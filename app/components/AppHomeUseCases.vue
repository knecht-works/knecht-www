<script setup lang="ts">
// Below lg the desktop card is hidden and never scrolls into view, so it never
// plays. Every case has four steps so the card keeps its height when switching.
const { t } = useI18n()

const caseMeta: { key: string, source: SourceKey, steps: string[] }[] = [
  { key: 'update', source: 'cron', steps: ['trigger', 'boot', 'update', 'links'] },
  { key: 'estimate', source: 'jira', steps: ['trigger', 'boot', 'reproduce', 'estimate'] },
  { key: 'fix', source: 'github', steps: ['trigger', 'boot', 'fix', 'build'] }
]

const cases = computed(() => caseMeta.map((item) => {
  const base = `useCases.items.${item.key}`
  return {
    ...item,
    workflow: t(`${base}.workflow`),
    title: t(`${base}.title`),
    text: t(`${base}.text`),
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

const activeIndex = ref(0)
const active = computed(() => cases.value[activeIndex.value]!)

const open = ref(new Set([0]))

function select(index: number) {
  activeIndex.value = index
  if (open.value.has(index)) open.value.delete(index)
  else open.value.add(index)
}
</script>

<template>
  <section id="use-cases">
    <div class="container pt-default">
      <AppSectionHeading
        :title="$t('useCases.title')"
        :title-accent="$t('useCases.titleAccent')"
        :text="$t('useCases.intro')"
      />

      <div
        class="col-span-full mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-center lg:gap-16"
      >
        <ol class="min-w-0 divide-y divide-default lg:col-span-5 lg:divide-y-0">
          <li
            v-for="(item, i) in cases"
            :key="item.key"
            class="py-5 lg:border-l-2 lg:pl-10 lg:transition-colors"
            :class="[
              { 'pt-0': i === 0, 'pb-0': i === cases.length - 1 },
              i === activeIndex ? 'lg:border-primary' : 'lg:border-default'
            ]"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-start justify-between gap-4 text-left transition-opacity duration-300 lg:block"
              :class="{ 'lg:opacity-40 lg:hover:opacity-70': i !== activeIndex }"
              :aria-expanded="open.has(i)"
              @click="select(i)"
            >
              <span>
                <span class="block text-balance text-lg font-semibold tracking-tight text-highlighted sm:text-xl">
                  {{ item.title }}
                </span>
                <p class="mt-2 text-balance text-base leading-relaxed text-muted">
                  {{ item.text }}
                </p>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="mt-1 size-5 shrink-0 text-dimmed transition-transform duration-300 lg:hidden"
                :class="{ 'rotate-180': open.has(i) }"
              />
            </button>

            <AppWorkflowRun
              v-if="open.has(i)"
              class="mt-5 lg:hidden"
              :workflow="item.workflow"
              :source="item.source"
              :steps="item.steps"
              :out="item.out"
            />
          </li>
        </ol>

        <Transition
          name="case-swap"
          mode="out-in"
        >
          <AppWorkflowRun
            :key="active.key"
            class="hidden lg:col-span-7 lg:block"
            :workflow="active.workflow"
            :source="active.source"
            :steps="active.steps"
            :out="active.out"
          />
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-swap-enter-active,
.case-swap-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.case-swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.case-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
