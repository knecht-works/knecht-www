---
title: Der Agent sieht die Preview
date: 2026-11-23
tag: Engine
description: Seit Version 0.22 öffnet der Agent die Preview einer Session in einem echten Browser, klickt sich durch und macht Screenshots. Die Screenshots zeigt er direkt im Chat.
---

Der Agent in einer [Session](/updates/sessions-rebuilt) kannte die Website bisher nur über ihren Code und über das HTML, das er per Request abrufen konnte. Ob das CSS lädt, ob ein Button nach dem Fix an der richtigen Stelle sitzt oder ob die Konsole voller JavaScript-Fehler ist, sieht man so nicht. Seit [Version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0) öffnet der Agent die Preview deshalb in einem Browser und schaut sie sich an wie ein Mensch.

## Ein Browser in der Session

Hat eine Session eine Preview, baut Knecht einen Headless-Chromium in den Web-Container ihrer DDEV-Umgebung. Headless heißt, der Browser rendert die Seite vollständig, nur ohne Fenster. Der Agent steuert ihn über [Playwright MCP](https://github.com/microsoft/playwright-mcp), einen [MCP-Server](/updates/mcp-servers) von Microsoft, der die Funktionen von [Playwright](https://playwright.dev/) als Tools anbietet.

Damit kann der Agent:

- Seiten öffnen und sich durchklicken, auch Formulare ausfüllen
- die Konsole und die Netzwerk-Requests der Seite lesen
- Screenshots machen und sie sich selbst ansehen

Über den Systemprompt regeln wir das sichtbare Änderungen geprüft werden sollen, bevor er sie als erledigt meldet. Ändert er zum Beispiel das CSS eines Headers, öffnet er danach die Seite, macht einen Screenshot und sieht nach, ob der Header so aussieht wie gewünscht.

## Screenshots im Chat

![Eine Antwort des Agenten im Chat mit zwei Screenshots der Startseite nebeneinander, Desktop und Mobile](/assets/knecht-agent-screenshots.png)

Jeder Screenshot, den der Agent macht, erscheint als kleines Bild unter dem Tool-Call (im Screenshot oben hat der Agent den Screenshot schon früher im Run gemacht). Will der Agent dir etwas zeigen, bindet er den Screenshot zusätzlich groß in seine Antwort ein, an der Stelle, über die er gerade schreibt. Stehen zwei Screenshots direkt untereinander, zeigt der Chat sie nebeneinander, etwa Desktop und Mobile.

Die Bilder liegen im Projektordner der Session auf dem Server, in einem Ordner, den Knecht aus Git ausschließt. Der Agent kann sie also nicht versehentlich committen. Knecht liest sie direkt aus diesem Ordner, deshalb laden sie auch dann, wenn die Umgebung der Session gerade gestoppt ist.

## Screenshots in Tickets

Schreibt der Agent einen Kommentar in Jira, Linear, Plane oder GitHub, etwa nach einer [Mention](/updates/sessions-and-mentions), kann darin auch ein Screenshot stehen. Das Bild liegt aber in der Sandbox, und die kann das Ticket-System nicht erreichen. Im Kommentar stand deshalb zuerst ein kaputtes Bild.

Jetzt wird aus dem Screenshot im Kommentar ein Link "Screenshot: ..." mit der Beschreibung des Agenten. Der Link öffnet die Session im Dashboard und dort direkt diesen Screenshot. Wer den Kommentar liest, braucht dafür einen Login in Knecht.

### Bilder in Tickets

Schöner wäre es, wenn der Screenshot direkt im Kommentar stünde. Dafür muss Knecht das Bild als Anhang ins Ticket hochladen, und jedes Ticket-System macht das anders. Jira, Linear und Plane haben dafür eigene APIs. GitHub hat für Kommentare gar keine öffentliche Upload-API, dort bräuchte es einen anderen Weg. Das kommt in einem späteren Release.
