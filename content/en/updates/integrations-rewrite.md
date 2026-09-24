---
title: One Interface for All Integrations
date: 2026-09-24
tag: Architecture
description: How we put Knecht's integrations behind one shared interface, so a new tool only brings what is actually different about it.
---

::note
This post is a look under the hood. It explains how the integrations are built in the server, not what you do with them. What Knecht does is on the [home page](/), and how it works on GitHub and in Jira is in [Knecht Now Replies on GitHub](/updates/sessions-and-mentions). Setup is covered in the docs for [GitHub](/docs/integrations/github) and [Jira](/docs/integrations/jira).
::

Knecht started with one integration, GitHub. Then Jira came along, and Jira works differently. There are tickets instead of pull requests and [status categories](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/) instead of open and closed. A ticket cannot show a pull request, so Knecht writes the result back as a comment. So Jira got its own code. Every further issue tracker would have gotten that code once more. This post tells how we turned it into one shared interface.

This is what the result looks like in Jira. A ticket gets a label, Knecht picks it up, works in its environment and comes back with a pull request and a comment.

::update-youtube{id="9FFm1AlmRn4" title="Knecht Works on Jira" caption="A Jira ticket gets a label, Knecht works and comes back with a PR and a comment"}
::

## The Problem

### Copied Infrastructure

