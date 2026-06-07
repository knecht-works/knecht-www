<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { isActive } = useNavActive()

const baseItems = [
  { label: 'Die Idee', to: '/#idee' },
  { label: 'Vorschau', to: '/#dashboard' },
  { label: 'Roadmap', to: '/#roadmap' },
  { label: 'Updates', to: '/#updates' }
]

// Active item is highlighted to match the hover state (text-highlighted).
const items = computed<NavigationMenuItem[]>(() =>
  baseItems.map(item => ({
    ...item,
    active: isActive(item.to),
    class: isActive(item.to) ? 'text-highlighted' : undefined
  }))
)

// Mobile slideover open state. We control it so a tap always closes the menu.
// UHeader's built-in auto-close only fires when route.fullPath changes, so
// tapping a link to the section you are already on (same fullPath) left the menu
// stuck open and looked like "nothing happens".
const open = ref(false)

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
    v-model:open="open"
    mode="slideover"
    :menu="{ transition: false }"
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
        label="Beta-Tester werden"
        color="neutral"
        class="hidden lg:flex"
        size="lg"
        to="#cta"
      />
    </template>

    <template #body>
      <!-- Close on any tap inside the menu, even when the link target equals the
           current fullPath (UHeader's auto-close would not fire then). -->
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
        @click="open = false"
      />
      <UButton
        label="Beta-Tester werden"
        color="neutral"
        block
        class="mt-4"
        to="#cta"
        @click="open = false"
      />
    </template>
  </UHeader>
</template>
