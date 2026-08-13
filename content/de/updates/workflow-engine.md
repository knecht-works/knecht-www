---
title: DDEV-Projekte automatisieren mit Workflows
date: 2026-07-13
tag: Engine
description: Automatisierung für DDEV-Projekte. Knecht führt Composer-Updates und Tests in einer Sandbox aus und öffnet Pull Requests. Mit AI-Agent, der Bugs im Projekt fixt.
---

Ein Workflow ist eine Liste von Schritten, die Knecht automatisch für ein Projekt ausführt. Zum Beispiel Projekt starten, Composer-Pakete updaten, Tests laufen lassen und einen Pull Request öffnen. Die letzten Wochen sind fast komplett in diese Engine geflossen. Hier steht, was sie kann, was die AI-Action von einem Chat unterscheidet und was noch fehlt.

![Der Workflow-Editor mit Trigger, Schritten und der Action-Bibliothek](/assets/workflow-detail.png)

## Wie ein Workflow läuft

Wird ein Workflow gestartet, entsteht ein **Run**, eine einzelne Ausführung auf einem Projekt. Jeder Run bekommt eine eigene, abgeschottete Umgebung, die **Sandbox**. Darin läuft das Projekt komplett, der Code frisch von GitHub, die Datenbank eingespielt, [DDEV](https://ddev.com) gestartet. Das Live-System und andere Runs bekommen davon nichts mit. Warum jeder Run seine eigene Sandbox bekommt, steht im [Architektur-Post](/updates/dashboard-architecture).

Die Schritte laufen nacheinander, und jeder hinterlässt Ergebnisse, die spätere Schritte über Platzhalter einsetzen.

```
{{ steps.run_tests.stdout }}      die Ausgabe des Schritts "Run tests"
{{ inputs.title }}                der Titel des Tickets, das den Workflow gestartet hat
```

Auswendig wissen muss man das nicht. Wer `{{ ` tippt, bekommt eine Liste mit allem, was an dieser Stelle verfügbar ist. Und nach jedem Schritt speichert Knecht, was passiert ist. Deshalb sieht man live, wo ein Run steht, und ein fehlgeschlagener Run lässt sich genau ab dem Schritt fortsetzen, an dem er hängen blieb.

## Die Actions

Jeder Schritt führt eine Action aus. Grob gibt es drei Sorten.

::field-group
  :::field{name="Deterministische Actions"}
  Erledigen genau eine Sache, immer gleich. Sie booten das Projekt, führen einen Shell-Befehl wie `composer update` aus, lassen eigenen JavaScript-Code laufen, rufen eine externe URL auf, prüfen die ganze Sitemap auf kaputte Links oder bringen die Änderungen als Pull Request zurück nach GitHub.
  :::

  :::field{name="Kontrollfluss-Actions"}
  If/else führt Schritte nur unter einer Bedingung aus, zum Beispiel "wenn die Tests fehlgeschlagen sind". Loop wiederholt Schritte für jeden Eintrag einer Liste.
  :::

  :::field{name="AI-Action"}
  Lässt einen Agenten im laufenden Projekt arbeiten, dazu gleich mehr.
  :::
::

Weil nicht jeder Fehler ein echter Fehler ist, hat jeder Schritt seine eigene Fehler-Policy. Wackelige Befehle bekommen Retries mit Backoff, und mit `continueOnError` läuft der Run trotz Fehler weiter. Die Bibliothek wächst gerade noch, einen teil der aktuellen Actions können im oberen Screenshot angesehen werden.

### Ein Agent, kein Chat

Die AI-Action startet [opencode](https://opencode.ai) mit eurem eigenen API-Key direkt in der Sandbox. Der Agent arbeitet im echten, laufenden Projekt, er liest Code, ändert Dateien und führt Befehle aus. Ein Chat sagt dir, wie ein Fix aussehen könnte. Der Agent wendet ihn an und probiert aus, ob er funktioniert.

![Die AI-Action mit Prompt, festem Output-Format und den verfügbaren Variablen](/assets/workflow-ai-action.png)

Statt Fließtext kann der Agent feste Output-Felder wie `prTitle` liefern, als geprüftes JSON für spätere Schritte. Und er ist nach dem Run nicht weg. Ein Chat auf der Run-Seite setzt dieselbe Session fort, "Mach den Button noch blau" braucht keinen neuen Run.

### Sicher eingesperrt

Alles, was ein Workflow ausführt (Shell-Befehle, eigener Code, der Agent), läuft ausschließlich in der Sandbox, nie auf dem Server selbst. 

Auch Projekt-Secrets bleiben, wo sie hingehören. API-Keys und Tokens liegen [verschlüsselt](/updates/gh-auth-evolution) in der Datenbank. Die Preview-URLs sind ebenfalls nicht öffentlich, denn wer eine öffnet, braucht einen Knecht-Login.

## Die Trigger

Ein Trigger legt fest, wann ein Workflow von selbst startet. Das ist der Punkt, an dem aus einem Werkzeug Automatisierung wird, denn niemand muss mehr daran denken, den Ablauf anzustoßen. Der Workflow läuft, sobald seine Bedingung eintritt, auch nachts und am Wochenende. Aktuell gibt es drei Arten.

::field-group
  :::field{name="Manuell"}
  Per Klick im Dashboard oder als Test-Run direkt im Editor.
  :::

  :::field{name="Integrationen"}
  Knecht reagiert auf Events aus GitHub und Jira. Bekommt ein Jira-Ticket zum Beispiel das Label "knecht", startet der Workflow, und der fertige PR-Link landet als Kommentar auf dem Ticket.
  :::

  :::field{name="Cron"}
  Nach Zeitplan, zum Beispiel jeden Montag um 6 Uhr die Security-Updates prüfen.
  :::
::

Ein Trigger kann mehrere Projekte anhängen und startet für jedes einen eigenen Run.

## Nach dem Start

Bevor ein Trigger scharf geschaltet wird, lässt sich der Workflow direkt im Editor testen, gegen ein echtes Projekt in einer eigenen Sandbox. Für Test-Runs gilt dabei dasselbe wie für echte.

![Ein Test-Run direkt im Editor, mit Live-Log und laufendem Schritt](/assets/workflow-test-run.png)

Innerhalb eines Runs läuft alles bewusst nacheinander, parallele Zweige gibt es nicht. Ein Run bleibt eine lineare, nachvollziehbare Kette. Wie viele Runs gleichzeitig laufen, ist konfigurierbar, alles darüber wartet in der Queue.

## Workflows als Code

Jeder Workflow lässt sich als YAML oder JSON exportieren und wieder importieren. Damit wandert ein Workflow ins Git-Repo, bekommt Reviews wie jeder andere Code und lässt sich zwischen Projekten oder Instanzen kopieren. Wer lieber im Texteditor arbeitet, schreibt die Datei direkt und importiert sie fertig.

Das Format öffnet auch die Tür für später. Ein Workflow, der sich bei einer Agentur bewährt hat, funktioniert bei der nächsten genauso, weil er nur aus Schritten und Platzhaltern besteht. Denkbar ist ein Workflow-Store, aus dem man sich fertige Abläufe wie Security-Updates oder Link-Checks direkt installiert, statt sie selbst zusammenzuklicken.

## Was noch fehlt

Ein Benachrichtigungssystem gibt es noch nicht. Schlägt ein Run fehl, sieht man das bisher nur im Dashboard. Wer es sofort wissen will, ruft mit dem HTTP-Schritt am Ende des Workflows einen Slack-Webhook auf. Auch ein hartes Zeitlimit pro Run fehlt noch, ein hängender Schritt läuft, bis man ihn abbricht.

