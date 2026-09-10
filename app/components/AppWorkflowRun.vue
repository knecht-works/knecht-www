<script setup lang="ts">
// A workflow run as the dashboard shows it, replayed step by step. The replay
// starts when the card scrolls into view, plays once and rests on the finished
// state. Only one card on the page plays at a time. A button in the title bar
// pauses, resumes or replays the run.
export interface RunStep {
  label: string
  title: string
  detail: string
}

const props = defineProps<{
  workflow: string
  source: SourceKey
  steps: RunStep[]
  out: { head: string, body: string, link: string }
}>()

type StepState = 'done' | 'active' | 'todo'

const { t } = useI18n()

const rootEl = useTemplateRef<HTMLElement>('rootEl')
// Index of the active step. At the step count the run is done and the output
// card slides in.
const { pos, playing, toggle } = useRunPlayer(rootEl, props.steps.length)

const done = computed(() => pos.value >= props.steps.length)

// Play / pause / replay button in the title bar.
const control = computed(() => {
  if (playing.value) return { icon: 'i-lucide-pause', label: t('useCases.player.pause') }
  if (done.value) return { icon: 'i-lucide-rotate-ccw', label: t('useCases.player.replay') }
  return { icon: 'i-lucide-play', label: t('useCases.player.play') }
})

// Status dot before the workflow name: running, finished or idle.
const dotClass = computed(() => {
  if (playing.value) return 'bg-accent-orange text-accent-orange shadow-glow animate-pulse'
  if (done.value) return 'bg-primary text-primary shadow-glow'
  return 'bg-accented'
})

const stateOf = (index: number): StepState => {
  if (done.value || pos.value > index) return 'done'
  return pos.value === index ? 'active' : 'todo'
}

const rowClass: Record<StepState, string> = {
  done: 'border-white/6 bg-card',
  active: 'border-accent-orange/60 bg-accent-orange/8',
  todo: 'border-transparent bg-card opacity-45'
}

const markClass: Record<StepState, string> = {
  done: 'border-primary/55 text-primary',
  active: 'border-accent-orange bg-accent-orange/15 text-accent-orange shadow-glow',
  todo: 'border-white/14 text-dimmed'
}

const labelClass: Record<StepState, string> = {
  done: 'text-primary',
  active: 'text-accent-orange',
  todo: 'text-neutral-600'
}
</script>

<template>
  <div
    ref="rootEl"
    class="shadow-panel-lg overflow-hidden rounded-2xl border border-default bg-muted"
  >
    <!-- Title bar -->
    <div class="flex items-center justify-between gap-3 border-default bg-elevated px-4 py-3.5 sm:px-4.5">
      <span class="flex min-w-0 items-center gap-2.5">
        <span
          class="size-2 shrink-0 rounded-full transition-colors duration-400"
          :class="dotClass"
        />
        <span class="truncate font-mono text-sm text-highlighted">{{ workflow }}</span>
      </span>
      <button
        type="button"
        class="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border border-default text-muted transition-colors hover:border-accented hover:text-highlighted"
        :aria-label="control.label"
        :title="control.label"
        @click="toggle"
      >
        <UIcon
          :name="control.icon"
          class="size-3.5"
        />
      </button>
    </div>

    <!-- Steps -->
    <ol class="flex flex-col gap-2 p-3 sm:p-4.5">
      <li
        v-for="(step, i) in steps"
        :key="i"
        class="flex items-center gap-3 rounded-lg border px-3 py-3 transition-all duration-400 sm:gap-3.5 sm:px-3.5"
        :class="rowClass[stateOf(i)]"
      >
        <span
          class="grid size-7 shrink-0 place-items-center rounded-full border font-mono text-2xs transition-all duration-400"
          :class="markClass[stateOf(i)]"
        >
          <UIcon
            v-if="stateOf(i) === 'done'"
            name="i-lucide-check"
            class="size-3.5"
          />
          <template v-else>{{ i + 1 }}</template>
        </span>

        <div class="min-w-0 flex-1">
          <div
            class="text-sm font-semibold"
            :class="stateOf(i) === 'todo' ? 'text-muted' : 'text-highlighted'"
          >
            {{ step.title }}
          </div>
          <div class="mt-0.5 truncate text-xs text-dimmed">
            {{ step.detail }}
          </div>
        </div>

        <span
          class="hidden shrink-0 font-mono text-2xs uppercase tracking-widest sm:block"
          :class="labelClass[stateOf(i)]"
        >
          {{ step.label }}
        </span>
      </li>
    </ol>

    <!-- Output: the comment or PR that lands back in the tool -->
    <div
      class="mx-3 mb-3 rounded-xl border border-primary/30 bg-primary/6 px-4 py-3.5 transition-all duration-500 ease-soft sm:mx-4.5 sm:mb-4.5"
      :class="done ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'"
      :aria-hidden="!done"
    >
      <div class="flex items-center gap-2.5 text-sm font-semibold text-primary">
        <AppSourceMark :source="source" />
        <span class="truncate">{{ out.head }}</span>
      </div>
      <!-- Fixed to three lines so cards with different copy keep one height. -->
      <p class="mt-2 line-clamp-3 min-h-[3lh] text-sm leading-normal text-toned">
        {{ out.body }}
      </p>
      <div class="mt-2 truncate font-mono text-xs text-primary">
        {{ out.link }}
      </div>
    </div>
  </div>
</template>
