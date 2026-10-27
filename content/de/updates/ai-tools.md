---
title: Eine Schnittstelle für KI im Dashboard
date: 2026-10-27
tag: Architektur
description: Wie KI-Features in Knecht über eine gemeinsame Tool-Registry und einen gemeinsamen Loop arbeiten, und warum dieselben Tools später auch über MCP erreichbar sein sollen.
---

::note
Dieser Post ist ein Blick unter die Haube. Er erklärt, wie KI-Features im Server von Knecht aufgebaut sind. Was Knecht macht und für wen er gedacht ist, steht auf der [Startseite](/) und in [Was macht der Knecht](/updates/was-macht-knecht).
::

Bisher lief KI in Knecht nur in der Sandbox eines Runs, über OpenCode. Jetzt kommt sie auch ins Dashboard. Das erste Feature erklärt, warum ein Run fehlgeschlagen ist. Weitere Features sollen folgen, und später sollen auch externe KI-Tools wie Claude Code über MCP auf Knecht zugreifen. Alle brauchen Zugriff auf Runs, Logs und Workflows. Wir wollten nicht, dass jedes davon diesen Zugriff und die Berechtigungsprüfung selbst baut. Deshalb laufen alle über eine gemeinsame Schnittstelle. Dieser Post zeigt, wie sie aufgebaut ist.

## Die Fehlerdiagnose

Zuerst zum ersten Feature, das im Dashboard KI nutzt. Es findet heraus, warum ein Run fehlgeschlagen ist. Dafür liest es das Run-Log, die Logs der Actions und den Workflow selbst.

![Statuskarte auf der Projektseite mit der Ursache eines fehlgeschlagenen Runs und Links auf die betroffenen Actions](/assets/knecht-failure-diagnosis.png)

Schlägt ein Run fehl, zeigt die Statuskarte auf der Projektseite zuerst "Knecht is looking into why the last run failed." Kurz danach stehen dort in ein bis zwei Sätzen die Ursache und der wahrscheinlichste Fix. Darunter zeigt Knecht einen Button für jede Action, in deren Log die Ursache zu sehen ist. Ein Klick führt direkt zu dieser Action im Workflow-Editor, klappt sie auf und scrollt zu ihr. So kann man sie gleich korrigieren.

## Architektur

Weitere Features sind schon geplant, zum Beispiel eines, das erklärt, warum ein Workflow langsam ist, oder eines, das Verbesserungen für einen Workflow vorschlägt. Für alle sind zwei Begriffe wichtig. Ein Tool ist eine einzelne Operation, die eine KI ausführen darf. Ein Feature legt fest, welche Tools eine KI für eine bestimmte Aufgabe bekommt.

### Tools

