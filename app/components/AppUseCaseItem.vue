<script setup lang="ts">
import type { RunStep } from './AppWorkflowRun.vue'

// One story: the copy on one side, the replayed workflow run on the other.
// `flip` swaps the sides from lg upwards. On mobile the copy always comes first.
defineProps<{
  source: SourceKey
  sourceLabel: string
  title: string
  text: string
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
