---
title: Knecht antwortet jetzt auf GitHub
date: 2026-08-17
tag: Engine
description: Jedes Issue bekommt eine eigene Session mit Umgebung und Gespräch, der Agent antwortet und labelt direkt im Thread, und mit einer Mention schickt ihr ihn zurück an die Arbeit.
---

Bisher lief bei Knecht alles in eine Richtung. Ein [Trigger](/updates/workflow-engine) feuerte, ein Workflow lief, und das Ergebnis lag im Dashboard. Wer im GitHub-Issue auf eine Antwort wartete, sah dort nichts. Mit diesem Update arbeitet Knecht dort, wo die Arbeit gemeldet wird. Er antwortet und labelt direkt im Issue-Thread, und mit einer Mention im Kommentar schickt ihr ihn zurück an die Arbeit.

## Vom Bug-Report zum PR

So sieht das auf unserem Craft-Testprojekt aus. Jemand meldet per Issue, dass die Seite keinen Dark Mode hat. Ein Trigger startet den Workflow "Classify Issue". Knecht bootet die Seite in ihrer [Preview-Umgebung](/updates/sandbox-rollback), stellt den Report nach und findet heraus, dass Dark Mode schlicht nie implementiert wurde. Er setzt das vorhandene Label `enhancement` und antwortet dem Reporter im Thread.

![GitHub-Issue mit einem Dark-Mode-Bug-Report, unter dem die App knecht-works das Label enhancement gesetzt hat](/assets/issue-creation-with-label.png)

Die Antwort enthält den Befund und einen konkreten Plan für die Umsetzung, mit der Preview-URL am Ende.

![Kommentar der App knecht-works im Issue mit Befund und Umsetzungsplan, darunter ein Kommentar des Teammitglieds mit einer Mention und einer Augen-Reaktion](/assets/issue-follow-up.png)

Ein Teammitglied liest die Analyse und antwortet mit einer Mention, sinngemäß "@knecht-works, setz das um und öffne einen PR". Knecht bestätigt sofort mit einer Augen-Reaktion und arbeitet weiter, in derselben Umgebung und demselben Gespräch wie die Triage. Er kennt also den Befund und den Plan schon. Ein paar Minuten später steht die Antwort im Thread, mit dem geöffneten PR und der Preview-URL.

![Antwort der App knecht-works im Issue mit einer Zusammenfassung der beiden Commits, am Ende Preview-URL und PR-Link](/assets/issue-enhancement-finished.png)

Dass der Fix auf der Triage aufbauen kann, liegt an der größten Änderung dieses Updates, den Sessions.

## Eine Session pro Issue

Bisher war jede Workflow-Ausführung ihre eigene Welt, mit eigenem Checkout, eigener Umgebung und eigenem Agenten-Gespräch. Beim Bauen der Antwort-Schleife hat sich gezeigt, dass das die falsche Einheit ist, denn Umgebung und Kontext gehören zum Issue, nicht zur einzelnen Ausführung. Deshalb gibt es jetzt Sessions. Eine Session gehört zu genau einem Issue oder PR und hält dessen Checkout, dessen Umgebung und ein gemeinsames Agenten-Gespräch. Darin laufen die Runs, also einzelne Workflow-Ausführungen, und Follow-ups, also einzelne Nachrichten an den Agenten.

![Projektseite im Knecht-Dashboard mit der Run-Liste, gruppiert nach Issues, unter dem Dark-Mode-Issue vier Runs von der Triage bis zu zwei Mentions](/assets/knecht-project-triggers-in-action.png)

Die Projektseite und die Run-Übersicht gruppieren Runs jetzt nach Session. Im Screenshot gehören vier Runs zum Dark-Mode-Issue, von "Classify Issue" bis zu den beiden Mentions, alle in derselben Umgebung. Im Detail heißt das:

- Feuern zwei Trigger auf dasselbe Issue, laufen sie nacheinander in der Session, nie parallel.
- Wird das Issue geschlossen, schließt auch die Session. Ein Reopen belebt sie wieder, solange ihre Umgebung noch existiert.
- Beim Archivieren einer Umgebung sichert Knecht jetzt auch das Gespräch des Agenten, ein paar Megabyte. Es übersteht damit einen Archive-Restore-Zyklus.
- Events ohne Issue oder PR, also Push, Zeitplan und manueller Start, verhalten sich wie bisher und bekommen eine Session mit einem einzigen Run.

Wird eine Umgebung ganz abgebaut, ist das Gespräch weg. Der Agent setzt dann nicht stumm bei null an, sondern liest den GitHub-Thread, die Ergebnisse der bisherigen Actions und das [Projekt-Gedächtnis](/updates/agent-memory), und sagt im Thread dazu, dass er neu ansetzt. Bestehende Installationen müssen dafür nichts tun, das Update stellt vorhandene Runs und Umgebungen beim Start automatisch auf Sessions um.

## Das Beispiel Cloudflare

Dass sich Issue-Triage komplett automatisieren lässt, hat Cloudflare im August 2026 am Repository des Astro-Frameworks gezeigt. Ihr [Triage-System](https://blog.cloudflare.com/astro-issue-triage/) reproduziert jeden Report, diagnostiziert die Ursache und baut den Fix, die offenen Issues sind damit von über 200 auf rund 30 gefallen. Es ist allerdings ein eigenes Stück Software, von einem Team bei Cloudflare für genau dieses Repository gebaut. Bei Knecht ist derselbe Ablauf ein Workflow, den ihr auf eure eigenen Projekte legt, und die Session bringt die gebootete Seite gleich mit.

## Wie es weitergeht

Als Nächstes gehen wir Jira an. Die Konzepte bleiben dieselben, ein Ticket bekommt seine Session mit Umgebung und Gespräch, und Antworten und Mentions funktionieren im Ticket genauso wie im Issue-Thread.
