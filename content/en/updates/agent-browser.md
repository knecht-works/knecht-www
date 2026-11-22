---
title: The Agent Sees the Preview
date: 2026-11-23
tag: Engine
description: Since version 0.22, the agent opens the preview of a session in a real browser, clicks through it and takes screenshots. It shows the screenshots right in the chat.
---

So far, the agent in a [session](/updates/sessions-rebuilt) only knew the website through its code and the HTML it could fetch with a request. That does not tell you whether the CSS loads, whether a button sits in the right place after the fix, or whether the console is full of JavaScript errors. Since [version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0), the agent therefore opens the preview in a browser and looks at it the way a person does.

## A Browser in the Session

If a session has a preview, Knecht builds a headless Chromium into the web container of its DDEV environment. Headless means the browser renders the page completely, just without a window. The agent controls it through [Playwright MCP](https://github.com/microsoft/playwright-mcp), an [MCP server](/updates/mcp-servers) by Microsoft that offers the features of [Playwright](https://playwright.dev/) as tools.

With it, the agent can:

- open pages and click through them, including filling in forms
- read the console and the network requests of the page
- take screenshots and look at them itself

We have instructed it to check visible changes this way before it reports them as done. If it changes the CSS of a header, it then opens the page, takes a screenshot and checks whether the header looks as intended.

## Screenshots in the Chat

![A reply of the agent in the chat with two screenshots of the start page side by side, desktop and mobile](/assets/knecht-agent-screenshots.png)

Every screenshot the agent takes appears as a small image below the tool call (in the screenshot above the agent took the screenshot earlier in the run). If the agent wants to show you something, it also embeds the screenshot large in its reply, at the point it is writing about. If two screenshots sit directly below each other, the chat shows them side by side, for example desktop and mobile.

The images are stored in the project folder of the session on the server, in a folder that Knecht excludes from Git. So the agent cannot commit them by accident. Knecht reads them directly from that folder, which is why they also load while the environment of the session is stopped.

## Screenshots in Tickets

When the agent writes a comment in Jira, Linear, Plane or GitHub, for example after a [mention](/updates/sessions-and-mentions), the comment can contain a screenshot too. But the image is stored in the sandbox, and the ticket system cannot reach it. At first, the comment therefore showed a broken image.

Now the screenshot in the comment becomes a link "Screenshot: ..." with the agent's description. The link opens the session in the dashboard and shows that screenshot right away. Whoever reads the comment needs a Knecht login for this.

### See Images in Tickets

It would be nicer if the screenshot showed directly in the comment. For that, Knecht has to upload the image to the ticket as an attachment, and every ticket system does this differently. Jira, Linear and Plane have their own APIs for it. GitHub has no public upload API for comments at all, so it needs a different approach. This will come in a later release.
