---
title: Warum Knecht nicht Open Source ist
date: 2026-08-09
tag: Projekt
description: Knecht hat jetzt eine Lizenz, die Functional Source License. Was du mit dem Code alles darfst, warum es kein MIT geworden ist und wie jede Version trotzdem irgendwann Open Source wird.
---

Das [Knecht-Repo](https://github.com/knecht-works/knecht-cloud) war von Anfang an öffentlich auf GitHub, eine Lizenz hatte es aber nie. Das haben wir jetzt geändert: Knecht steht ab sofort unter der Functional Source License, kurz FSL. Hier steht, warum überhaupt eine Lizenz nötig war, warum es kein MIT geworden ist und was du mit dem Code offiziell darfst.

## Ohne Lizenz geht nichts

Öffentlich sichtbar und frei nutzbar sind zwei verschiedene Dinge. Code ist urheberrechtlich geschützt wie ein Text oder ein Foto, und ohne ausdrückliche Lizenz gilt der Standard des Urheberrechts: alle Rechte vorbehalten. [GitHub weist selbst darauf hin](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository), dass ein öffentliches Repo ohne Lizenz nur angesehen und auf der Plattform geforkt werden darf. Herunterladen, verändern, produktiv einsetzen: genau genommen alles nicht erlaubt.

Ein Repo ohne Lizenz ist damit restriktiver als jede noch so strenge Lizenz. Absicht war das bei Knecht nicht, wir hatten die Lizenzfrage schlicht noch nicht entschieden. Wer Knecht in der Beta selbst hostet, tat das bisher mit unserer mündlichen, aber nirgends festgehaltenen Erlaubnis.

## Das Dilemma

An die Lizenz hatten wir zwei Anforderungen, die sich auf den ersten Blick widersprechen. Der Code soll öffentlich bleiben, und jeder soll Knecht kostenlos selbst hosten, lesen und anpassen dürfen. Gleichzeitig soll Knecht irgendwann Geld verdienen können, damit das Projekt dauerhaft betrieben werden kann. Wie genau, ist offen. Vielleicht eine gehostete Version, vielleicht bezahlte Zusatzfunktionen für Teams.

Mit einer permissiven Lizenz wie [MIT](https://opensource.org/license/mit) oder Apache verträgt sich das nicht. Permissiv heißt: jeder darf alles, auch Knecht nehmen und als eigenes bezahltes Produkt anbieten. Elasticsearch hat vorgemacht, wohin das führt. Es war Apache-lizenziert, AWS verkaufte es als eigenen Managed Service, und Elastic ging dabei leer aus. 2021 [wechselte Elastic auf eine restriktivere Lizenz](https://www.elastic.co/blog/licensing-change), AWS forkte die letzte freie Version und betreibt sie seitdem als [OpenSearch](https://opensearch.org/) weiter. Terraform (Fork: [OpenTofu](https://opentofu.org/)) und Redis (Fork: [Valkey](https://valkey.io/)) haben denselben Zyklus hinter sich.

Diese Geschichten haben eine Gemeinsamkeit: Der Lizenzwechsel kam spät, als längst eine Community auf der freien Lizenz aufgebaut hatte. Ändern lässt sich eine Lizenz nämlich nur für neue Versionen. Was einmal permissiv veröffentlicht ist, bleibt es für immer, und beim Wechsel steht die Community verständlicherweise auf der Seite des Forks. Wenn eine Grenze nötig ist, dann ehrlicherweise von Anfang an.

## Die Kandidaten

Ernsthaft angeschaut haben wir uns fünf Lizenzen:

| Lizenz | Modell | Verbietet | Wird Open Source |
| --- | --- | --- | --- |
| MIT / Apache | Open Source, permissiv | nichts | ist es schon |
| AGPL | Open Source, Copyleft | nichts, erzwingt aber Offenlegung eigener Änderungen | ist es schon |
| BSL | source available | was der Hersteller selbst festlegt | nach bis zu vier Jahren |
| ELv2 | source available | das Anbieten als Managed Service | nie |
| FSL | source available | Konkurrenzprodukte | nach zwei Jahren |

Die [AGPL](https://www.gnu.org/licenses/agpl-3.0.html) ist die eine echte Open-Source-Lizenz, die ein Geschäftsmodell schützt. Wer AGPL-Software als Webdienst betreibt oder in ein Produkt einbaut, muss seinen eigenen Code offenlegen, und das schreckt Konkurrenten zuverlässig ab. Es schreckt aber auch die Falschen ab: Viele Firmen verbieten AGPL-Software pauschal, weil ihre Rechtsabteilung die Offenlegungspflicht nicht im Einzelfall prüfen will. Ausgerechnet Agenturen mit vorsichtigen Kunden, also die Leute, für die Knecht gebaut wird, wären davon betroffen.

BSL, ELv2 und FSL stehen für dasselbe Modell, es nennt sich source available. Der Code ist öffentlich und frei nutzbar, nur die kommerzielle Verwertung bleibt dem Hersteller vorbehalten. Die [BSL](https://mariadb.com/bsl11/) (von MariaDB) verlangt, dass der Hersteller die erlaubte Nutzung selbst formuliert, deshalb liest sich jede BSL anders und muss einzeln geprüft werden. Selbst ob kostenloses Self-Hosting erlaubt ist, hängt dort vom jeweiligen Hersteller ab. Die [ELv2](https://www.elastic.co/licensing/elastic-license) (von Elastic) ist einfach, wird aber nie zu Open Source. Die FSL ([von Sentry](https://blog.sentry.io/introducing-the-functional-source-license-freedom-without-free-riding/)) ist die jüngste der drei: eine Seite Text, feste Regeln und eine eingebaute Umwandlung zu Open Source.

## Was die FSL erlaubt

Für die allermeisten ändert sich durch die Lizenz nichts, sie erlaubt genau das, was Knecht-Nutzer ohnehin tun:

- Knecht selbst hosten und produktiv einsetzen, auch kommerziell, auch für Kundenprojekte
- den Code lesen, verändern und forken
- Dienstleistungen rund um Knecht anbieten, etwa Setup und Betrieb für einen Kunden

Verboten ist eine Sache: Knecht anderen als eigenes kommerzielles Produkt anzubieten, also etwa Knecht-Hosting zu verkaufen oder Knecht unter anderem Namen zu vertreiben. Der [Lizenztext](https://fsl.software/) nennt das Competing Use.

Und dann ist da die Klausel, wegen der es am Ende die FSL geworden ist: Jede veröffentlichte Version wird zwei Jahre nach ihrem Release automatisch unter die [Apache-2.0-Lizenz](https://www.apache.org/licenses/LICENSE-2.0) gestellt, also echtes Open Source. Das steht unwiderruflich im Lizenztext, wir könnten es nicht einmal zurücknehmen. Sollte Knecht eines Tages eingestellt werden, ist der komplette Code spätestens zwei Jahre später frei. Niemand baut hier auf etwas, das ihm dauerhaft weggenommen werden kann.

## Kein Open Source

Im Alltag wird jedes öffentliche Repo schnell Open Source genannt. Open Source ist aber ein definierter Begriff: Die [Definition der Open Source Initiative](https://opensource.org/osd) verlangt unter anderem, dass eine Lizenz kein Einsatzfeld ausschließt, auch nicht das der Konkurrenz. Genau das tut die FSL mit ihrem Competing-Use-Verbot. Knecht ist damit kein Open Source. Die passenden Begriffe sind source available oder [Fair Source](https://fair.io/), so heißt die Initiative, unter der Sentry und andere dieses Modell zusammengefasst haben.

## Wie es weitergeht

Ein Punkt steht noch auf der Liste: Bevor der erste externe Pull Request gemergt wird, richten wir ein CLA ein, ein [Contributor License Agreement](https://de.wikipedia.org/wiki/Contributor_License_Agreement). Das ist eine kurze Vereinbarung, mit der Contributors uns die Rechte einräumen, ihren Beitrag zusammen mit dem restlichen Code zu lizenzieren. Ohne sie würden sich die Rechte am Code auf viele Personen verteilen, und jedes spätere Lizenzmodell müsste mit jedem einzelnen Contributor neu verhandelt werden.
