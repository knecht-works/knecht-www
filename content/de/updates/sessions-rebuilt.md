---
title: Eine Session für Ticket, PR und alles dazwischen
date: 2026-11-20
tag: Engine
description: Seit Version 0.21 gehören Ticket und Pull Request in dieselbe Session. Eine Session startet auch ohne Workflow, und das Dashboard zeigt sie als Ganzes.
---

Eine [Session](/updates/sessions-and-mentions) hält Checkout, Umgebung und Agenten-Gespräch einer Aufgabe. Bisher gehörte sie zu genau einem Ticket oder Pull Request. Öffnete Knecht zu einem Ticket einen PR, landeten Reviews und Kommentare auf diesem PR in einer neuen Session. Seit [Version 0.21](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.21.0) kann eine Session mehrere Tickets und PRs halten. Außerdem startet sie auch ohne Workflow, und das Dashboard zeigt sie als Ganzes statt als einzelne Runs.

## Ticket und PR zusammen

Ein PR, den Knecht aus einer Session öffnet, gehört ab jetzt zu dieser Session. Ein Review oder eine Mention auf dem PR läuft im selben Checkout und im selben Gespräch wie die Arbeit am Ticket. Der Agent weiß also, warum er den Code so geschrieben hat.

Öffnet jemand den PR von Hand, hängt Knecht ihn an die Session, die auf dessen Branch arbeitet. Knecht weiß außerdem, von welchem Ticket oder PR eine Anfrage kam, und antwortet dort. Eine Mention auf dem PR bekommt ihre Antwort auf dem PR, nicht im Ticket. Die Session bleibt offen, bis alle ihre Tickets und PRs geschlossen sind.

Manchmal soll ein Review auf dem PR den Code ohne die Vorgeschichte des Tickets ansehen. Das geht auch, wie der Abschnitt [Frischer Kontext](#frischer-kontext) zeigt.

## Sessions ohne Workflow

Bisher brauchte man für eine Session im Dashboard einen Workflow. Wer nur kurz etwas am Projekt ausprobieren oder den Agenten etwas fragen wollte, musste dafür einen Workflow bauen. Die wichtigste Aktion im Projekt-Header heißt jetzt "Start session". Sie fragt nach dem Branch und hat einen Schalter "Boot a preview".

![Der Dialog "Start session" mit Branch-Auswahl, dem Schalter "Boot a preview" und der Liste der Workflows daneben](/assets/knecht-start-session.png)

Ohne den Schalter startet eine [Code-Session](/updates/lightweight-workspaces). Das ist ein leichter Container mit Checkout und Tools, aber ohne Datenbank und Preview. Den Namen bekommt die Session von der ersten Nachricht im Chat, die ein kleines Modell in ein paar Worten zusammenfasst. Dasselbe gilt für Runs, die eine Mention startet. Sie heißen jetzt nach ihrer Aufgabe statt "Mention".

### Die Preview bei Bedarf

Eine Code-Session zeigt keinen leeren Preview-Rahmen mehr. Wer die Seite doch braucht, findet "Start preview" im Menü "More actions" im Run-Header.

Du kannst den Agenten auch im Chat um eine Preview bitten. Und merkt der Agent in einem Follow-up oder bei einer Mention, dass er die laufende Seite braucht, etwa um einen Fehler nachzustellen, bittet er Knecht von sich aus um den Boot. Knecht startet DDEV mit Datenbank, Boot-Befehlen und Dev-Server, und der Agent arbeitet im selben Gespräch weiter, sobald die Seite läuft.

## Die Session im Dashboard

Ein Klick auf eine Session in der Liste öffnet jetzt die ganze Session, nicht einen ihrer Runs.

![Eine Session mit Ticket und Pull Request im Header und einem Log, das die Schritte von drei Runs untereinander zeigt](/assets/knecht-session-log.png)

Der Header zeigt jedes Ticket und jeden PR der Session. Ein PR aus einem früheren Run bleibt dadurch einen Klick entfernt, auch wenn der aktuelle Run keinen eigenen hat.

## Frischer Kontext

Alle AI-Actions einer Session teilen sich ein Agenten-Gespräch. Das ist meistens gewollt, denn ein Fix soll auf der Analyse aufbauen. Manchmal stört die Vorgeschichte aber, etwa bei einem Review, das den Code ohne die Begründungen des Autors ansehen soll. Dafür hat seit [Version 0.21.1](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.21.1) jede AI-Action den Schalter "Fresh context". Die Action startet dann ohne den Chat-Verlauf der Session, und das Gespräch der Session bleibt unberührt. Ihre letzte Nachricht bekommt das Gespräch beim nächsten Schritt einmal mit, damit der Agent dort weiß, was das Review ergeben hat.

::note{variant="info"}
Weil der Schalter an der einzelnen AI-Action hängt, kann ein Workflow beides mischen. Eine Action setzt das Gespräch der Session fort, die nächste schaut sich den Code ohne Vorgeschichte an.
::
