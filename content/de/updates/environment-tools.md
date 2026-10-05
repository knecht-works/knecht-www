---
title: Mailpit, Adminer und andere Tools im Run
date: 2026-10-05
tag: Dashboard
description: Mailpit, Adminer und andere Web-Tools aus der DDEV-Umgebung öffnen sich jetzt direkt aus dem Run.
---

Ein Run ist eine einzelne Ausführung eines [Workflows](/updates/workflow-engine) auf einem Projekt, mit eigener DDEV-Umgebung auf dem Server. Bisher kam man dort an die Website, das [Terminal und VS Code](/updates/web-terminal-vscode). Die Tools, die DDEV neben der Website mitbringt, blieben unerreichbar. Seit [Version 0.13](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.13.0) öffnen sich diese Tools direkt aus dem Run.

## Tools öffnen

Jedes Tool bekommt oben auf der Run-Seite einen eigenen Button neben "Open in IDE" und "Terminal". Ein Klick darauf öffnet das Tool in einem neuen Tab.

<!-- TODO(samuel): Screenshot vom Kopf eines Runs mit den Buttons für Mailpit und Adminer -->
![Der Kopf eines Runs mit Buttons für Mailpit und Adminer neben dem Terminal](/assets/knecht-environment-tools.png)

Knecht zeigt die Tools, die mit der DDEV-Config des Repos kommen:

- [Mailpit](https://docs.ddev.com/en/stable/users/usage/developer-tools/#email-capture-and-review-mailpit) ist in jeder DDEV-Umgebung dabei und fängt alle Mails ab, die das Projekt verschickt.
- Add-on-Container wie [Adminer](https://github.com/ddev/ddev-adminer), phpMyAdmin oder Solr erscheinen unter ihrem Service-Namen.
- Zusätzliche Ports im Web-Container, die über [`web_extra_exposed_ports`](https://docs.ddev.com/en/stable/users/configuration/config/#web_extra_exposed_ports) freigegeben sind, erscheinen unter dem Namen, der dort eingetragen ist.

::note
Die Tools sind nur erreichbar, solange die Umgebung des Runs läuft. Ist sie gestoppt, fehlen die Buttons, bis man die Umgebung wieder startet.
::

## Wie es funktioniert

Lokal macht der [DDEV-Router](https://docs.ddev.com/en/stable/users/usage/architecture/) die Tools erreichbar. Er nimmt Anfragen auf Port 80 und 443 an und leitet sie an den passenden Container weiter, Mailpit etwa auf Port 8026. Auf dem Server startet Knecht DDEV ohne diesen Router. Dort teilen sich viele Runs einen Docker-Daemon, und jeder Router würde dieselben Ports auf dem Host belegen wollen.

Welche Ports der Router weiterleiten soll, erfährt er aus den Containern selbst. Jeder Container trägt dafür die Umgebungsvariablen [`HTTP_EXPOSE` und `HTTPS_EXPOSE`](https://docs.ddev.com/en/stable/users/extend/custom-compose-files/) mit seinen Ports. Knecht liest diese Variablen aus den laufenden Containern eines Runs und leitet die Ports selbst weiter. Jedes Add-on, das lokal über den Router erreichbar ist, erscheint deshalb auch im Run.

Jedes Tool bekommt eine eigene Adresse nach demselben Schema wie die Preview, mit dem Namen des Tools vorne dran, etwa `mailpit--42.preview.example.com`. Der Port der Website und der Port des Dev-Servers bekommen keinen Button, die sind schon über die Preview erreichbar.
