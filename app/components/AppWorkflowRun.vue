<script setup lang="ts">
// A workflow run as the dashboard shows it, replayed step by step. The replay
// starts when the card scrolls into view, pauses while it is out of view, and
// rests a few ticks on the finished state before it loops.
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

// Ticks the finished state stays visible before the run restarts.
const REST_TICKS = 3

const rootEl = useTemplateRef<HTMLElement>('rootEl')
const { tick, frozen } = useSceneTimer(rootEl, { threshold: 0.4 })

// Index of the active step. At the step count the run is done and the output
// card slides in.
const pos = computed(() => frozen.value
  ? props.steps.length
  : tick.value % (props.steps.length + REST_TICKS)
)

const done = computed(() => pos.value >= props.steps.length)
const progress = computed(() => Math.round((Math.min(pos.value, props.steps.length) / props.steps.length) * 100))

const stateOf = (index: number): StepState => {
  if (done.value || pos.value > index) return 'done'
  return pos.value === index ? 'active' : 'todo'
}

const rowClass: Record<StepState, string> = {
  done: 'border-white/6 bg-white/2',
  active: 'border-[var(--accent-orange)]/60 bg-[var(--accent-orange)]/8',
  todo: 'border-transparent opacity-45'
}

const markClass: Record<StepState, string> = {
  done: 'border-primary/55 text-primary',
  active: 'border-[var(--accent-orange)] bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] [box-shadow:0_0_14px_color-mix(in_oklab,var(--accent-orange)_60%,transparent)]',
  todo: 'border-white/14 text-dimmed'
}

const labelClass: Record<StepState, string> = {
  done: 'text-primary',
  active: 'text-[var(--accent-orange)]',
  todo: 'text-neutral-600'
}
</script>

<template>
  <div
    ref="rootEl"
    class="shadow-panel-lg overflow-hidden rounded-2xl border border-default bg-muted"
  >
    <!-- Title bar -->
    <div class="flex items-center justify-between gap-3 border-b border-default bg-elevated px-4 py-3.5 sm:px-[18px]">
      <span class="truncate font-mono text-[13px] text-highlighted">{{ workflow }}</span>
      <span
        class="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em]"
        :class="done ? 'text-primary' : 'text-[var(--accent-orange)]'"
      >
        <AppPulseDot
          :color="done ? 'primary' : 'orange'"
          :pulse="!done"
        />
        {{ done ? $t('useCases.status.succeeded') : $t('useCases.status.running') }}
      </span>
    </div>

    <!-- Progress -->
    <div class="h-[3px] bg-white/6">
      <div
        class="h-full bg-[linear-gradient(90deg,var(--accent-mint),color-mix(in_oklab,var(--accent-mint)_60%,var(--accent-orange)))] [box-shadow:0_0_16px_-2px_var(--accent-mint)] transition-[width] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <!-- Steps -->
    <ol class="flex flex-col gap-2 p-3 sm:p-[18px]">
      <li
        v-for="(step, i) in steps"
        :key="step.label"
        class="grid grid-cols-[28px_1fr] items-center gap-3 rounded-[10px] border px-3 py-3 transition-all duration-400 sm:grid-cols-[28px_1fr_auto] sm:gap-3.5 sm:px-3.5"
        :class="rowClass[stateOf(i)]"
      >
        <span
          class="grid size-7 place-items-center rounded-full border font-mono text-[11px] transition-all duration-400"
          :class="markClass[stateOf(i)]"
        >
          <UIcon
            v-if="stateOf(i) === 'done'"
            name="i-lucide-check"
            class="size-3.5"
          />
          <template v-else>{{ i + 1 }}</template>
        </span>

        <div class="min-w-0">
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
          class="hidden font-mono text-[10px] uppercase tracking-[0.1em] sm:block"
          :class="labelClass[stateOf(i)]"
        >
          {{ step.label }}
        </span>
      </li>
    </ol>

    <!-- Output: the comment or PR that lands back in the tool -->
    <div
      class="mx-3 mb-3 rounded-xl border border-primary/30 bg-primary/6 px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:mx-[18px] sm:mb-[18px]"
      :class="done ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'"
      :aria-hidden="!done"
    >
      <div class="flex items-center gap-2.5 text-xs font-medium text-primary">
        <AppSourceMark :source="source" />
        <span class="truncate">{{ out.head }}</span>
      </div>
      <p class="mt-2 text-sm leading-normal text-toned">
        {{ out.body }}
      </p>
      <div class="mt-2 truncate font-mono text-xs text-primary">
        {{ out.link }}
      </div>
    </div>
  </div>
</template>
