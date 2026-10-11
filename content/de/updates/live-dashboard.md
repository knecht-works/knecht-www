---
title: Ein Live-Dashboard ohne Polling
date: 2026-10-11
tag: Architektur
description: Wie wir jede Datenbank-Query in einen Store pro Tabelle verschoben haben und wie das Dashboard dadurch über einen einzigen SSE-Stream live wurde.
---

::note
Dieser Post ist ein Blick unter die Haube. Er erklärt, wie Daten von der Datenbank ins Dashboard kommen, nicht was man mit dem Dashboard macht. Was Knecht macht, steht auf der [Startseite](/), wie ein Run funktioniert, in [DDEV-Projekte automatisieren mit Workflows](/updates/workflow-engine).
::

Viele Seiten im Knecht-Dashboard haben sich nicht von selbst aktualisiert. Ein Run war fertig, aber die Projektübersicht zeigte ihn bis zum Neuladen als laufend an. Ein paar Stellen fragten den Server alle anderthalb Sekunden ab, die meisten taten gar nichts. Wir wollten, dass jede Übersicht und jede Detailseite live ist. Bevor wir das bauen konnten, mussten wir aufräumen, wie der Server Daten liest und schreibt. Dieser Post erzählt beide Teile.

## Das Problem

Das Dashboard ist von einem POC zu einem echten Produkt gewachsen. Dabei sind auch ein paar schlechte Designentscheidungen entstanden. Queries standen überall, und dafür, wie sich jede Seite aktuell hält, gab es keinen echten Vertrag.

### Queries überall

