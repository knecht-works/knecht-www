---
title: Ein Terminal und VS Code für jeden Run
date: 2026-07-27
tag: Dashboard
description: Ein Terminal im Browser, ein fertiger SSH-Befehl und VS Code ohne lokales Setup. Jeder Run lässt sich jetzt direkt öffnen und weiterbearbeiten.
---

Ein Run ist eine einzelne Ausführung eines [Workflows](/updates/workflow-engine) auf einem Projekt, mit eigener Umgebung auf dem Server. Bisher kam man an diese Umgebung nur über das Dashboard heran. Man konnte dem Agenten Anweisungen schicken und die Preview anschauen, aber nicht selbst hinein. Wer nur kurz ein Log lesen oder einen Befehl ausprobieren wollte, musste dafür den Agenten bemühen. Jetzt gibt es auf der Run-Seite drei direkte Wege hinein.

## Das Terminal

Der direkteste Weg in einen Run ist eine Shell. Es gibt sie in zwei Varianten, im Browser für jedes Dashboard-Mitglied und über SSH für alle, die ohnehin auf den Server dürfen. Das Video zeigt beide.

::update-video{src="/assets/knecht-ssh-showcase.webm" caption="Das Terminal im Browser und der fertige SSH-Befehl"}
::

### Im Browser

Ein Klick auf "Terminal" öffnet eine Shell im Container des Runs. Sie geht als Fenster direkt auf der Run-Seite auf, man tippt also im selben Browser-Tab, in dem man den Run gerade anschaut. Ein Terminal-Programm oder ein SSH-Client auf dem eigenen Rechner ist dafür nicht nötig.

- Funktioniert für jedes Dashboard-Mitglied, ganz ohne Zugang zum Server.
- Die Shell läuft im selben Container wie der Agent. Composer, npm und Git sind da und verhalten sich wie im echten Projekt.
- Es geht kein zusätzlicher Port auf, die Verbindung läuft über dieselbe HTTPS-Verbindung wie das Dashboard.
- Läuft ein Run mit mehreren Containern, etwa einer eigenen Datenbank, hat das Terminal einen Tab pro Service.

::note
Knecht stoppt die Umgebung eines Runs automatisch, wenn sie eine Weile niemand benutzt, damit sie keinen RAM belegt. Arbeit im Terminal zählt dabei als Benutzung, die Umgebung bleibt also an, solange man darin tippt.
::

### Über SSH

Wer lieber im eigenen Terminal arbeitet, findet im Terminal-Fenster einen fertigen SSH-Befehl zum Kopieren. Auf der eigenen Maschine eingefügt, landet er in genau demselben Container.

```bash
ssh -t knecht@my-server.com docker exec -it -u 1000:1000 -w /var/www/html -e HOME=/home/node -e USER=node ddev-knecht-run-4-web bash -l
```

Knecht betreibt dafür keinen eigenen SSH-Server und verwaltet keine Keys. Der Befehl nutzt den SSH-Zugang zum Server, den es sowieso schon gibt. In den Einstellungen wird dafür einmal die SSH-Adresse des Servers hinterlegt, mehr nicht. Dieser Weg ist damit denen vorbehalten, die ohnehin auf den Server dürfen. Für alle anderen bleibt das Web-Terminal.

## VS Code im Browser

VS Code läuft direkt im Run. Ein Klick auf "Open in VS Code" auf der Run-Seite öffnet die IDE als neuen Browser-Tab. Dahinter steckt [openvscode-server](https://github.com/gitpod-io/openvscode-server), der Open-Source-Build von VS Code für den Browser.

::update-video{src="/assets/knecht-vs-code.webm" caption="VS Code öffnet den Run im Browser"}
::

Die IDE arbeitet dabei direkt am Projekt im Run, nicht an einer Kopie. Eine gespeicherte Änderung liegt sofort im laufenden Projekt, es ist derselbe Code, den auch die Preview und der Agent sehen. Und weil jeder Run ein vollwertiger Git-Clone ist, funktionieren Commits und Branches in IDE und Terminal ganz normal.

Ein lokales Setup braucht es nicht. Die IDE läuft für jedes Dashboard-Mitglied im Browser und ist wie die Previews nur mit Knecht-Login erreichbar.
