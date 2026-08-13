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

const baseItems = [
  { labelKey: 'header.nav.idea', to: '/#idee' },
  { labelKey: 'header.nav.preview', to: '/#dashboard' },
  { labelKey: 'header.nav.roadmap', to: '/#roadmap' },
  { labelKey: 'header.nav.updates', to: '/#updates' }
]

const items = computed<NavigationMenuItem[]>(() =>
  baseItems.map((item) => {
    const to = localePath(item.to)
    return {
      label: t(item.labelKey),
      to,
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
      left: 'gap-2.5 lg:gap-3 items-center',
      right: 'gap-2.5 lg:gap-3',
      // The menu duplicates the header row inside a fullscreen modal. Match
      // the 1px container border below, or the logo jumps on open.
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
      <AppReleasePill />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
      color="neutral"
    />

    <template #right>
      <AppGithubStars />
      <UButton
        :label="$t('header.cta')"
        color="neutral"
        class="hidden lg:flex"
        size="lg"
        :to="localePath('/#cta')"
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
        :to="localePath('/#cta')"
      />
    </template>
  </UHeader>
</template>
