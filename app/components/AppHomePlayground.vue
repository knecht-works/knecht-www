<script setup lang="ts">
type StepKey = 'boot' | 'shell' | 'ai' | 'http' | 'links'
type TriggerKey = 'github' | 'jira' | 'linear' | 'cron'
type Phase = 'idle' | 'running' | 'done'

const { t } = useI18n()

const stepMeta: { key: StepKey, icon: string, tile: string }[] = [
  { key: 'boot', icon: 'i-lucide-play', tile: 'bg-accent-mint text-neutral-950' },
  { key: 'shell', icon: 'i-lucide-terminal', tile: 'bg-white text-neutral-950' },
  { key: 'ai', icon: 'i-lucide-sparkles', tile: 'bg-accent-orange text-white' },
  { key: 'http', icon: 'i-lucide-globe', tile: 'bg-accent-plane text-white' },
  { key: 'links', icon: 'i-lucide-link', tile: 'bg-accent-violet text-neutral-950' }
]

const triggerKeys: TriggerKey[] = ['github', 'jira', 'linear', 'cron']

const library = computed(() => stepMeta.map(step => ({
  ...step,
  title: t(`playground.steps.${step.key}.title`),
  text: t(`playground.steps.${step.key}.text`)
})))

const triggers = computed(() => triggerKeys.map(key => ({
  key,
  label: t(`playground.triggers.${key}.label`),
  event: t(`playground.triggers.${key}.event`)
})))

const trigger = ref<TriggerKey>('github')
const activeTrigger = computed(() => triggers.value.find(item => item.key === trigger.value)!)

const workflow = ref<StepKey[]>(['boot', 'ai', 'links'])
const workflowSteps = computed(() => workflow.value.map(key => library.value.find(step => step.key === key)!))

const phase = ref<Phase>('idle')
const activeIndex = ref(-1)
const log = ref<{ id: number, text: string, tone: 'muted' | 'step' | 'ok' }[]>([])

const logEl = useTemplateRef<HTMLElement>('logEl')

let timers: number[] = []
let logId = 0

function clearTimers() {
  timers.forEach(id => window.clearTimeout(id))
  timers = []
}

function reset() {
  clearTimers()
  phase.value = 'idle'
  activeIndex.value = -1
  log.value = []
}

function toggleStep(key: StepKey) {
  if (phase.value === 'running') return
  reset()
  workflow.value = workflow.value.includes(key)
    ? workflow.value.filter(item => item !== key)
    : [...workflow.value, key]
}

function selectTrigger(key: TriggerKey) {
  if (phase.value === 'running') return
  reset()
  trigger.value = key
}

function push(text: string, tone: 'muted' | 'step' | 'ok' = 'muted') {
  log.value.push({ id: logId++, text, tone })
  nextTick(() => logEl.value?.scrollTo({ top: logEl.value.scrollHeight, behavior: 'smooth' }))
}

function run() {
  if (!workflow.value.length) return
  reset()
  phase.value = 'running'

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stepMs = reduce ? 0 : 1300
  const lineMs = reduce ? 0 : 450
  let at = 0
  const later = (ms: number, fn: () => void) => {
    at += ms
    timers.push(window.setTimeout(fn, at))
  }

  push(t(`playground.triggers.${trigger.value}.log`), 'step')
  workflow.value.forEach((key, index) => {
    later(index === 0 ? lineMs : stepMs - lineMs, () => {
      activeIndex.value = index
      push(`▸ ${t(`playground.steps.${key}.title`)}`, 'step')
    })
    later(lineMs, () => push(t(`playground.steps.${key}.logA`)))
    later(lineMs, () => push(t(`playground.steps.${key}.logB`), 'ok'))
  })
  later(stepMs - lineMs, () => {
    activeIndex.value = workflow.value.length
    phase.value = 'done'
    push(t('playground.result.pr'), 'ok')
  })
}

onBeforeUnmount(clearTimers)

type StepState = 'done' | 'active' | 'todo'

const stateOf = (index: number): StepState => {
  if (phase.value === 'idle') return 'todo'
  if (activeIndex.value > index) return 'done'
  return activeIndex.value === index ? 'active' : 'todo'
}

