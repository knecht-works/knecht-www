---
title: Was macht der Knecht
date: 2026-05-15
tag: Setup
description: Über die Ideenfindung, die Motivation und wie Knecht dabei hilft.
---

Ein Bugreport beginnt immer mit dem Versuch, den Fehler zu reproduzieren. Und nach dem Fix muss man sicherstellen, dass er wirklich behoben ist. Oder?

## Motivation

Agenturen betreuen oft viele Projekte. Diese sind häufig unterschiedlich konfiguriert oder laufen nur auf dem Rechner des einen Mitarbeiters, der von Anfang an dabei ist. Trotzdem brauchen alle regelmäßig Security-Updates und Bugfixes.

Damit AI Agents hier wirklich helfen können, brauchen wir vollständig lauffähige Projekte.

### Security Updates

Um ein Security-Update in ein CMS einzuspielen, ist fast immer eine laufende Datenbank nötig – denn nach einem Update können Datenbank-Migrationen anstehen. Dependabot und andere Bots können deshalb nicht einfach ein `composer update` machen und live ausrollen.

### Bug fixes

Leider ist es nicht immer so einfach: 

::prompt{description="Pls fix!"}
https://youtu.be/dQw4w9WgXcQ?t=0
::

Für einen Bugfix muss zuerst ein Mitarbeiter frei sein – im besten Fall einer, der das Projekt schon lokal laufen hat, um den Fehler nachhaltig zu lösen. Und wenn nicht?

## DDEV

DDEV ist eine Docker-basierte Entwicklungsumgebung. Mit ihr lässt sich ein Projekt vollständig betreiben, ohne Entwickler-Tools direkt auf dem Gerät zu installieren.

So fährt jedes Projekt reproduzierbar und isoliert hoch: Web und Datenbank kommen sauber konfiguriert und immer auf die gleiche Weise. Genau diese Verlässlichkeit ist die Grundlage für alles Weitere. Denn was sich auf Knopfdruck immer gleich booten lässt, kann auch eine Maschine booten.

## Was der Knecht macht

Knecht wird als Dashboard gebaut, das du auf deinem eigenen Server hostest – so behältst du die Daten. Im Dashboard gibt es Preview-Links und Screenshots (über Penthouse), mit denen du einen Bugfix direkt verifizieren kannst.

### How it works

In Knecht gibt es Projekte, Workflows und Trigger.

::steps{level="3"}

### Projekte

Ein Projekt besteht immer aus einem GitHub-Repository, in dem DDEV bereits konfiguriert ist. Darin lassen sich dann noch Environment-Variablen und die Datenbank festlegen.

### Workflows

Ein Workflow ist ein vordefinierter Prozess, der mit Projekten arbeitet. Er kann zum Beispiel so aussehen: Projekt booten → Composer-Pakete updaten → PR mit den Änderungen erstellen. Die Schritte werden also deterministisch abgearbeitet.

Bugfixes sind aber selten immer gleiche, wiederholbare Schritte. Hier kommen AI Agents ins Spiel: Über Opencode können sie einen Bug im laufenden Projekt reproduzieren und beheben.

### Trigger

Ein Trigger ist der Startpunkt eines Workflows. Über Webhooks – etwa von Jira oder GitHub – kann der Knecht vordefinierte Workflows automatisch starten und die Ergebnisse später als Pull Request liefern.

::
