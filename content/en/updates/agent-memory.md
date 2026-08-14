---
title: The agent gets a memory per project
date: 2026-08-14
tag: Engine
description: Until now the agent explored the project again in every run. Now Knecht remembers per project what the agent has learned.
---

The [AI action](/updates/workflow-engine) starts a fresh [sandbox](/updates/sandbox-rollback) for every run, with its own checkout of the project. Until now the agent knew nothing about earlier runs. What it had found out about a project was gone afterwards, and the next run had to explore it again. Now Knecht keeps notes per project. The agent writes them itself and finds them again in the next run.

## Every run started at zero

In August 2026 we looked at where slow runs lose their time. A large part was rediscovery. A one-line change to a `font-weight` took 280 seconds on a project that already had dozens of runs behind it. Around 160 of those seconds went to a subagent finding out where the styles live and how the project is built, facts that earlier runs already knew.

[opencode](https://opencode.ai), the agent behind the AI action, only knows static [rules files](https://opencode.ai/docs/rules/) like an `AGENTS.md` in the repository. A human writes that file by hand, the agent does not add anything to it. There are community plugins for learned memory, but they do not fit Knecht.

- Everything a plugin writes to disk lands in the throwaway checkout of the run and is gone afterwards. Knecht would have to build the persistence outside the run anyway.
- The best-known plugin, [opencode-mem](https://github.com/tickernelz/opencode-mem), only saves its memories when the session has been quiet for a while. That is the pause in which a human in a chat is not typing. But Knecht starts opencode [non-interactively](https://opencode.ai/docs/cli/), and that process exits right after its answer. The pause never comes, so the plugin would never save.

So we built this directly into Knecht, as a small store per project on the host, outside every sandbox.

## An index and topic files

The memory consists of an index file `MEMORY.md` and any number of topic files. After a few runs on a [Craft](https://craftcms.com) project it can look like this:

::code-tree{defaultValue="MEMORY.md"}

```md [MEMORY.md]
- Styles: Tailwind, tokens, build step, see styles.md
- Build and tests: commands and pitfalls, see build.md
```

```md [styles.md]
Tailwind 4, tokens live in src/css/config.css.
Font sizes and weights only via text-* utilities, no raw values.
After CSS changes run `ddev npm run build`,
templates load the built file from web/dist/.
```

```md [build.md]
Build: `ddev npm run build`
Tests: `ddev php vendor/bin/phpunit`
The build needs DDEV running, plain npm on the host
fails on the node version.
```

::

The index holds one line per topic and is merged into the instructions on every agent call, so it is always in context. To keep that cheap, it has a hard limit of 2 KB. The agent only reads a topic file when the index points at something relevant. Until then the topic files cost no context. The pattern comes from Claude Code, whose [auto-memory](https://code.claude.com/docs/en/memory) is built the same way.

The agent maintains the memory itself, following rules in the `AGENTS.md` that Knecht puts into every sandbox. It should rewrite notes instead of appending, delete outdated notes, and record corrections that come in through the follow-up chat on the run page. If you write "no, we do not use utility classes" there once, you should not have to write it a second time. And the agent should briefly check its own notes before building on them, because the project can have changed since the last run.

## Copy instead of mount

Before every agent call Knecht copies the notes into the checkout of the run. After the call it copies them back to the host. The copy back also happens for failed steps, because the notes hold facts about the project, not a run status.

A mount into the sandbox would have been simpler. But with the copy, every run works only on its own state, and Knecht has one place during the copy back where it can check what the agent wrote.

- Only plain Markdown files at the top level are accepted, no [symlinks](https://man7.org/linux/man-pages/man7/symlink.7.html), no subfolders, no hidden files.
- The index may be at most 2 KB, all files together at most 64 KB. If the copy is larger, Knecht does not accept it at all. The last valid state stays, and one line about it appears in the run log.

Knecht discards oversized copies instead of trimming them, because the agent would not notice a trim and would then keep working with incomplete notes. With the old state it can clean up itself in the next run. The rules for that are in the `AGENTS.md`. Knecht still checks the limits itself, so the context does not grow when the model ignores the rules.

## What is still missing

There is no view in the project settings yet that shows what Knecht has remembered. You would want to read the notes there and also correct them. It is also open whether Knecht should at some point summarize an oversized copy instead of discarding it. That is only worth building if discards turn out to be frequent in practice.