const nodeClass: Record<StepState, string> = {
  done: 'border-primary/40 bg-primary/6',
  active: 'border-accent-orange/60 bg-accent-orange/8',
  todo: 'border-white/6 bg-card'
}

const toneClass = {
  muted: 'text-muted',
  step: 'text-highlighted',
  ok: 'text-primary'
}

const runButton = computed(() => {
  if (phase.value === 'running') return { label: t('playground.running'), icon: 'i-lucide-loader-circle' }
  if (phase.value === 'done') return { label: t('playground.rerun'), icon: 'i-lucide-rotate-ccw' }
  return { label: t('playground.run'), icon: 'i-lucide-play' }
})
</script>

<template>
  <section id="playground">
    <div class="container pt-default">
      <AppSectionHeading
        :title="$t('playground.title')"
        :title-accent="$t('playground.titleAccent')"
        :text="$t('playground.intro')"
      />

      <div class="shadow-panel-lg col-span-full mt-10 grid overflow-hidden rounded-2xl border border-default bg-white/2 lg:grid-cols-12">
        <div class="border-default p-4 sm:p-6 lg:col-span-4 lg:border-r">
          <span class="font-mono text-2xs uppercase tracking-widest text-dimmed">
            {{ $t('playground.libraryLabel') }}
          </span>
          <ul class="mt-4 flex flex-col gap-2">
            <li
              v-for="step in library"
              :key="step.key"
            >
              <button
                type="button"
                class="group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed"
                :class="workflow.includes(step.key) ? 'border-primary/30 bg-primary/5' : 'border-white/6 bg-card hover:border-accented'"
                :disabled="phase === 'running'"
                :aria-pressed="workflow.includes(step.key)"
                :aria-label="workflow.includes(step.key) ? $t('playground.remove', { step: step.title }) : $t('playground.add', { step: step.title })"
                @click="toggleStep(step.key)"
              >
                <span
                  class="grid size-9 shrink-0 place-items-center rounded-lg"
                  :class="step.tile"
                >
                  <UIcon
                    :name="step.icon"
                    class="size-4.5"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold text-highlighted">{{ step.title }}</span>
                  <span class="mt-0.5 block text-xs leading-snug text-muted">{{ step.text }}</span>
                </span>
                <UIcon
                  :name="workflow.includes(step.key) ? 'i-lucide-check' : 'i-lucide-plus'"
                  class="size-4 shrink-0 transition-colors"
                  :class="workflow.includes(step.key) ? 'text-primary' : 'text-dimmed group-hover:text-highlighted'"
                />
              </button>
            </li>
          </ul>
        </div>

        <div class="border-t border-default p-4 sm:p-6 lg:col-span-4 lg:border-t-0 lg:border-r">
          <span class="font-mono text-2xs uppercase tracking-widest text-dimmed">
            {{ $t('playground.triggerLabel') }}
          </span>
          <div
            role="radiogroup"
            :aria-label="$t('playground.triggerLabel')"
            class="mt-4 grid grid-cols-2 gap-1.5"
          >
            <button
              v-for="item in triggers"
              :key="item.key"
              type="button"
              role="radio"
              :aria-checked="trigger === item.key"
              :disabled="phase === 'running'"
              class="flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed"
              :class="trigger === item.key ? 'border-accented bg-elevated text-highlighted' : 'border-transparent text-muted hover:text-highlighted'"
              @click="selectTrigger(item.key)"
            >
              <AppSourceMark :source="item.key" />
              {{ item.label }}
            </button>
          </div>

          <div class="mt-5 flex items-center gap-3 rounded-xl border border-white/6 bg-card px-3 py-3">
            <AppSourceMark
              :source="trigger"
              size="md"
            />
            <div class="min-w-0">
              <div class="text-sm font-semibold text-highlighted">
                {{ activeTrigger.label }}
              </div>
              <div class="mt-0.5 truncate font-mono text-xs text-muted">
                {{ activeTrigger.event }}
              </div>
            </div>
          </div>

          <span class="mt-6 block font-mono text-2xs uppercase tracking-widest text-dimmed">
            {{ $t('playground.workflowLabel') }}
          </span>

          <TransitionGroup
            tag="ol"
            name="node"
            class="relative mt-4 flex flex-col gap-2"
          >
            <li
              v-for="(step, i) in workflowSteps"
              :key="step.key"
              class="flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-300"
              :class="nodeClass[stateOf(i)]"
            >
              <span
                class="grid size-7 shrink-0 place-items-center rounded-full border font-mono text-2xs transition-colors duration-300"
                :class="{
                  'border-primary/55 text-primary': stateOf(i) === 'done',
                  'border-accent-orange bg-accent-orange/15 text-accent-orange shadow-glow': stateOf(i) === 'active',
                  'border-white/14 text-dimmed': stateOf(i) === 'todo'
                }"
              >
                <UIcon
                  v-if="stateOf(i) === 'done'"
                  name="i-lucide-check"
                  class="size-3.5"
                />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="min-w-0 flex-1 truncate text-sm font-medium text-highlighted">{{ step.title }}</span>
              <button
                type="button"
                class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-dimmed transition-colors hover:bg-elevated hover:text-highlighted disabled:invisible"
                :disabled="phase === 'running'"
                :aria-label="$t('playground.remove', { step: step.title })"
                @click="toggleStep(step.key)"
              >
                <UIcon
                  name="i-lucide-x"
                  class="size-3.5"
                />
              </button>
            </li>
          </TransitionGroup>

          <p
            v-if="!workflow.length"
            class="rounded-xl border border-dashed border-default px-4 py-6 text-center text-sm text-muted"
          >
            {{ $t('playground.empty') }}
          </p>

          <UButton
            :label="runButton.label"
            :icon="runButton.icon"
            size="lg"
            block
            class="mt-5"
            :disabled="!workflow.length || phase === 'running'"
            :ui="{ leadingIcon: phase === 'running' ? 'animate-spin' : '' }"
            @click="run"
          />
        </div>

        <div class="flex min-h-96 flex-col border-t border-default bg-muted lg:col-span-4 lg:border-t-0">
          <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3.5 sm:px-6">
            <span class="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-dimmed">
              <UIcon
                name="i-lucide-square-terminal"
                class="size-3.5"
              />
              {{ $t('playground.logLabel') }}
            </span>
            <span class="flex items-center gap-2 font-mono text-2xs text-dimmed">
              <AppPulseDot
                :color="phase === 'running' ? 'orange' : phase === 'done' ? 'primary' : 'neutral'"
                :pulse="phase === 'running'"
              />
              {{ phase === 'running' ? $t('playground.running') : phase === 'done' ? $t('playground.result.title') : $t('playground.idle') }}
            </span>
          </div>

          <ol
            ref="logEl"
            aria-live="polite"
            class="max-h-80 flex-1 overflow-y-auto px-4 py-4 font-mono text-xs leading-relaxed sm:px-6"
          >
            <li
              v-if="!log.length"
              class="text-dimmed"
            >
              {{ $t('playground.logEmpty') }}
            </li>
            <li
              v-for="line in log"
              :key="line.id"
              class="log-line"
              :class="toneClass[line.tone]"
            >
              {{ line.text }}
            </li>
          </ol>

          <div
            class="mx-4 mb-4 rounded-xl border border-primary/30 bg-primary/6 px-4 py-3.5 transition-all duration-500 ease-soft sm:mx-6 sm:mb-6"
            :class="phase === 'done' ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2.5 opacity-0'"
            :aria-hidden="phase !== 'done'"
          >
            <div class="flex items-center gap-2.5 text-sm font-semibold text-primary">
              <UIcon
                name="i-lucide-git-pull-request"
                class="size-4"
              />
              {{ $t('playground.result.pr') }}
            </div>
            <div class="mt-2 flex flex-col gap-1 text-xs text-toned">
              <span class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-globe"
                  class="size-3.5 shrink-0 text-accent-orange"
                />
                <span class="truncate font-mono">{{ $t('playground.result.preview') }}</span>
              </span>
              <span class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-message-square-text"
                  class="size-3.5 shrink-0 text-accent-violet"
                />
                {{ $t('playground.result.comment', { where: $t(`playground.triggers.${trigger}.where`) }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.node-enter-active,
.node-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.node-enter-from,
.node-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.log-line {
  animation: log-in 0.25s ease-out;
}

@keyframes log-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .log-line {
    animation: none;
  }
}
</style>
