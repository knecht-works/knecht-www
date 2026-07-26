---
name: update-post
description: Building-in-Public-Updates in content/updates/ schreiben oder überarbeiten. Anwenden, wenn ein neuer Update-Post entsteht, Feedback in einen Post eingearbeitet wird oder Update-Texte redigiert werden.
---

# Update-Posts schreiben

Regeln für "Building in Public"-Updates in `content/updates/`. Der Skill
wächst mit: Feedback aus Review-Runden hier einarbeiten und dabei
Widersprüche zu bestehenden Regeln auflösen, nicht daneben stapeln.

## Datei und Frontmatter

- Ablage: `content/updates/<slug>.md`, Slug englisch, kebab-case
  (`dashboard-architecture`, `workflow-engine`).
- Frontmatter (Schema in `content.config.ts`):

```yaml
---
title: Deutscher Titel, kein Punkt am Ende
date: 2026-07-26
tag: Architektur
description: 1-2 Sätze für die Liste auf der Startseite.
---
```

- Bisher verwendete Tags: Architektur, Engine, Security, Performance, Setup,
  Beta. Vorhandene wiederverwenden, bevor ein neues erfunden wird.

## Zielgruppe und Sprache

- Leser sind Devs in Agenturen: GitHub, Composer, DDEV gelten als bekannt.
  Workflow-Engine-Wissen, Container-Interna und Knecht-Begriffe nicht.
- Knecht-Begriffe (Run, Sandbox, Trigger, Follow-up, Action) beim ersten
  Auftreten in einem Halbsatz erklären oder auf den erklärenden Post
  verlinken. Workflow-Schritte heißen **Actions** (die Action), nie Blocks.
- Dinge beim konkreten Namen nennen, keine selbst erfundenen Sammelbegriffe
  ("DDEV-Config" statt "Projekt-Config"). Was der Leser aus seinem Alltag
  kennt, muss er wiedererkennen.
- UI-Elemente mit ihrem exakten Label in Anführungszeichen nennen
  ('Ein Klick auf "Terminal" ...'), damit klar ist, dass ein Button oder
  Menüpunkt gemeint ist.
- Deutsch. "Wir" für uns, Leser sparsam und direkt ("du"/"ihr"), sonst
  unpersönlich ("man"). Kurze, direkte Sätze, ein Gedanke pro Satz:
  Nutzeraktion und Technik-Detail nicht in einen Satz packen.
  Fachbegriffe ohne gute deutsche Entsprechung bleiben englisch
  (Daemon, Socket, Run).

## Ton

