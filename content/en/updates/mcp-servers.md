---
title: MCP Servers for the Agent
date: 2026-11-21
tag: Engine
description: Since version 0.22, the agent can use tools from MCP servers, for example Sentry or Notion. You set them up once for all projects or per project and connect them with a token or OAuth.
---

So far, the agent in a [run](/updates/workflow-engine) sees the checkout, the environment and the ticket. But a lot of what a task needs lives somewhere else. The stack trace is in Sentry, the spec is in Notion, and the docs are those of the library the project uses. Since [version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0), the agent can use MCP servers for this.

::note{variant="info"}
[One interface for AI in the dashboard](/updates/ai-tools) was about the other direction. There, Knecht itself becomes an MCP server (in the future), so that tools like Claude Code can access runs and logs. This post is about MCP servers that the agent in Knecht uses.
::

## What MCP Is

The [Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro) is a standard that lets an application offer tools to an AI agent. Sentry, for example, offers tools that search issues or read a stack trace. The agent decides itself when to call a tool. If the ticket mentions a Sentry issue, it reads the stack trace before it writes the fix.

## Setting It Up

![The "MCP servers" list in the agent settings of a project, with a project server, a global server and the templates below them](/assets/knecht-mcp-servers.png)

The "MCP servers" list is in the agent settings. In the global agent settings, a server applies to all projects. In the agent settings of a project, it applies to that project only. If a project has a server with the same name as a global one, it replaces the global one in that project. A global server that a project does not need can be turned off there with the switch in its row.

Sentry, Context7, Notion and Cloudflare have templates that already know the URL and the sign-in. Any other remote server can be added with its URL through "Add custom server".

## Signing In

Most MCP servers need a sign-in. The simplest way is OAuth. Clicking "Connect" opens the vendor's sign-in in the browser, the same way you would sign in to any other app with your Sentry or Notion account. Knecht registers itself with the server, so you do not have to create an app at the vendor first.

The agent then works with the rights of the account that connected the server. That is why the row shows who connected it and when. Knecht renews the access before it expires. If that fails, for example because someone revoked the access at the vendor, the row shows the reason and a "Reconnect" button.

A server can also be connected with a token or API key from the vendor, or with custom headers. Knecht stores all of these encrypted, and the dashboard only shows a preview after saving. What each sign-in needs is on the docs page for [MCP servers](/docs/usage/mcp-servers).

## When a Server Fails

An MCP server is an external service, and it can go down. That is why Knecht checks every server before each AI step. If one does not answer or its sign-in has expired, Knecht leaves it out of that step and writes a notice into the transcript of the run. The run continues without the tools of that server instead of failing.
