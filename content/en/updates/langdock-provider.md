---
title: Langdock as an AI Provider
date: 2026-08-18
tag: Engine
description: The agent now also runs through Langdock. One API key covers GPT and Claude models, and every request stays in the EU or in the US.
---

The agent in the [AI action](/updates/workflow-engine) is [opencode](https://opencode.ai). Until now it ran through the providers of OpenCode itself, Zen or Go, with a key from the OpenCode console. Now we have added Langdock as a provider, a European alternative. Here too, one API key covers the models of several vendors, but every request of the agent stays in the selected region.

## What Langdock is

[Langdock](https://langdock.com) is an AI gateway for European companies. It sits in front of several model vendors, among them OpenAI, Anthropic, Google, Meta, and Mistral. The team signs one contract and gets one API key. Behind that key, the models of all vendors are available.

The second reason for such a gateway is data residency. That is the guarantee that every request is processed in a fixed region, EU or US. This affects the agent directly, because its prompts contain code and data from the client project. Many client contracts require that such data does not leave the EU. With Langdock in the EU region, this also holds for the work of the agent. Often that is the condition under which the agent may work on the project at all.

## Opencode does not know Langdock

opencode resolves providers through the [models.dev](https://models.dev) registry. For the previous providers, an environment variable with the API key is enough. opencode knows the rest itself. Langdock is not in that registry, so this path does not work.

Instead, Knecht generates an `opencode.json` in the checkout for every run. In that file, it declares Langdock as a custom provider, with the endpoint of the selected region and exactly the models this run may use. Shortened, the block looks like this:

```json
{
  "provider": {
    "langdock": {
      "name": "Langdock",
      "options": {
        "baseURL": "https://api.langdock.com/openai/eu/v1",
        "apiKey": "{env:LANGDOCK_API_KEY}"
      },
      "models": { "gpt-5.5": {} }
    }
  }
}
```

The key itself is not in the file. The config only points to an environment variable with `{env:LANGDOCK_API_KEY}`, and Knecht hands the value directly to the opencode process. So the key never lands in the checkout where the agent works.

One quirk of the gateway hides in the `baseURL`. Langdock speaks a different API depending on the model. Claude models use the Anthropic-compatible one, all other models the OpenAI-compatible one. Knecht decides by the model name under which endpoint a model is declared in the config. In the picker, you just select a model. You never notice the split.

## The setup

Everything lives under "Settings" → "Agent". There you select Langdock as the provider, and the region select appears next to it. The region applies to the whole instance, that is, to every request from every run. Then you save the Langdock API key. Like all provider keys, it is stored [encrypted](/updates/gh-auth-evolution) in the database. Afterwards it can only be replaced, not read again.

<!-- TODO(samuel): Screenshot der Agent-Settings mit Langdock als Provider, Region-Auswahl und geladenem Modell-Picker -->
![The agent settings with Langdock as the provider, the region select, and the open model picker](/assets/settings-agent-langdock.png)

Once the key is saved, the model picker loads the list live from the Langdock workspace. It shows exactly the models that are enabled there, GPT and Claude models in the same picker. The default model and the optional subtask model, a smaller model for side tasks of the agent, work like with every other provider.

::note
When you switch the provider, Knecht clears the stored models, because the old names would not resolve in the catalog of the new provider. The AI action only runs again after a new default model is selected.
::

## Mixing models

Nothing changes in the AI action itself. The agent works in the running project as usual. It reads code, changes files, and executes commands, also with reasoning models like GPT-5.5. And because one key covers all models of the workspace, a workflow can still mix vendors through the per-step model override:

```yaml
steps:
  - type: ai
    id: analyze
    label: Analyze bug
    model: gpt-5.5
    prompt: Stelle den Bug aus {{ inputs.title }} nach und beschreibe die Ursache.
  - type: ai
    id: fix
    label: Fix bug
    model: claude-sonnet-4-5
    prompt: Behebe die Ursache aus {{ steps.analyze.text }}.
```

Both steps run through the same Langdock key and in the same region. The move to the EU gateway takes nothing away that you know from OpenCode Zen.
