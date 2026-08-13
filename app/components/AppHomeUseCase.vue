<script setup lang="ts">
// The one concrete story that explains the product better than any claim:
// a CMS security update needs a running database, so bots without a booted
// project can't do it. Rendered as the workflow run it actually is.
const { t } = useI18n()

const stepKeys = ['trigger', 'boot', 'update', 'test', 'result'] as const

const steps = computed(() => stepKeys.map(key => ({
  label: t(`useCase.steps.${key}.label`),
  title: t(`useCase.steps.${key}.title`),
  text: t(`useCase.steps.${key}.text`)
})))
</script>

<template>
  <section id="anwendungsfall">
    <div class="container pt-default">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow :label="$t('useCase.eyebrow')" />

        <h2 class="mt-6 text-balance text-highlighted">
          {{ $t('useCase.title') }}
        </h2>

        <i18n-t
          keypath="useCase.intro"
          tag="p"
          scope="global"
          class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg"
        >
          <template #code>
            <code>composer update</code>
          </template>
        </i18n-t>
      </AppReveal>

      <!-- Workflow run: the steps a single update actually goes through -->
      <div class="col-span-full mt-8 lg:mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AppReveal
          v-for="(step, i) in steps"
          :key="step.label"
          as="article"
          :y="0"
          :delay="i * 0.08"
          class="shadow-panel group relative flex flex-col rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented hover:shadow-panel-lg"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm tracking-wider text-primary">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="rounded-md border border-default bg-elevated px-2 py-1 font-mono text-xs text-dimmed">
              {{ step.label }}
            </span>
          </div>

          <h3 class="mt-6 text-base text-highlighted">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ step.text }}
          </p>
        </AppReveal>
      </div>

      <AppReveal
        :delay="0.1"
        class="col-span-full mt-6"
      >
        <p class="font-mono text-sm text-dimmed">
          {{ $t('useCase.outro') }}
        </p>
      </AppReveal>
    </div>
  </section>
</template>
