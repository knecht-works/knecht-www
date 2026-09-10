---
title: Die Docs sind online
date: 2026-09-10
tag: Projekt
description: Knecht hat jetzt eine Dokumentation mit Suche, einem Chat-Assistenten und Feedback auf jeder Seite. Und einen Discord-Server, auf dem wir eure Rückmeldungen sammeln.
---

Bisher gab es zu Knecht nur diese Updates. Sie erzählen, warum etwas so gebaut ist, aber nicht, wie man es einrichtet. Wer eine Instanz aufsetzen oder einen Workflow bauen wollte, musste sich die Schritte aus mehreren Posts zusammensuchen. Seit dieser Woche gibt es unter [knecht.works/docs](/docs) eine Dokumentation. Dieser Post zeigt, was drinsteht und was die Seiten außer Text noch können.

## Was drinsteht

Die Docs sind auf Englisch, so wie das Dashboard, damit die Begriffe auf beiden Seiten gleich heißen. Sie bestehen aus drei Teilen.

::card-group
  :::card{title="Get Started" icon="i-lucide-rocket" to="/docs/get-started/introduction"}
  Was Knecht ist, die Begriffe aus dem Dashboard, Installation, Setup und der laufende Betrieb.
  :::

  :::card{title="Usage" icon="i-lucide-workflow" to="/docs/usage/projects"}
  Projekte, Workflows, Trigger und der AI Agent, also die Dinge, mit denen man täglich arbeitet.
  :::

  :::card{title="Resources" icon="i-lucide-life-buoy" to="/docs/resources/beta-testers"}
  Die Seite für Beta-Tester und ein Troubleshooting je Framework.
  :::
::

Vieles davon ist noch nicht sehr detailliert. Die Docs wachsen nach und nach mit dem Produkt. Knecht selbst hat noch einige Ecken und Kanten, und die polieren wir zuerst aus, bevor wir sie ausführlich dokumentieren. Sonst müssten wir die Seiten kurz darauf wieder umschreiben.

## Features

### Suche

Oben rechts sitzt eine Suche, die auch über :kbd{value="meta"} :kbd{value="K"} aufgeht. Sie durchsucht alle Docs-Seiten bis auf Abschnittsebene, ein Treffer springt also direkt zur passenden Überschrift.

![Die Docs-Suche über der Seite "Introduction", die Treffer gruppiert nach Get Started, Usage und Resources](/assets/docs-search.png)

### Frag Knecht

Neben der Suche gibt es den Button "Frag Knecht", der auch auf :kbd{value="meta"} :kbd{value="I"} hört. Er öffnet ein Chat-Fenster, in dem man Fragen in ganzen Sätzen stellt, auf Deutsch oder Englisch. Der Assistent antwortet aus dem Inhalt der Website, also aus den Docs und diesen Updates, und verlinkt die Seite, auf der die Antwort steht. Was auf der Website nicht steht, weiß er nicht, und das sagt er dann auch.

![Das Panel "Frag Knecht" rechts neben den Docs, mit der Frage nach der Installation und einer Antwort mit Anforderungen und dem Install-Befehl](/assets/docs-ai.png)

Öffnet man das Fenster auf einer Docs-Seite, bekommt der Assistent diese Seite als Kontext mit und bevorzugt sie bei der Antwort. Das lässt sich im Fenster abschalten. Dahinter läuft ein Claude-Modell, das bei jeder Frage den kompletten Inhalt der Website mitbekommt. Knecht speichert die Chats nicht.

### Docs als Markdown

Jede Docs-Seite gibt es auch als reines Markdown. Der Button "Copy page" oben auf der Seite kopiert den Text in die Zwischenablage. Das Menü daneben bietet den Markdown-Link, die Rohansicht und die Möglichkeit, die Seite direkt in ChatGPT oder Claude zu öffnen. Wer Knecht mit einem Coding-Agenten einrichtet, gibt ihm so die passende Seite mit, ohne HTML drumherum.

::tip
Für alles auf einmal gibt es [llms.txt](/llms.txt) mit der Übersicht und [llms-full.txt](/llms-full.txt) mit dem kompletten Inhalt der Website in einer Datei.
::

### Feedback pro Seite

Auf jeder Docs-Seite kann man uns direkt sagen, ob sie geholfen hat und was fehlt.

- Am Ende jeder Seite steht die Frage "Was this page helpful?" mit Daumen hoch und Daumen runter. Ein Klick genügt, wir sehen pro Seite, wie oft welche Antwort kam.
- "Provide Feedback" öffnet ein GitHub-Issue im [Repo der Website](https://github.com/knecht-works/knecht-www), mit dem Seitentitel schon im Betreff. Das Repo ist öffentlich, ein Tippfehler lässt sich also auch direkt als Pull Request korrigieren.

### Shortcuts

Suche und "Frag Knecht" lassen sich komplett über die Tastatur bedienen.

| Shortcut | Aktion |
|---|---|
| :kbd{value="meta"} :kbd{value="K"} | Suche öffnen |
| :kbd{value="meta"} :kbd{value="I"} | "Frag Knecht" öffnen und schließen |
| :kbd{value="meta"} :kbd{value="O"} | Neuen Chat starten |
| :kbd{value="tab"} | Aktuelle Seite als Kontext an- oder abschalten |

## Ecken und Kanten

Die Docs sind neu, und wir haben sie als die Leute geschrieben, die Knecht am besten kennen. Was für uns offensichtlich ist, fehlt vielleicht genau denen, die es zum ersten Mal einrichten. Uns interessiert deshalb vor allem, wo ihr hängen geblieben seid. Welche Seite hat eine Frage offen gelassen, welcher Begriff ist unerklärt, welches Setup hat nicht funktioniert wie beschrieben. Kleine Hinweise sind dabei oft die nützlichsten.

## Discord

Für alles, was kein Issue ist, gibt es seit Kurzem einen Discord-Server. Dort beantworten wir Fragen zum Setup, diskutieren Workflow-Ideen und zeigen, woran wir gerade bauen. Wer Knecht ausprobiert oder es vorhat, ist dort willkommen, auch ohne konkrete Frage.

::callout{icon="i-simple-icons-discord" color="primary" to="https://discord.gg/WuxjmtgUyX" target="_blank"}
Dem Knecht-Discord beitreten
::
