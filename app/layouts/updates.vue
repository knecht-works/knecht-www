<script setup lang="ts">
// Two-column reading layout for update articles: content on the left, a sticky
// table of contents on the right. The layout owns its sidebar data - it reuses
// the page's useAsyncData key, so Nuxt returns the cached document without a
// second query and the TOC is ready before this layout renders.
const route = useRoute()

const { data: update } = await useUpdate(route.path)

const tocLinks = computed(() => update.value?.body?.toc?.links ?? [])

// Full list (newest first) to find the current article's neighbours. Shares the
// 'updates-index' key with the index page, so it is fetched at most once.
const { data: updates } = await useAsyncData('updates-index', () =>
  queryCollection('updates').order('date', 'DESC').all()
)

const nav = computed(() => {
  const list = updates.value ?? []
  const i = list.findIndex(u => u.path === route.path)
  if (i === -1) return { newer: null, older: null }
  // Map to AppUpdateNav's slim link shape (drops the rest of the collection
  // item and the undefined from out-of-range index access).
  const toLink = (item: (typeof list)[number] | undefined) =>
    item ? { path: item.path, title: item.title, description: item.description } : null
  return {
    newer: toLink(list[i - 1]), // next more recent
    older: toLink(list[i + 1]) // next older
  }
})
</script>

<template>
  <AppShell>
    <div class="container pt-hero">
      <div class="col-span-full grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div class="min-w-0">
          <slot />
          <AppUpdateNav
            :newer="nav.newer"
            :older="nav.older"
          />
        </div>

        <aside class="hidden lg:block">
          <div class="sticky top-24">
            <AppToc :links="tocLinks" />
          </div>
        </aside>
      </div>
    </div>
  </AppShell>
</template>
