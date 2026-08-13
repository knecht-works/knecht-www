<script setup lang="ts">
const { isActive } = useNavActive()
const localePath = useLocalePath()

const year = new Date().getFullYear()

const { t } = useI18n()

const baseColumns = [
  {
    headingKey: 'footer.columns.knecht',
    links: [
      { labelKey: 'footer.links.idea', to: '/#idee' },
      { labelKey: 'footer.links.preview', to: '/#dashboard' },
      { labelKey: 'footer.links.roadmap', to: '/#roadmap' },
      { labelKey: 'footer.links.updates', to: '/#updates' }
    ]
  },
  {
    headingKey: 'footer.columns.takePart',
    links: [
      { labelKey: 'footer.links.beta', to: '/#cta' },
      { labelKey: 'footer.links.subscribe', to: '/#cta' },
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

// Only route paths get a locale prefix, the mailto link stays untouched.
const columns = computed(() =>
  baseColumns.map(column => ({
    heading: t(column.headingKey),
    links: column.links.map(link => ({
      label: t(link.labelKey),
      to: link.to.startsWith('/') ? localePath(link.to) : link.to
    }))
  }))
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
              class="text-sm transition-colors"
              :class="isActive(link.to) ? 'text-white' : 'text-muted hover:text-white'"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="col-span-full flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-1 font-mono text-xs text-dimmed">
          <span>{{ $t('footer.copyright', { year }) }}</span>
        </div>

        <!-- Language switch + socials (right) -->
        <div class="flex items-center gap-4">
          <AppLocaleSwitch />

          <span
            class="h-4 w-px bg-border"
            aria-hidden="true"
          />

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
  </footer>
</template>
