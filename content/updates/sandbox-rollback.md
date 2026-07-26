---
title: Zurück zum geteilten Daemon, eine Preview für 180 MB
date: 2026-07-26
tag: Architektur
description: Die Sandbox pro Run hat funktioniert und kostete 3 GB RAM pro Preview. Warum wir sie wieder ausgebaut haben und wie die alten Probleme heute gelöst sind.
---

::note
Dieser Post ist die Fortsetzung von [Vom geteilten Docker Daemon zur Sandbox pro Run](/updates/dashboard-architecture). Dort steht, warum wir uns für eine eigene Sandbox pro Run entschieden haben. Hier steht, warum wir sie wieder ausgebaut haben.
::

Der letzte Architektur-Post endete mit einem klaren Plan. Jeder Run bekommt seine eigene [Sysbox](https://github.com/nestybox/sysbox)-Sandbox mit eigenem [Docker Daemon](https://docs.docker.com/get-started/docker-overview/#docker-architecture). Wir haben das gebaut, und es lief. Trotzdem haben wir die Sandbox wieder ausgebaut, denn zwei Probleme, die wir bewusst aufgeschoben hatten, ließen sich nicht mehr aufschieben.

## Die Rechnung

Eine Sysbox-Sandbox ist im Grunde ein kleines Betriebssystem mit [systemd](https://systemd.io), eigenem Docker Daemon und darüber dem kompletten [DDEV](https://ddev.com)-Stack. Dass das Ressourcen kostet, war uns von Anfang an klar. Wir dachten nur, wir bekommen das später in den Griff, dem war aber leider nicht so.

- Eine laufende Preview kostete gemessen rund 3 GB RAM. Bei 20 parallelen Previews wären das 60 GB, nur für Sandboxes.
- Jede Sandbox braucht alle DDEV-Images einmal für sich, das sind 1-2 GB Disk pro Preview. Ein Registry-Cache beschleunigte die Downloads, am Platz änderte er nichts.

Das Ziel von Knecht ist aber, dass eine Agentur alle ihre Projekte auf einem eigenen, bezahlbaren Server laufen lässt. Dafür ist eine Architektur mit 3 GB pro Preview das falsche Fundament, egal wie sauber sie isoliert.

## Was die Sandbox löste

Zur Erinnerung, der letzte Post hatte zwei Gründe für die Sandbox.

- Auf dem geteilten Daemon gab es keine Isolation zwischen Runs. Die festen Ports des [DDEV-Routers](https://docs.ddev.com/en/stable/users/usage/architecture/) kollidierten, deshalb mussten wir ihn weglassen und in die DDEV-Config eingreifen.
- Der Agent führt fremden Code aus, und wer den [Docker-Socket](https://docs.docker.com/engine/security/#docker-daemon-attack-surface) des Hosts erreicht, kontrolliert den ganzen Server.

Die Sandbox löste beides mit einem Schlag. Aber sie war die gründlichste Lösung, nicht die einzige. Der Rückbau war erst möglich, als wir beide Probleme noch einmal einzeln angeschaut haben.

## Die neuen Lösungen

### Kein Socket im Run

Das Problem ist der Docker-Socket. Der Agent führt fremden Code aus, und sobald der Socket in seiner Umgebung liegt, kontrolliert ein gekaperter Agent den ganzen Server. Die Sandbox hat deshalb jedem Run einen eigenen Daemon gegeben, damit der Socket des Hosts außer Reichweite bleibt.

Unsere Lösung setzt früher an, der Run bekommt überhaupt keinen Docker-Zugriff mehr. Knecht fährt DDEV host-seitig hoch. Der Agent und alle Projekt-Befehle wie `composer install` laufen ausschließlich im Web-Container des Projekts. Ein Agent, der per [Prompt Injection](https://simonwillison.net/series/prompt-injection/) gekapert wird, steht damit in einem ganz normalen Container mit eigenem Netz und begrenzten Ressourcen, und er findet dort weder Socket noch Daemon vor.

### Umbenennen statt einsperren

Die Port-Kollisionen kamen allein vom Router, dem Reverse Proxy, den DDEV vor alle Projekte stellt und der die Ports 80 und 443 auf dem Host bindet. Der bleibt weiter weg. Stattdessen spricht der Preview-Proxy den Web-Container jedes Runs direkt über das [Docker-Netzwerk](https://docs.docker.com/engine/network/) an.

Eine Sache muss der Proxy dabei mitliefern, den Hostnamen. Projekte mit mehreren Domains, etwa ein [Craft-Multisite](https://craftcms.com/docs/5.x/system/sites.html), entscheiden anhand der aufgerufenen Domain, welche Site sie ausliefern. Die Preview läuft aber unter einer Knecht-URL, nicht unter der echten Domain des Projekts. Deshalb schickt der Proxy die echte Domain im [Host-Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Host) mit, und für das Projekt sieht jede Anfrage so aus, als wäre sie über die normale URL gekommen.

Damit parallele Runs desselben Projekts sich nicht in die Quere kommen, registriert Knecht jeden Run als eigenes DDEV-Projekt mit eindeutigem Namen. Der Eingriff in die DDEV-Config, im letzten Post noch ein Minuspunkt, ist geblieben, aber er ist für das Projekt unsichtbar. Der Code im Repo bleibt unangetastet, umgeschrieben wird nur die generierte Laufzeit-Config.

## Der Tradeoff

Sicherheitstechnisch ist das ein Rückschritt gegenüber Sysbox. Sysbox mappte Root im Container über [User Namespaces](https://man7.org/linux/man-pages/man7/user_namespaces.7.html) auf einen unprivilegierten Host-User. Jetzt laufen die Container wieder mit [runc](https://github.com/opencontainers/runc), der normalen Docker-Runtime, die Grenze zum Host ist dünner. Aufgefangen wird das durch genau die Punkte von oben, denn der Run hat keinen Socket, ein eigenes Netz und feste Limits.

Ob dieser Rückschritt vertretbar ist, entscheidet wie schon im letzten Post das [Threat Model](https://owasp.org/www-community/Threat_Modeling). Knecht läuft bei einer Agentur, für ihre eigenen Projekte, auf ihrem eigenen Server. Der Angreifer, vor dem die Sandbox zusätzlich geschützt hätte, braucht einen Kernel-Exploit und landet dann auf einem Server, auf dem ohnehin nur die eigenen Projekte liegen. Für dieses Risiko 3 GB statt 180 MB pro Preview zu bezahlen, ist der falsche Tausch.

## Das Ergebnis

Beide Varianten liefen auf derselben Dev-Maschine, gemessen im Juli 2026:

|  | Sandbox pro Run (Sysbox) | DDEV auf dem Host (heute) |
|---|---|---|
| RAM pro laufender Preview | ~3 GB | ~180 MB |
| DDEV-Images | pro Sandbox, 1-2 GB extra | einmal pro Host |
| Gestoppte Preview wecken | Minuten, kompletter Sandbox-Boot | Sekunden |
| Docker-Zugriff im Run | eigener Daemon in der Sandbox | keiner, Knecht steuert von außen |
| Isolationsgrenze | eigener Daemon plus User Namespaces | eigenes Netz, Limits, kein Socket |

Dazu kommen noch zwei kleinere Optimierungen.

- Die Datenbank läuft für die Preview mit einer sparsameren Konfiguration. Die MySQL-Config, die DDEV mitliefert, erlaubt jeder Datenbank rund 1 GB [Puffer](https://mariadb.com/kb/en/innodb-buffer-pool/).
- Eine gestoppte Preview kostet 0 RAM, übrig bleiben nur Datenbank-Volume und Code.

Aus "ein paar Previews pro Server" wurde damit "praktisch alle Projekte einer Agentur gleichzeitig".

## Was wir mitnehmen

Der letzte Post begann mit dem Satz, dass wir die riskanteste Annahme zuerst testen. Das war richtig, und es hat funktioniert, die Sandbox lief. Nur war "läuft es?" die falsche letzte Frage. Die vollständige lautet "läuft es zu Kosten, die zum Ziel passen?", und die lässt sich erst beantworten, wenn das System unter echter, paralleler Last steht. Diese Messung machen wir jetzt früher.
