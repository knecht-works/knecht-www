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
  { key: 'pr', icon: 'i-lucide-git-pull-request', accent: 'var(--accent-mint)' },
  { key: 'preview', icon: 'i-lucide-globe', accent: 'var(--accent-orange)' },
  { key: 'comment', icon: 'i-lucide-message-square-text', accent: 'var(--accent-violet)' }
]

const triggers = computed(() => triggerMeta.map(item => ({
  ...item,
  title: t(`integrations.triggers.${item.key}.title`),
  text: t(`integrations.triggers.${item.key}.text`)
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
        class="shadow-panel col-span-full mt-10 flex flex-col rounded-2xl border border-default bg-muted p-5 sm:p-8 lg:mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_60px_minmax(0,1.1fr)_60px_minmax(0,1fr)] lg:items-center lg:p-10"
      >
        <!-- Triggers -->
        <div class="flex flex-col gap-3">
          <span class="font-mono text-[11px] uppercase tracking-[0.12em] text-dimmed">
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

        <AppFlowConnector accent="var(--accent-mint)" />

        <!-- Knecht -->
        <div class="relative rounded-2xl border border-primary/35 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--accent-mint)_8%,transparent),color-mix(in_oklab,var(--accent-mint)_2%,transparent))] px-5 py-7 text-center [box-shadow:0_0_60px_-20px_color-mix(in_oklab,var(--accent-mint)_35%,transparent)] sm:px-6">
          <NuxtImg
            :src="'/assets/mascotMain.png'"
            alt=""
            aria-hidden="true"
            height="240"
            format="webp"
            loading="lazy"
            class="mx-auto h-[120px] w-auto select-none [filter:drop-shadow(0_16px_24px_oklch(0_0_0/0.6))]"
          />
          <div class="mt-3.5 text-lg font-semibold text-highlighted">
            {{ $t('integrations.center.title') }}
          </div>
          <p class="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
            {{ $t('integrations.center.text') }}
          </p>
          <div class="mt-4 flex justify-center">
            <AppTag :label="$t('integrations.center.tag')" />
          </div>
        </div>

        <AppFlowConnector
          accent="var(--accent-orange)"
          :delay="1.2"
        />

        <!-- Results -->
        <div class="flex flex-col gap-3">
          <span class="font-mono text-[11px] uppercase tracking-[0.12em] text-dimmed">
            {{ $t('integrations.resultLabel') }}
          </span>
          <AppFlowCard
            v-for="item in results"
            :key="item.key"
            :icon="item.icon"
            :accent="item.accent"
            :title="item.title"
            :text="item.text"
          />
        </div>
      </AppReveal>
    </div>
  </section>
</template>
