---
title: DB-Import läuft jetzt parallel
date: 2026-05-28
tag: Engine
description: Große Datenbanken werden beim Boot in Chunks importiert – Kaltstart unter 45 Sekunden.
---

Lange war der Datenbank-Import der Flaschenhals beim Boot. Bei großen Shop-Datenbanken hat ein einzelner, sequenzieller Import schnell mehrere Minuten gedauert – Zeit, in der sonst nichts passiert.

## Was sich geändert hat

Der Import läuft jetzt in parallelen Chunks: Die Datenbank wird in Blöcke aufgeteilt, die gleichzeitig eingespielt werden. Dadurch ist der Kaltstart eines typischen Shop-Projekts von rund zwei Minuten auf **unter 45 Sekunden** gefallen.

## Warum das wichtig ist

Jede Sekunde beim Boot zählt – besonders, wenn Agents viele Projekte hintereinander hochfahren. Schnellere Kaltstarts bedeuten kürzere Feedback-Schleifen und mehr getestete Flows pro Stunde.
