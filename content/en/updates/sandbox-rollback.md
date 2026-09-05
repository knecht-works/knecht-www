---
title: Back to the Shared Daemon, One Preview for 180 MB
date: 2026-07-26
tag: Architecture
description: The sandbox per run worked, and it used 3 GB of RAM per preview. This post explains why we removed it again and how we solve the old problems today.
---

::note
This post continues [From the shared Docker daemon to a sandbox per run](/updates/dashboard-architecture). That post explains why we selected a separate sandbox per run. This post explains why we removed it again.
::

The last architecture post ended with a clear plan. Each run gets its own [Sysbox](https://github.com/nestybox/sysbox) sandbox with its own [Docker daemon](https://docs.docker.com/get-started/docker-overview/#docker-architecture). We built it, and it worked. Still, we removed the sandbox again, because two problems could wait no longer. We postponed both problems on purpose before.

## The cost

A Sysbox sandbox is basically a small operating system with [systemd](https://systemd.io), its own Docker daemon, and the complete [DDEV](https://ddev.com) stack on top. We knew from the start that this uses many resources. We thought we could control the cost later, but we could not.

- One active preview used about 3 GB of RAM in our measurements. With 20 parallel previews, that would be 60 GB, only for sandboxes.
- Each sandbox needs its own copy of all DDEV images, and that is 1-2 GB of disk per preview. A registry cache made the downloads faster, but it did not change the disk use.

The goal of Knecht is that an agency operates all its projects on one affordable server. An architecture with 3 GB per preview is the wrong base for this goal, no matter how clean its isolation is.

## What the sandbox solved

As a reminder, the last post gave two reasons for the sandbox.

- On the shared daemon, there was no isolation between runs. The fixed ports of the [DDEV router](https://docs.ddev.com/en/stable/users/usage/architecture/) collided. Therefore we had to remove the router and change the DDEV config.
- The agent executes external code, and a process that reaches the [Docker socket](https://docs.docker.com/engine/security/#docker-daemon-attack-surface) of the host controls the complete server.

The sandbox solved both problems at once. But it was the most thorough solution, not the only one. We could only remove it after we examined both problems again, one by one.

## The new solutions

### No socket in the run

The problem is the Docker socket. The agent executes external code. When the socket is in the environment of the agent, a hijacked agent controls the complete server. The sandbox therefore gave each run its own daemon, so the socket of the host stayed out of reach.

Our new solution starts earlier. The run gets no Docker access at all. Knecht starts DDEV on the host side. The agent and all project commands, for example `composer install`, run only in the web container of the project. An agent that an attacker hijacks with [prompt injection](https://simonwillison.net/series/prompt-injection/) then sits in a normal container with its own network and limited resources. It finds no socket and no daemon there.

### Rename instead of isolate

The port collisions came only from the router. The router is the reverse proxy that DDEV puts in front of all projects, and it binds ports 80 and 443 on the host. The router stays removed. Instead, the preview proxy connects to the web container of each run directly over the [Docker network](https://docs.docker.com/engine/network/).

The proxy must supply one thing, the hostname. Projects with multiple domains, for example a [Craft multisite](https://craftcms.com/docs/5.x/system/sites.html), select the site from the requested domain. But the preview runs under a Knecht URL, not under the real domain of the project. Therefore the proxy sends the real domain in the [Host header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Host). For the project, each request looks as if it came over the normal URL.

Parallel runs of the same project must not conflict with each other. Therefore Knecht registers each run as a separate DDEV project with a unique name. The change to the DDEV config, a minus point in the last post, remains, but the project does not see it. The code in the repo stays untouched. Knecht only rewrites the generated runtime config.

## The tradeoff

For security, this is a step back compared with Sysbox. Sysbox mapped root in the container to an unprivileged host user with [user namespaces](https://man7.org/linux/man-pages/man7/user_namespaces.7.html). Now the containers run again with [runc](https://github.com/opencontainers/runc), the normal Docker runtime, and the border to the host is thinner. The points above compensate for this, because the run has no socket, its own network, and fixed limits.

The [threat model](https://owasp.org/www-community/Threat_Modeling) decides if this step back is acceptable, as in the last post. Knecht runs at an agency, for its own projects, on its own server. The attacker that the sandbox would block in addition needs a kernel exploit. This attacker then lands on a server that only contains the projects of the agency. To pay 3 GB instead of 180 MB per preview for this risk is the wrong trade.

## The result

Both variants ran on the same dev machine, measured in July 2026:

|  | Sandbox per run (Sysbox) | DDEV on the host (today) |
|---|---|---|
| RAM per active preview | ~3 GB | ~180 MB |
| DDEV images | per sandbox, 1-2 GB extra | once per host |
| Wake a stopped preview | minutes, a complete sandbox boot | seconds |
| Docker access in the run | own daemon in the sandbox | none, Knecht controls from outside |
| Isolation border | own daemon plus user namespaces | own network, limits, no socket |

Two smaller optimizations come on top.

- The database of a preview runs with a leaner configuration. The MySQL config that DDEV supplies permits about 1 GB of [buffer](https://mariadb.com/kb/en/innodb-buffer-pool/) for each database.
- A stopped preview uses 0 RAM. Only the database volume and the code remain.

Before, one server could hold a few previews. Now it can hold almost all projects of an agency at the same time.

## What we learned

The last post started with the sentence that we test the riskiest assumption first. That was correct, and it worked, the sandbox ran. But the correct last question is not if the system runs. The correct question is if it runs at a cost that matches the goal. You can only answer this question when the system is under real, parallel load. We now make this measurement earlier.