Ein Tool hat einen Namen, eine Beschreibung für das Modell, ein Eingabeschema und einen Scope. Das Schema ist mit [Zod](https://zod.dev) geschrieben. Das Modell bekommt daraus ein [JSON Schema](https://json-schema.org), und Knecht prüft damit jede Eingabe. Stark vereinfacht sieht das Tool aus, das das Log einer Action liest:

```ts
export const getActionLogTool = defineTool({
  name: 'get_action_log',
  description: 'Returns the log of one action of a run.',
  scope: 'runs:read',
  input: z.object({ runId: z.number(), actionId: z.number() }),
  run: ({ runId, actionId }) => readActionLog(runId, actionId),
})
```

Alle Tools liegen in einer Registry im Server. Bisher gibt es nur lesende Tools, für Runs, Logs, Projekte und Workflows. Die Liste wächst mit jedem Feature.

Jeder Tool-Aufruf läuft über `callTool`. Es prüft die Eingabe gegen das Schema und die Berechtigung. Der Scope eines Tools ist die Berechtigung, die es braucht. `runs:read` erlaubt zum Beispiel, Runs und ihre Logs zu lesen. Der Actor des Aufrufs muss diese Berechtigung haben, sonst bricht `callTool` mit einem Fehler ab.

### Features

Ein Feature beschreibt eine Aufgabe im Dashboard. Es legt das Modell, die Anweisungen, die erlaubten Tools, das Format der Antwort und die maximale Zahl an Schritten fest. So sieht das Feature für die Fehlerdiagnose aus:

```ts
const diagnosis = defineAiFeature({
  id: 'failure-diagnosis',
  model: 'fast',
  instructions: 'You explain why a run of Knecht failed. ...',
  tools: [getRunTool, getActionLogTool, getRunLogTool, getWorkflowTool],
  output: z.object({ summary: z.string(), actionIds: z.array(z.number()) }),
  maxSteps: 4,
})
```

Die Diagnose darf also einen Run lesen, die Logs seiner Actions, das Log des ganzen Runs und den Workflow selbst. Mehr nicht. Ein anderes Feature bekommt eine andere Liste. Die Liste steht fest im Code, eine KI kann sich keine weiteren Tools suchen. `model: 'fast'` nennt eine Modell-Rolle, kein konkretes Modell. Was das heißt, erklärt der Abschnitt zum Model-Call weiter unten.

### Agentic Loop

Jedes Feature läuft über dieselbe Funktion:

```ts
const result = await runAiFeature(diagnosis, prompt)
```

`runAiFeature` gibt dem Modell den Prompt und die Tools des Features. Das Modell entscheidet selbst, welches Tool es aufruft. Steht etwa im Log der fehlgeschlagenen Action keine Ursache, liest es das Log einer früheren Action. Knecht führt den Aufruf aus und gibt das Ergebnis zurück. Das wiederholt sich, bis das Modell antwortet oder das Limit an Schritten erreicht ist. Diesen Ablauf nennt man einen [agentic Loop](https://www.anthropic.com/engineering/building-effective-agents).

Im letzten erlaubten Schritt darf das Modell keine Tools mehr aufrufen. Sonst könnte ein Modell, das noch suchen will, ohne Antwort enden. Die Antwort kommt immer im Format, das das Feature vorgibt. Bei der Diagnose ist das eine Zusammenfassung plus die Ids der betroffenen Actions.

Auch der agentic Loop kommt aus dem [AI SDK](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling), einer TypeScript-Library, die die APIs vieler Modell-Anbieter hinter eine gemeinsame Schnittstelle bringt.

### Der Model-Call

Für den Agent in der Sandbox nutzt Knecht [OpenCode](https://opencode.ai). OpenCode spricht selbst mit dem Modell, Knecht gibt ihm nur den Key und die Config. Ein Feature im Dashboard läuft dagegen im Server von Knecht, ohne OpenCode-Prozess. Dort ruft der Server das Modell direkt über das AI SDK auf.

Der Loop fragt das Modell über seine Rolle an:

```ts
const model = await languageModel('fast')
```

`languageModel` liest Provider, API-Key und Modell aus den Settings. Die Rolle `default` steht für das "Default model". Die Rolle `fast` steht für das "Subtask model", oder für das Default-Modell, wenn kein Subtask-Modell gesetzt ist. Deshalb lässt sich das Modell in den Settings wechseln, ohne den Code anzufassen.

Das AI SDK hat ein Paket pro Modell-Anbieter, und jeder Provider wird einem davon zugeordnet. Verkürzt sieht das so aus:

```ts
switch (provider) {
  case 'anthropic': return createAnthropic({ apiKey })(model)
  case 'openai': return createOpenAI({ apiKey })(model)
  case 'google': return createGoogleGenerativeAI({ apiKey })(model)
  case 'langdock': return isClaude(model)
    ? createAnthropic({ apiKey, baseURL: langdockAnthropicUrl })(model)
    : createOpenAI({ apiKey, baseURL: langdockOpenAiUrl })(model)
}
```

[Langdock](/updates/langdock-provider) spricht für Claude-Modelle die Anthropic-API und für alle anderen Modelle die OpenAI-API. OpenCode Zen und Go liefern jedes Modell über die API seines Anbieters aus. Welche API das ist, schlägt Knecht in [models.dev](https://models.dev) nach.

Die Features im Dashboard nutzen also denselben Provider, denselben Key und dieselbe Region wie OpenCode.

## MCP kommt bald

Diese Architektur ist nicht nur für das Dashboard gedacht. Über das [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) (MCP) können KI-Tools wie [Claude Code](https://claude.com/product/claude-code) oder Cursor Tools anderer Anwendungen nutzen. Bekommt Knecht einen MCP-Server, nutzt der dieselben Tools.

```text
Dashboard feature ──> runAiFeature ──> callTool ──> Tool
MCP client ──> MCP server ────────────> callTool ──> Tool
```

::note{variant='info'}
Agentic Loops sind nicht Teil der MCP-Spezifikation. MCP-Clients wie Claude oder Cursor bringen ihren eigenen agentic Loop schon mit.
::

Das Feature im Dashboard legt seine Tools im Code fest. Bei einem MCP-Client entscheiden die Scopes seines Tokens, welche Tools er sieht. Beide Wege enden bei `callTool`. Damit gelten dieselben Prüfungen, egal ob ein Feature im Dashboard fragt oder ein externes KI-Tool.

## Wie es weitergeht

Unsere Vision für Knecht ist, dass KI so nativ wie möglich ist. Die KI-Features sollen sich nicht wie ein nachträglich angeflanschtes Extra anfühlen, sondern wie ein natürlicher Teil des Dashboards. Die gemeinsame Registry und der Loop sind ein erster Schritt.

Weitere nützliche Features folgen bald, und die Architektur ist jetzt bereit dafür.

Wir freuen uns auf das, was damit möglich wird, und hoffen, ihr auch. Wenn ihr Ideen für Features habt, sagt uns gern Bescheid!
