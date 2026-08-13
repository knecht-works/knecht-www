---
title: Beta Testers Wanted
date: 2026-06-08
tag: Beta
description: Knecht is ready for real projects. We search for a few agencies that use it first and help to shape it.
---

Knecht runs. Now it needs what no local test can give: real projects, real bugs, and honest feedback. Thus we search for a small number of agencies that want to use Knecht first.

::note
**For new readers:** Knecht is a dashboard on your own server. It boots your DDEV projects as complete environments, does tasks in them through workflows, and delivers finished pull requests with a preview. You can find more on the [home page](/) and in [What Knecht does](/updates/was-macht-knecht).
::

## What Knecht does in practice

Here is an example from daily agency work. A security patch appears for a Craft CMS project. To install it, the database must run. After the `composer update`, migrations run and write files, and these files must go into the commit. Dependabot cannot do this, because it has no booted project. Knecht can:

1. The patch appears, and a trigger starts your update workflow.
2. Knecht boots the project with DDEV, together with the database.
3. `composer update` runs in the real project. Migrations run, and tests run.
4. You get a pull request with a preview link. Examine it, merge it, done.

You build this workflow one time. Then it runs for each of your projects, for each patch.

## Who we search for

Knecht is most useful where a team must maintain many projects. This is the ideal profile:

- **You work with DDEV.** Your projects already have a DDEV configuration, or you can convert them with little effort.
- **You maintain many projects.** Security updates and bug fixes are recurrent work for you, not a rare event.
- **You have a responsible person.** This person tries Knecht and tells us regularly what works and what does not.

If this describes your team, you are a good match.

## Our offer

::note
We set up Knecht for you and pay **100 € of OpenCode credit**, so that the AI agents can start immediately. Also, the first year after the release will be free for you. And we will put your logo with a link on the home page, where everybody can see it.
::

Thus you do not fight through the setup, and you take no financial risk. You get a functional Knecht on your own server, configured for your projects, plus the credit to really use it.

## What we ask for

In return, we need honest feedback. Tell us what helps you in your daily work, where Knecht blocks you, and what you miss. This feedback from real agency projects is worth more to us than any test.

## More than a test: shape the product

This is the chance to develop Knecht with us at an early stage. Your feedback goes directly into the roadmap. You do not only see where the product goes. You also set the direction, before many decisions become fixed.

## Contact us

Send a short message to [hallo@knecht.works](mailto:hallo@knecht.works). Tell us about your agency and your projects. Then we will find out together if it is a match.

## Tell others

Perhaps you know an agency that is a good match. Then describe Knecht like this:

> Knecht is a self-hosted dashboard for agencies with many DDEV projects. It boots each project as a functional environment, does tasks in it through workflows, and delivers finished pull requests with a preview. Beta testers wanted: https://knecht.works/updates/beta-tester

This is the full idea in three sentences, and that is all you need to share it.
