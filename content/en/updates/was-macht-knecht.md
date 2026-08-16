---
title: What Knecht Does
date: 2026-05-15
tag: Project
description: About the idea, the motivation, and how Knecht helps.
---

A bug report always starts with an attempt to reproduce the error. After the fix, you must make sure that the error is really gone. This sounds simple, but often it is not.

## Motivation

Agencies often maintain many projects. These projects often have different configurations, or they run only on the computer of the one employee who was there from the start. Still, all projects need regular security updates and bug fixes.

AI agents can only really help here when the projects boot completely.

### Security Updates

To install a security update in a CMS, the database must run in almost all cases. After an update, database migrations can follow. Thus Dependabot and other bots cannot just do a `composer update` and deploy the result.

### Bug fixes

Unfortunately, a bug fix is not always this simple.

::prompt{description="Pls fix!"}
https://youtu.be/dQw4w9WgXcQ?t=0
::

For a bug fix, an employee must first be available. In the best case, this employee already has the project on the local machine and can solve the error at the root. Often, no such employee is available.

## DDEV

DDEV is a development environment that is based on Docker. With DDEV, you can run a full project. You do not need to install developer tools directly on your device.

Each project boots in a reproducible and isolated way. The web server and the database start with a clean configuration, always in the same way. This reliability is the base for everything else. When a project always boots in the same way at the push of a button, a machine can also boot it.

## What Knecht does

We build Knecht as a dashboard that you host on your own server. Thus you keep your data. The dashboard shows preview links and screenshots (made with Penthouse). With them, you can verify a bug fix directly.

### How it works

Knecht has projects, workflows, and triggers.

::steps{level="3"}

### Projects

A project is always a GitHub repository in which DDEV is already configured. In the project, you can also set environment variables and the database.

### Workflows

A workflow is a predefined process that works with projects. One example is this sequence: boot the project → update the Composer packages → create a PR with the changes. Knecht does these steps in a deterministic order.

But bug fixes are rarely the same repeatable steps. For them, Knecht uses AI agents. Through Opencode, the agents can reproduce and repair a bug in the booted project.

### Triggers

A trigger is the start point of a workflow. Through webhooks, for example from Jira or GitHub, Knecht can start predefined workflows automatically. Knecht then delivers the results as a pull request.

::
