---
title: Der Agent bekommt ein Gedächtnis pro Projekt
date: 2026-08-14
tag: Engine
description: Bisher hat der Agent in jedem Run das Projekt neu erkundet. Jetzt merkt sich Knecht pro Projekt, was der Agent gelernt hat.
---

Die [AI-Action](/updates/workflow-engine) startet für jeden Run eine frische [Sandbox](/updates/sandbox-rollback) mit einem eigenen Checkout des Projekts. Der Agent wusste darin bisher nichts von früheren Runs. Was er über ein Projekt herausgefunden hatte, war danach weg, und der nächste Run musste es neu erkunden. Jetzt legt Knecht pro Projekt Notizen an. Der Agent schreibt sie selbst und findet sie beim nächsten Run wieder vor.

## Jeder Run fing bei null an

Wir haben uns im August 2026 angeschaut, wo langsame Runs ihre Zeit verlieren. Ein großer Teil war Wiederentdeckung. Eine einzeilige Änderung an einem `font-weight` dauerte auf einem Projekt, das schon Dutzende Runs hinter sich hatte, 280 Sekunden. Rund 160 davon verbrachte ein Subagent damit herauszufinden, wo die Styles liegen und wie das Projekt gebaut wird, also Fakten, die frühere Runs längst kannten.

[opencode](https://opencode.ai), der Agent hinter der AI-Action, kennt von Haus aus nur statische [Regel-Dateien](https://opencode.ai/docs/rules/) wie eine `AGENTS.md` im Repository. Die schreibt ein Mensch von Hand, der Agent trägt dort selbst nichts ein. Es gibt Community-Plugins für gelerntes Memory, aber sie passen nicht zu Knecht.

- Alles, was ein Plugin auf die Platte schreibt, landet im Wegwerf-Checkout des Runs und ist danach weg. Die Persistenz außerhalb des Runs müsste Knecht also sowieso bauen.
- Das bekannteste Plugin, [opencode-mem](https://github.com/tickernelz/opencode-mem), speichert seine Erinnerungen erst, wenn in der Session eine Weile nichts passiert, also in der Pause, in der ein Mensch im Chat gerade nichts tippt. Knecht startet opencode aber [nicht-interaktiv](https://opencode.ai/docs/cli/), und dieser Prozess beendet sich sofort nach seiner Antwort. Die Pause gibt es nie, das Plugin würde also nie speichern.

Deshalb haben wir das direkt in Knecht gebaut, als kleinen Speicher pro Projekt auf dem Host, außerhalb jeder Sandbox.

## Ein Index und Themen-Dateien

Das Gedächtnis besteht aus einer Index-Datei `MEMORY.md` und beliebigen Themen-Dateien. Nach ein paar Runs auf einem [Craft](https://craftcms.com)-Projekt kann es zum Beispiel so aussehen:

::code-tree{defaultValue="MEMORY.md"}

```md [MEMORY.md]
- Styles: Tailwind, tokens, build step, see styles.md
- Build and tests: commands and pitfalls, see build.md
```

```md [styles.md]
Tailwind 4, tokens live in src/css/config.css.
Font sizes and weights only via text-* utilities, no raw values.
After CSS changes run `ddev npm run build`,
templates load the built file from web/dist/.
```

```md [build.md]
Build: `ddev npm run build`
Tests: `ddev php vendor/bin/phpunit`
The build needs DDEV running, plain npm on the host
fails on the node version.
```

::

Der Index hält eine Zeile pro Thema und wird bei jedem Agenten-Aufruf in die Instructions gemischt, er ist also immer im Kontext. Damit das billig bleibt, ist er hart auf 2 KB begrenzt. Die Themen-Dateien liest der Agent nur, wenn der Index auf etwas Relevantes zeigt, sie kosten bis dahin keinen Kontext. Das Muster stammt aus Claude Code, dessen [Auto-Memory](https://code.claude.com/docs/en/memory) genauso aufgebaut ist.

Gepflegt wird das Ganze vom Agenten selbst, nach Regeln in der `AGENTS.md`, die Knecht in jede Sandbox legt. Er soll Notizen umschreiben statt anhängen, Veraltetes löschen und Korrekturen festhalten, die im Follow-up-Chat auf der Run-Seite kommen. Wer dort einmal "nein, wir benutzen keine Utility-Klassen" schreibt, soll das kein zweites Mal schreiben müssen. Und er soll seine eigenen Notizen kurz prüfen, bevor er darauf aufbaut, denn das Projekt kann sich seit dem letzten Run geändert haben.

## Kopieren statt mounten

Vor jedem Agenten-Aufruf kopiert Knecht die Notizen in den Checkout des Runs, nach dem Aufruf zurück auf den Host. Das Zurückkopieren passiert auch bei fehlgeschlagenen Schritten, denn die Notizen halten Fakten über das Projekt fest, keinen Run-Status.

Ein Mount in die Sandbox wäre einfacher gewesen. Mit der Kopie arbeitet jeder Run aber nur auf seinem eigenen Stand, und Knecht hat beim Zurückkopieren eine Stelle, an der es prüfen kann, was der Agent geschrieben hat.

- Übernommen werden nur einfache Markdown-Dateien auf oberster Ebene, keine [Symlinks](https://man7.org/linux/man-pages/man7/symlink.7.html), keine Unterordner, keine versteckten Dateien.
- Der Index darf höchstens 2 KB groß sein, alle Dateien zusammen höchstens 64 KB. Ist die Kopie größer, übernimmt Knecht sie gar nicht, der letzte gültige Stand bleibt erhalten, und im Run-Log steht eine Zeile dazu.

Knecht verwirft zu große Kopien, statt sie zu kürzen, weil der Agent eine Kürzung nicht mitbekommen würde und dann mit lückenhaften Notizen weiterarbeitet. Mit dem alten Stand kann er beim nächsten Run selbst aufräumen, die Regeln dafür stehen in der `AGENTS.md`. Dass die Limits eingehalten werden, prüft Knecht trotzdem selbst, damit der Kontext nicht wächst, wenn das Modell die Regeln ignoriert.

## Was noch fehlt

Eine Ansicht in den Projekt-Einstellungen, die zeigt, was sich Knecht gemerkt hat, gibt es noch nicht. Dort will man die Notizen lesen und auch korrigieren können. Offen ist auch, ob Knecht eine zu große Kopie irgendwann zusammenfassen soll, statt sie zu verwerfen, das lohnt sich aber erst, wenn Verwerfungen in der Praxis häufig vorkommen.
