<script setup lang="ts">
const { t } = useI18n()

const tabMeta = [
  {
    id: 'projekte',
    labelKey: 'demo.tabs.projects',
    image: '/assets/dashboard.png',
    url: '/projekte'
  },
  {
    id: 'detail',
    labelKey: 'demo.tabs.detail',
    image: '/assets/project.png',
    url: '/projekte/test-craftcms'
  },
  {
    id: 'workflow',
    labelKey: 'demo.tabs.workflow',
    image: '/assets/workflow.png',
    url: '/workflows/bug-fix'
  },
  {
    id: 'running-workflow',
    labelKey: 'demo.tabs.runningWorkflow',
    image: '/assets/running-workflow.png',
    url: '/workflows/bug-fix'
  }
]

const tabs = computed(() => tabMeta.map(tab => ({ ...tab, label: t(tab.labelKey) })))

const activeId = ref(tabMeta[0]!.id)
const activeTab = computed(() => tabs.value.find(tab => tab.id === activeId.value) ?? tabs.value[0]!)
</script>

<template>
  <section
    id="dashboard"
    class="overflow-hidden"
  >
    <div class="container pt-default">
      <!-- Heading (left-aligned) -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow :label="$t('demo.eyebrow')" />

        <h2 class="mt-6 text-balance text-highlighted">
          {{ $t('demo.title') }} <span class="text-primary">{{ $t('demo.titleAccent') }}</span>
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {{ $t('demo.description') }}
        </p>
      </AppReveal>

      <!-- Tab bar: segmented control, horizontally scrollable on mobile -->
      <AppReveal
        :delay="0.05"
        class="col-span-full mt-8 -mx-(--container-margin-x) overflow-x-auto outside-container scrollbar-none"
      >
        <div
          role="tablist"
          class="flex w-max gap-1 rounded-xl border border-default bg-white/2 p-1"
        >
          <button
            v-for="(tab, i) in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeId === tab.id"
            :class="[
              'flex shrink-0 items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer',
              activeId === tab.id
                ? 'border-default bg-elevated text-highlighted shadow-sm'
                : 'border-transparent text-muted hover:text-highlighted'
            ]"
            @click="activeId = tab.id"
          >
            <span
              class="font-mono text-xs tabular-nums"
              :class="activeId === tab.id ? 'text-primary' : 'text-dimmed'"
            >
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            {{ tab.label }}
          </button>
        </div>
      </AppReveal>

      <!-- Browser mockup -->
      <AppReveal
        :delay="0.1"
        :y="22"
        class="col-span-full mt-6 w-full"
      >
        <AppBrowserFrame :url="activeTab.url">
          <!-- Render all three screenshots (stacked, crossfaded via opacity) so
               the ipxStatic prerender generates an optimized /_ipx/ variant for
               each. With the previous single-image swap only the preselected tab
               was in the prerendered HTML, so the other two had no static variant
               and 404'd at runtime (Cloudflare Pages has no IPX runtime). -->
          <div class="relative aspect-[1915/1098]">
            <NuxtImg
              v-for="tab in tabs"
              :key="tab.id"
              :src="tab.image"
              :alt="$t('demo.imageAlt', { label: tab.label })"
              :aria-hidden="tab.id === activeId ? undefined : 'true'"
              sizes="sm:100vw lg:1920px"
              format="webp"
              quality="82"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ease-out"
              :class="tab.id === activeId ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            />
          </div>
        </AppBrowserFrame>
      </AppReveal>
    </div>
  </section>
</template>
