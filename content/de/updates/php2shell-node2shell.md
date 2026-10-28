---
title: PHP2Shell, Node2Shell und Knecht
date: 2026-10-28
tag: Security
description: Was die PHP2Shell- und Node2Shell-Lücken für Knecht bedeuten, wo ein Angreifer sie erreichen könnte und wie Version 0.14 PHP und Node patcht.
---

Am 21. Oktober 2026 wurden gleich zwei kritische Lücken öffentlich, eine in PHP und eine in Node.js. Beide können zu Remote Code Execution führen. Knecht nutzt beide Sprachen: PHP läuft in der DDEV-Umgebung jedes Runs, Node treibt das Dashboard selbst. Dieser Post erklärt, was das für deine Instanz bedeutet und was [Version 0.14](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.14.0) ändert.

## PHP2Shell

Unter dem Namen PHP2Shell laufen zwei Lücken in PHP: [CVE-2026-109618 und CVE-2026-109619](https://sansec.io/research/php2shell). Eine einzige präparierte Anfrage reicht für Remote Code Execution, ohne Login und mit einer Standard-`php.ini`. Betroffen ist jede PHP-Version vor 8.5.12, 8.4.27, 8.3.36 und 8.2.35.

Der Angriff braucht genau eine Sache, eine Anfrage, die bei PHP ankommt. In Knecht läuft PHP nur im Web-Container eines Runs, und dieser Container ist aus dem Internet nicht erreichbar. Der einzige Weg hinein ist die Preview des Runs, und jede Preview liegt hinter dem Login des Dashboards.

## Node2Shell

[Node2Shell (CVE-2026-111497)](https://www.aikido.dev/blog/node2shell-nodejs-brotli-rce-cve-2026-111497) ist ein Fehler in [Brotli](https://github.com/google/brotli), einer Kompressions-Bibliothek, die Node.js mitbringt. Präparierte Brotli-Daten können beim Entpacken zu Remote Code Execution führen. Gefixt ist das in Node 22.23.4, 24.22.1 und 26.12.1. Gefährlich ist das nur, wenn Node Daten eines Angreifers entpackt. Anfragen aus dem Internet entpackt das Dashboard nie, auch nicht beim Login oder bei Webhooks.

Einen Weg gibt es aber von innen. Manche Schritte wie der Link-Check laden Seiten aus der Preview eines Runs, und Node entpackt die Antworten automatisch. Fremder Code im Run-Container könnte so präparierte Daten ans Dashboard schicken.

Das kann etwa ein per [Prompt Injection](https://simonwillison.net/series/prompt-injection/) gekaperter Agent oder eine bösartige Abhängigkeit sein. Beim HTTP-Schritt reicht dafür ein kompromittierter Server.

## Was du tun musst

Aktualisiere Knecht im Dashboard auf Version 0.14. Managed Beta-Instanzen aktualisieren wir selbst.

Nach dem Update:

- Starte laufende Umgebungen neu, damit sie die gepatchte PHP-Version bekommen. Der erste Start dauert ein paar Minuten, weil Knecht die neuen DDEV-Images lädt.
- Steht in der DDEV-Config eines Projekts unter `nodejs_version` eine ungepatchte Version wie `24.22.0`, ändere sie im Repo.
- Aktualisiere PHP und Node auch auf den Produktions- und Staging-Servern deiner Projekte. Das kann Knecht nicht für dich übernehmen.

## Was Version 0.14 ändert

- Das Dashboard läuft auf Node 24.22.1. Damit ist der Weg vom Run-Container zum Dashboard geschlossen.
- DDEV ist auf [1.25.5](https://github.com/ddev/ddev/releases/tag/v1.25.5) aktualisiert. Es bringt PHP 8.2 bis 8.5 in den gefixten Versionen und neu gebaute, gepatchte Pakete für PHP 5.6 bis 8.1.
- `session.upload_progress.enabled` steht in jeder PHP-Version auf `0`. Das ist die [Übergangslösung](https://www.sophos.com/en-us/security-advisories/sophos-sa-20261021-php2shell), die das PHP-Projekt empfiehlt.