Every tool needs the same four things. Knecht has to store credentials, show the connection in the settings, load labels and statuses for the trigger form and receive webhooks. A [webhook](https://docs.github.com/en/webhooks/about-webhooks) is the HTTP request a tool sends to tell Knecht about a change. Jira had its own API routes, its own database table and its own settings panel for this. A second tracker would have copied all of it and only swapped field names and texts.

### Tool Names in the Code

The bigger issue was that the rest of Knecht knew the tools by name. Wherever an integration mattered, there was a check like this:

```ts
if (tool === 'jira') {
  await postResultComment(ticket)
}
```

The code that finishes a run knew that Jira needs a result comment. Mention handling only knew GitHub. For every new tool we would have had to find and extend all of those places.

## The Interface

### Capabilities, Not Names

Now an integration is one object that fulfils a fixed [TypeScript interface](https://www.typescriptlang.org/docs/handbook/2/objects.html). The rest of Knecht no longer asks which tool it is looking at, but what the tool can do. If you know your design patterns, this is an [adapter](https://refactoring.guru/design-patterns/adapter). Heavily simplified, the interface looks like this:

```ts
interface Integration {
  webhook: {
    verify(request): boolean
    parse(request): Delivery
  }
  comment(ticket, text): Promise<void>
  labels?: { list(ticket), apply(ticket, names) }
  statuses?: { list(ticket), move(ticket, status) }
  assignee?: { take(ticket), handBack(ticket, person) }
}
```

`verify` checks the [signature](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries) of a webhook, that is whether it really comes from the tool. `parse` translates it into a shape Knecht understands. Every tool can comment, everything with a question mark is [optional](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties). The check from above becomes:

```ts
if (integration.labels) {
  await integration.labels.apply(ticket, ['bug'])
}
```

### One Path for Every Webhook

`parse` returns the same shape for every tool. A webhook can contain a comment that addresses Knecht directly (a [mention](/updates/sessions-and-mentions)), a status change on the ticket, or an event a [trigger](/docs/usage/triggers) reacts to. A trigger is the rule that starts a workflow. Often a webhook carries several of these, a closed ticket for example is a status change and maybe a trigger event too. What Knecht does with them lives in exactly one place:

```ts
const delivery = await integration.webhook.parse(request)

if (delivery.comment) handleMention(delivery.comment)
if (delivery.statusChange) syncTicketStatus(delivery.statusChange)
if (delivery.event) startMatchingWorkflows(delivery.event)
```

The integration only has to know how its tool sends data. What follows from it, Knecht decides the same way for every tool. Alexis King describes the idea behind this in [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/): foreign data is translated into your own type once at the boundary, and after that the code only works with that type.

## Differences as Data

What still differs between two tools is mostly terms and formats. A ticket has another name, other statuses count as done, the title sits somewhere else in the payload. Each integration describes that as data, and the logic around it exists only once.

### The Tracker

A tracker is a tool where a team manages its tickets, like Jira. What Knecht needs to know about it fits into a short description:

```ts
const jira = {
  noun: 'ticket',
  statusGroups: { new: 'To Do', indeterminate: 'In Progress', done: 'Done' },
  closedGroups: ['done'],

  toTicket: issue => ({
    title: issue.fields.summary,
    body: adfToMarkdown(issue.fields.description),
    status: issue.fields.status.name,
    labels: issue.fields.labels,
  }),
}
```

The upper part is the tool's vocabulary, that is what a ticket is called, which status categories exist and which of them count as done. `toTicket` translates the webhook data into one uniform ticket. From there the same code decides for every tracker whether a trigger starts, and the text the [agent](/docs/usage/agent) reads about the ticket comes from it too.

### The Trigger Form

In the [trigger dialog](/docs/usage/triggers) you pick which event starts a workflow. Each integration describes the events it offers:

```ts
trigger: {
  form: {
    events: [
      { label: 'Label added', options: 'labels' },
      { label: 'Status reached', options: 'statuses' },
    ],
  },
  options: {
    labels: () => jira.get('/label'),
    statuses: () => jira.get('/status'),
  },
}
```

From `form` Knecht builds the dialog. `options` fills the dropdowns with the labels and statuses that actually exist in Jira. `form` is plain data and goes to the browser, `options` runs on the server, because only the server has the credentials.

### The Connection

The connection is the set of credentials Knecht uses to read and write in the tool, for Jira the site URL, an email and an API token. An admin enters them once in the settings, and from then on the connection applies to the whole instance. This form is a description too. The integration only says which fields it needs and how it checks that the credentials work:

```ts
connection: {
  fields: [
    { key: 'siteUrl', label: 'Site URL', type: 'url' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'apiToken', label: 'API token', type: 'secret' },
  ],
  verify: values => jira.whoAmI(values),
}
```

One shared Vue component builds the form from it, and one shared API route saves it. The field type brings its rules. A `url` has to start with https, and a `secret` is [stored encrypted](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) and only shown as a preview. Before saving, `verify` signs in to the tool once, so wrong credentials never get stored.

## Tests Against the Interface

### From Clicking to Fixtures

At first we tested triggers by hand. The local Knecht instance was reachable through a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/), we created a ticket in Jira, set a label, moved the status and checked the log to see whether the right workflow started. That took a while, and after every change to the trigger logic it started over.

So Knecht can now write every verified webhook to a folder as a JSON file. One round of clicking through the tool is enough, and the recorded webhooks become fixtures. As of September 2026 there are 89 of them. The tests replay them and state for each trigger which webhooks it has to fire on and which it must not:

```ts
const cases = [
  { trigger: 'Label "bug" added', firesOn: ['ticket-labeled-bug'] },
  { trigger: 'Status "Done" reached', firesOn: ['ticket-moved-to-done'] },
]

for (const { trigger, firesOn } of cases) {
  for (const webhook of recordedWebhooks) {
    expect(fires(trigger, webhook)).toBe(firesOn.includes(webhook.name))
  }
}
```

Once the connection to a tool works and one round of webhooks is recorded, we know within seconds after every change whether the triggers still hold, without opening the tool. If a tool changes its format, we record again and the tests show right away what changed.

### One Suite for All

The fixtures check whether triggers decide correctly. Whether an integration fulfils the interface at all is checked on a second level. Because all integrations share the same interface, they run through the same test suite in [Vitest](https://vitest.dev/guide/). An integration only provides building blocks that create webhooks in its format:

```ts
webhookSuite({
  integration: jira,
  created: project => jiraWebhook('issue_created', project),
  labeled: project => jiraWebhook('issue_updated', project, { labels: ['bug'] }),
  mention: project => jiraComment(project, '@Knecht please take a look'),
})
```

The suite sends these webhooks through the real route and expects the same behaviour from every integration.

Martin Fowler calls this a [contract test](https://martinfowler.com/bliki/ContractTest.html). For a new integration it means we do not have to think about what to test. As soon as it provides the building blocks and the suite is green, it behaves like the others.

## What We Take Away

A new integration now consists of the tracker description, the API calls and the connection form. Triggers, mentions, comments, labels, statuses and the settings panel come with the interface. If you build something like this yourself, four points can guide you:

- The rest of the app asks for capabilities, never for the name of the tool.
- Incoming data is translated into one shared shape at the boundary. After that there is no tool-specific code. Microsoft describes this pattern as an [anti-corruption layer](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer).
- What only differs in data, like forms or terms, is described as data and not as code.
- Tests run against the interface, so every integration has to pass the same tests.
