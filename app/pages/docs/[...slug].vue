<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageHeadline } from '@nuxt/content/utils'

definePageMeta({
  layout: 'docs',
  // /docs itself has no content. The server redirect lives in routeRules,
  // this covers client-side navigation from the header link.
  middleware: (to) => {
    if (to.path === '/docs') {
      // The link checker cannot match catch-all route patterns.
      // eslint-disable-next-line link-checker/valid-route, link-checker/valid-sitemap-link
      return navigateTo('/docs/introduction/introduction', { redirectCode: 301, replace: true })
    }
  }
})

// Docs are English only: no /de/docs routes, the German site links to /docs.
// Registered for 'en' (not disabled entirely) so localePath can resolve docs
// links. Nuxt UI runs every internal link through it, and unresolvable paths
// degrade to plain buttons.
defineI18nRoute({ locales: ['en'] })

const route = useRoute()

const docsNav = inject<Ref<ContentNavigationItem[]>>('docsNavigation', ref([]))
const headline = computed(() => findPageHeadline(docsNav.value, route.path))
const menuOpen = ref(false)
const tocOpen = ref(false)

// The mobile bar only gets a background while it sticks below the header.
const bar = useTemplateRef('bar')
const pinned = usePinned(bar)

// Close the drawers after navigating from them. A TOC link only changes the
// hash and the drawer locks body scroll, so the router's scroll is a no-op.
// Scroll to the heading once the drawer has released the body.
watch(() => route.fullPath, () => {
  menuOpen.value = false
  tocOpen.value = false
})

// The TOC in the drawer mounts on open, after the page hooks ContentToc uses
// to observe the headings have fired. Fire the hook again so the active
// heading is highlighted (same workaround as nuxt.com).
const nuxtApp = useNuxtApp()

function onTocOpen(open: boolean) {
  if (open) {
    nextTick(() => nuxtApp.callHook('page:loading:end'))
  }
}

function onTocAnimationEnd(open: boolean) {
  if (!open && route.hash) {
    document.querySelector(route.hash)?.scrollIntoView()
  }
}

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
  <div v-if="page">
    <!-- Mobile: sticky bar below the header that opens the docs navigation
         and the TOC as drawers, like nuxt.com. Desktop uses the page columns. -->
    <div
      ref="bar"
      class="lg:hidden sticky top-(--ui-header-height) z-10 -mx-(--container-margin-x) outside-container flex items-center justify-between py-3 rounded-b-xl border-b transition-colors"
      :class="pinned ? 'bg-default/95 border-default' : 'border-transparent'"
    >
      <UDrawer
        v-model:open="menuOpen"
        direction="left"
        title="Docs"
        :handle="false"
        :ui="{ content: 'w-full max-w-2/3' }"
      >
        <UButton
          label="Menu"
          icon="i-lucide-text-align-start"
          color="neutral"
          variant="link"
          size="xs"
          aria-label="Open navigation"
          class="font-mono uppercase tracking-widest text-dimmed"
        />
        <template #body>
          <UContentNavigation
            :navigation="docsNav"
            highlight
          />
        </template>
      </UDrawer>

      <UDrawer
        v-if="page.body?.toc?.links?.length"
        v-model:open="tocOpen"
        direction="right"
        :handle="false"
        :ui="{ content: 'w-full max-w-2/3' }"
        @update:open="onTocOpen"
        @animation-end="onTocAnimationEnd"
      >
        <UButton
          label="On this page"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="link"
          size="xs"
          aria-label="Open table of contents"
          class="font-mono uppercase tracking-widest text-dimmed"
        />
        <template #body>
          <UContentToc
            :links="page.body.toc.links"
            title="On this page"
            open
            highlight
            highlight-variant="circuit"
            :ui="{
              root: 'mx-0! px-0! top-0 overflow-visible',
              container: 'pt-0! border-b-0',
              trailingIcon: 'hidden'
            }"
          />
        </template>
      </UDrawer>
    </div>

    <UPage :ui="{ right: 'hidden lg:block' }">
      <UPageHeader
        :title="page.title"
        :description="page.description"
        :headline="headline"
      >
        <template #links>
          <DocsPageLinks :key="page.path" />
        </template>
      </UPageHeader>

      <!-- The footer brings its own top margin, so no bottom padding here. -->
      <UPageBody class="pb-0">
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
          highlight-variant="circuit"
        />
      </template>
    </UPage>
  </div>
</template>
