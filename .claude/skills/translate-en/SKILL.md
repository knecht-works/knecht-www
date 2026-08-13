---
name: translate-en
description: Deutsche Inhalte aus content/de/ nach content/en/ übersetzen oder eine bestehende Übersetzung nachziehen. Anwenden, wenn ein Update-Post oder eine Seite auf Englisch gebraucht wird, wenn sich die deutsche Fassung geändert hat oder wenn UI-Strings in i18n/locales fehlen.
---

# Deutsche Seiten nach Englisch übersetzen

Die Site ist zweisprachig. Jede deutsche Datei hat ein englisches Gegenstück
am gespiegelten Pfad. Englisch ist `defaultLocale`, Deutsch läuft unter
`/de`. Dieser Skill beschreibt, wie die englische Fassung entsteht und wie
sie klingt.

## Dateien und Pfade

- `content/de/updates/<slug>.md` → `content/en/updates/<slug>.md`
- `content/de/pages/<slug>.md` → `content/en/pages/<slug>.md`
- Dateiname und Slug bleiben identisch, auch wenn sie deutsch sind
  (`was-macht-knecht.md`, `datenschutz.md`). Der Slug ist die gemeinsame
  Klammer zwischen den Sprachen, der Locale-Switch baut die Gegen-URL
  daraus. Slug umbenennen heißt immer: in beiden Sprachen umbenennen.
- Collections und Präfixe stehen in `content.config.ts`. Neue Dateien
  brauchen dort nichts, solange sie im richtigen Ordner liegen.
- UI-Strings liegen nicht im Content, sondern in `i18n/locales/de.json`
  und `i18n/locales/en.json`. Beide Dateien haben exakt dieselben Keys in
  derselben Reihenfolge, das bleibt so.

## Ablauf

1. Zieldatei bestimmen und prüfen, ob sie schon existiert.
2. Die deutsche Datei komplett lesen, nicht abschnittsweise. Der Ton eines
   Posts entscheidet sich über den ganzen Text.
3. Existiert die englische Fassung bereits, nur die geänderten Stellen
   nachziehen. Den Rest nicht neu formulieren, sonst wandert der Stil bei
   jedem Update.
4. Übersetzen nach den Regeln unten.
5. Struktur gegenprüfen (siehe unten).
6. Kein Lint, kein Build, kein Dev-Server nebenbei. Nur wenn der User
   danach fragt.

## Frontmatter

| Feld | Behandlung |
| --- | --- |
| `title` | übersetzen, kein Punkt am Ende, Sentence Case |
| `description` | übersetzen, gleiche Länge und Aussage |
| `date`, `updatedAt` | unverändert übernehmen |
| `tag` | über die feste Tabelle unten mappen |

Tags sind ein geschlossenes Set, weil sie im Dashboard und in der Liste als
Filter auftauchen. Nur diese Zuordnung verwenden:

| Deutsch | Englisch |
| --- | --- |
| Architektur | Architecture |
| Projekt | Project |
| Engine | Engine |
| Security | Security |
| Performance | Performance |
| Setup | Setup |
| Beta | Beta |
| Dashboard | Dashboard |

Neuer deutscher Tag ohne Eintrag hier: englische Entsprechung wählen, die
Tabelle in diesem Skill ergänzen und im gleichen Zug den Tag auch im
Update-Post-Skill nachtragen.

