---
title: A light container until the preview is needed
date: 2026-11-14
tag: Engine
description: Not every workflow needs a booted website. Since version 0.16, a session starts in a light container and boots DDEV only when a workflow really needs the preview.
---

Until now, Knecht started the full Preview for every [session](/updates/sessions-and-mentions), that is the checkout, environment and agent conversation of a ticket. Since [version 0.16](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.16.0), a session starts in a light container and boots the preview only when a workflow asks for it.

## The problem

A workflow that summarizes a ticket only reads files. Still, Knecht started the dev environment with a database import and a preview. This cost time and RAM.

There was also a bug. When a step found no running environment, Knecht ran a plain `ddev start` without the project's boot commands. `npm ci` never ran, and later steps saw a half-booted environment.

## Two tiers per session

### Code session

Every session starts as a code session. Steps and follow-ups (chat messages to the agent) run in the **workspace**. This is a container based on the DDEV web image, with the checkout, Composer, npm and Git, but without database and preview. It starts in about one second. Mounts, limits and environment variables from the project settings apply as in DDEV, and "Terminal" and "Open in IDE" work here too.

### Preview session

The action "Boot project" starts DDEV with database, boot commands, dev server and preview. After that, the session stays a preview session, so later steps can rely on the database. Only this action boots an environment now, so the bug above is gone too.

| | Code session | Preview session |
|---|---|---|
| Container | one workspace | DDEV stack with web container and database |
| Start | about one second | about 10 seconds, plus the boot commands |
| RAM when idle | about 1 MB | ~180 MB |
| Database | none | from the project dump |
| Preview and dev server | no | yes |
| PHP and Node | 8.4 and 24 from the image | versions of the project |

Measured in November 2026 with a small PHP project. With `composer install` and `npm install` as boot commands, the preview took 25 seconds to be ready.

### One shared lifecycle

Both tiers are stopped when unused and archived later. A restore brings the session back in its tier, a preview session with its archived database.

::note
If a follow-up or the terminal starts while the environment is stopping, booting or being restored, it stops with "The environment is ..." instead of getting in its way.
::

## What changes for workflows

Check three cases:

- A workflow that uses the database or the dev server without "Boot project" now needs this action.
- The workspace has PHP 8.4 and Node 24 from the image. If a step needs the project's version, it belongs after "Boot project".
- bun is missing in the workspace.

::note
Version 0.16 needs Docker 28. Knecht joins the network of every session. With older versions, this could take over the default route of the dashboard, and connections broke whenever an environment started or stopped. Docker 28 has a [priority per network](https://docs.docker.com/reference/cli/docker/network/connect/). The install script checks the version.
::
