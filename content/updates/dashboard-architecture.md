---
title: Vom geteilten Docker Daemon zur Sandbox pro Run
date: 2026-07-01
tag: Architektur
description: Knecht kann aus einem Container heraus echte DDEV-Projekte booten. Was der Test gezeigt hat und warum jeder Run künftig seine eigene Sandbox bekommt.
---

Knecht läuft selbst als Docker Container, muss aber DDEV-Projekte hochfahren, die wieder aus Containern bestehen. Ob das überhaupt funktioniert, war die riskanteste Annahme der ganzen Architektur. Deshalb haben wir sie zuerst getestet, noch bevor der eigentliche Code entsteht.

## Der Ansatz

Kurz zum Hintergrund: Docker besteht aus zwei Teilen. Der [Docker Daemon](https://docs.docker.com/get-started/docker-overview/#docker-architecture) ist der Dienst, der Container tatsächlich erstellt und verwaltet. Die Docker CLI ist nur ein Client, der über einen Unix-Socket (`/var/run/docker.sock`) mit dem Daemon spricht. Wer den Socket hat, steuert den Daemon.

Genau das nutzt Knecht: Der Container startet keinen eigenen Daemon, sondern mountet den Socket des Hosts und steuert damit den Host-Daemon. Das Muster heißt [Docker-out-of-Docker](https://www.avonture.be/blog/docker-out-of-docker-dood/) (DooD). Die DDEV-Container laufen dann als Geschwister neben dem Knecht-Container auf dem Host, nicht verschachtelt in ihm. [Coolify](https://coolify.io) und viele CI-Runner arbeiten genauso.

## Der Test

::steps{level="3"}

### Host-Daemon erreichbar

`docker ps` im Container zeigt die Host-Container. Der Socket-Mount funktioniert.

### DDEV-Projekt bootet

Ein minimales PHP-Projekt am festen Pfad, dann `ddev start`. DDEV startet Webserver und Datenbank auf dem Host.

### Container sind Host-Geschwister

Auf dem Host tauchen die Projekt-Container als normale Nachbarn des Knecht-Containers auf.

### App erreichbar

Das gebootete Projekt antwortet. Wichtig dabei: `*.ddev.site` löst per DNS immer auf `127.0.0.1` auf, also auf den Container selbst. Der Preview-Proxy muss den Web-Container deshalb direkt über das Docker-Netzwerk ansprechen.

::

Damit ist die Basis bewiesen: Ein Prozess im Knecht-Container kann echte DDEV-Stacks booten, mit korrekt gemountetem Source Code.

## Zwei Probleme sind geblieben

Der Test hat aber auch die Grenzen des Ansatzes gezeigt.

### Keine Isolation zwischen Runs

Alles läuft auf einem gemeinsamen Daemon. Knecht soll aber mehrere Previews parallel fahren, ohne dass sich Runs gegenseitig stören. Wir mussten sogar den [DDEV-Router](https://docs.ddev.com/en/stable/users/usage/architecture/) weglassen. Das ist der Reverse Proxy, den DDEV vor alle Projekte stellt und der die Ports 80 und 443 auf dem Host bindet. Feste Host-Ports gibt es nur einmal, bei vielen parallelen Projekten kollidiert das. Ohne Router muss Knecht in die `.ddev/config.yaml` eingreifen und zum Beispiel dir Urls überschreiben.

### Fremder Code am Host-Socket

Der Agent führt Code aus, und wir kontrollieren nicht vollständig, was er tut. Ein Agent lässt sich über [Prompt Injection](https://simonwillison.net/series/prompt-injection/) kapern, etwa durch manipulierte Inhalte im Repo oder in einer Datenquelle, und macht dann nicht mehr das, was wir wollten. Wer an dieser Stelle an den Host-Socket kommt, steuert den Daemon, und wer den Daemon steuert, kann jeden Container mit jedem Mount starten. Das ist faktisch Root auf dem Server.

## Die Lösung: eine Sandbox pro Run
 
Beide Probleme haben dieselbe Antwort: Jeder Run bekommt seinen eigenen Docker Daemon in einer eigenen Sandbox. Damit verschwindet auch der Grund, den Router wegzulassen. Port 80 in Sandbox A kann nicht mit Sandbox B kollidieren, weil jede Sandbox ihren eigenen Netzwerk-Namespace hat. Projekte laufen also wieder mit allen ihren URLs und Settings.
 
Bleibt die Frage, was die Sandbox ist. Wir haben uns die üblichen Kandidaten angesehen.
 
### Privileged Docker-in-Docker
 
Ein zweiter Daemon in einem Container mit [`--privileged`](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities). Die Flag schaltet praktisch alle Schutzmechanismen ab und gibt dem Container Zugriff auf die Host-Geräte. Eine bösartige Dependency kommt damit ohne Exploit auf den Host. Fällt raus.
 
### Kata Containers
 
[Kata](https://katacontainers.io) startet jeden Container in einer leichtgewichtigen VM mit eigenem Kernel. Das ist die stärkste Grenze und der Ansatz hinter [Firecracker](https://firecracker-microvm.github.io), auf dem etwa AWS Lambda läuft. Kata braucht aber `/dev/kvm`, und normale Cloud-VPS bieten [keine Nested Virtualization](https://lowendtalk.com/discussion/154261/searching-vps-for-nested-virtualization). Das würde Bare-Metal erzwingen und kollidiert mit dem Ziel, Knecht auf einem normalen VPS zu installieren. Fällt raus.
 
### gVisor
 
[gVisor](https://gvisor.dev) fängt Syscalls in einem Userspace-Kernel ab und braucht kein KVM. Es isoliert Anwendungsprozesse gut, tut sich aber schwer damit, selbst ein Docker-Host zu sein: [iptables wird nur teilweise unterstützt](https://github.com/google/gvisor/issues/9917) und [Overlayfs bricht mit Docker v29](https://github.com/google/gvisor/issues/12475). Genau ein Docker-Host ist aber, was DDEV braucht. Fällt raus.
 
### Unsere Wahl: Sysbox
 
[Sysbox](https://github.com/nestybox/sysbox) ist eine Container-Runtime, die Docker-in-Docker ohne `--privileged` erlaubt. Sie nutzt dafür [User Namespaces](https://man7.org/linux/man-pages/man7/user_namespaces.7.html), Root im Container wird auf einen unprivilegierten User auf dem Host gemappt. Sysbox ist genau für diesen Fall gebaut, braucht kein KVM und läuft damit auf jedem normalen Linux-Server.

## Das Threat Model entscheidet
 
Den Ausschlag gibt am Ende nicht die Runtime, sondern das Threat Model, also die Frage, wer hier eigentlich angreift und was er erreicht. Knecht ist [Single-Tenant](https://www.geeksforgeeks.org/system-design/single-tenant-vs-multi-tenant-architecture/): eine Agentur, ihre Projekte, ihr Server. Die VM-Grenze von Kata schützt vor allem davor, dass ein Kunde aus seiner Umgebung in die eines anderen ausbricht. Diesen Fall gibt es hier nicht.

## Wie es weitergeht

Als Nächstes bauen wir die Sysbox-Sandbox pro Run (eigener Daemon, DDEV inklusive Router) und einen zentralen Ingress mit Auth-Gate, der Preview-URLs in die richtige Sandbox routet. Der nächste Meilenstein: DDEV mit Router in einer Sysbox-Sandbox auf einem echten Linux-Host, erreichbar vom Ingress.

Vielleicht gibt es auch schon den ersten Showcase vom Prototypen.
