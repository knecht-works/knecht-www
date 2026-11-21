---
title: MCP-Server für den Agenten
date: 2026-11-21
tag: Engine
description: Seit Version 0.22 kann der Agent Tools von MCP-Servern nutzen, etwa Sentry oder Notion. Man richtet sie einmal für alle Projekte oder pro Projekt ein und verbindet sie per Token oder OAuth.
---

Der Agent in einem [Run](/updates/workflow-engine) sieht bisher den Checkout, die Umgebung und das Ticket. Viel von dem, was eine Aufgabe braucht, liegt aber woanders. Der Stacktrace liegt in Sentry, die Spezifikation in Notion, und die Doku ist die der Library, die das Projekt nutzt. Seit [Version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0) kann der Agent dafür MCP-Server nutzen.

::note{variant="info"}
In [Eine Schnittstelle für KI im Dashboard](/updates/ai-tools) ging es um die andere Richtung. Dort wird Knecht selbst (künftig) zum MCP-Server, damit Tools wie Claude Code auf Runs und Logs zugreifen können. Dieser Post geht um MCP-Server, die der Agent in Knecht nutzt.
::

## Was MCP ist

Das [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) ist ein Standard, über den eine Anwendung einem KI-Agenten Tools anbietet. Sentry bietet zum Beispiel Tools, die Issues suchen oder einen Stacktrace lesen. Der Agent entscheidet selbst, wann er ein Tool aufruft. Steht im Ticket eine Sentry-Issue, liest er deren Stacktrace, bevor er den Fix schreibt.

## Einrichten

![Die Liste "MCP servers" in den Agent-Settings eines Projekts mit einem Projekt-Server, einem globalen Server und den Vorlagen darunter](/assets/knecht-mcp-servers.png)

Die Liste "MCP servers" steht in den Agent-Settings. In den globalen Agent-Settings gilt ein Server für alle Projekte, in den Agent-Settings eines Projekts nur für dieses Projekt. Hat ein Projekt einen Server mit demselben Namen wie ein globaler, ersetzt er den globalen in diesem Projekt. Einen globalen Server, den ein Projekt nicht braucht, schaltet man dort mit dem Schalter in seiner Zeile ab.

Für Sentry, Context7, Notion und Cloudflare gibt es Vorlagen, die URL und Anmeldung schon kennen. Jeder andere Remote-Server lässt sich über "Add custom server" mit seiner URL eintragen.

## Anmelden

Die meisten MCP-Server brauchen eine Anmeldung. Am einfachsten geht das per OAuth. Ein Klick auf "Connect" öffnet den Login des Anbieters im Browser, so wie man sich auch bei anderen Apps mit seinem Sentry- oder Notion-Konto anmeldet. Knecht registriert sich dabei selbst beim Server, man muss also vorher keine App beim Anbieter anlegen.

Der Agent arbeitet danach mit den Rechten des Kontos, das den Server verbunden hat. Deshalb zeigt die Zeile, wer ihn wann verbunden hat. Knecht erneuert den Zugang, bevor er abläuft. Klappt das nicht, etwa weil jemand den Zugang beim Anbieter widerrufen hat, zeigt die Zeile den Grund und den Button "Reconnect".

Ein Server lässt sich auch mit einem Token oder API-Key des Anbieters verbinden, oder mit eigenen Headern. All das speichert Knecht verschlüsselt, und das Dashboard zeigt nach dem Speichern nur noch eine Vorschau. Was die einzelnen Anmeldungen brauchen, steht auf der Doku-Seite zu [MCP-Servern](/docs/usage/mcp-servers).

## Wenn ein Server ausfällt

Ein MCP-Server ist ein fremder Dienst, der auch mal ausfällt. Deshalb prüft Knecht vor jedem AI-Schritt jeden Server. Antwortet einer nicht oder ist seine Anmeldung abgelaufen, lässt Knecht ihn für diesen Schritt weg und schreibt einen Hinweis ins Transkript des Runs. Der Run läuft ohne die Tools dieses Servers weiter, statt fehlzuschlagen.