Titel neuerer Posts stehen in Sentence Case ("A terminal and VS Code for
each run"). Das ist der Standard. Ältere Titel in Title Case
("What Knecht Does") bleiben, wie sie sind, solange niemand den Post
sowieso anfasst.

## Sprache

Das Englisch ist bewusst einfach. Leser sind Devs in Agenturen quer durch
Europa, für viele ist Englisch Zweitsprache. Klar vor elegant.

- Kurze Sätze, ein Gedanke pro Satz. Ein deutscher Satz wird im Zweifel zu
  zwei englischen. Deutsche Schachtelsätze nie 1:1 nachbauen.
- Keine Kontraktionen. "does not", nicht "doesn't". "it is", nicht "it's".
- Keine Em-Dashes, nirgends. Komma, Doppelpunkt oder zwei Sätze.
- Deutsche Doppelpunkt-Konstruktionen im Satz auflösen. "Das haben wir
  geändert: Knecht steht unter der FSL" wird zu zwei Sätzen. Ein
  Doppelpunkt, der eine Liste oder Tabelle einleitet, ist ok.
- "man" wird "you". "wir" bleibt "we".
- Knecht ist im Deutschen männlich ("er bootet"), im Englischen sachlich:
  "Knecht is a dashboard. It boots your DDEV projects."
- Alltagswortschatz statt Latinat: "use" statt "utilize", "start" statt
  "initiate", "select" statt "opt for".
- Keine Idiome und keine Metaphern dazuerfinden. Was im Deutschen sachlich
  steht, bleibt englisch sachlich.
- Zahlen umstellen: `0,5` wird `0.5`, `1.000` wird `1,000`. Monate
  ausschreiben ("Juli 2026" wird "July 2026"). Datumsangaben im Fließtext
  als "July 2026", nicht numerisch.
- "z. B." wird "for example", "d. h." wird "that is". Keine
  Abkürzungspunkte importieren.

## Was nicht übersetzt wird

- Produktbegriffe: Knecht, Run, Sandbox, Workflow, Action, Trigger,
  Follow-up, Preview. Im Englischen kleingeschrieben im Fließtext (`a run`,
  `the sandbox`), außer der Post führt sie gerade fett als Begriff ein.
- Tool- und Techniknamen: DDEV, Docker, Composer, npm, Git, GitHub, Craft
  CMS, Sysbox, VS Code.
- UI-Labels in Anführungszeichen. Das Dashboard ist auf Englisch, also
  bleibt `"Terminal"` und `"Open in VS Code"` in beiden Sprachen gleich.
- Code-Blöcke inklusive Kommentaren, Befehlen, Pfaden und Hostnamen.
- URLs, `src`- und `poster`-Pfade, Dateinamen in `/public/assets/`.

## MDC und Struktur

Die englische Datei hat dieselbe Struktur wie die deutsche: gleiche
Abschnitte, gleiche Reihenfolge, gleiche Anzahl Überschriften, gleiche
Medien an denselben Stellen. Übersetzen heißt nicht redigieren. Fällt beim
Übersetzen ein inhaltlicher Fehler auf, gehört der in die deutsche Fassung
zurück, nicht still in die englische hinein.

- `::note`, `::steps`, `::field-group`, `::update-video` Block für Block
  übernehmen, inklusive schließendem `::`. Nur Textinhalt und Props wie
  `caption` oder `name` übersetzen.
- Bild-Alt-Texte übersetzen, Pfade nicht.
- Tabellen: Kopfzeile und Zellen übersetzen, Spalten- und Zeilenzahl
  bleibt. In Tabellen keine Links.
- Überschriften kurz halten, 2-4 Wörter, wie im Deutschen. Aus der TOC
  wird sonst eine Textwand.
- Links: URL unverändert, Linktext übersetzen. Interne Links auf andere
  Updates bleiben `/updates/<slug>`, ohne Locale-Präfix.
- `<!-- TODO(samuel): ... -->` Kommentare mitübernehmen, solange sie in der
  deutschen Fassung stehen.

## Gegenprüfen

Nach dem Schreiben Struktur vergleichen, nicht den Text:

```bash
for f in content/de/updates/<slug>.md content/en/updates/<slug>.md; do
  echo "$f: $(grep -c '^#' "$f") headings, $(grep -c '^::' "$f") mdc-lines, $(grep -o '](' "$f" | wc -l) links"
done
```

Die Zahlen müssen übereinstimmen. Dazu per Auge:

- Frontmatter hat dieselben Keys, `date` und `updatedAt` identisch.
- Keine Em-Dashes, keine Kontraktionen im englischen Text.
- Kein deutsches Wort übrig geblieben, besonders in Alt-Texten, Captions
  und Tabellenzellen.

## UI-Strings

Fehlt ein Key in `i18n/locales/en.json`, gelten dieselben Sprachregeln,
plus: Länge im Blick behalten. Buttons und Nav-Labels sind auf Englisch
oft kürzer, dürfen aber nie länger werden als die deutsche Fassung, sonst
bricht das Layout. Beide Dateien behalten dieselbe Key-Reihenfolge.

## Andere Richtung

Für Englisch nach Deutsch oder für neue deutsche Posts gilt der Skill
`update-post`. Der beschreibt Ton, Struktur und Faktenquelle der deutschen
Originale. Dieser Skill hier fügt inhaltlich nichts hinzu, er überträgt
nur.