Knecht speichert seine Daten in [SQLite](https://www.sqlite.org/) und spricht über [Drizzle](https://orm.drizzle.team/) mit der Datenbank. Jede Datei, die Daten brauchte, importierte die Datenbank und schrieb ihre eigene Query. So kamen rund 190 Queries in mehr als 40 Dateien zusammen. Ziemlich chaotisch!

Eine Route, die einen Run abbricht, sah so aus:

```ts [server/api/runs/[id]/cancel.post.ts]
export default defineEventHandler((event) => {
  const id = requireIntParam(event)
  db.update(schema.runs)
    .set({ status: 'cancelled', finishedAt: new Date() })
    .where(eq(schema.runs.id, id))
    .run()
})
```

Funktioniert hat das schon. Aber wenn das Dashboard von jeder Änderung erfahren soll, muss irgendetwas jede Änderung bemerken. Bei Writes in 35 Dateien müsste dieses Etwas in 35 Dateien stehen, und die 36. vergisst man, ohne dass es jemand merkt.

### Polling hier und da

Wo sich Seiten aktualisierten, taten sie es per Polling. Die Run-Seite fragte alle 1,5 Sekunden nach Run und Steps, solange etwas lief, die Projektseite nach ihren Runs. Jede Seite löste es für sich, und Seiten ohne Timer blieben veraltet.

## Stores im Server

Der erste Schritt war, das Query-Chaos aufzuräumen. Jede Tabelle bekam eine Stelle, an der alle ihre Queries stehen.

### Ein Modul pro Tabelle

Jede Tabelle hat jetzt genau ein Modul in `server/stores`, dem alle ihre Queries gehören, Reads wie Writes. Vereinfacht sieht der Store für Runs so aus:

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

Die Route von oben schrumpft auf einen Aufruf:

```ts [server/api/runs/[id]/cancel.post.ts]
export default defineEventHandler((event) => {
  finishRun(requireIntParam(event), 'cancelled')
})
```

Wer Code Patterns kennt: Das ist das [Repository](https://martinfowler.com/eaaCatalog/repository.html)-Pattern. Der Rest des Servers weiß nicht mehr, wie eine Query aussieht. Er kennt nur Funktionen, deren Namen sagen, was sie tun.

### Keine generischen Namen

Ein generisches `update(table, patch)` haben wir nicht gebaut. Wo ein Write einer Regel folgt, bekommt er eine eigene Funktion. Das erneute Senden einer fehlgeschlagenen Chat-Nachricht an den Agenten ist ein gutes Beispiel. Die Nachricht kommt zurück in die Warteschlange und beginnt von vorn, also müssen auch ihr alter Fehler und beide Zeitstempel weg:

```ts [server/stores/followups.ts]
export function requeueFollowup(id: number) {
  updateFollowup(id, { status: 'queued', error: null, startedAt: null, finishedAt: null })
}
```

Vorher hat die Retry-Route diese vier Felder selbst gesetzt. Jetzt hat die Regel einen Namen, und die Route sagt nur, was sie will: `requeueFollowup(id)`.

### Eine Lint-Regel

Eine Konvention hält nur, solange niemand (und kein Agent) sie vergisst. Deshalb macht eine [ESLint](https://eslint.org/)-Regel daraus eine harte Grenze: Außerhalb von `server/stores` und `server/db` darf niemand die Datenbank importieren.

```js [eslint.config.mjs]
ImportDeclaration(node) {
  if (!/(^|\/)db$/.test(node.source.value)) return
  if (node.specifiers.some(s => s.imported?.name === 'db')) {
    context.report({ node, message: 'Query the database through a store in server/stores.' })
  }
}
```

Neue Tabellen brauchen also keine Konfiguration, und wer außerhalb eines Stores eine Query schreibt, bekommt einen Lint-Fehler.

## Änderungen ankündigen

Wenn jeder Write einer Tabelle an einer Stelle passiert, kann der Server dem Browser genau dort mitteilen, was sich geändert hat.

### Topics statt Daten

Da jetzt jeder Write durch einen Store läuft, kann jeder Store ankündigen, was sich geändert hat. Er schickt nicht die neuen Daten, sondern nur ein Topic:

```ts [server/stores/runs.ts]
export function finishRun(id: number, status: FinalStatus) {
  db.update(schema.runs).set({ status, finishedAt: new Date() }).where(eq(schema.runs.id, id)).run()
  emitTopics(liveTopics.runs, liveTopics.run(id))
}
```

`runs` heißt „irgendeine Run-Liste hat sich geändert“, `run:12` heißt „Run 12 hat sich geändert“. Die Topics stehen in einer Datei, die Server und Browser beide importieren. So kann ein Tippfehler auf einer Seite die Live-Updates nicht still kaputt machen:

```ts [shared/utils/live-topics.ts]
export const liveTopics = {
  runs: 'runs',
  run: (id: number) => `run:${id}`,
  projects: 'projects',
  project: (id: number) => `project:${id}`,
  // workflows, triggers, integrations, members
}
```

Der Browser abonniert mit denselben Helfern.

Warum nur ein Topic? Weil der Browser die Daten dann über dieselben API-Routen neu lädt, die er sowieso nutzt. Berechtigungen und Antwortformat bleiben an einer Stelle, und die Reihenfolge der Events spielt keine Rolle, weil ein Neuladen immer den aktuellen Stand liefert.

::note
Figma hat für sein Echtzeit-System denselben Wechsel gemacht und beschreibt ihn in [LiveGraph](https://www.figma.com/blog/livegraph-real-time-data-at-scale/). Dominik Dorfmeister empfiehlt dasselbe Muster für [React Query und WebSockets](https://tkdodo.eu/blog/using-web-sockets-with-react-query).
::

### Ein Stream pro Tab

Die Topics kommen über [Server-Sent Events](https://developer.mozilla.org/de/docs/Web/API/Server-sent_events) in den Browser, eine HTTP-Verbindung, über die der Server laufend kleine Nachrichten schickt. Ein Stream pro Tab reicht für das ganze Dashboard:

```ts [server/api/live.get.ts]
export default defineEventHandler((event) => {
  const stream = createEventStream(event)
  const off = onTopics(topics => stream.push({ event: 'topics', data: JSON.stringify(topics) }))
  stream.onClosed(off)
  return stream.send()
})
```

Änderungen kommen oft in Schüben, zum Beispiel wenn ein Step endet und der nächste startet. Deshalb wartet `emitTopics` nach dem ersten Topic 100 Millisekunden, sammelt alles, was in der Zeit ankommt, und schickt es als eine Nachricht.

## Composables im Client

Im Client gilt dieselbe Idee: Jede Ressource wird an einer Stelle geladen, und diese Stelle weiß, welche Änderungen sie betreffen.

### Geteilte Daten, feste Keys

Der Client hatte dasselbe Problem wie der Server. Rund 35 Stellen in Pages und Komponenten riefen [`useFetch`](https://nuxt.com/docs/api/composables/use-fetch) direkt auf, `/api/workflows` allein sechsmal, jede mit eigenen Optionen. Jetzt hat jede Ressource ein [Composable](https://vuejs.org/guide/reusability/composables), mit festem Key und den Topics, von denen es abhängt:

```ts [app/composables/useRuns.ts]
export function useRun(id: number) {
  const key = `run:${id}`
  useLiveTopics(key, [liveTopics.run(id)])
  return useFetch(`/api/runs/${id}`, { key })
}
```

Nuxt teilt Daten zwischen allen Aufrufen mit demselben Key. Die Run-Seite und die Komponente, die den Run anzeigt, nutzen jetzt einen Request und einen Cache. Ändern die Projekt-Einstellungen das Projekt, sieht der Header darüber die Änderung auch.

### Eine Funktion, die neu lädt

`useLiveTopics` merkt sich, welcher Key von welchen Topics abhängt, solange eine Komponente auf dem Bildschirm ihn nutzt. `invalidate` lädt jeden Key neu, der von einem der übergebenen Topics abhängt:

```ts [app/composables/useLiveTopics.ts]
export function invalidate(...topics: string[]) {
  const keys = [...subscriptions]
    .filter(([, s]) => s.topics.some(t => topics.includes(t)))
    .map(([key]) => key)
  return refreshNuxtData(keys)
}
```

Ein kleines Plugin verbindet den Stream mit dieser Funktion:

```ts [app/plugins/live.client.ts]
const source = new EventSource('/api/live')
source.addEventListener('topics', e => invalidate(...JSON.parse(e.data)))
```

Das ist der ganze Live-Mechanismus im Browser. Nach einer Mutation ruft die Seite selbst `invalidate` auf statt ihres eigenen `refresh()`, und andere Tabs erfahren über den Stream von der Änderung.

## Fazit

Sechs Poller sind weg, und jede Übersicht und Detailseite aktualisiert sich von selbst, auch wenn eine Umgebung gerade stoppt oder neu bootet. Der größere Gewinn ist das Aufräumen darunter. Wer so etwas selbst baut, kann sich an vier Punkten orientieren:

- Erst den Datenzugriff aufräumen. Live-Updates sind einfach, sobald jeder Write durch eine Stelle läuft.
- Die Grenze per Lint-Regel durchsetzen, nicht per Konvention.
- Topics schicken, nicht die Daten. Der Client lädt über die Routen neu, die er schon hat.
- Daten über ein Composable pro Ressource mit festem Key laden, damit die Invalidierung eine Stelle hat, an der sie andockt.
