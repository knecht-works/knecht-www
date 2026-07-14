<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { isActive } = useNavActive()

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

const baseItems = [
  { label: 'Die Idee', to: '/#idee' },
  { label: 'Vorschau', to: '/#dashboard' },
  { label: 'Roadmap', to: '/#roadmap' },
  { label: 'Updates', to: '/#updates' }
]

const items = computed<NavigationMenuItem[]>(() =>
  baseItems.map(item => ({
    ...item,
    active: isActive(item.to),
    class: isActive(item.to) ? 'text-highlighted' : undefined
  }))
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
      <NuxtLink to="/" class="flex items-center">
        <AppLogo class="w-auto shrink-0" />
      </NuxtLink>
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
        label="Beta-Tester werden"
        color="neutral"
        class="hidden lg:flex"
        size="lg"
        to="/#cta"
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
        label="Beta-Tester werden"
        color="neutral"
        block
        size="lg"
        class="mt-4"
        to="/#cta"
      />
    </template>
  </UHeader>
</template>
