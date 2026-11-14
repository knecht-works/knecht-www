---
title: Ein leichter Container, bis die Preview gebraucht wird
date: 2026-11-14
tag: Engine
description: Nicht jeder Workflow braucht eine gebootete Website. Seit Version 0.16 startet eine Session in einem leichten Container und bootet DDEV erst, wenn ein Workflow die Preview wirklich braucht.
---

Bisher startete Knecht für jede [Session](/updates/sessions-and-mentions), also Checkout, Umgebung und Agenten-Gespräch eines Tickets, die komplette Preview. Seit [Version 0.16](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.16.0) startet eine Session in einem leichten Container und bootet die Preview erst, wenn ein Workflow sie verlangt.

## Das Problem

Ein Workflow, der ein Ticket zusammenfasst, liest nur Dateien. Trotzdem startete Knecht die Entwicklungsumgebung samt Datenbank-Import und Preview. Das kostete Zeit und RAM.

Dazu kam ein Fehler. Fand ein Schritt keine laufende Umgebung, startete Knecht ein einfaches `ddev start` ohne die Boot-Befehle des Projekts. `npm ci` lief nie, und spätere Schritte sahen eine halb gebootete Umgebung.

## Zwei Stufen pro Session

### Code-Session

Jede Session startet als Code-Session. Schritte und Follow-ups (Chat-Nachrichten an den Agenten) laufen im **Workspace**. Das ist ein Container auf Basis des DDEV-Web-Images, mit Checkout, Composer, npm und Git, aber ohne Datenbank und Preview. Er startet in etwa einer Sekunde. Mounts, Limits und Umgebungsvariablen aus den Projekt-Settings gelten wie in DDEV, und "Terminal" und "Open in IDE" funktionieren auch hier.

### Preview-Session

Die Action "Boot project" startet DDEV mit Datenbank, Boot-Befehlen, Dev-Server und Preview. Danach bleibt die Session eine Preview-Session, damit sich spätere Schritte auf die Datenbank verlassen können. Nur noch diese Action bootet eine Umgebung, damit ist auch der Fehler von oben weg.

| | Code-Session | Preview-Session |
|---|---|---|
| Container | ein Workspace | DDEV-Stack mit Web-Container und Datenbank |
| Start | etwa eine Sekunde | etwa 10 Sekunden, plus die Boot-Befehle |
| RAM im Leerlauf | etwa 1 MB | etwa 180 MB |
| Datenbank | keine | aus dem Projekt-Dump |
| Preview und Dev-Server | nein | ja |
| PHP und Node | 8.4 und 24 aus dem Image | Versionen des Projekts |

Gemessen im November 2026 mit einem kleinen PHP-Projekt. Mit `composer install` und `npm install` als Boot-Befehlen war die Preview nach 25 Sekunden bereit.

### Ein gemeinsamer Lebenszyklus

Beide Stufen werden bei Nichtbenutzung gestoppt und später archiviert. Ein Restore bringt die Session in ihrer Stufe zurück, eine Preview-Session mit ihrer archivierten Datenbank.

::note
Startet ein Follow-up oder das Terminal, während die Umgebung stoppt, bootet oder wiederhergestellt wird, bricht es mit "The environment is ..." ab, statt ihr in die Quere zu kommen.
::

## Was sich für Workflows ändert

Zu prüfen sind drei Fälle:

- Ein Workflow, der ohne "Boot project" die Datenbank oder den Dev-Server nutzt, braucht jetzt diese Action.
- Der Workspace hat PHP 8.4 und Node 24 aus dem Image. Braucht ein Schritt die Projekt-Version, gehört er hinter "Boot project".
- bun fehlt im Workspace.

::note
Version 0.16 braucht Docker 28. Knecht hängt sich ins Netzwerk jeder Session. Bei älteren Versionen konnte das die Standardroute des Dashboards übernehmen, und Verbindungen brachen ab, sobald eine Umgebung startete oder stoppte. Docker 28 kennt eine [Priorität pro Netzwerk](https://docs.docker.com/reference/cli/docker/network/connect/). Das Install-Script prüft die Version.
::
