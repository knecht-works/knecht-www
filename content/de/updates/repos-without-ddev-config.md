---
title: Jedes Repo bootet, auch ohne DDEV-Config
date: 2026-09-11
tag: Engine
description: Knecht baut die Umgebung jetzt aus den Repo-Dateien, wenn keine DDEV-Config da ist. Ein Dev-Server wird zur Live-Preview, mit Hot Reload.
---

Bisher brauchte ein Repo eine `.ddev/config.yaml`, sonst konnte Knecht es nicht booten. Seit Version 0.10 baut Knecht die Umgebung aus den Dateien im Repo, wenn keine Config da ist. Ein Dev-Server wird dabei zur Live-Preview, [Hot Reload](https://vite.dev/guide/features.html#hot-module-replacement) eingeschlossen. Dieser Post erklärt, was Knecht erkennt, wie die Preview durchkommt und was wir dabei über [DDEV](https://ddev.com/), [Docker Compose](https://docs.docker.com/compose/) und [Nuxt](https://nuxt.com/) gelernt haben.

## Was Knecht erkennt

Beim Start jedes Runs liest Knecht die Dateien aus dem Checkout, die die Versionen ohnehin festlegen:

| | Quelle | Regel |
|---|---|---|
| PHP | `require.php` in `composer.json` | die höchste Version des DDEV-Images, die den Constraint erfüllt |
| Node | `mise.toml`, `.mise.toml`, `.tool-versions`, `.nvmrc`, `engines.node` | die erste Datei mit einem Wert gewinnt |
| Package Manager | Feld `packageManager`, sonst das Lockfile | npm, pnpm, yarn oder bun |

Fehlt eine Angabe, gilt der DDEV-Default. Das Run-Log nennt jeden Wert mit seiner Quelle, etwa `PHP 8.2 from composer.json, Node 22 from .nvmrc`.

### Die generierte Config

Aus den Werten schreibt Knecht eine `.ddev/config.yaml` in den Checkout. Für ein Nuxt-Repo, das Node 22 pinnt und keine `composer.json` hat, sieht sie so aus:

```yaml
#knecht-generated
name: knecht-run-42
type: php
docroot: ""
webserver_type: generic
php_version: "8.4"
nodejs_version: "22"
omit_containers:
  - db
corepack_enable: true
disable_settings_management: true
```

Der Projekttyp ist `php`, weil DDEV dafür keine CMS-Annahmen trifft. Der Web-Server ist [`generic`](https://docs.ddev.com/en/stable/users/configuration/config/#webserver_type), also laufen weder nginx noch php-fpm, denn ohne Website gibt es nichts auszuliefern. Der Datenbank-Container fehlt, Corepack ist eingeschaltet, und DDEV schreibt keine Settings-Dateien ins Repo. Ports, Umgebungsvariablen und Daemons legt Knecht wie bei jedem Projekt in eigenen Override-Dateien daneben ab, dazu weiter unten mehr.

Den Kommentar in der ersten Zeile braucht Knecht, damit es bei jedem weiteren Run sicher sagen kann, dass es sich um ein Projekt ohne eigene DDEV-Config handelt, obwohl im Checkout jetzt eine liegt.

Der Marker sorgt auch dafür, dass nichts davon in einem Commit landet. Die Git-Actions im Run committen alles, was im Checkout liegt. Deshalb schreibt Knecht vor dem ersten Run das Verzeichnis `.ddev/` in die Datei [`.git/info/exclude`](https://git-scm.com/docs/gitignore) des Clones. Das ist eine Ignore-Liste, die nur in diesem Clone gilt und selbst nicht im Repo liegt, Git behandelt die Einträge wie eine `.gitignore`. Bei einem Repo mit eigener Config stehen dort nur Knechts eigene Dateien, bei einer generierten das ganze Verzeichnis, weil auch DDEV beim Start Dateien hineinlegt. Welcher Fall gilt, liest Knecht am Marker ab.

### Package Manager

npm steckt im DDEV-Image und ist der Default, wenn das Repo nichts anderes festlegt. [Corepack](https://nodejs.org/api/corepack.html) ist in jeder generierten Umgebung eingeschaltet, damit pnpm und yarn ohne Installation laufen. Corepack lädt die Version aus dem Feld `packageManager`, im Repo muss nichts installiert werden.

[bun](https://bun.sh/) fehlt im Image. Knecht ergänzt den Image-Build um eine Zeile, die bun über npm installiert. Die Schicht bleibt im [Docker-Cache](https://docs.docker.com/build/cache/), nur die erste bun-Session auf einem Server baut sie.

Die Downloads aller vier landen im serverweiten Cache von DDEV. Composer, npm und Corepack zeigt DDEV selbst dorthin, die Pfade für den pnpm-Store, yarn und bun setzt Knecht dazu, und zwar für jedes Projekt, auch für eines mit eigener DDEV-Config. Ein Server lädt jedes Paket einmal, spätere Sessions installieren aus dem Cache.

### Node-Version

Konkrete Versionen wie `22` oder `v20.11` übernimmt Knecht bis zur Minor-Version, [nvm](https://github.com/nvm-sh/nvm#nvmrc)-Codenamen wie `lts/iron` als Major-Version. Bewegliche Ziele wie `lts/*` oder `latest` pinnt Knecht nicht, dann gilt der Default, mit einer Warnung im Run-Log. [`engines.node`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#engines) in der `package.json` ist meist ein Bereich wie `>=20`. Erfüllt der DDEV-Default den Bereich, bleibt er, sonst nimmt Knecht die höchste LTS-Version, die passt.

### PHP-Version

Zur Wahl stehen die Versionen des DDEV-Images, derzeit 5.6 bis 8.4. Composer-[Constraints](https://getcomposer.org/doc/articles/versions.md) wie `^8.1` oder `>=8.1,<8.3` übersetzt Knecht in einen [Semver-Range](https://github.com/npm/node-semver#ranges) und nimmt die höchste Version, die ihn erfüllt. Erfüllt keine den Constraint, gilt der Default, mit Warnung im Run-Log.

### Das Ergebnis in den Settings

![Projekt-Settings eines Nuxt-Repos ohne DDEV-Config: die Karte "Environment" mit PHP 8.4, Node 24 und pnpm, darunter die Boot Commands und die Karte "Dev Server" mit Befehl und Port](/assets/knecht-project-settings-noddev.png)

Die Karte "Environment" in den Projekt-Settings zeigt die erkannten Werte mit ihrer Quelle. Wer will, wählt dort eine andere PHP-Version, eine andere Node-Version oder einen anderen Package Manager. Die Erkennung läuft schon beim Verbinden des Repos, über die GitHub-API und mit derselben Logik wie beim Boot. Warnungen, etwa zu einem Constraint, den keine Version erfüllt, stehen ebenfalls in der Karte.

## Preview

Eine generierte Umgebung hat keine Website. Deshalb gibt es die Karte "Dev Server" mit dem Befehl, der den Dev-Server startet, etwa `npm run dev`, und seinem Port. Knecht startet ihn nach den Boot-Befehlen und liefert ihn als Preview der Session aus. Die Preview-URL bekommt der Befehl als `KNECHT_PREVIEW_URL`. Ohne Dev-Server bootet die Umgebung ohne Preview. Änderungen an den Karten "Environment" und "Dev Server" greifen beim nächsten Run der Session.

::update-video{src="/assets/hmr-nuxt-knecht.mp4" caption="Ein Nuxt-Dev-Server als Preview. Die Änderung im Code erscheint ohne Reload."}
::

### Hot Reload

Hot Reload funktioniert in der Preview wie lokal, ohne Änderungen im Repo. Wie ein Vite-Dev-Server durchkommt, war aber ein Stück Arbeit.

::steps{level="4"}

#### Der Daemon im Container

Der Dev-Server läuft als Daemon unter [supervisord](https://supervisord.org/) im Web-Container, so wie DDEV es für [web_extra_daemons](https://docs.ddev.com/en/stable/users/configuration/config/#web_extra_daemons) vorsieht. Knecht trägt ihn in seiner Override-Datei ein, zusammen mit dem Forwarder aus dem nächsten Schritt:

```yaml
web_extra_daemons:
  - name: knecht-dev
    command: bash -lc 'npm run dev'
    directory: /var/www/html
  - name: knecht-forward
    command: knecht-forward 41000 3000
    directory: /var/www/html
```

Der Befehl läuft in einer Login-Shell, damit das Profil des Images gilt. DDEV startet den Daemon direkt nach `ddev start`, also bevor die Boot-Befehle `npm ci` ausgeführt haben. Der erste Start stirbt deshalb, und supervisord gibt nach ein paar Versuchen auf. Knecht startet die Daemon-Gruppe nach den Boot-Befehlen noch einmal und pollt dann, bis auf dem Port etwas antwortet. Erst dann gilt die Preview als bereit.

#### Der Forwarder

Vite, Nuxt und Next binden standardmäßig nur an `127.0.0.1`. Der Preview-Proxy erreicht den Container aber von außen, über dessen IP im Docker-Netz. Deshalb läuft als zweiter Daemon ein kleiner Forwarder daneben, ein Node-Script mit wenigen Zeilen. Es lauscht auf allen Interfaces des Containers an einem festen Port und reicht jede TCP-Verbindung an `127.0.0.1` und den Port des Dev-Servers weiter. Alles vom Host aus zielt auf den Forwarder, auch das Polling beim Boot, damit derselbe Weg geprüft wird, den später der Browser nimmt.

#### Der Proxy

Ein Request auf `<session>.preview.<host>` landet beim Preview-Proxy von Knecht. Der prüft das Login-Cookie, ermittelt die IP des Web-Containers und reicht den Request per HTTP an den Forwarder durch. Der `Host`-Header bleibt der Preview-Host, weil der Dev-Server keinen eigenen Hostnamen hat. Hot Reload läuft über eine [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)-Verbindung. Der Proxy leitet den Upgrade an denselben Port weiter und gibt das vom Browser gewünschte Subprotokoll mit, weil Vite den HMR-Upgrade nur mit `vite-hmr` abschließt. Weil der Forwarder rohes TCP weiterreicht, kommt der WebSocket ohne weiteres Zutun durch.

#### Die Host-Prüfung

Vite lehnt Anfragen für unbekannte Hostnamen ab, siehe [server.allowedHosts](https://vite.dev/config/server-options.html#server-allowedhosts). Seit Vite 5.4.12 und 6.0.9 liest der Dev-Server einen zusätzlichen erlaubten Host aus der Umgebungsvariable `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`, und Knecht setzt sie auf den Preview-Host. Nuxt nutzt Vite und ist damit abgedeckt. Next.js führt seine eigene Liste in [`allowedDevOrigins`](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins), die kommt weiterhin aus dem Repo.

::

### Dev-Server neben der eigenen Config

Seit demselben Release kann auch ein Repo mit eigener DDEV-Config einen Dev-Server angeben, etwa Vite für HMR neben einer [Craft](https://craftcms.com/)-Site. Der Dev-Server ersetzt die Site dann nicht. Die Hostnamen des Repos erreichen weiter den Web-Server, und der Dev-Server bekommt eine eigene Preview-Origin, die der Container als `KNECHT_DEV_SERVER_URL` sieht. Dorthin zeigt das Repo seine Asset-URL, etwa mit einem Env-Wert wie `VITE_DEV_SERVER_PUBLIC=$KNECHT_DEV_SERVER_URL` in den Projekt-Settings.

Die Seite lädt den Dev-Server als Module-Script, und Module-Scripts holt der Browser über Origins hinweg ohne Cookies. Das Login-Cookie der Preview kommt dort also nie an. Deshalb trägt die Origin des Dev-Servers einen Token pro Session im Hostnamen, statt am Cookie zu hängen. Sichtbar ist davon nichts, `KNECHT_DEV_SERVER_URL` enthält die fertige URL.

## Nebenbei gelernt

Ein Teil der Arbeit an diesem Release war weniger die Erkennung als das Zusammenspiel mit DDEV, Docker Compose und Nuxt. Fünf Dinge davon sind auch außerhalb von Knecht nützlich.

### DDEV merged nach Dateinamen

DDEV liest alle `config.*.yaml` in `.ddev/` und merged sie in alphabetischer Reihenfolge, bei Skalaren gewinnt die letzte Datei, Listen werden zusammengehängt ([Doku](https://docs.ddev.com/en/stable/users/extend/customization-extendibility/)). Knechts Override hieß `config.knecht.yaml`. Ein Repo mit einer `config.vite.yaml` sortierte dahinter und konnte den Run-Namen oder die Umgebung überschreiben. Jetzt heißen Knechts Dateien `config.zzz-knecht.yaml` und `docker-compose.zzz-knecht.yaml`, damit sie zuletzt gelesen werden.

Beim Merge ignoriert DDEV außerdem Nullwerte. Ein `xdebug_enabled: false` in einer Override-Datei hebt ein `true` aus der Haupt-Config nicht auf. Auf einem Knecht-Server läuft kein Debugger, jeder Request hätte auf einen gewartet. Knecht schaltet Xdebug deshalb über [`XDEBUG_MODE=off`](https://xdebug.org/docs/all_settings) in der Umgebung ab, die Variable schlägt die ini, für php-fpm und die CLI. Eine eigene `XDEBUG_MODE`-Zeile in den Projekt-Settings gewinnt trotzdem.

### Variablen ohne Router

Ohne Router lässt DDEV [`DDEV_PRIMARY_URL`](https://docs.ddev.com/en/stable/users/extend/custom-commands/#environment-variables-provided), `DDEV_HOSTNAME` und `DDEV_SCHEME` leer. Auf Knecht-Servern gibt es keinen Router, der Preview-Proxy spricht die Web-Container direkt an. Die Settings-Dateien, die DDEV selbst für Drupal, TYPO3 und WordPress schreibt, bauen ihre URLs aber aus genau diesen Variablen, und so zeigten sie ins Leere. Knecht schreibt sie jetzt selbst, so wie DDEV es lokal tut, mit der Preview-URL der Session als Wert.

### Ports aus der Projektliste

Zwei parallele Runs desselben Projekts brauchen verschiedene Host-Ports, auch wenn das Repo für den GUI-Client eines Entwicklers einen [`host_db_port`](https://docs.ddev.com/en/stable/users/configuration/config/#host_db_port) pinnt. Knecht hat freie Ports beim Betriebssystem erfragt, und DDEV lehnte den Start trotzdem ab:

```
host port 36865 has already been allocated to project knecht-run-6
```

DDEV merkt sich die Ports jedes Projekts in `~/.ddev/project_list.yaml`, auch die von gestoppten, und prüft gegen diese Liste. Knecht liest die Liste jetzt mit und probiert weiter, bis es Ports hat, die DDEV nicht kennt.

### Docker Compose expandiert gegen den Host

Die Env-Werte aus den Projekt-Settings landen über eine Compose-Datei im Container. Docker Compose [interpoliert](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/) ein `$NAME` in dieser Datei gegen die Umgebung des Hosts, nicht des Containers. Ein nicht gesetzter Name wurde ein leerer String, ein Passwort mit `$` kam verstümmelt an. Knecht expandiert Referenzen jetzt selbst, gegen `KNECHT_PREVIEW_URL` und die vorherigen Zeilen, und escaped jedes übrige `$` als `$$`. `APP_URL=$KNECHT_PREVIEW_URL` ergibt so die Preview-URL der Session, `SITE_URL=${APP_URL}/en` baut darauf auf, und ein `$` im Passwort bleibt ein `$`.

### Nuxt hinter Nuxt

Das Dashboard ist eine Nuxt-App, und die Preview eines Nuxt-Projekts läuft über einen Proxy in derselben App. Beide liefern ihre Assets unter `/_nuxt/` aus. [Vites](https://vite.dev/) Dev-Middleware und [Nitros](https://nitro.build/) Static-Handler beantworten Anfragen auf diesen Pfad, bevor eine Server-Middleware dran ist. Die Assets der Preview kamen also beim Dashboard an und liefen ins Leere, 404 in Production und ENOENT im Dev-Modus. Die Lösung ist eine Zeile in der `nuxt.config.ts`, [buildAssetsDir](https://nuxt.com/docs/api/nuxt-config#buildassetsdir) auf `/_knecht/`. Wer eine Nuxt-App durch eine Nuxt-App proxyt, braucht sie auch.

## Einschränkungen

Die generierte Umgebung ist ein DDEV-Projekt mit PHP und Node, mehr nicht. Damit läuft alles, was mit diesen beiden auskommt, also Libraries, Plugins, Frontends und Node-Tools. Was darüber hinausgeht, braucht weiterhin eine eigene `.ddev/config.yaml` im Repo:

- eine Datenbank, weil die generierte Umgebung keinen Datenbank-Container hat
- zusätzliche Dienste wie Redis oder Elasticsearch
- andere Laufzeiten wie Python, Ruby oder Go, die das DDEV-Image nicht mitbringt

Repos, die statt DDEV eine eigene docker-compose-Datei mitbringen, kann Knecht weiterhin nicht booten.

::callout{icon="i-lucide-arrow-right" color="neutral"}
Fälle, in denen ein Projekt auf Knecht anders läuft als lokal, sammeln wir mit dem Fix je Framework in den Docs unter [Troubleshooting](/docs/resources/troubleshooting).
::