- Geredet, nicht gepitcht. Keine Business-Metaphern ("Hebel",
  "Gamechanger"), keine Aufzählung per Doppelpunkt im Satz ("Das bringt
  drei Dinge: X, Y, Z"), keine Paradox-Pointen ("gilt unverändert, nur mit
  anderem Ergebnis"), keine Werbe-Satzstellung mit Inversion ("Los geht es
  mit ...", "öffentlich erreichbar ist da nichts") und keine inhaltsleeren
  Zuschreibungen ("sinnvolle Defaults"). Wörtlich hinschreiben, was gemeint
  ist, in normaler Satzstellung, in Sätzen, die man so auch sagen würde.
- Prosa erzählt die Geschichte, Listen tragen die Fakten. Reiht ein Absatz
  mehrere Fakten oder Messwerte aneinander (auch als
  "Erstens ... Zweitens ..."-Prosa), wird daraus ein kurzer
  Einleitungssatz plus ungeordnete Liste. Listen bleiben schlicht: kein
  fetter Vorspann ("**RAM:** ..."), keine Nummerierung ohne echte
  Reihenfolge. Ein Doppelpunkt, der eine Liste oder Tabelle einleitet,
  ist ok.
- Aber nicht jede Sammlung wird eine Liste. Listen sind für gleichartige,
  parallele Fakten (Messwerte, die zwei Gründe, die drei Wege). Lose
  zusammenhängende Eigenschaften eines Features lieber thematisch zu 1-2
  kurzen Absätzen gruppieren, sonst wirkt die Liste wie ein Feature-Zettel.
- Ehrlich, aber unaufgeregt. Probleme, Fehlentscheidungen und Tradeoffs
  offen benennen, ohne die eigene Offenheit zu kommentieren ("und den
  machen wir bewusst") und ohne Dramatisierung: nichts als überraschend
  hinstellen, was absehbar war. Im Zweifel beim Autor nachfragen, wie es
  wirklich ablief, statt eine runde Story zu erfinden. Keine unfairen
  Seitenhiebe auf andere Tools.
- Produktverhalten nicht als bloße Metapher beschreiben ("legt sich
  schlafen", "wacht auf"). Den Mechanismus einmal konkret erklären (Knecht
  stoppt unbenutzte Umgebungen automatisch); erst danach trägt eine kurze
  Metapher.
- Wirkungsketten ausschreiben. Wenn ein technisches Detail einen Effekt
  erklären soll (Host-Header, deshalb funktioniert Multisite), den
  Zwischenschritt nennen, der beides verbindet. Test: Würde ein Leser
  fragen "was hat das eine mit dem anderen zu tun?", fehlt ein Satz.

## Was ein Update ist (und was nicht)

- Ein Update erzählt eine Entscheidung, einen Meilenstein oder eine
  Lernkurve. Es ist keine Doku: keine vollständigen Feature-Listen, keine
  Zahlen, die beim nächsten Release veralten (Anzahl Actions,
  Retry-Limits). Historische Messwerte mit Zeitpunkt ("gemessen im Juli
  2026: ~180 MB") sind dagegen erwünscht, die veralten nicht.
- Nur behaupten, was die UI wirklich kann, nicht was die Engine intern
  könnte.
- Implementierungsdetails nur, wenn sie das Argument tragen. Ein Detail,
  das beim Leser neue Fragen aufwirft statt eine zu beantworten
  (`docker exec`, Dateipfade, Flags), fliegt raus.

## Struktur

- Einstieg ohne Überschrift: 2-4 Sätze, worum es geht und warum es den
  Leser interessiert. Danach `##`-Abschnitte, `###` für Unterpunkte.
- Aus den Headlines wird eine TOC gebaut: kurz halten, 2-4 Wörter
  ("Die Rechnung", "Kein Socket im Run"). Keine Sätze, keine
  Doppelpunkt-Konstruktionen als Überschrift. Zusammengehörende Punkte
  unter ein `##` gruppieren und als `###` gliedern, statt viele flache
  `##` aneinanderzureihen.
- Technische Abschnitte folgen dem Muster: Problem in 1-2 Sätzen benennen,
  dann die Lösung erklären. Keine Aha-Dramaturgie als Einstieg ("Am Ende
  hängt alles an ...", "Die entscheidende Idee ist ...").
- Architektur-Posts starten mit einer `::note`, die klarstellt, dass es
  ein Blick unter die Haube ist, mit Link auf Startseite und einen
  Produkt-Post.
- Fortsetzungen verlinken in beide Richtungen: der neue Post verweist früh
  auf den Vorgänger, der Vorgänger bekommt eine kurze `::note` mit Link
  nach vorn, wenn seine Aussagen inzwischen überholt sind.
- Häufiger Schluss: "## Wie es weitergeht" oder "## Was noch fehlt" mit
  einem ehrlichen Ausblick.

## Formatierung (Nuxt Content / MDC)

- `::note` für Einordnungen am Anfang und für Info-Randnotizen im Text,
  etwa Verhalten, das erklärenswert ist, aber nicht zum Argument des
  Abschnitts gehört.
- `::steps{level="3"}` ... `::` für nummerierte Abläufe, innen `###` pro
  Schritt.
- `::field-group` mit `:::field{name="..."}` für 2-4 parallele Kategorien.
- Vorher/Nachher-Vergleiche als Markdown-Tabelle: erste Spalte die
  Dimension (RAM, Disk, Bootzeit), eine Spalte pro Variante. Nur Zeilen
  aufnehmen, für die es belegte Werte oder klare Fakten gibt. In Tabellen
  keine Links.
- Bilder aus `/public/assets/` einbinden: `![Alt-Text](/assets/name.png)`,
  Alt-Text beschreibt, was zu sehen ist.
- Kurze Demo-Videos (mp4 oder webm, ebenfalls in `/public/assets/`) über die
  Komponente `app/components/UpdateVideo.global.vue`:
  `::update-video{src="/assets/name.mp4" caption="..."}` plus schließendes
  `::`. Props nur `src`, `caption`, `poster`. Verhalten ist eingebaut:
  stummer Loop, spielt nur solange das Video im Viewport sichtbar ist,
  Controls erscheinen beim Hover bzw. beim ersten Tap.
- Medien stehen früh im Abschnitt, den sie zeigen: nach dem
  Einleitungsabsatz, der sagt, was zu sehen ist, oder direkt unter der
  Headline, wenn es keinen gibt. Nicht ans Abschnittsende schieben.
- Nach einem Medium den Faden wieder aufnehmen: Der Text danach braucht
  einen kurzen Anschlusssatz, eine Liste steht nie direkt unter einem
  Video oder Bild.
- Fehlende Medien beim Schreiben nicht blockieren lassen: Einbindung mit
  endgültigem Dateinamen plus `<!-- TODO(samuel): ... -->` davor, und dem
  Autor eine Dreh-Liste geben (Dateiname, was zu sehen ist, Länge).
- Links auf andere Updates relativ (`/updates/<slug>`). Tech-Begriffe beim
  ersten Auftreten auf vertrauenswürdige Quellen verlinken, bevorzugt
  offizielle Doku (docs.docker.com, docs.ddev.com, MDN, man7.org,
  craftcms.com, OWASP); Blogs nur, wenn sie die beste Erklärung sind
  (z. B. Simon Willison zu Prompt Injection). Jede URL vor dem Einbau per
  curl prüfen; Hosts, die Bots blocken (dev.mysql.com), durch
  gleichwertige offene Quellen ersetzen (MariaDB KB).
- Keine Em-Dashes, nirgends. Komma, Doppelpunkt oder zwei Sätze.

## Faktenquelle

Die Fakten kommen aus knecht-cloud, nicht aus dem Gedächtnis: Commit
Messages (`git log`), `internals/docs/*.md` und Memory-Notizen. Messwerte
und Behauptungen vor dem Schreiben dort verifizieren.
