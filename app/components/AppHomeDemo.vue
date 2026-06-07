<script setup lang="ts">
const tabs = [
  {
    id: 'projekte',
    label: 'Projekte',
    image: '/assets/dashboard.png',
    url: '/projekte'
  },
  {
    id: 'detail',
    label: 'Projekt-Detail',
    image: '/assets/project-detail.png',
    url: '/projekte/typo3-portal'
  },
  {
    id: 'workflow',
    label: 'Workflow-Editor',
    image: '/assets/workflow.png',
    url: '/workflows/security-update-fix'
  }
]

const activeId = ref(tabs[1]!.id)
const activeTab = computed(() => tabs.find(t => t.id === activeId.value) ?? tabs[0]!)
</script>

<template>
  <section
    id="dashboard"
    class="overflow-hidden"
  >
    <div class="container pt-default">
      <!-- Heading (left-aligned) -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="So wird's aussehen" />

        <h2 class="mt-6 text-balance text-highlighted">
          Viele Projekte. <span class="text-primary">Ein Knecht.</span>
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Ein erster Blick auf das Dashboard, an dem wir bauen: von der
          Projekt-Übersicht und Projekt-Detail Seite bis zum Workflow-Editor.
          Design und Funktionen ändern sich noch.
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
          <div class="relative aspect-18/13">
            <NuxtImg
              v-for="tab in tabs"
              :key="tab.id"
              :src="tab.image"
              :alt="`Knecht ${tab.label} Vorschau`"
              :aria-hidden="tab.id === activeId ? undefined : 'true'"
              sizes="sm:100vw lg:1520px"
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
