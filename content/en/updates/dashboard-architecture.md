---
title: From a Shared Docker Daemon to One Sandbox per Run
date: 2026-07-01
tag: Architecture
description: Knecht can boot real DDEV projects from inside a container. What the test showed, and why each run will get its own sandbox.
---

::note
This post is a look under the hood. The container architecture is the base that makes parallel previews with DDEV projects possible. It is not the product itself. The [home page](/) and [What Knecht does](/updates/was-macht-knecht) explain what Knecht does and who it is for.

Update, July 2026: We built the Sysbox sandbox, and it worked. Still, we removed it again. The follow-up post [Back to the shared daemon](/updates/sandbox-rollback) explains why. The path to the decision below is still worth a read, because the follow-up post builds on it.
::

Knecht itself runs as a Docker container, but it must boot DDEV projects, which also consist of containers. The most risky assumption in the full architecture was that this works at all. Thus we tested this assumption first, before we wrote the real code.

## The approach

Some background first. Docker consists of two parts. The [Docker daemon](https://docs.docker.com/get-started/docker-overview/#docker-architecture) is the service that really creates and manages containers. The Docker CLI is only a client that talks to the daemon through a Unix socket (`/var/run/docker.sock`). If you have the socket, you control the daemon.

Knecht uses exactly this. The container does not start its own daemon. It mounts the socket of the host and thus controls the host daemon. This pattern is called [Docker-out-of-Docker](https://www.avonture.be/blog/docker-out-of-docker-dood/) (DooD). The DDEV containers then run as siblings next to the Knecht container on the host, not nested inside it. [Coolify](https://coolify.io) and many CI runners work in the same way.

## The test

::steps{level="3"}

### The host daemon is reachable

`docker ps` in the container shows the host containers. The socket mount works.

### A DDEV project boots

We put a minimal PHP project at a fixed path and ran `ddev start`. DDEV started the web server and the database on the host.

### Containers are host siblings

On the host, the project containers appear as normal neighbors of the Knecht container.

### The app is reachable

The booted project responds. One detail is important here. `*.ddev.site` always resolves through DNS to `127.0.0.1`, which is the container itself. Thus the preview proxy must contact the web container directly through the Docker network.

::

This proves the base. A process in the Knecht container can boot real DDEV stacks, with the source code correctly mounted.

## Two problems remained

But the test also showed the limits of the approach.

### No isolation between runs

Everything runs on one shared daemon. But Knecht must run many previews in parallel, without conflicts between runs. We even had to remove the [DDEV router](https://docs.ddev.com/en/stable/users/usage/architecture/). The router is the reverse proxy that DDEV puts in front of all projects and that binds ports 80 and 443 on the host. Fixed host ports exist only one time, and many parallel projects then collide. Without the router, Knecht must change the `.ddev/config.yaml` and, for example, overwrite the URLs.

### Foreign code at the host socket

The agent executes code, and we do not fully control what it does. An attacker can hijack an agent through [prompt injection](https://simonwillison.net/series/prompt-injection/), for example with manipulated content in the repo or in a data source. Then the agent no longer does what we want. An attacker who reaches the host socket at this point controls the daemon. And who controls the daemon can start any container with any mount. In effect, this is root on the server.

## The solution: one sandbox per run

Both problems have the same answer. Each run gets its own Docker daemon in its own sandbox. With this, the reason to remove the router also disappears. Port 80 in sandbox A cannot collide with sandbox B, because each sandbox has its own network namespace. Thus projects run again with all their URLs and settings.

The open question is what the sandbox is. We examined the usual candidates.

### Privileged Docker-in-Docker

This is a second daemon in a container with [`--privileged`](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities). The flag turns off almost all protection mechanisms and gives the container access to the host devices. A malicious dependency then reaches the host without an exploit. Not an option.

### Kata Containers

[Kata](https://katacontainers.io) starts each container in a lightweight VM with its own kernel. This is the strongest boundary and the approach behind [Firecracker](https://firecracker-microvm.github.io), on which, for example, AWS Lambda runs. But Kata needs `/dev/kvm`, and normal cloud VPS providers offer [no nested virtualization](https://lowendtalk.com/discussion/154261/searching-vps-for-nested-virtualization). This would force bare metal and conflicts with the goal to install Knecht on a normal VPS. Not an option.

### gVisor

[gVisor](https://gvisor.dev) intercepts syscalls in a userspace kernel and needs no KVM. It isolates application processes well, but it has problems as a Docker host itself. [It supports iptables only in part](https://github.com/google/gvisor/issues/9917), and [overlayfs breaks with Docker v29](https://github.com/google/gvisor/issues/12475). But a Docker host is exactly what DDEV needs. Not an option.

### Our choice: Sysbox

[Sysbox](https://github.com/nestybox/sysbox) is a container runtime that permits Docker-in-Docker without `--privileged`. For this, it uses [user namespaces](https://man7.org/linux/man-pages/man7/user_namespaces.7.html). Root in the container is mapped to an unprivileged user on the host. Sysbox was built exactly for this case, needs no KVM, and thus runs on every normal Linux server.

## The threat model decides

In the end, the decision does not come from the runtime but from the threat model. The threat model asks who attacks and what the attacker can reach. Knecht is [single-tenant](https://www.geeksforgeeks.org/system-design/single-tenant-vs-multi-tenant-architecture/), one agency, its projects, its server. The VM boundary of Kata mostly protects against a customer who breaks out of one environment into the environment of another customer. This case does not exist here.

## What comes next

Next, we build the Sysbox sandbox per run (own daemon, DDEV with router) and a central ingress with an auth gate that routes preview URLs into the correct sandbox. The next milestone is DDEV with the router in a Sysbox sandbox on a real Linux host, reachable from the ingress.

Perhaps there will also be a first showcase of the prototype.
