---
title: AI-Connection pro Projekt
date: 2026-11-22
tag: Engine
description: Seit Version 0.22 kann ein Projekt einen eigenen API-Key oder einen eigenen AI-Provider nutzen.
---

Bisher hatte eine Knecht-Instanz genau einen AI-Provider mit einem API-Key. Jeder [Run](/updates/workflow-engine) in jedem Projekt lief über diesen Key. In einer Agentur passt das nicht immer. Manche Kunden zahlen die AI-Kosten ihres Projekts selbst, andere schreiben einen bestimmten Provider vor, etwa [Langdock](/updates/langdock-provider) in der EU. Seit [Version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0) kann ein Projekt deshalb eine eigene AI-Connection haben.

## Feld Inheritance

![Das Panel "AI connection" in den Advanced-Settings eines Projekts mit Provider, API-Key, Default-Modell und Subtask-Modell](/assets/knecht-project-ai-connection.png)

Das Panel "AI connection" findest du in den Projekt-Settings unter "Advanced". Solange du dort nichts änderst, nutzt das Projekt den AI-Provider aus den globalen Settings. Jedes Feld erbt einzeln, bis du es überschreibst. So hast du die volle Kontrolle:

- Eigener Key beim selben Provider. "Provider" bleibt auf "Global default", du speicherst nur einen Key. Die Kosten des Projekts laufen dann über diesen Key, die Modelle folgen weiter den globalen Settings.
- Eigener Provider. Du wählst einen anderen Provider und speicherst dessen Key. Das Projekt bekommt eine eigene Modell-Liste und eigene Modelle und erbt nichts mehr aus den globalen Settings.

## Was darüber läuft

Wenn Knecht AI nutzt und weiß, zu welchem Projekt die Arbeit gehört, nimmt es die AI-Connection des Projekts statt der globalen. Im Moment gehört jede AI-Funktion in Knecht zu einem Projekt.

### Globale AI-Funktionen

Das gibt es noch nicht, aber künftig kommen AI-Funktionen, die zu keinem Projekt gehören, etwa das Erstellen von Workflows. Diese Funktionen brauchen die globale AI-Connection, auch wenn jedes Projekt einen eigenen API-Key hat. Wenn du alle Projekte auf eigene AI-Connectionen umstellst, behalte das im Hinterkopf.

## Prüfung des API-Keys

Mit den AI-Connectionen pro Projekt haben wir auch die Prüfung der API-Keys verbessert. Bisher hat Knecht den Key gar nicht geprüft. Ob er funktioniert, hat man erst gemerkt, als man die AI tatsächlich genutzt hat.

Jetzt speicherst du den API-Key einmal, Knecht prüft ihn, und die Modell-Liste lädt. Der Weg dahin war allerdings etwas knifflig.

### Ein Wort zur UX

::update-video{src="/assets/ux-ai-connection.mp4" caption="Einen neuen AI-Provider in den Projekt-Settings speichern"}
::

Weil es sich besser anfühlt, wollen wir das jede Einstellung automatisch speichert. Dabei stellt sich aber immer die Frage, wann man prüft, ob ein Wert stimmt. Normalerweise prüft man während der Eingabe. Sobald eine fremde API im Spiel ist, funktioniert das nicht mehr. Solche Anfragen dauern eine Weile, und die Verzögerung fühlt sich seltsam an.

Einen API-Key prüfen heißt, den Provider zu fragen, ob er den Key akzeptiert. Das geht nicht sofort. Und erst wenn der Key gültig ist, wissen wir, welche Modelle der Modell-Picker anbieten kann. Ein Default-Modell ist Pflicht. Wie stellen wir also sicher, dass eines ausgewählt ist, wenn wir noch gar nicht wissen, welche Modelle dein Provider hat?

Gelöst haben wir das mit einem kleinen Speichern-Button neben dem API-Key. Wenn du den Key speicherst, prüft Knecht ihn und lädt dann die verfügbaren Modelle. Das Modell-Dropdown wäre an dieser Stelle aber noch leer. Deshalb haben wir für jeden Provider eine Liste mit bis zu drei bevorzugten Modellen hinterlegt. Das erste davon, das dein Provider anbietet, wird vorausgewählt. So sollte direkt nach dem Speichern des API-Keys immer ein Default-Modell gespeichert sein.

::note{variant="info"}
  Einfacher wäre es gewesen, das Modell-Feld zu prüfen, sobald die Modell-Liste geladen ist. Dann wäre das Feld aber anfangs immer invalid (rot). Das wäre ein falsches Signal, denn dein API-Key ist ja gültig. Wir halten den Speichern-Button für einen guten Kompromiss.
::
