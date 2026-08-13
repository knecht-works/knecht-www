---
title: A terminal and VS Code for each run
date: 2026-07-27
tag: Dashboard
description: A terminal in the browser, a ready SSH command, and VS Code without a local setup. You can now open each run directly and continue the work.
---

A run is a single execution of a [workflow](/updates/workflow-engine) on a project, with its own environment on the server. Before, the dashboard was the only way to this environment. You could send instructions to the agent and view the preview, but you could not enter the environment yourself. To read a log or to test a command, you had to ask the agent. Now the run page has three direct ways in.

## The terminal

The most direct way into a run is a shell. It exists in two variants, in the browser for each dashboard member, and over SSH for people who already have access to the server. The video shows both.

::update-video{src="/assets/knecht-ssh-showcase.webm" caption="The terminal in the browser and the ready SSH command"}
::

### In the browser

A click on "Terminal" opens a shell in the container of the run. The shell opens as a window directly on the run page. You type in the same browser tab in which you view the run. You do not need a terminal program or an SSH client on your own computer.

- It works for each dashboard member, without any access to the server.
- The shell runs in the same container as the agent. Composer, npm, and Git are there, and they behave like in the real project.
- No additional port opens. The terminal uses the same HTTPS connection as the dashboard.
- If a run has multiple containers, for example its own database, the terminal shows one tab per service.

::note
Knecht stops the environment of a run automatically when nobody uses it for a while, so it does not use RAM. Work in the terminal counts as use. The environment stays on while you type in it.
::

### Over SSH

If you prefer your own terminal, the terminal window shows a ready SSH command that you can copy. Paste it on your own machine, and you land in exactly the same container.

```bash
ssh -t knecht@my-server.com docker exec -it -u 1000:1000 -w /var/www/html -e HOME=/home/node -e USER=node ddev-knecht-run-4-web bash -l
```

Knecht does not operate its own SSH server, and it does not manage keys. The command uses the SSH access to the server that already exists. You store the SSH address of the server once in the settings, nothing more. This way is therefore only for people who already have access to the server. All others use the web terminal.

## VS Code in the browser

VS Code runs directly in the run. A click on "Open in VS Code" on the run page opens the IDE in a new browser tab. The base is [openvscode-server](https://github.com/gitpod-io/openvscode-server), the open source build of VS Code for the browser.

::update-video{src="/assets/knecht-vs-code.webm" caption="VS Code opens the run in the browser"}
::

The IDE works directly on the project in the run, not on a copy. A saved change is immediately in the active project. It is the same code that the preview and the agent see. And because each run is a full Git clone, commits and branches work normally in the IDE and in the terminal.

You do not need a local setup. The IDE runs in the browser for each dashboard member. Like the previews, you can only reach it with a Knecht login.
