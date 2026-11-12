---
title: Knecht liest das ganze Ticket
date: 2026-11-13
tag: Engine
description: Seit Version 0.17 bekommt der Agent jedes Ticket komplett, mit allen Kommentaren, Anhängen und verlinkten Tickets. Er antwortet im richtigen Thread, und die Regeln des Projekts gelten in jedem Schritt.
---

Bisher bekam der Agent von einem Ticket Beschreibung, Status, Labels und die neuesten Kommentare. Screenshots, Anhänge und verlinkte Tickets sah er nicht. Seit [Version 0.17](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.17.0) liest Knecht das ganze Ticket, in Jira, Linear, Plane und GitHub.

## Das ganze Ticket

Vor jedem Schritt und jeder Chat-Nachricht legt Knecht das Ticket als Dateien in die Session. Die Session ist der Arbeitskontext des Tickets, mit Checkout, Umgebung und Agenten-Gespräch. Sie enthält:

- eine lesbare Fassung mit Beschreibung und allen Kommentaren, mit Autor und Zeitpunkt
- die Rohdaten mit jedem Feld, in Jira auch die Custom Fields mit ihren Namen
- die Anhänge, auch direkt ins Ticket eingefügte Bilder

Der Agent kann außerdem zugehörige Tickets laden, zum Beispiel ein Sub-Issue oder verlinkte Tickets. Für sie gilt dasselbe wie oben.

### Warum Dateien

Bei großen Tickets will man nicht, dass der Agent jedes Mal das ganze Ticket in den Kontext laden muss. Liegen Dateien vor, entscheidet der Agent selbst, wie er das Ticket liest und welche Informationen er braucht.

::note{variant="info"}
Zwei Grenzen gibt es. Jira-Anhänge über 20 MB werden nur aufgelistet. In privaten GitHub-Repos kommen eingefügte Bilder an, hochgeladene Dateien wie PDFs aber nicht. GitHub liefert sie nur an angemeldete Browser aus.
::

### Immer aktuell

Alle Schritte einer Session teilen sich ein Gespräch. Deshalb verließ sich der Agent auf früher Gelesenes und übersah neue Kommentare. Darum lädt Knecht das Ticket neu, sobald ein [Webhook](https://docs.github.com/en/webhooks/about-webhooks) eine Änderung meldet, sonst spätestens nach zehn Minuten. Das fängt auch Änderungen ohne Webhook ab, etwa bearbeitete Kommentare. Kommen die Webhooks einer Integration gar nicht an, lädt Knecht vor jedem Schritt neu. Schlägt das Laden fehl, bleiben die alten Dateien, und der Agent erfährt, dass sie veraltet sein können.

## Antworten im Thread

In Jira, Linear und Plane antwortet Knecht auf eine Mention im Thread des Kommentars. Die Antwort beginnt mit einer Mention der fragenden Person, damit sie benachrichtigt wird. Wer lieber einen neuen Kommentar will, schreibt das in die Mention.

## Ein Gespräch pro Session

Bisher startete jede AI-Action ein neues Gespräch, nur der Chat setzte das letzte fort. Jetzt laufen alle AI-Actions und Chat-Nachrichten einer Session im selben Gespräch. Spätere Actions wissen, was frühere gemacht haben, und der Chat kennt den ganzen Workflow. Hat eine Action ein anderes Modell, wechselt Knecht es im laufenden Gespräch.

## Regeln in jedem Schritt

Knecht kennt [Anweisungen](/docs/usage/agent#instructions) für die Instanz und für Projekte, etwa "Setze das Jira-Ticket auf In Review, sobald der PR offen ist". Der Agent behandelte sie oft als optional, wenn die Anfrage sie nicht erwähnte. Deshalb haben wir einige System-Prompts angepasst, damit das besser funktioniert.
