---
title: GitHub Auth Evolution
date: 2026-07-06
tag: Security
description: Ein Deep Dive in Knechts GitHub-Anbindung. Warum ein OAuth-Token nicht reicht, was eine GitHub App anders macht und wieso wir die Zugriffskontrolle am Ende selbst bauen mussten.
---

Der GitHub-Login funktionierte vom ersten Tag an. Trotzdem haben wir ihn dreimal umgebaut.

Der Grund: Hinter "mit GitHub verbinden" stecken drei getrennte Fragen, die gerne vermischt werden. Wer sitzt vor dem Dashboard? Womit klont der Server Repos und öffnet PRs? Und wer darf diese Instanz überhaupt benutzen? Am Anfang haben wir alle drei mit einem einzigen Token beantwortet. Hier der Weg von dort bis zum heutigen Stand, inklusive der GitHub-Eigenheiten, über die wir dabei gestolpert sind.

## Was ist eigentlich eine OAuth App?

Eine OAuth App ist der klassische "Sign in with GitHub"-Button. Der User wird zu GitHub geschickt, bestätigt dort den Zugriff und kommt mit einem Access Token zurück. Was dieser Token darf, bestimmen die [Scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps), die die App anfragt. `read:user` heißt: nur das Profil lesen. `repo` heißt: voller Lese- und Schreibzugriff auf **alle** Repos, die der User erreichen kann.

Und genau da fing unser Problem an.

## Stufe 1: Ein Token für alles

Die erste Version von Knecht war eine OAuth App mit `repo`-Scope. Der Token, der den Login bestätigt hat, war gleichzeitig das Credential für alle Git-Operationen. Kein zweites Secret, nichts einzurichten. Praktisch, aber zweifach falsch:

- **Der Scope ist zu grob.** Ein `repo`-Token kann alles, was der User kann. In jedem seiner Repos, nicht nur in den Projekten, die Knecht betreut. Feiner geht es bei OAuth-Scopes nicht.
- **Das Credential hängt an einer Person.** Rotiert der User seinen Token oder verlässt die Agentur, kommt der Server an kein Repo mehr. Server-Infrastruktur, die auf dem Account eines Mitarbeiters steht, ist eine tickende Uhr.

## Was eine GitHub App anders macht

Für Stufe 2 haben wir den Repo-Zugriff auf eine **GitHub App** umgestellt. Der [Unterschied zur OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps) ist grundlegend:

- Eine GitHub App ist ein **eigener Akteur** mit eigener Identität, nicht ein User, der seine Rechte verleiht.
- Sie wird auf ausgewählten Repos **installiert**. Der Zugriff ist auf genau diese Repos begrenzt.
- Sie authentifiziert sich mit ihrem **Private Key** und erzeugt daraus [Installation Tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app): gültig für etwa eine Stunde, gescoped auf die installierten Repos. Läuft einer ab, wird einfach der nächste erzeugt.

Der Login blieb OAuth, aber mit geschrumpftem Scope: `read:user`. Der Token wird einmal benutzt, um das Profil zu laden, und danach verworfen. Er wird nie gespeichert. Identität und Repo-Zugriff waren damit sauber getrennt.

Nur das Setup war eine Zumutung. Der Betreiber musste eine OAuth App **und** eine GitHub App von Hand anlegen, vier Secrets in die `.env` kopieren, den Private Key base64-encoden und Callback-URLs eintragen. Bevor irgendetwas lief.

## Stufe 3: Der Manifest Flow

Dann fiel uns auf: Eine GitHub App bringt ihren eigenen OAuth-Client schon mit. Eine einzige App kann also beides, Login und Repo-Zugriff. Die separate OAuth App war überflüssig.

Und GitHub hat für genau diesen Fall den [App Manifest Flow](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest): Eine Software beschreibt die gewünschte App als JSON (Name, Callback-URLs, Permissions), schickt das an GitHub, GitHub legt die App an und gibt **alle** Credentials zurück.

Bei Knecht sieht das so aus: Beim ersten Start zeigt das Dashboard einen Button. Ein Klick, GitHub erstellt die App, Knecht speichert die Credentials verschlüsselt in der eigenen Datenbank. AES-256-GCM, der Schlüssel wird per [HKDF](https://datatracker.ietf.org/doc/html/rfc5869) aus dem Session-Passwort abgeleitet, das ohnehin gesetzt sein muss. Die Verschlüsselung kostet also keine neue Env-Variable.

Übrig bleiben genau zwei Dinge, die der Betreiber liefert: das Session-Passwort und die Base URL.

Ein Trade-off gehört dazu: Wer das Session-Passwort rotiert, macht die gespeicherten Credentials unlesbar. Die Lösung ist dann nicht Entschlüsseln, sondern das Setup einmal neu durchlaufen.

## Stufe 4: Wer darf überhaupt rein?

Ein Loch blieb bis zuletzt offen: Der Login prüfte **Identität**, aber keine **Erlaubnis**. Jeder GitHub-Account, der den OAuth-Flow abschließt, bekam eine Session.

Ob das ausnutzbar ist, hängt an einer GitHub-Eigenheit, die man einmal verstanden haben muss. Eine App ist entweder [privat oder öffentlich](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/making-a-github-app-public-or-private):

- Eine **private** GitHub App zeigt die Authorize-Seite nur ihrem Besitzer (oder Mitgliedern der besitzenden Org). Alle anderen sehen einen 404. Das wirkt wie eingebaute Zugriffskontrolle, macht aber das Einladen externer Teammitglieder unmöglich. Sie kommen nicht einmal bis zur Zustimmungsseite.
- Eine **öffentliche** App lässt jeden GitHub-User durch den Identity-Flow. Nur so lassen sich beliebige Teammitglieder onboarden. Dafür gated GitHub dann gar nichts mehr.

::callout{icon="i-lucide-lightbulb" color="primary"}
  Die Sichtbarkeit einer GitHub App ist keine Zugriffskontrolle. Privat sperrt die Falschen aus, öffentlich lässt alle rein. Wer entscheiden will, wer sich einloggen darf, muss das selbst tun.
::

Also ist Knechts App öffentlich, und die Erlaubnis liegt bei Knecht selbst: eine **Allowlist**. Eine simple Members-Tabelle mit GitHub-Logins. Beim Setup wird der Ersteller automatisch als Owner eingetragen, alle weiteren werden über die Settings eingeladen. Wer nicht auf der Liste steht, wird nach dem GitHub-Login abgewiesen.

"Öffentlich" heißt übrigens nur, dass Fremde die App auf ihren eigenen Repos installieren könnten. Das ist harmlos: Knecht benutzt ausschließlich Installationen, von denen er weiß.

Ein Detail noch, weil es oft übersehen wird: Eine Session ist typischerweise ein Cookie, das bis zu seinem Ablauf gültig bleibt. Wer nur beim Login prüft, hat entfernte Mitglieder also noch tagelang im System, die [OWASP nennt das fehlende serverseitige Invalidierung](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Knecht prüft die Mitgliedschaft deshalb bei **jedem** Request neu. Wird jemand entfernt, ist er beim nächsten Klick draußen.

## Was noch fehlt

Rollen. Aktuell hat jedes Mitglied vollen Zugriff, inklusive Einladen. Für die kleinen Teams, für die Knecht gerade gebaut wird, reicht das. Feinere Rechte kommen, wenn echte Rollen gebraucht werden.
