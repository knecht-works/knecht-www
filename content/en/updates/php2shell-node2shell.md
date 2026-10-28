---
title: PHP2Shell, Node2Shell and Knecht
date: 2026-10-28
tag: Security
description: What the PHP2Shell and Node2Shell vulnerabilities mean for Knecht, where an attacker could reach them, and how version 0.14 patches PHP and Node.
---

On October 21, 2026, two critical vulnerabilities became public, one in PHP and one in Node.js. Both can lead to remote code execution. Knecht uses both languages: PHP runs in the DDEV environment of every run, and Node powers the dashboard itself. This post explains what that means for your instance and what [version 0.14](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.14.0) changes.

## PHP2Shell

PHP2Shell is the name for two vulnerabilities in PHP: [CVE-2026-109618 and CVE-2026-109619](https://sansec.io/research/php2shell). A single crafted request is enough for remote code execution, without a login and with a stock `php.ini`. Every PHP version before 8.5.12, 8.4.27, 8.3.36 and 8.2.35 is affected.

The attack needs one thing: a request that reaches PHP. In Knecht, PHP runs only in the web container of a run, and that container is not reachable from the internet. The only way in is the preview of the run, and every preview sits behind the dashboard login.

## Node2Shell

[Node2Shell (CVE-2026-111497)](https://www.aikido.dev/blog/node2shell-nodejs-brotli-rce-cve-2026-111497) is a bug in [Brotli](https://github.com/google/brotli), a compression library that ships with Node.js. Crafted Brotli data can lead to remote code execution when Node decompresses it. It is fixed in Node 22.23.4, 24.22.1 and 26.12.1. This only matters when Node decompresses data from an attacker. The dashboard never decompresses requests from the internet, not even for the login or webhooks.

But there is one path from the inside. Some steps, such as the link check, load pages from the preview of a run, and Node decompresses the responses automatically. Malicious code in the run container could use this to send crafted data to the dashboard. 

Examples are an agent hijacked through [prompt injection](https://simonwillison.net/series/prompt-injection/) or a malicious dependency. For the HTTP step, a compromised server is enough. 

## What You Need to Do

Update Knecht to version 0.14 or later via the dashboard update utility. Managed beta instances are updated by us.

After the update:

- Restart running environments so they get the patched PHP version. The first start takes a few minutes while Knecht pulls the new DDEV images.
- If the DDEV config of a project pins an unpatched Node version in `nodejs_version`, such as `24.22.0`, change it in this project.
- Update PHP and Node on the production and staging servers of your projects too. Knecht cannot do that for you.

## What Version 0.14 Changes

- The dashboard runs on Node 24.22.1. This closes the path from the run container to the dashboard.
- DDEV is updated to [1.25.5](https://github.com/ddev/ddev/releases/tag/v1.25.5). It ships PHP 8.2 to 8.5 in the fixed versions and rebuilt, patched packages for PHP 5.6 to 8.1.
- `session.upload_progress.enabled` is set to `0` in every PHP version. This is the [interim mitigation](https://www.sophos.com/en-us/security-advisories/sophos-sa-20261021-php2shell) the PHP project recommends.
