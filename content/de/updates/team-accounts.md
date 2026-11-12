---
title: Einladungslinks, Passwörter und mehrere Owner
date: 2026-11-12
tag: Dashboard
description: Mit Version 0.18 braucht niemand mehr einen GitHub-Account, um ins Dashboard zu kommen. Owner laden per Link ein und verwalten die Instanz, Members arbeiten mit ihr.
---

Bisher hing der Zugang zu Knecht an GitHub. Eingeladen wurde über den GitHub-Namen, und jedes Mitglied durfte alles, auch andere entfernen. In einer Agentur haben aber nicht alle einen GitHub-Account, etwa Projektleitungen, die nur in Jira arbeiten. Mit [Version 0.18](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.18.0) geht es ohne GitHub, und es gibt Rollen.

## Einladen per Link

Ein Owner klickt in den Settings auf "Create invite link" und schickt den Link weiter. Er gilt für eine Person und sieben Tage und lässt sich widerrufen.

![Der Account-Tab in den Settings mit der Liste der Mitglieder, einem offenen Einladungslink und dem Aktionsmenü eines Mitglieds](/assets/user-settings.png)

Wer den Link öffnet, wählt Benutzername und Passwort oder tritt mit GitHub bei. Nach 10 Fehlversuchen in 15 Minuten sperrt Knecht weitere Versuche, pro Benutzername und pro Client.

## Owner und Member

Wenn wir schon dabei waren, haben wir auch gleich einfache Benutzerrollen eingeführt. Vorerst "Members" und "Owners". Eine Instanz kann mehrere Owner haben. Über das Aktionsmenü einer Mitgliedskarte vergibt ein Owner die Rolle mit "Make owner" und nimmt sie dort wieder weg.

Die Owner-Rolle gilt für Settings, die die ganze Instanz betreffen, zum Beispiel:

- Mitglieder einladen und entfernen
- Integrationen verbinden, ändern und trennen
- AI-Provider, Key und Modelle wählen
- Session-Aufbewahrung, parallele Runs, SSH-Adresse und Update-Zeitplan einstellen
- Knecht aktualisieren

Members sehen diese Settings nur.

## Passwort vergessen

Ein Owner erstellt mit "Create password reset link" einen Link, der einmal und 24 Stunden gilt. Wer ihn öffnet, setzt ein neues Passwort und ist angemeldet. Knecht meldet dabei alle anderen Sessions des Mitglieds ab, wie bei jeder Passwortänderung.

Ist der einzige Owner ausgesperrt, erzeugt ein Script auf dem Server denselben Link:

```bash
docker compose exec knecht node scripts/reset-password.mjs <username>
```

Und falls du auch deinen Benutzernamen vergessen hast: Wir haben vorgesorgt. Mit diesem Befehl listest du alle Benutzernamen auf:

```bash
docker compose exec knecht node scripts/reset-password.mjs
```

## Wie es weitergeht

Die GitHub App war bisher Login, Voraussetzung fürs Setup und Zugang zu den Repos zugleich. Den Login haben wir jetzt gelöst. Als Nächstes wird GitHub eine Git-Verbindung unter mehreren, und wir bauen GitLab an.
