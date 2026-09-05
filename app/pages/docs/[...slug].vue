<script setup lang="ts">
definePageMeta({
  layout: 'docs',
  // /docs itself has no content. The server redirect lives in routeRules,
  // this covers client-side navigation from the header link.
  middleware: (to) => {
    if (to.path === '/docs') {
      // The link checker cannot match catch-all route patterns.
      // eslint-disable-next-line link-checker/valid-route, link-checker/valid-sitemap-link
      return navigateTo('/docs/getting-started/introduction', { redirectCode: 301, replace: true })
    }
  }
})

// Docs are English only: no /de/docs routes, the German site links to /docs.
// Registered for 'en' (not disabled entirely) so localePath can resolve docs
// links. Nuxt UI runs every internal link through it, and unresolvable paths
// degrade to plain buttons.
defineI18nRoute({ locales: ['en'] })

const route = useRoute()

const { data: page } = await useAsyncData('docs-' + route.path, () =>
  queryCollection('docs_en').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData('docs-surround-' + route.path, () =>
  queryCollectionItemSurroundings('docs_en', route.path, { fields: ['description'] })
)

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})

defineOgImage('Knecht', {
  title: page.value.title,
  description: page.value.description
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
    />

    <UPageBody>
      <ContentRenderer
        :value="page"
        class="richtext"
      />

      <USeparator v-if="surround?.filter(Boolean).length" />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page.body?.toc?.links?.length"
      #right
    >
      <UContentToc
        :links="page.body.toc.links"
        highlight
      />
    </template>
  </UPage>
</template>
