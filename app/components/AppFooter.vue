<script setup lang="ts">
const { isMostSpecificActive } = useNavActive()
const localePath = useLocalePath()

const year = new Date().getFullYear()

const { t } = useI18n()

const baseColumns = [
  {
    headingKey: 'footer.columns.knecht',
    links: [
      { labelKey: 'footer.links.integrations', to: '/#integrations' },
      { labelKey: 'footer.links.useCases', to: '/#use-cases' },
      { labelKey: 'footer.links.preview', to: '/#dashboard' },
      { labelKey: 'footer.links.roadmap', to: '/#roadmap' }
    ]
  },
  {
    headingKey: 'footer.columns.takePart',
    links: [
      { labelKey: 'footer.links.beta', to: '/updates/beta-tester?signup=beta' },
      { labelKey: 'footer.links.discord', to: DISCORD_URL },
      { labelKey: 'footer.links.allUpdates', to: '/updates' },
      { labelKey: 'footer.links.feedback', to: `mailto:${CONTACT_EMAIL}` }
    ]
  },
  {
    headingKey: 'footer.columns.legal',
    links: [
      { labelKey: 'footer.links.imprint', to: '/impressum' },
      { labelKey: 'footer.links.privacy', to: '/datenschutz' }
    ]
  }
]

// Only route paths get a locale prefix, mailto and external links stay untouched.
const columns = computed(() =>
  baseColumns.map(column => ({
    heading: t(column.headingKey),
    links: column.links.map(link => ({
      label: t(link.labelKey),
      to: link.to.startsWith('/') ? localePath(link.to) : link.to
    }))
  }))
)

// All footer link targets, so active-state resolution can prefer the most
// specific match across columns.
const allLinkTargets = computed(() =>
  columns.value.flatMap(column => column.links.map(link => link.to))
)
</script>

<template>
  <footer class="border-t border-default mt-20 lg:mt-24">
    <div class="container pt-10 lg:pt-16">
      <div class="col-span-full flex flex-col justify-between gap-12 border-b border-default pb-12 lg:flex-row lg:gap-16">
        <!-- Brand -->
        <div class="max-w-xs">
          <AppLogo />

          <p class="mt-5 font-mono text-sm leading-relaxed text-dimmed">
            {{ $t('footer.tagline1') }}<br>{{ $t('footer.tagline2') }}
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <AppBadge
              dot-color="primary"
              :pulse="false"
              :label="$t('footer.badgeStatus')"
            />
            <AppBadge
              dot-color="orange"
              :pulse="false"
              :label="$t('footer.badgeEu')"
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
              :target="link.to.startsWith('http') ? '_blank' : undefined"
              class="text-sm transition-colors"
              :class="isMostSpecificActive(link.to, allLinkTargets) ? 'text-white' : 'text-muted hover:text-white'"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom bar. On mobile the copyright takes its own line, below it the
           language switch sits left and the socials right. -->
      <div class="col-span-full flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <span class="font-mono text-xs text-dimmed">
          {{ $t('footer.copyright', { year }) }}
        </span>

        <div class="flex items-center justify-between gap-6 sm:justify-end sm:gap-8">
          <AppLocaleSwitch />

          <div class="flex items-center gap-4">
            <NuxtLink
              v-for="social in SOCIAL_LINKS"
              :key="social.label"
              :to="social.to"
              :aria-label="social.label"
              :target="social.to.startsWith('http') ? '_blank' : undefined"
              rel="noopener noreferrer"
              class="text-dimmed transition-colors hover:text-white"
            >
              <UIcon
                :name="social.icon"
                class="size-5"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
