<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { isActive } = useNavActive()
const localePath = useLocalePath()

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

const { t } = useI18n()

// Docs exist in English only, so their link stays unlocalized.
const baseItems: { labelKey: string, to: string, localized?: boolean }[] = [
  { labelKey: 'header.nav.integrations', to: '/#integrations' },
  { labelKey: 'header.nav.useCases', to: '/#use-cases' },
  { labelKey: 'header.nav.updates', to: '/updates' },
  { labelKey: 'header.nav.docs', to: '/docs', localized: false }
]

const items = computed<NavigationMenuItem[]>(() =>
  baseItems.map((item) => {
    const to = item.localized === false ? item.to : localePath(item.to)
    return {
      label: t(item.labelKey),
      to,
      locale: item.localized,
      active: isActive(to),
      class: isActive(to) ? 'text-highlighted' : undefined
    }
  })
)
</script>

<template>
  <UHeader
    class="lg:h-20 border-b-0 bg-transparent backdrop-blur-none"
    :ui="{
      left: 'gap-2.5 lg:gap-3 items-center lg:flex-none',
      right: 'gap-2.5 lg:gap-3 lg:flex-none',
      header: 'border-x border-t border-x-transparent border-t-transparent',
      body: 'flex flex-1 flex-col',
      container: [
        'h-full rounded-b-xl border transition-all duration-300',
        scrolled
          ? 'border-default bg-default/95 shadow-panel'
          : 'border-transparent'
      ].join(' ')
    }"
  >
    <template #left>
      <NuxtLinkLocale
        to="/"
        class="flex items-center"
      >
        <AppLogo class="w-auto shrink-0" />
      </NuxtLinkLocale>
      <AppReleasePill class="max-sm:hidden"/>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      color="neutral"
    />

    <template #right>
      <AssistantButton />
      <UContentSearchButton
        variant="ghost"
        class="cursor-pointer"
        :aria-label="$t('header.search')"
      />
      <AppGithubStars class="hidden sm:flex lg:hidden xl:flex" />
      <UButton
        :label="$t('header.cta')"
        color="neutral"
        class="hidden lg:flex"
        size="lg"
        :to="localePath('/updates/beta-tester?signup=beta')"
      />
    </template>

    <template #body>
      <div class="flex flex-1 flex-col">
        <nav>
          <NuxtLink
            v-for="(item, i) in items"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-4 border-b border-default py-4 text-2xl font-semibold tracking-tight transition-colors"
            :class="item.active ? 'text-primary' : 'text-highlighted'"
          >
            <span class="w-6 font-mono text-xs tabular-nums text-dimmed">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="flex-1">{{ item.label }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-5 text-dimmed transition-transform group-hover:translate-x-0.5 group-hover:text-highlighted"
            />
          </NuxtLink>
        </nav>

        <div class="mt-auto pt-10">
          <UButton
            :label="$t('header.cta')"
            color="neutral"
            block
            size="xl"
            :to="localePath('/updates/beta-tester?signup=beta')"
          />
        </div>
      </div>
    </template>
  </UHeader>
</template>
