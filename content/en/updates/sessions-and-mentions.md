---
title: Knecht now replies on GitHub
date: 2026-08-17
tag: Engine
description: Every issue gets its own session with an environment and a conversation, the agent replies and labels directly in the thread, and a mention sends it back to work.
---

Until now, everything in Knecht flowed in one direction. A [trigger](/updates/workflow-engine) fired, a workflow ran, and the result sat in the dashboard. Anyone waiting for an answer in the GitHub issue saw nothing there. With this update, Knecht works where the work is reported. It replies and labels directly in the issue thread, and a mention in a comment sends it back to work.

## From bug report to PR

This is what it looks like on our Craft test project. Someone files an issue saying the site has no dark mode. A trigger starts the "Classify Issue" workflow. Knecht boots the site in its [preview environment](/updates/sandbox-rollback), reproduces the report, and finds out that dark mode was simply never implemented. It applies the existing `enhancement` label and answers the reporter in the thread.

![GitHub issue with a dark mode bug report, below it the knecht-works app has applied the enhancement label](/assets/issue-creation-with-label.png)

The reply contains the findings and a concrete plan for the implementation, with the preview URL at the end.

![Comment by the knecht-works app in the issue with findings and an implementation plan, below it a comment by the team member with a mention and an eyes reaction](/assets/issue-follow-up.png)

A team member reads the analysis and replies with a mention, roughly "@knecht-works, implement it and open a PR". Knecht confirms right away with an eyes reaction and continues working, in the same environment and the same conversation as the triage. So it already knows the findings and the plan. A few minutes later the answer is in the thread, with the opened PR and the preview URL.

![Reply by the knecht-works app in the issue with a summary of the two commits, at the end the preview URL and the PR link](/assets/issue-enhancement-finished.png)

The fix can build on the triage because of the biggest change in this update, sessions.

## One session per issue

Until now, every workflow execution was its own world, with its own checkout, its own environment, and its own agent conversation. While building the reply loop it became clear that this is the wrong unit, because the environment and the context belong to the issue, not to a single execution. So there are sessions now. A session belongs to exactly one issue or PR and holds its checkout, its environment, and one shared agent conversation. Inside it run the runs, that is, individual workflow executions, and follow-ups, that is, individual messages to the agent.

![Project page in the Knecht dashboard with the run list grouped by issues, under the dark mode issue four runs from the triage to two mentions](/assets/knecht-project-triggers-in-action.png)

The project page and the runs overview now group runs by session. In the screenshot, four runs belong to the dark mode issue, from "Classify Issue" to the two mentions, all in the same environment. In detail this means:

- If two triggers fire on the same issue, they run one after the other in the session, never in parallel.
- If the issue is closed, the session closes too. A reopen revives it, as long as its environment still exists.
- When archiving an environment, Knecht now also saves the agent's conversation, a few megabytes. It survives an archive and restore cycle.
- Events without an issue or PR, that is, push, schedule, and manual start, behave as before and get a session holding a single run.

If an environment is torn down completely, the conversation is gone. The agent then does not silently start from zero. It reads the GitHub thread, the results of the previous actions, and the [project memory](/updates/agent-memory), and says in the thread that it is starting fresh. Existing installations do not have to do anything for this, the update automatically converts existing runs and environments to sessions on startup.

## The Cloudflare example

Cloudflare showed in August 2026 that issue triage can be automated end to end, on the repository of the Astro framework. Their [triage system](https://blog.cloudflare.com/astro-issue-triage/) reproduces every report, diagnoses the cause, and builds the fix. The open issues dropped from over 200 to about 30 with it. It is its own piece of software though, built by a team at Cloudflare for exactly this repository. In Knecht, the same flow is a workflow that you put on your own projects, and the session brings the booted site with it.

## What is next

Next up is Jira. The concepts stay the same, a ticket gets its session with an environment and a conversation, and replies and mentions work in the ticket just like in the issue thread.
