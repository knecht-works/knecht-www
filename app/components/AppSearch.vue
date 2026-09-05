<script setup lang="ts">
// Cmd+K search over the docs. UContentSearchButton (in the header) and this
// component share their open state through Nuxt UI's useContentSearch.
const { data: files } = useLazyAsyncData(
  'docs-search-sections',
  () => queryCollectionSearchSections('docs_en'),
  { server: false }
)

// Own key: the docs layout fetches the same navigation server-side under
// 'docs-navigation', and reusing a key with different options would clash.
const { data: navigation } = useLazyAsyncData(
  'docs-navigation-client',
  () => queryCollectionNavigation('docs_en'),
  { server: false }
)

// Strip the synthetic /docs root node so sections show as top-level groups.
const docsNav = computed(() => navigation.value?.[0]?.children ?? navigation.value ?? [])
</script>

<template>
  <ClientOnly>
    <LazyUContentSearch
      :files="files ?? []"
      :navigation="docsNav"
      :color-mode="false"
      :fuse="{ resultLimit: 30 }"
    />
  </ClientOnly>
</template>
