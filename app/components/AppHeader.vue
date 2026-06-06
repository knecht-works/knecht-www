<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Order matches the on-page scroll order of the sections.
const items: NavigationMenuItem[] = [
  { label: 'Die Idee', to: '#idee' },
  { label: 'Vorschau', to: '#dashboard' },
  { label: 'Roadmap', to: '#roadmap' },
  { label: 'Updates', to: '#updates' }
]

// Transparent at the very top (so the background grid shows through), then a
// muted, blurred bar once the user scrolls a few pixels.
const scrolled = ref(false)
const onScroll = () => {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <UHeader
    mode="slideover"
    :class="[
      'transition duration-300',
      scrolled
        ? 'backdrop-blur-xl border-0'
        : 'bg-transparent backdrop-blur-none border-0'
    ]"
  >
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:flex"
      />
      <UButton
        label="Auf die Warteliste"
        color="neutral"
        class="hidden lg:flex"
        size="lg"
        to="#cta"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
      <UButton
        label="Auf die Warteliste"
        color="neutral"
        block
        class="mt-4"
        to="#cta"
      />
    </template>
  </UHeader>
</template>
