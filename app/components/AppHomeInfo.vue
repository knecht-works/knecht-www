<script setup lang="ts">
const { t } = useI18n()

const stepMeta = [
  { number: '01', key: 'projects', accent: 'var(--accent-mint)' },
  { number: '02', key: 'workflows', accent: 'var(--accent-orange)' },
  { number: '03', key: 'agent', accent: 'var(--accent-violet)' }
]

const steps = computed(() => stepMeta.map(step => ({
  ...step,
  block: t(`info.steps.${step.key}.block`),
  title: t(`info.steps.${step.key}.title`),
  text: t(`info.steps.${step.key}.text`)
})))
</script>

<template>
  <section
    id="idee"
  >
    <div class="container pt-16 sm:pt-24">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {{ $t('info.intro') }}
        </p>
      </AppReveal>

      <!-- Steps -->
      <div class="col-span-full mt-7 lg:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppReveal
          v-for="(step, i) in steps"
          :key="step.number"
          as="article"
          :y="0"
          :delay="i * 0.1"
          class="shadow-panel group relative flex flex-col overflow-hidden rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented hover:shadow-panel-lg lg:p-7"
          :style="{ '--a': step.accent }"
        >
          <!-- Header row -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm tracking-wider text-[var(--a)]">{{ step.number }}</span>
            <span class="rounded-md border border-default bg-elevated px-2 py-1 font-mono text-xs text-dimmed">
              {{ step.block }}
            </span>
          </div>

          <h3 class="mt-8 text-highlighted">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ step.text }}
          </p>
        </AppReveal>
      </div>
    </div>
  </section>
</template>
