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
      <UNavigationMenu
        :items="items"
        variant="link"
        color="neutral"
        orientation="vertical"
        class="-mx-2.5"
      />
      <UButton
        :label="$t('header.cta')"
        color="neutral"
        block
        size="lg"
        class="mt-4"
        :to="localePath('/updates/beta-tester?signup=beta')"
      />
      <AppGithubStars class="sm:hidden mt-4 justify-center" />
    </template>
  </UHeader>
</template>
