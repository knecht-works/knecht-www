---
title: Erste End-to-End-Flows bestehen
date: 2026-05-14
tag: Agents
description: Der Agent klickt sich eigenständig durch Login, Warenkorb und Checkout – und meldet einen echten 500er.
---

Bisher haben wir Agents vor allem isoliert getestet. Jetzt laufen die ersten echten End-to-End-Flows gegen eine vollständige Test-App.

## Der erste grüne (und rote) Durchlauf

Der Agent klickt sich eigenständig durch Login, Warenkorb und Checkout – ohne vorgegebenes Skript. Dabei ist er auf einen echten 500er im Checkout gestoßen und hat ihn reproduzierbar zurückgemeldet, inklusive der Schritte, die dahin geführt haben.

## Nächster Schritt

Aus „Fehler gefunden“ wird „Fehler gefixt“: Der Agent soll den Bug künftig nicht nur melden, sondern reproduzieren, patchen und gegen die laufende App verifizieren.
