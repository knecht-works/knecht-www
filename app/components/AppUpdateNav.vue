<script setup lang="ts">
// Prev/next navigation between update articles, ordered by date.
// `older` = the next older article, `newer` = the next more recent one. Either
// can be null (oldest article has no older, newest has no newer).
type UpdateLink = {
  path: string
  title: string
  description?: string
} | null

defineProps<{
  newer: UpdateLink
  older: UpdateLink
}>()
</script>

<template>
  <nav
    v-if="newer || older"
    class="mt-12 grid grid-cols-1 gap-4 border-t border-default pt-8 sm:grid-cols-2"
    aria-label="Weitere Updates"
  >
    <NuxtLink
      v-if="newer"
      :to="newer.path"
      class="group flex flex-col gap-1 rounded-xl border border-default bg-muted p-5 transition-colors hover:border-accented"
    >
      <span class="inline-flex items-center gap-1.5 font-mono text-xs text-muted mb-4">
        <UIcon
          name="i-lucide-arrow-left"
          class="size-3.5 transition-transform group-hover:-translate-x-0.5"
        />
        Neueres Update
      </span>
      <span class="text-highlighted transition-colors group-hover:text-primary">
        {{ newer.title }}
      </span>
      <span
        v-if="newer.description"
        class="mt-1 text-sm leading-relaxed text-muted"
      >
        {{ newer.description }}
      </span>
    </NuxtLink>

    <NuxtLink
      v-if="older"
      :to="older.path"
      class="group flex flex-col gap-1 rounded-xl border border-default bg-muted p-5 transition-colors hover:border-accented sm:col-start-2 items-end text-right"
    >
      <span class="inline-flex items-center gap-1.5 font-mono text-xs text-muted mb-4">
        Älteres Update
        <UIcon
          name="i-lucide-arrow-right"
          class="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
      <span class="text-highlighted transition-colors group-hover:text-primary">
        {{ older.title }}
      </span>
      <span
        v-if="older.description"
        class="mt-1 text-sm leading-relaxed text-muted"
      >
        {{ older.description }}
      </span>
    </NuxtLink>
  </nav>
</template>
