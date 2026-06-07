<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Minimal header to isolate the mobile nav bug: no custom mode, no active-state,
// no scroll/backdrop logic. Plain UHeader defaults + plain anchor items.
const items: NavigationMenuItem[] = [
  { label: 'Die Idee', to: '/#idee' },
  { label: 'Vorschau', to: '/#dashboard' },
  { label: 'Roadmap', to: '/#roadmap' },
  { label: 'Updates', to: '/#updates' }
]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        color="neutral"
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
        to="#cta"
      />
    </template>
  </UHeader>
</template>
