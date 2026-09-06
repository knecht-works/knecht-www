<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { data: navigation } = await useAsyncData('docs-navigation', () => queryCollectionNavigation('docs_en'))

// Strip the synthetic /docs root node so the sections render as top-level groups.
const docsNav = computed<ContentNavigationItem[]>(() => navigation.value?.[0]?.children ?? navigation.value ?? [])

// The docs page renders the same tree in its mobile menu drawer.
provide('docsNavigation', docsNav)
</script>

<template>
  <AppShell :cta="false">
    <div class="mx-auto w-full max-w-(--ui-container) outside-container">
      <UPage>
        <template #left>
          <UPageAside>
            <UContentNavigation
              :navigation="docsNav"
              highlight
            />
          </UPageAside>
        </template>

        <slot />
      </UPage>
    </div>
  </AppShell>
</template>
