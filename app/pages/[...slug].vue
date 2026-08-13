<script setup lang="ts">
import { withLeadingSlash } from 'ufo'

const route = useRoute()
const { pages, locale } = useContentCollections()
// Route params exclude the locale prefix, so this is the path inside a locale.
const slug = computed(() => Array.isArray(route.params.slug) ? withLeadingSlash(String(route.params.slug.join('/'))) : withLeadingSlash(String(route.params.slug)))

const { data: page } = await useAsyncData('pages-' + route.path, async () => {
  // Content paths carry the locale prefix, so they match the route path.
  const content = await queryCollection(pages.value).path(route.path).first()

  // Fall back to the default locale while a page is not translated yet.
  if (!content && locale.value !== 'en') {
    return await queryCollection('pages_en').path(slug.value).first()
  }

  return content
}, {
  watch: [locale] // Refetch when locale changes
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})

defineOgImage('Knecht', {
  title: page.value.title,
  description: page.value.description
})

const updatedAt = computed(() =>
  page.value?.updatedAt
    ? new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(page.value.updatedAt))
    : null
)
</script>

<template>
  <div
    v-if="page"
    class="container pt-hero"
  >
    <article class="col-span-full">
      <NuxtLinkLocale
        to="/"
        class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        Zur Startseite
      </NuxtLinkLocale>

      <h1 class="mt-8 text-balance text-highlighted">
        {{ page.title }}
      </h1>

      <p
        v-if="updatedAt"
        class="mt-3 font-mono text-xs text-dimmed"
      >
        Zuletzt aktualisiert: {{ updatedAt }}
      </p>

      <div class="mt-6 max-w-(--text-width) richtext">
        <ContentRenderer :value="page" />
      </div>
    </article>
  </div>
</template>
