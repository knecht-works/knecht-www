---
title: GitHub Auth Evolution
date: 2026-07-06
tag: Security
description: A deep dive into the GitHub connection of Knecht. Why an OAuth token is not enough, what a GitHub App does differently, and why we had to build the access control ourselves in the end.
---

The GitHub login worked from day one. Still, we rebuilt it three times.

The reason is that "connect with GitHub" hides three separate questions, and people often mix them. Who sits in front of the dashboard? With what does the server clone repos and open PRs? And who is permitted to use this instance at all? At the start, we answered all three with a single token. This post shows the path from there to the current state, together with the GitHub quirks that we found on the way.

## What an OAuth App is

An OAuth App is the classic "Sign in with GitHub" button. The app sends the user to GitHub. The user confirms the access there and comes back with an access token. The [scopes](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps) that the app requests define what this token can do. `read:user` means that the app can only read the profile. `repo` means full read and write access to **all** repos that the user can reach.

And exactly there our problem started.

## Stage 1: one token for everything

The first version of Knecht was an OAuth App with the `repo` scope. The token that confirmed the login was also the credential for all Git operations. There was no second secret and no setup. This was practical, but wrong in two ways:

- **The scope is too wide.** A `repo` token can do everything that the user can do, in each of the user's repos, not only in the projects that Knecht maintains. OAuth scopes cannot be more precise than this.
- **The credential belongs to one person.** If the user rotates the token or leaves the agency, the server loses access to all repos. Server infrastructure that depends on the account of one employee is a time bomb.

## What a GitHub App does differently

For stage 2, we moved the repo access to a **GitHub App**. The [difference to an OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps) is fundamental:

- A GitHub App is a **separate actor** with its own identity, not a user who lends personal permissions.
- You **install** it on selected repos. The access is limited to exactly these repos.
- It authenticates with its **private key** and creates [installation tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app) from it. Each token is valid for about one hour and scoped to the installed repos. When one token expires, the app simply creates the next one.

The login stayed OAuth, but with a smaller scope, `read:user`. Knecht uses the token one time to load the profile and then discards it. It never stores the token. With this, identity and repo access were cleanly separated.

But the setup was painful. The operator had to create an OAuth App **and** a GitHub App by hand, copy four secrets into the `.env`, encode the private key as base64, and enter callback URLs. All this before anything worked.

## Stage 3: the Manifest Flow

Then we noticed that a GitHub App already contains its own OAuth client. Thus a single app can do both, login and repo access. The separate OAuth App was unnecessary.

And for exactly this case, GitHub has the [App Manifest Flow](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest). A program describes the desired app as JSON (name, callback URLs, permissions) and sends it to GitHub. GitHub creates the app and returns **all** credentials.

In Knecht, this works as follows. At the first start, the dashboard shows a button. One click, GitHub creates the app, and Knecht stores the credentials encrypted in its own database. The cipher is AES-256-GCM, and [HKDF](https://datatracker.ietf.org/doc/html/rfc5869) derives the key from the session password, which must be set in any case. Thus the encryption costs no new env variable.

Exactly two things remain for the operator to supply: the session password and the base URL.

There is one trade-off. If you rotate the session password, the stored credentials become unreadable. The solution then is not to decrypt them but to run through the setup one more time.

## Stage 4: who gets access

One hole stayed open until the end. The login checked **identity** but not **permission**. Each GitHub account that completed the OAuth flow got a session.

Whether an attacker can use this depends on a GitHub quirk that you must understand one time. An app is either [private or public](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/making-a-github-app-public-or-private):

- A **private** GitHub App shows the authorize page only to its owner (or to members of the owner org). All others see a 404. This looks like built-in access control, but it makes it impossible to invite external team members. They do not even reach the consent page.
- A **public** app lets each GitHub user through the identity flow. Only this makes it possible to onboard any team member. But then GitHub gates nothing at all.

::callout{icon="i-lucide-lightbulb" color="primary"}
  The visibility of a GitHub App is not access control. Private locks out the wrong people, and public lets everybody in. If you want to decide who can log in, you must do it yourself.
::

Thus the app of Knecht is public, and Knecht itself holds the permission with an **allowlist**. This is a simple members table with GitHub logins. During the setup, Knecht automatically adds the creator as the owner. You invite all other members through the settings. After the GitHub login, Knecht rejects each person who is not on the list.

"Public" only means that strangers could install the app on their own repos. This is harmless, because Knecht only uses installations that it knows.

One more detail, because people often miss it. A session is typically a cookie that stays valid until it expires. If you check only at login, removed members stay in the system for days. [OWASP calls this a lack of server-side invalidation](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Thus Knecht checks the membership again at **each** request. When someone is removed, that person is out at the next click.

## What is still open

Roles. At the moment, each member has full access, and this includes invitations. For the small teams that Knecht is built for now, this is enough. Finer permissions will come when teams need real roles.
