<script setup lang="ts">
// Trigger -> Knecht -> result, as one diagram. Stacks vertically on mobile,
// reads left to right from lg upwards.
const { t } = useI18n()

const triggerMeta: { key: string, source: SourceKey, dashed?: boolean }[] = [
  { key: 'github', source: 'github' },
  { key: 'jira', source: 'jira' },
  { key: 'cron', source: 'cron', dashed: true }
]

const resultMeta = [
  { key: 'pr', icon: 'i-lucide-git-pull-request', tileClass: 'bg-accent-mint text-neutral-950' },
  { key: 'preview', icon: 'i-lucide-globe', tileClass: 'bg-accent-orange text-white' },
  { key: 'comment', icon: 'i-lucide-message-square-text', tileClass: 'bg-accent-violet text-neutral-950' }
]

const triggers = computed(() => triggerMeta.map(item => ({
  ...item,
  title: t(`integrations.triggers.${item.key}.title`),
  text: t(`integrations.triggers.${item.key}.text`)
})))

// What happens inside a run, as three one-line steps.
const stepMeta = [
  { key: 'boot', icon: 'i-lucide-box' },
  { key: 'run', icon: 'i-lucide-list-checks' },
  { key: 'ai', icon: 'i-lucide-sparkles' }
]

const centerSteps = computed(() => stepMeta.map(item => ({
  ...item,
  title: t(`integrations.center.steps.${item.key}`)
})))

const results = computed(() => resultMeta.map(item => ({
  ...item,
  title: t(`integrations.results.${item.key}.title`),
  text: t(`integrations.results.${item.key}.text`)
})))
</script>

<template>
  <section id="integrations">
    <div
      class="container pt-default"
    >
      <AppSectionHeading
        :title="$t('integrations.title')"
        :title-accent="$t('integrations.titleAccent')"
        :title-after="$t('integrations.titleAfter')"
        :text="$t('integrations.intro')"
      />

      <div
        class="shadow-panel col-span-full mt-10 flex flex-col rounded-2xl border border-default bg-white/2 p-5 sm:p-8 lg:grid lg:integration-grid lg:items-center lg:gap-y-3 lg:p-10 xl:integration-grid-xl"
      >
        <!-- Labels get their own grid row from lg, so the columns below stay centered on the Knecht card. -->
        <span class="mb-3 font-mono text-2xs uppercase tracking-widest text-dimmed lg:col-start-1 lg:row-start-1 lg:mb-0">
          {{ $t('integrations.triggerLabel') }}
        </span>
        <!-- Triggers -->
        <div class="flex flex-col gap-3 lg:row-start-2">
          <AppFlowCard
            v-for="item in triggers"
            :key="item.key"
            :source="item.source"
            :dashed="item.dashed"
            :title="item.title"
            :text="item.text"
          />
        </div>

        <AppFlowConnector class="lg:row-start-2" />

        <!-- Knecht -->
        <div class="relative rounded-2xl lg:row-start-2 border border-white/6 bg-card px-5 py-7 sm:flex sm:items-center sm:gap-5 sm:px-6 lg:block xl:flex xl:px-7">
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-highlighted">
              {{ $t('integrations.center.label') }}
            </div>
            <p class="mt-1 max-w-xs text-sm leading-snug text-muted">
              {{ $t('integrations.center.text') }}
            </p>

            <ol class="mt-5 flex flex-col gap-2">
              <li
                v-for="step in centerSteps"
                :key="step.key"
                class="flex items-center gap-2.5 rounded-lg border border-white/6 bg-card px-3 py-2 text-sm font-medium text-highlighted"
              >
                <UIcon
                  :name="step.icon"
                  class="size-4 shrink-0 text-primary"
                />
                {{ step.title }}
              </li>
            </ol>
          </div>

          <img
            :src="'/assets/mascotLeft.svg'"
            alt=""
            aria-hidden="true"
            width="654"
            height="1199"
            loading="lazy"
            class="drop-shadow-mascot hidden h-52 w-auto shrink-0 select-none sm:block lg:hidden xl:block"
          >
        </div>

        <AppFlowConnector
          accent="orange"
          :delay="1.2"
          class="lg:row-start-2"
        />

        <!-- Results -->
        <span class="mb-3 font-mono text-2xs uppercase tracking-widest text-dimmed lg:col-start-5 lg:row-start-1 lg:mb-0">
          {{ $t('integrations.resultLabel') }}
        </span>
        <div class="flex flex-col gap-3 lg:row-start-2">
          <AppFlowCard
            v-for="item in results"
            :key="item.key"
            :icon="item.icon"
            :tile-class="item.tileClass"
            :title="item.title"
            :text="item.text"
          />
        </div>
      </div>
    </div>
  </section>
</template>
