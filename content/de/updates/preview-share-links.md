---
title: Previews teilen, auch ohne Login
date: 2026-11-16
tag: Dashboard
description: Seit Version 0.19 lässt sich eine Preview per Link mit Leuten teilen, die keinen Knecht-Account haben, etwa mit Kunden. Die Previews eines Projekts können auch ganz öffentlich sein.
---

Ein [Run](/updates/workflow-engine) ist eine einzelne Ausführung eines Workflows auf einem Projekt. Bootet er die Website, ist sie als Preview unter einer eigenen Adresse erreichbar. Öffnen konnten sie bisher nur Leute, die im Dashboard angemeldet sind. Ein Kunde, der eine Änderung abnehmen soll, hat dort aber keinen Account. Seit [Version 0.19](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.19.0) gibt es dafür Share-Links und eine Einstellung, ob Previews überhaupt einen Login brauchen.

## Einen Link teilen

Die Bar über der Preview eines Runs hat jetzt einen Share-Button. Ein Klick kopiert einen Link, mit dem jeder die Preview ohne Login öffnen kann.

![Die Leiste über der Preview eines Runs mit dem Share-Button und dem Toast "Share link copied"](/assets/knecht-preview-share-link.png)

Der Link gehört zur [Session](/updates/sessions-and-mentions). Er bleibt über alle Runs der Session derselbe.

Beim ersten Aufruf legt Knecht den Token aus dem Link in ein Cookie und leitet auf dieselbe Adresse ohne Token weiter. Die Adresse, die der Kunde danach in der Adressleiste sieht und vielleicht weiterschickt, gibt deshalb keinen Zugang.

## Preview Policies

Neu sind außerdem Preview Policies. Damit legst du fest, ob die Previews deiner Projekte überhaupt einen Login brauchen. Eine globale Policy gilt für alle Projekte, und jedes Projekt kann sie überschreiben.

Vorerst gibt es diese Optionen:

- Public: Jeder kann die Preview ohne Login und ohne Share-Link öffnen.
- Login required: Die Preview braucht einen Login und lässt sich nur von Knecht-Mitgliedern öffnen.

![Das Panel "Previews" in den Advanced-Settings eines Projekts mit den Einstellungen "Access" und "Share links"](/assets/knecht-project-preview-settings.png)

## Was geteilt wird

Die Umgebung eines Runs enthält mehr als die Website. Terminal und IDE geben Zugriff auf den Code, Tools wie Adminer Zugriff auf die Datenbank. Ein Kunde, der eine Änderung abnimmt, braucht nur die Website. Deshalb gelten Share-Links und "Public" nur für die Website und ihren Dev-Server. Alles andere braucht weiterhin einen Login:

- "Terminal" und "Open in IDE"
- die [Tools der Umgebung](/updates/environment-tools) wie Mailpit oder Adminer

Wer einen Share-Link bekommt, sieht also die Seite, aber weder den Code noch die Datenbank oder die abgefangenen Mails.
