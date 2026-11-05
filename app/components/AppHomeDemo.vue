<script setup lang="ts">
const { t } = useI18n()

interface Hotspot {
  key: string
  x: number
  y: number
}

const tabMeta: { id: string, labelKey: string, image: string, url: string, hotspotKey: string, hotspots: Hotspot[] }[] = [
  {
    id: 'projekte',
    labelKey: 'demo.tabs.projects',
    image: '/assets/dashboard.png',
    url: '/projekte',
    hotspotKey: 'projects',
    hotspots: [
      { key: 'filter', x: 49, y: 12.3 },
      { key: 'status', x: 66, y: 25.8 },
      { key: 'live', x: 40, y: 76 }
    ]
  },
  {
    id: 'detail',
    labelKey: 'demo.tabs.detail',
    image: '/assets/project.png',
    url: '/projekte/test-craftcms',
    hotspotKey: 'detail',
    hotspots: [
      { key: 'preview', x: 57.5, y: 42 },
      { key: 'tools', x: 56.5, y: 19.4 },
      { key: 'sessions', x: 82, y: 26.6 },
      { key: 'followUp', x: 30.5, y: 84.1 }
    ]
  },
  {
    id: 'workflow',
    labelKey: 'demo.tabs.workflow',
    image: '/assets/workflow.png',
    url: '/workflows/bug-fix',
    hotspotKey: 'workflow',
    hotspots: [
      { key: 'triggers', x: 34, y: 28.1 },
      { key: 'library', x: 83.5, y: 13.6 },
      { key: 'ai', x: 36, y: 75 }
    ]
  },
  {
    id: 'running-workflow',
    labelKey: 'demo.tabs.runningWorkflow',
    image: '/assets/running-workflow.png',
    url: '/workflows/bug-fix',
    hotspotKey: 'runningWorkflow',
    hotspots: [
      { key: 'banner', x: 47.5, y: 23.4 },
      { key: 'log', x: 33, y: 48.9 },
      { key: 'background', x: 74.5, y: 5.8 }
    ]
  }
]

const tabs = computed(() => tabMeta.map(tab => ({
  ...tab,
  label: t(tab.labelKey),
  hotspots: tab.hotspots.map(spot => ({
    ...spot,
    title: t(`demo.hotspots.${tab.hotspotKey}.${spot.key}.title`),
    text: t(`demo.hotspots.${tab.hotspotKey}.${spot.key}.text`)
  }))
})))

const activeId = ref(tabMeta[0]!.id)
const activeTab = computed(() => tabs.value.find(tab => tab.id === activeId.value) ?? tabs.value[0]!)
</script>

<template>
  <section
    id="dashboard"
    class="overflow-hidden"
  >
    <div class="container pt-default">
      <AppSectionHeading
        :title="$t('demo.title')"
        :title-accent="$t('demo.titleAccent')"
        :text="$t('demo.description')"
      />

      <div
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
      </div>

      <div
        class="col-span-full mt-6 w-full"
      >
        <AppBrowserFrame
          :url="activeTab.url"
          :action="$t('demo.browserAction')"
        >
          <!-- Render all screenshots (stacked, crossfaded via opacity) so
               the ipxStatic prerender generates an optimized /_ipx/ variant for
               each. With the previous single-image swap only the preselected tab
               was in the prerendered HTML, so the others had no static variant
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

            <UPopover
              v-for="(spot, i) in activeTab.hotspots"
              :key="`${activeTab.id}-${spot.key}`"
              :content="{ side: 'top', sideOffset: 10, collisionPadding: 16 }"
              arrow
            >
              <button
                type="button"
                class="hotspot absolute grid size-7 -translate-1/2 cursor-pointer place-items-center rounded-full bg-accent-orange font-mono text-2xs font-semibold text-white shadow-glow sm:size-8"
                :style="{ left: `${spot.x}%`, top: `${spot.y}%`, animationDelay: `${i * 0.08}s` }"
                :aria-label="spot.title"
              >
                {{ i + 1 }}
              </button>

              <template #content>
                <div class="max-w-64 p-3.5">
                  <div class="text-sm font-semibold text-highlighted">
                    {{ spot.title }}
                  </div>
                  <p class="mt-1 text-sm leading-snug text-muted">
                    {{ spot.text }}
                  </p>
                </div>
              </template>
            </UPopover>
          </div>
        </AppBrowserFrame>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hotspot {
  animation: hotspot-in 0.35s var(--ease-soft) both;
}

.hotspot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  border: 2px solid var(--accent-orange);
  opacity: 0;
  animation: hotspot-ping 2.4s ease-out infinite;
}

@keyframes hotspot-in {
  from {
    opacity: 0;
    scale: 0.6;
  }
}

@keyframes hotspot-ping {
  0% {
    opacity: 0.7;
    scale: 0.8;
  }
  100% {
    opacity: 0;
    scale: 1.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hotspot,
  .hotspot::after {
    animation: none;
  }
}
</style>
