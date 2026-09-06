<script setup lang="ts">
import type { ContentSurroundLink } from '@nuxt/ui'

const route = useRoute()

const { data: update } = await useUpdate(route.path)

if (!update.value) {
  throw createError({ statusCode: 404, statusMessage: 'Update nicht gefunden', fatal: true })
}

useSeoMeta({
  title: update.value.title,
  description: update.value.description
})

defineOgImage('Knecht', {
  title: update.value.title,
  description: update.value.description
})

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(update.value!.date))
)

const tocLinks = computed(() => update.value?.body?.toc?.links ?? [])

// Full list (newest first) to find the current article's neighbours. Shares its
// key with the index page, so it is fetched at most once.
const { data: updates } = await useUpdates()

// Newer on the left, older on the right, like the docs. A missing neighbour
// stays in the array as a placeholder so the other card keeps its side.
// UContentSurround skips it at runtime, its prop type just does not say so.
const surround = computed(() => {
  const list = updates.value ?? []
  const i = list.findIndex(u => u.path === route.path)
  if (i === -1) return []
  const toLink = (item?: (typeof list)[number]) =>
    item ? { path: item.path, title: item.title, description: item.description } : null
  return [toLink(list[i - 1]), toLink(list[i + 1])] as ContentSurroundLink[]
})
</script>

<template>
  <div class="container pt-hero">
    <!-- UPage owns the two-column reading layout; the tracks are remapped to
         the site's content width and a fixed 15rem TOC column. -->
    <UPage
      class="col-span-full"
      :ui="{
        root: 'lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-x-12',
        center: 'min-w-0 lg:col-span-1',
        // UPage merges these onto the TOC element itself (no wrapper div).
        // self-start keeps it content-sized so its sticky offset can travel.
        right: 'hidden lg:block lg:col-span-1 lg:self-start'
      }"
    >
      <article v-if="update">
        <NuxtLinkLocale
          to="/updates"
          class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="size-4"
          />
          Alle Updates
        </NuxtLinkLocale>

        <div class="mt-8 flex items-center gap-3 font-mono text-sm">
          <span class="text-muted">{{ formattedDate }}</span>
          <AppTag
            v-if="update.tag"
            :label="update.tag"
          />
        </div>

        <h1 class="mt-4 text-balance text-highlighted">
          {{ update.title }}
        </h1>

        <p
          v-if="update.description"
          class="mt-4 text-pretty text-lg leading-relaxed text-muted"
        >
          {{ update.description }}
        </p>

        <!-- Mobile TOC between hero and body; sticks below the header while
             scrolling the article. Desktop renders it in the right column. -->
        <AppToc
          v-if="tocLinks.length"
          :links="tocLinks"
          class="mt-8 lg:hidden"
        />

        <!-- Full blog body - styled by Nuxt UI's built-in Prose components. -->
        <div class="richtext lg:border-t lg:border-default pt-4 lg:mt-8">
          <ContentRenderer :value="update" />
        </div>

        <AppUpdateAbout class="max-w-(--text-width)" />
      </article>

      <template v-if="surround.some(Boolean)">
        <USeparator class="mt-12" />
        <UContentSurround
          :surround="surround"
          class="mt-12"
        />
      </template>

      <template #right>
        <AppToc
          v-if="tocLinks.length"
          :links="tocLinks"
        />
      </template>
    </UPage>
  </div>
</template>
