<script setup lang="ts">
// Three stories from agency life. Each run card drives its own replay, starting
// when it scrolls into view.
const { t } = useI18n()

const caseMeta: { key: string, source: SourceKey, steps: string[], flip?: boolean }[] = [
  { key: 'update', source: 'cron', steps: ['trigger', 'boot', 'update', 'links', 'result'] },
  { key: 'estimate', source: 'jira', steps: ['trigger', 'boot', 'analyze', 'assess', 'result'], flip: true },
  { key: 'fix', source: 'github', steps: ['trigger', 'boot', 'fix', 'test', 'result'] }
]

const cases = computed(() => caseMeta.map((item) => {
  const base = `useCases.items.${item.key}`
  return {
    ...item,
    sourceLabel: t(`${base}.source`),
    workflow: t(`${base}.workflow`),
    title: t(`${base}.title`),
    text: t(`${base}.text`),
    before: t(`${base}.before`),
    after: t(`${base}.after`),
    steps: item.steps.map(step => ({
      label: t(`${base}.steps.${step}.label`),
      title: t(`${base}.steps.${step}.title`),
      detail: t(`${base}.steps.${step}.detail`)
    })),
    out: {
      head: t(`${base}.out.head`),
      body: t(`${base}.out.body`),
      link: t(`${base}.out.link`)
    }
  }
}))
</script>

<template>
  <section id="use-cases">
    <div class="container pt-default">
      <AppSectionHeading
        :title="$t('useCases.title')"
        :title-accent="$t('useCases.titleAccent')"
        :text="$t('useCases.intro')"
      />

      <div class="col-span-full mt-12 flex flex-col gap-16 lg:mt-14 lg:gap-24">
        <AppReveal
          v-for="item in cases"
          :key="item.key"
          :y="22"
        >
          <AppUseCaseItem
            :source="item.source"
            :source-label="item.sourceLabel"
            :title="item.title"
            :text="item.text"
            :before="item.before"
            :after="item.after"
            :workflow="item.workflow"
            :steps="item.steps"
            :out="item.out"
            :flip="item.flip"
          />
        </AppReveal>
      </div>
    </div>
  </section>
</template>
