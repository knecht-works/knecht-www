<script setup lang="ts">
const year = new Date().getFullYear()

const columns = [
  {
    heading: 'Knecht',
    links: [
      { label: 'Die Idee', to: '#idee' },
      { label: 'Vorschau', to: '#dashboard' },
      { label: 'Roadmap', to: '#roadmap' },
      { label: 'Updates', to: '#updates' }
    ]
  },
  {
    heading: 'Mitmachen',
    links: [
      { label: 'Warteliste', to: '#cta' },
      { label: 'Beta-Tester werden', to: '#cta' },
      { label: 'Feedback geben', to: '#cta' }
    ]
  },
  {
    heading: 'Rechtliches',
    links: [
      { label: 'Impressum', to: '/impressum' },
      { label: 'Datenschutz', to: '/datenschutz' }
    ]
  }
]
</script>

<template>
  <footer class="border-t border-default mt-20 lg:mt-24">
    <div class="container py-10 lg:py-16">
      <div class="col-span-full flex flex-col justify-between gap-12 border-b border-default pb-12 lg:flex-row lg:gap-16">
        <!-- Brand -->
        <div class="max-w-xs">
          <AppLogo />

          <p class="mt-5 font-mono text-sm leading-relaxed text-dimmed">
            Boote jedes Projekt.<br>Lass den Knecht arbeiten.
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <AppBadge
              dot-color="primary"
              :pulse="false"
              label="In Entwicklung"
            />
            <AppBadge
              dot-color="orange"
              :pulse="false"
              label="Self-hosted"
            />
          </div>
        </div>

        <!-- Link columns -->
        <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-16">
          <div
            v-for="column in columns"
            :key="column.heading"
            class="flex flex-col gap-3"
          >
            <span class="mb-1 font-mono text-xs uppercase tracking-[0.12em] text-dimmed">
              {{ column.heading }}
            </span>
            <NuxtLink
              v-for="link in column.links"
              :key="link.label"
              :to="link.to"
              class="text-sm text-muted transition-colors hover:text-primary"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="col-span-full flex flex-col gap-3 pt-6 font-mono text-xs text-dimmed sm:flex-row sm:justify-between">
        <span>© {{ year }} Knecht – in Entwicklung, gebaut für Agenturen und Devs.</span>
        <span>Building in Public · made with ❤️</span>
      </div>
    </div>
  </footer>
</template>
