---
title: A Live Dashboard Without Polling
date: 2026-10-11
tag: Architecture
description: How we moved every database query into one store per table, and how that made the dashboard update live over a single SSE stream.
---

::note
This post is a look under the hood. It explains how data flows from the database to the dashboard, not what you do with the dashboard. What Knecht does is on the [home page](/), and how a run works is in [Automate DDEV Projects with Workflows](/updates/workflow-engine).
::

Many pages in the Knecht dashboard did not update on their own. A run finished, but the project overview still showed it as running until you reloaded. A few places polled the server every one and a half seconds, most did nothing. We wanted every overview and detail page to be live. Before we could build that, we had to clean up how the server reads and writes data. This post tells both parts.

## The Problem

The dashboard grew as a POC to a real product. With that came some poor code design decisions. Queries were everywhere, and the logic for how each page kept itself up to date had no real contract.

### Queries Everywhere

Knecht stores its data in [SQLite](https://www.sqlite.org/) and talks to it through [Drizzle](https://orm.drizzle.team/). Every file that needed data imported the database and wrote its own query. That made for about 190 queries in more than 40 files. Well, that's a mess!

A route that cancels a run looked like this:

```ts [server/api/runs/[id]/cancel.post.ts]
export default defineEventHandler((event) => {
  const id = requireIntParam(event)
  db.update(schema.runs)
    .set({ status: 'cancelled', finishedAt: new Date() })
    .where(eq(schema.runs.id, id))
    .run()
})
```

I mean it worked. But if the dashboard is supposed to learn about every change, something has to notice every change. With writes in 35 files, that something would have to be added in 35 files, and the 36th one gets forgotten without anybody noticing.

### Polling Here and There

Where pages did update, they did it with polling. The run page asked for the run and its steps every 1.5 seconds while anything was running, the project page asked for its runs. Each page solved it on its own, and pages without a timer stayed stale.

## Stores on the Server

The first step was to clean up the query mess. We gave every table one place where all its queries live.

### One Module per Table

Every table now has exactly one module in `server/stores` that owns all its queries, reads and writes alike. Simplified, the store for runs looks like this:

```ts [server/stores/runs.ts]
export function getRun(id: number) {
  return db.select().from(schema.runs).where(eq(schema.runs.id, id)).get()
}

export function finishRun(id: number, status: FinalStatus) {
  db.update(schema.runs)
    .set({ status, finishedAt: new Date() })
    .where(eq(schema.runs.id, id))
    .run()
}
```

The route from above shrinks to a call:

```ts [server/api/runs/[id]/cancel.post.ts]
export default defineEventHandler((event) => {
  finishRun(requireIntParam(event), 'cancelled')
})
```

If you know code patterns, this is a [repository](https://martinfowler.com/eaaCatalog/repository.html) pattern. The rest of the server no longer knows what a query looks like. It only knows functions with names that say what they do.

### Not Generic Names

We didn't build a generic `update(table, patch)`. Where a write follows a rule, it gets its own function. Retrying a failed chat message to the agent is a good example. The message goes back into the queue and starts over, so its old error and both timestamps have to go as well:

```ts [server/stores/followups.ts]
export function requeueFollowup(id: number) {
  updateFollowup(id, { status: 'queued', error: null, startedAt: null, finishedAt: null })
}
```

Before, the retry route set these four fields itself. Now the rule has a name, and the route only says what it wants: `requeueFollowup(id)`.

### A Lint Rule

A convention only holds as long as nobody (and no agent) forgets it. So an [ESLint](https://eslint.org/) rule makes it a hard boundary: outside of `server/stores` and `server/db`, nobody may import the database.

```js [eslint.config.mjs]
ImportDeclaration(node) {
  if (!/(^|\/)db$/.test(node.source.value)) return
  if (node.specifiers.some(s => s.imported?.name === 'db')) {
    context.report({ node, message: 'Query the database through a store in server/stores.' })
  }
}
```

So new tables don't need configuration and whoever writes a query outside a store gets a lint error.

## Announcing Changes

With every write in one place per table, the server can tell the browser what changed, right where the change happens.

### Topics Instead of Data

Now that every write goes through a store, each store can announce what changed. It does not send the new data, only a topic:

```ts [server/stores/runs.ts]
export function finishRun(id: number, status: FinalStatus) {
  db.update(schema.runs).set({ status, finishedAt: new Date() }).where(eq(schema.runs.id, id)).run()
  emitTopics(liveTopics.runs, liveTopics.run(id))
}
```

`runs` means "some run list changed", `run:12` means "run 12 changed". The topics live in one file that both the server and the browser import, so a typo on one side cannot silently break live updates:

```ts [shared/utils/live-topics.ts]
export const liveTopics = {
  runs: 'runs',
  run: (id: number) => `run:${id}`,
  projects: 'projects',
  project: (id: number) => `project:${id}`,
  // workflows, triggers, integrations, members
}
```

The browser subscribes with the same helpers.

Why only a topic? Because the browser then reloads the data through the same API routes it uses anyway. Permissions and response shape stay in one place, and the order of events does not matter, since a reload always returns the latest state. 

::note
Figma made the same switch for its real-time system and describes it in [LiveGraph](https://www.figma.com/blog/livegraph-real-time-data-at-scale/). Dominik Dorfmeister recommends the same pattern for [React Query and WebSockets](https://tkdodo.eu/blog/using-web-sockets-with-react-query).
::

### One Stream per Tab

The topics reach the browser over [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events), an HTTP connection on which the server keeps sending small messages. One stream per tab is enough for the whole dashboard:

```ts [server/api/live.get.ts]
export default defineEventHandler((event) => {
  const stream = createEventStream(event)
  const off = onTopics(topics => stream.push({ event: 'topics', data: JSON.stringify(topics) }))
  stream.onClosed(off)
  return stream.send()
})
```

Changes often come in bursts, for example a step that finishes and the next one that starts. So `emitTopics` waits 100 milliseconds after the first topic, collects everything that comes in during that time and sends it as one message.

## Composables on the Client

On the client, the same idea applies: every resource is loaded in one place, and that place knows which changes concern it.

### Shared Data, Fixed Keys

The client had the same problem as the server. About 35 places in pages and components called [`useFetch`](https://nuxt.com/docs/api/composables/use-fetch) directly, `/api/workflows` alone six times, each with its own options. Now every resource has one [composable](https://vuejs.org/guide/reusability/composables), with a fixed key and the topics it depends on:

```ts [app/composables/useRuns.ts]
export function useRun(id: number) {
  const key = `run:${id}`
  useLiveTopics(key, [liveTopics.run(id)])
  return useFetch(`/api/runs/${id}`, { key })
}
```

Nuxt shares data between all calls with the same key. The run page and the component that shows the run now use one request and one cache. When the project settings change the project, the header above them sees the change too.

### One Function That Reloads

`useLiveTopics` notes which key depends on which topics, as long as a component on screen uses it. `invalidate` reloads every key that depends on one of the given topics:

```ts [app/composables/useLiveTopics.ts]
export function invalidate(...topics: string[]) {
  const keys = [...subscriptions]
    .filter(([, s]) => s.topics.some(t => topics.includes(t)))
    .map(([key]) => key)
  return refreshNuxtData(keys)
}
```

A small plugin connects the stream to that function:

```ts [app/plugins/live.client.ts]
const source = new EventSource('/api/live')
source.addEventListener('topics', e => invalidate(...JSON.parse(e.data)))
```

That is the whole live mechanism in the browser. After a mutation, the page calls `invalidate` itself instead of its own `refresh()`, and other tabs learn about the change through the stream.

## Conclusion

Six pollers are gone, and every overview and detail page updates on its own, including when an environment is stopping or rebooting. The bigger win is the cleanup underneath. If you build something like this yourself, four points can guide you:

- Clean up data access first. Live updates are easy once every write runs through one place.
- Let a lint rule enforce the boundary, not a convention.
- Send topics, not the data. The client reloads through the routes it already has.
- Load data through one composable per resource with a fixed key, so invalidation has one place to hook in.
