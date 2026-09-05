<script setup lang="ts">
import type { RunStep } from './AppWorkflowRun.vue'

// One story: the copy on one side, the replayed workflow run on the other.
// `flip` swaps the sides from lg upwards. On mobile the copy always comes first.
defineProps<{
  source: SourceKey
  sourceLabel: string
  title: string
  text: string
  before: string
  after: string
  workflow: string
  steps: RunStep[]
  out: { head: string, body: string, link: string }
  flip?: boolean
}>()
</script>

<template>
  <article class="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
    <div :class="flip && 'lg:order-2'">
      <AppBadge
        :dot="false"
        class="pl-2"
      >
        <AppSourceMark :source="source" />
        {{ sourceLabel }}
      </AppBadge>

      <h3 class="mt-5 text-balance text-2xl leading-tight tracking-tight text-highlighted sm:text-3xl">
        {{ title }}
      </h3>

      <p class="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {{ text }}
      </p>

      <!-- Before vs. with Knecht. The icon carries the meaning, the label is
           only for screen readers. -->
      <ul class="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
        <li class="flex gap-3 rounded-xl border border-default bg-white/2 p-4">
          <span class="grid size-7 shrink-0 place-items-center rounded-full border border-default text-dimmed">
            <UIcon
              name="i-lucide-x"
              class="size-3.5"
            />
          </span>
          <p class="text-sm leading-relaxed text-muted">
            <span class="sr-only">{{ $t('useCases.before') }}: </span>{{ before }}
          </p>
        </li>
        <li class="flex gap-3 rounded-xl border border-primary/30 bg-primary/6 p-4">
          <span class="grid size-7 shrink-0 place-items-center rounded-full border border-primary/55 text-primary">
            <UIcon
              name="i-lucide-check"
              class="size-3.5"
            />
          </span>
          <p class="text-sm leading-relaxed text-toned">
            <span class="sr-only">{{ $t('useCases.after') }}: </span>{{ after }}
          </p>
        </li>
      </ul>
    </div>

    <AppWorkflowRun
      :class="flip && 'lg:order-1'"
      :workflow="workflow"
      :source="source"
      :steps="steps"
      :out="out"
    />
  </article>
</template>
