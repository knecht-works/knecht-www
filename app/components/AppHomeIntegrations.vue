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
  { key: 'pr', icon: 'i-lucide-git-pull-request', iconClass: 'text-accent-mint' },
  { key: 'preview', icon: 'i-lucide-globe', iconClass: 'text-accent-orange' },
  { key: 'comment', icon: 'i-lucide-message-square-text', iconClass: 'text-accent-violet' }
]

const triggers = computed(() => triggerMeta.map(item => ({
  ...item,
  title: t(`integrations.triggers.${item.key}.title`),
  text: t(`integrations.triggers.${item.key}.text`)
})))

const centerSteps = computed(() => ['boot', 'run', 'ai'].map(key => ({
  key,
  title: t(`integrations.center.steps.${key}.title`),
  detail: t(`integrations.center.steps.${key}.detail`)
})))

const results = computed(() => resultMeta.map(item => ({
  ...item,
  title: t(`integrations.results.${item.key}.title`),
  text: t(`integrations.results.${item.key}.text`)
})))
</script>

<template>
  <section id="integrations">
    <div class="container pt-default">
      <AppSectionHeading
        :title="$t('integrations.title')"
        :text="$t('integrations.intro')"
      />

      <AppReveal
        :delay="0.08"
        :y="22"
        class="shadow-panel col-span-full mt-10 flex flex-col rounded-2xl border border-default bg-muted p-5 sm:p-8 lg:mt-12 lg:grid lg:integration-grid lg:items-center lg:p-10"
      >
        <!-- Triggers -->
        <div class="flex flex-col gap-3">
          <span class="font-mono text-2xs uppercase tracking-widest text-dimmed">
            {{ $t('integrations.triggerLabel') }}
          </span>
          <AppFlowCard
            v-for="item in triggers"
            :key="item.key"
            :source="item.source"
            :dashed="item.dashed"
            :title="item.title"
            :text="item.text"
          />
        </div>

        <AppFlowConnector />

        <!-- Knecht -->
        <div class="knecht-node relative rounded-2xl border border-primary/35 px-5 py-7 text-center sm:px-6">
          <NuxtImg
            :src="'/assets/mascotMain.png'"
            alt=""
            aria-hidden="true"
            height="240"
            format="webp"
            loading="lazy"
            class="drop-shadow-mascot mx-auto h-30 w-auto select-none"
          />
          <div class="mt-3.5 text-lg font-semibold text-highlighted">
            {{ $t('integrations.center.title') }}
          </div>

          <!-- What happens inside a run, as a rough three step outline -->
          <ol class="mx-auto mt-5 flex max-w-xs flex-col gap-2 text-left">
            <li
              v-for="(step, i) in centerSteps"
              :key="step.key"
              class="flex items-start gap-3 rounded-lg border border-default bg-elevated px-3 py-2.5"
            >
              <span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-primary/55 font-mono text-2xs text-primary">
                {{ i + 1 }}
              </span>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-highlighted">
                  {{ step.title }}
                </div>
                <div class="mt-0.5 text-xs leading-snug text-dimmed">
                  {{ step.detail }}
                </div>
              </div>
            </li>
          </ol>
        </div>

        <AppFlowConnector
          accent="orange"
          :delay="1.2"
        />

        <!-- Results -->
        <div class="flex flex-col gap-3">
          <span class="font-mono text-2xs uppercase tracking-widest text-dimmed">
            {{ $t('integrations.resultLabel') }}
          </span>
          <AppFlowCard
            v-for="item in results"
            :key="item.key"
            :icon="item.icon"
            :icon-class="item.iconClass"
            :title="item.title"
            :text="item.text"
          />
        </div>
      </AppReveal>
    </div>
  </section>
</template>
