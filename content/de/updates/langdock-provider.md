---
title: Langdock als AI-Provider
date: 2026-08-18
tag: Engine
description: Der Agent läuft jetzt auch über Langdock. Ein API-Key deckt GPT- und Claude-Modelle ab, und jede Anfrage bleibt in der EU oder in den USA.
---

Der Agent in der [AI-Action](/updates/workflow-engine) ist [opencode](https://opencode.ai). Bisher lief er über die Provider von OpenCode selbst, also Zen oder Go, mit einem Key aus der OpenCode-Konsole. Jetzt haben wir Langdock als Provider dazu gebaut, eine europäische Alternative. Ein API-Key deckt auch hier die Modelle mehrerer Anbieter ab, aber jede Anfrage des Agenten bleibt in der gewählten Region.

## Was Langdock ist

[Langdock](https://langdock.com) ist ein AI-Gateway für europäische Firmen. Es sitzt vor mehreren Modell-Anbietern, darunter OpenAI, Anthropic, Google, Meta und Mistral. Das Team schließt einen Vertrag und bekommt einen API-Key, dahinter sind die Modelle aller Anbieter erreichbar.

Der zweite Grund für so ein Gateway ist Data Residency, also die Zusage, dass jede Anfrage in einer festen Region verarbeitet wird, EU oder US. Das betrifft den Agenten direkt, denn seine Prompts enthalten Code und Daten aus dem Kundenprojekt. Viele Kundenverträge schreiben vor, dass solche Daten die EU nicht verlassen. Mit Langdock in der Region EU gilt das auch für die Arbeit des Agenten, und oft ist das die Bedingung, unter der er auf dem Projekt überhaupt eingesetzt werden darf.

## Opencode kennt Langdock nicht

opencode löst Provider über das Register [models.dev](https://models.dev) auf. Für die bisherigen Provider reicht deshalb eine Umgebungsvariable mit dem API-Key, alles Weitere weiß opencode selbst. Langdock steht in dem Register nicht, dieser Weg fällt also aus.

Stattdessen erzeugt Knecht für jeden Run eine `opencode.json` im Checkout und deklariert Langdock darin als eigenen Provider, mit dem Endpoint der gewählten Region und genau den Modellen, die dieser Run nutzen darf. Gekürzt sieht der Block so aus:

```json
{
  "provider": {
    "langdock": {
      "name": "Langdock",
      "options": {
        "baseURL": "https://api.langdock.com/openai/eu/v1",
        "apiKey": "{env:LANGDOCK_API_KEY}"
      },
      "models": { "gpt-5.5": {} }
    }
  }
}
```

Der Key selbst steht nicht in der Datei. Die Config verweist mit `{env:LANGDOCK_API_KEY}` nur auf eine Umgebungsvariable, und Knecht übergibt den Wert direkt dem opencode-Prozess. Im Checkout, in dem der Agent arbeitet, landet der Key damit nie.

Eine Eigenheit des Gateways steckt noch in der `baseURL`. Langdock spricht je nach Modell eine andere API, Claude-Modelle die Anthropic-kompatible, alle anderen die OpenAI-kompatible. Knecht entscheidet am Modellnamen, unter welchem Endpoint ein Modell in der Config deklariert wird. Im Picker wählt man nur ein Modell, von der Unterscheidung merkt man nichts.

## Die Einrichtung

Alles dazu liegt unter "Settings" → "Agent". Dort wählt man Langdock als Provider, daneben erscheint die Auswahl der Region. Sie gilt für die ganze Instanz, also für jede Anfrage aus jedem Run. Danach speichert man den Langdock-API-Key. Er liegt wie alle Provider-Keys [verschlüsselt](/updates/gh-auth-evolution) in der Datenbank und lässt sich nachträglich nur ersetzen, nicht wieder auslesen.

<!-- TODO(samuel): Screenshot der Agent-Settings mit Langdock als Provider, Region-Auswahl und geladenem Modell-Picker -->
![Die Agent-Settings mit Langdock als Provider, der Region-Auswahl und dem geöffneten Modell-Picker](/assets/settings-agent-langdock.png)

Sobald der Key gespeichert ist, lädt der Modell-Picker die Liste live aus dem Langdock-Workspace. Es erscheinen genau die Modelle, die dort freigeschaltet sind, GPT- und Claude-Modelle im selben Picker. Default-Modell und das optionale Subtask-Modell, das kleinere Modell für Nebenaufgaben des Agenten, funktionieren wie bei jedem anderen Provider.

::note
Beim Wechsel des Providers leert Knecht die gespeicherten Modelle, denn die alten Namen würden im Katalog des neuen Providers nicht auflösen. Die AI-Action läuft erst wieder, wenn ein neues Default-Modell gewählt ist.
::

## Modelle mischen

An der AI-Action selbst ändert sich nichts. Der Agent arbeitet wie gewohnt im laufenden Projekt, liest Code, ändert Dateien und führt Befehle aus, auch mit Reasoning-Modellen wie GPT-5.5. Und weil ein Key alle Modelle des Workspace abdeckt, kann ein Workflow über den Modell-Override pro Schritt weiterhin die Anbieter mischen:

```yaml
steps:
  - type: ai
    id: analyze
    label: Analyze bug
    model: gpt-5.5
    prompt: Stelle den Bug aus {{ inputs.title }} nach und beschreibe die Ursache.
  - type: ai
    id: fix
    label: Fix bug
    model: claude-sonnet-4-5
    prompt: Behebe die Ursache aus {{ steps.analyze.text }}.
```

Beide Schritte laufen über denselben Langdock-Key und in derselben Region. Der Wechsel auf das EU-Gateway kostet an dieser Stelle also nichts, was man von OpenCode Zen gewohnt ist.
