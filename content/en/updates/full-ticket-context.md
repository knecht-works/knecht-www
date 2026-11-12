---
title: Knecht reads the whole ticket
date: 2026-11-13
tag: Engine
description: Since version 0.17, the agent gets every ticket in full, with all comments, attachments and linked tickets. It answers in the right thread, and the project rules apply in every step.
---

Until now, the agent got the description, status, labels and the newest comments of a ticket. It did not see screenshots, attachments or linked tickets. Since [version 0.17](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.17.0), Knecht reads the whole ticket, in Jira, Linear, Plane and GitHub.

## The whole ticket

Before every step and every chat message, Knecht puts the ticket into the session as files. The session is the working context of the ticket, with checkout, environment and agent conversation. It holds:

- a readable version with the description and all comments, with author and time
- the raw data with every field, in Jira also the custom fields with their names
- the attachments, including images pasted directly into the ticket

The agent is also able to fetch related tickets, for example a sub-issue or linked tickets. The same applies to them.

### Why files

If you have huge tickets, you probably don't want the agent to load the whole ticket into context every time. If you have files, you can let the AI agent decide how it wants to read the ticket and what information it needs.

::note{variant="info"}
There are two limits. Jira attachments over 20 MB are only listed. In private GitHub repos, pasted images arrive, but uploaded files such as PDFs do not. GitHub serves them only to a signed-in browser.
::

### Always current

All steps of a session share one conversation. So the agent relied on what it had read earlier and missed new comments. That is why Knecht loads the ticket again as soon as a [webhook](https://docs.github.com/en/webhooks/about-webhooks) reports a change, and otherwise after ten minutes at the latest. This also catches changes without a webhook, such as edited comments. If the webhooks of an integration do not arrive at all, Knecht reloads before every step. If loading fails, the old files stay, and the agent learns that they may be outdated.

## Answers in the thread

In Jira, Linear and Plane, Knecht answers a mention in the thread of the comment. The answer starts with a mention of the person who asked, so they get a notification. If you want a new comment instead, write that in the mention.

## One conversation per session

Until now, every AI action started a new conversation, and only the chat continued the last one. Now all AI actions and chat messages of a session run in the same conversation. Later actions know what earlier ones did, and the chat knows the whole workflow. If an action has a different model, Knecht switches it in the running conversation.

## Rules in every step

Knecht has [instructions](/docs/usage/agent#instructions) for the instance and for projects, for example "Move the Jira ticket to In Review once the PR is open". The agent often treated them as optional when the request did not mention them. That's why we updated some of the system prompts so that this works better.
