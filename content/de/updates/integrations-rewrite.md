---
title: Eine Schnittstelle für alle Integrationen
date: 2026-09-24
tag: Architektur
description: Wie wir die Integrationen von Knecht hinter eine gemeinsame Schnittstelle gebracht haben, damit ein neues Tool nur noch mitbringt, was an ihm wirklich anders ist.
---

::note
Dieser Post ist ein Blick unter die Haube. Er erklärt, wie die Integrationen im Server aufgebaut sind, nicht was man damit macht. Was Knecht macht, steht auf der [Startseite](/), wie er auf GitHub und in Jira arbeitet, in [Knecht antwortet jetzt auf GitHub](/updates/sessions-and-mentions). Die Einrichtung steht in den Docs zu [GitHub](/docs/integrations/github) und [Jira](/docs/integrations/jira).
::

Knecht hat mit einer Integration angefangen, GitHub. Dann kam Jira, und Jira funktioniert anders. Es gibt Tickets statt Pull Requests und [Status-Kategorien](https://support.atlassian.com/jira-cloud-administration/docs/what-are-issue-statuses-priorities-and-resolutions/) statt offen und geschlossen. Ein Ticket kann keinen Pull Request anzeigen, also schreibt Knecht das Ergebnis als Kommentar zurück. Jira bekam deshalb eigenen Code. Jeder weitere Issue-Tracker hätte diesen Code noch einmal bekommen. Dieser Post erzählt, wie wir daraus eine gemeinsame Schnittstelle gemacht haben.

So sieht das Ergebnis in Jira aus. Ein Ticket bekommt ein Label, Knecht nimmt es sich, arbeitet in seiner Umgebung und meldet sich mit einem Pull Request und einem Kommentar zurück.

::update-youtube{id="9FFm1AlmRn4" title="Knecht Works on Jira" caption="Ein Jira-Ticket bekommt ein Label, Knecht arbeitet und meldet sich mit PR und Kommentar zurück"}
::

## Das Problem

### Kopierte Infrastruktur

Jedes Tool braucht dieselben vier Dinge. Knecht muss Zugangsdaten speichern, die Verbindung in den Settings anzeigen, Labels und Status für das Trigger-Formular laden und Webhooks empfangen. Ein [Webhook](https://docs.github.com/en/webhooks/about-webhooks) ist die HTTP-Anfrage, mit der das Tool Knecht über eine Änderung informiert. Jira hatte dafür eigene API-Routen, eine eigene Datenbanktabelle und ein eigenes Settings-Panel. Ein zweiter Tracker hätte all das kopiert und nur Feldnamen und Texte ausgetauscht.

### Tool-Namen im Code

Schlecht war, dass der Rest von Knecht die Tools beim Namen kannte. Überall, wo eine Integration eine Rolle spielte, stand eine Abfrage wie diese:

```ts
if (tool === 'jira') {
  await postResultComment(ticket)
}
```

Der Code, der einen Run abschließt, wusste, dass Jira einen Ergebnis-Kommentar braucht. Die Behandlung von Mentions kannte nur GitHub. Für jedes neue Tool hätten wir all diese Stellen finden und erweitern müssen.

## Die Schnittstelle

### Fähigkeiten statt Namen

Jetzt ist eine Integration ein Objekt, das eine feste [TypeScript-Schnittstelle](https://www.typescriptlang.org/docs/handbook/2/objects.html) erfüllt. Der Rest von Knecht fragt nicht mehr, welches Tool er vor sich hat, sondern was es kann. Wer Design Patterns kennt, erkennt darin einen [Adapter](https://refactoring.guru/design-patterns/adapter). Stark vereinfacht sieht die Schnittstelle so aus:

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

`verify` prüft die [Signatur](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries) eines Webhooks, also ob er wirklich vom Tool kommt. `parse` übersetzt ihn in eine Form, die Knecht versteht. Kommentieren kann jedes Tool, alles mit Fragezeichen ist [optional](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties). Aus der Abfrage oben wird damit:

```ts
if (integration.labels) {
  await integration.labels.apply(ticket, ['bug'])
}
```

### Ein Weg für jeden Webhook

`parse` liefert für jedes Tool dieselbe Form zurück. Ein Webhook kann einen Kommentar enthalten, der Knecht direkt anspricht (eine [Mention](/updates/sessions-and-mentions)), eine Statusänderung am Ticket oder ein Ereignis, auf das ein [Trigger](/docs/usage/triggers) reagiert. Ein Trigger ist die Regel, die einen Workflow startet. Oft steckt mehreres in einem Webhook, ein geschlossenes Ticket ist zum Beispiel eine Statusänderung und vielleicht auch ein Trigger-Ereignis. Was Knecht damit macht, steht an genau einer Stelle:

```ts
const delivery = await integration.webhook.parse(request)

if (delivery.comment) handleMention(delivery.comment)
if (delivery.statusChange) syncTicketStatus(delivery.statusChange)
if (delivery.event) startMatchingWorkflows(delivery.event)
```

Die Integration muss nur wissen, wie ihr Tool Daten schickt. Was daraus folgt, entscheidet Knecht für alle Tools gleich. Die Idee dahinter beschreibt Alexis King in [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/): Fremde Daten werden einmal an der Grenze in einen eigenen Typ übersetzt, danach arbeitet der Code nur noch mit diesem Typ.

## Unterschiede als Daten

Was sich zwischen zwei Tools noch unterscheidet, sind vor allem Begriffe und Formate. Ein Ticket heißt anders, andere Status gelten als erledigt, der Titel steht an einer anderen Stelle im Payload. Das beschreibt jede Integration als Daten, die Logik dazu gibt es nur einmal.

### Der Tracker

Ein Tracker ist ein Tool, in dem ein Team seine Tickets verwaltet, etwa Jira. Was Knecht über ihn wissen muss, passt in eine kurze Beschreibung:

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

Der obere Teil sind die Begriffe des Tools, also wie ein Ticket heißt, welche Status-Kategorien es gibt und welche davon als erledigt gelten. `toTicket` übersetzt die Daten aus dem Webhook in ein einheitliches Ticket. Ab da entscheidet für alle Tracker derselbe Code, ob ein Trigger startet, und auch der Text, den der [Agent](/docs/usage/agent) über das Ticket liest, entsteht daraus.

### Das Trigger-Formular

Im [Trigger-Dialog](/docs/usage/triggers) wählt man, bei welchem Ereignis ein Workflow startet. Welche Ereignisse es gibt, beschreibt jede Integration selbst:

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

Aus `form` baut Knecht den Dialog. `options` füllt die Auswahlfelder mit den Labels und Status, die es in Jira wirklich gibt. `form` sind reine Daten und gehen in den Browser, `options` läuft auf dem Server, weil nur der die Zugangsdaten hat.

### Die Verbindung

Die Verbindung sind die Zugangsdaten, mit denen Knecht im Tool liest und schreibt, bei Jira etwa die Site-URL, eine E-Mail und ein API-Token. Ein Admin trägt sie einmal in den Settings ein, danach gilt die Verbindung für die ganze Instanz. Auch dieses Formular ist eine Beschreibung. Die Integration sagt nur, welche Felder sie braucht und wie sie prüft, ob die Zugangsdaten stimmen:

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

Eine gemeinsame Vue-Komponente baut daraus das Formular, eine gemeinsame API-Route speichert es. Der Feldtyp bringt die Regeln mit. Eine `url` muss mit https beginnen, ein `secret` wird [verschlüsselt gespeichert](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html) und nur als Vorschau angezeigt. Vor dem Speichern meldet sich `verify` einmal beim Tool an, damit falsche Zugangsdaten gar nicht erst gespeichert werden.

## Tests gegen die Schnittstelle

### Vom Durchklicken zu Fixtures

Am Anfang haben wir Trigger von Hand getestet. Die lokale Knecht-Instanz war über einen [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) erreichbar, wir haben in Jira ein Ticket angelegt, ein Label gesetzt, den Status verschoben und im Log nachgesehen, ob der richtige Workflow startet. Das dauerte, und nach jeder Änderung an der Trigger-Logik ging es von vorne los.

Deshalb schreibt Knecht jetzt auf Wunsch jeden geprüften Webhook als JSON-Datei in einen Ordner. Eine Runde Durchklicken im Tool reicht, und die aufgezeichneten Webhooks werden zu Fixtures. Stand September 2026 sind es 89. Die Tests spielen sie erneut ab und legen für jeden Trigger fest, bei welchen Webhooks er feuern muss und bei welchen nicht:

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

Steht die Verbindung zu einem Tool einmal und ist eine Runde Webhooks aufgezeichnet, wissen wir nach jeder Änderung in Sekunden, ob die Trigger noch stimmen, ohne das Tool zu öffnen. Ändert ein Tool sein Format, zeichnen wir neu auf und sehen im Test sofort, was sich geändert hat.

### Eine Suite für alle

Die Fixtures prüfen, ob Trigger richtig entscheiden. Ob eine Integration die Schnittstelle überhaupt richtig erfüllt, prüft eine zweite Ebene. Weil alle Integrationen dieselbe Schnittstelle haben, laufen sie durch dieselbe Test-Suite in [Vitest](https://vitest.dev/guide/). Eine Integration liefert dafür nur Bausteine, die Webhooks in ihrem Format erzeugen:

```ts
webhookSuite({
  integration: jira,
  created: project => jiraWebhook('issue_created', project),
  labeled: project => jiraWebhook('issue_updated', project, { labels: ['bug'] }),
  mention: project => jiraComment(project, '@Knecht bitte anschauen'),
})
```

Die Suite schickt diese Webhooks durch die echte Route und erwartet von jeder Integration dasselbe Verhalten.

Martin Fowler nennt so etwas einen [Contract Test](https://martinfowler.com/bliki/ContractTest.html). Für eine neue Integration heißt das, dass wir nicht überlegen müssen, was zu testen ist. Sobald sie die Bausteine liefert und die Suite grün ist, verhält sie sich wie die anderen.

## Was wir mitnehmen

Eine neue Integration besteht jetzt aus der Beschreibung des Trackers, den API-Aufrufen und dem Verbindungsformular. Trigger, Mentions, Kommentare, Labels, Status und das Settings-Panel kommen mit der Schnittstelle. Wer so etwas selbst baut, kann sich an vier Punkten orientieren:

- Der Rest der Anwendung fragt nach Fähigkeiten, nie nach dem Namen des Tools.
- Eingehende Daten werden an der Grenze in eine gemeinsame Form übersetzt. Danach gibt es keinen Tool-spezifischen Code mehr. Microsoft beschreibt das Muster als [Anti-Corruption Layer](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer).
- Was sich nur in Daten unterscheidet, etwa Formulare oder Begriffe, wird als Daten beschrieben und nicht als Code.
- Getestet wird gegen die Schnittstelle, damit jede Integration dieselben Tests bestehen muss.
