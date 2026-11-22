---
title: Per-Project AI Connections
date: 2026-11-22
tag: Engine
description: Since version 0.22 a project can use its own API key or its own AI provider.
---

Until now a Knecht instance had exactly one AI provider with one API key. Every [run](/updates/workflow-engine) in every project used that key. For an agency, that doesn't always fit. Some clients pay for the AI costs of their project themselves. Others require a specific provider, for example [Langdock](/updates/langdock-provider) in the EU. So since [version 0.22](https://github.com/knecht-works/knecht-cloud/releases/tag/v0.22.0), a project can have its own AI connection.

## Inherited Field by Field

![The "AI connection" panel in the advanced settings of a project, with provider, API key, default model, and subtask model](/assets/knecht-project-ai-connection.png)

You'll find the "AI connection" panel in the project settings under "Advanced". As long as you don't change anything there, the project uses the AI provider from the global settings. Each field is inherited separately until you override it. That gives you full control:

- Your own key with the same provider. "Provider" stays on "Global default" and you only save a key. The project's costs then go to that key, while the models still follow the global settings.
- Your own provider. You pick a different provider and save its key. The project gets its own model list and its own models, and no longer inherits anything from the global settings.

## What Uses It

Whenever Knecht uses AI and knows which project it is working on, it uses the project's AI connection instead of the global one. Right now, every AI feature in Knecht belongs to a project.

### Global AI Features

This isn't built yet, but in the future there will be AI features that don't belong to any project, like building workflows. These features will need the global AI connection, even if every project has its own API key. So if you move all your projects to their own AI connections, keep this in mind.

## API Key Validation

While adding AI connections per project, we also improved how API keys are validated. Before, Knecht didn't check the key at all. You only found out whether it worked once you actually used the AI.

Now you save the API key once, Knecht validates it, and the model list loads. Getting there was a bit tricky, though.

### A Word About UX

::update-video{src="/assets/ux-ai-connection.mp4" caption="Saving a new AI provider in the project settings"}
::

We want every setting to save automatically, because it simply feels better. But that always raises the question of when to check whether a value is correct. Usually you validate while the user types. That doesn't work once a third-party API is involved: those requests take a while, and the delay feels strange.

Validating an API key means asking the provider whether it accepts the key, so it can't be instant. And only once the key is valid do we know which models the model picker can offer. A default model is required, so how do we make sure one is selected when we don't even know yet which models your provider has?

We solved this with a small save button next to the API key. When you save the key, Knecht validates it and then loads the available models. At that point the model dropdown would still be empty. So we defined a list of up to three preferred models for each provider, and the first one your provider offers gets preselected. That way a default model should always be saved right after you enter the API key.

::note{variant="info"}
  A simpler alternative would have been to validate the model field once the model list has loaded. But then the field would always show up red at first, which sends the wrong signal, because your API key is actually valid. We think the save button is a good compromise.
::
