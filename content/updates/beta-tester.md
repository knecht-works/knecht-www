---
title: Beta Tester gesucht
date: 2026-06-08
tag: Beta
description: Knecht ist bereit für echte Projekte. Wir suchen ein paar Agenturen, die ihn als Erste einsetzen und mitgestalten.
---

Knecht läuft. Jetzt braucht er das, was kein lokaler Test ersetzen kann: echte Projekte, echte Bugs und ehrliches Feedback. Dafür suchen wir eine Handvoll Agenturen, die Knecht als Erste einsetzen.

::note
**Neu hier?** Knecht ist ein Dashboard auf deinem eigenen Server: Er bootet deine DDEV-Projekte als komplett lauffähige Umgebungen, erledigt Aufgaben darin über Workflows und liefert fertige Pull Requests mit Preview. Mehr dazu auf der [Startseite](/) und in [Was macht der Knecht](/updates/was-macht-knecht).
::

## Was Knecht konkret macht

Ein Beispiel aus dem Agentur-Alltag: Für ein Craft-CMS-Projekt erscheint ein Security-Patch. Um ihn einzuspielen, muss die Datenbank laufen, denn nach dem `composer update` laufen Migrations, die Files schreiben, und die müssen mit in den Commit. Dependabot kann das nicht, er hat kein laufendes Projekt. Knecht schon:

1. Der Patch erscheint, ein Trigger startet deinen Update-Workflow.
2. Knecht bootet das Projekt per DDEV, inklusive Datenbank.
3. `composer update` läuft im echten Projekt, Migrations laufen, Tests laufen.
4. Du bekommst einen Pull Request mit Preview-Link. Prüfen, mergen, fertig.

Diesen Workflow baust du einmal. Danach läuft er für jedes deiner Projekte, bei jedem Patch.

## Wen wir suchen

Knecht entfaltet seinen Nutzen dort, wo viele Projekte gepflegt werden müssen. Genau dafür ist das ideale Profil:

- **Ihr arbeitet mit DDEV.** Eure Projekte sind bereits dafür konfiguriert oder lassen sich leicht darauf umstellen.
- **Ihr betreut mehrere Projekte.** Security-Updates und Bugfixes sind bei euch wiederkehrende Arbeit, kein Einzelfall.
- **Ihr habt eine verantwortliche Person.** Jemand, der Knecht ausprobiert und uns regelmäßig zurückspielt, was funktioniert und was nicht.

Wenn das auf euch passt, seid ihr genau richtig.

Genauso ehrlich: Wer ein eigenes Platform-Team hat, Kubernetes samt eigener Pipelines betreibt oder in air-gapped Umgebungen arbeitet, hat die Probleme, die Knecht löst, vermutlich schon anders gelöst. Dann ist Knecht nichts für euch, und das ist völlig okay.

## Unser Angebot

::note
Wir setzen Knecht für euch auf und übernehmen **100 € OpenCode-Guthaben**, damit die AI Agents direkt loslegen können.
::

Ihr müsst euch also nicht durch die Einrichtung kämpfen und geht kein finanzielles Risiko ein. Ihr bekommt einen lauffähigen Knecht auf eurem eigenen Server, eingerichtet auf eure Projekte, plus das Guthaben, um ihn wirklich zu nutzen.

## Was wir uns wünschen

Im Gegenzug brauchen wir ehrliches Feedback. Was hilft euch im Alltag? Wo hakt es? Was fehlt? Diese Rückmeldungen aus echten Agentur-Projekten sind für uns mehr wert als jeder isolierte Test.

## Mehr als testen: mitgestalten

Das ist die Chance, Knecht früh mitzuentwickeln. Euer Feedback fließt direkt in die Roadmap. Ihr seht nicht nur, wohin sich das Produkt entwickelt, ihr bestimmt die Richtung mit, bevor sich vieles verfestigt.

## Interesse?

Schreib uns einfach kurz an [hallo@knecht.works](mailto:hallo@knecht.works). Erzähl uns von eurer Agentur und euren Projekten, dann finden wir gemeinsam heraus, ob es passt.

## Weitersagen

Du kennst eine Agentur, für die das passt? Dann beschreib Knecht am besten so:

> Knecht ist ein selbst gehostetes Dashboard für Agenturen mit vielen DDEV-Projekten. Er bootet jedes Projekt als lauffähige Umgebung, erledigt Aufgaben darin über Workflows und liefert fertige Pull Requests mit Preview. Beta-Tester gesucht: https://knecht.works/updates/beta-tester

Das ist die ganze Idee in drei Sätzen, und mehr braucht es fürs Teilen nicht.
