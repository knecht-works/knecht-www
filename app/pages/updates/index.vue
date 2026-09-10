<script setup lang="ts">
const { t } = useI18n()
const { data: updates } = await useUpdates()

const selectedTags = ref<string[]>([])

// Most used tags first, ties sorted alphabetically.
const tags = computed(() => {
  const counts = new Map<string, number>()
  for (const update of updates.value ?? []) {
    if (update.tag) {
      counts.set(update.tag, (counts.get(update.tag) ?? 0) + 1)
    }
  }
  return [...counts.keys()].sort((a, b) =>
    (counts.get(b)! - counts.get(a)!) || a.localeCompare(b))
})

// Tags are OR-combined. An empty selection shows everything.
const filteredUpdates = computed(() => {
  if (selectedTags.value.length === 0) {
    return updates.value ?? []
  }
  return (updates.value ?? []).filter(update => update.tag && selectedTags.value.includes(update.tag))
})

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter(t => t !== tag)
    : [...selectedTags.value, tag]
}

useSeoMeta({
  title: 'Updates',
  description: t('updates.seoDescription')
})

defineOgImage('Knecht', {
  title: 'Updates',
  description: t('updates.seoDescription')
})
</script>

<template>
  <div class="container pt-hero">
    <div class="col-span-full">
      <NuxtLinkLocale
        to="/"
        class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        {{ $t('common.home') }}
      </NuxtLinkLocale>

      <h1 class="mt-8 text-balance text-highlighted">
        {{ $t('updates.title') }}
      </h1>

      <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {{ $t('updates.description') }}
      </p>
    </div>

    <div class="col-span-full mt-8 flex flex-wrap gap-2 lg:mt-10">
      <button
        v-for="tag in tags"
        :key="tag"
        type="button"
        :aria-pressed="selectedTags.includes(tag)"
        class="cursor-pointer rounded-full border px-3 pb-1 pt-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors"
        :class="selectedTags.includes(tag)
          ? 'border-primary/60 bg-primary/10 text-primary'
          : 'border-default text-muted hover:border-primary/40 hover:text-primary'"
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <ol class="col-span-full border-t border-default mt-6">
      <li
        v-for="update in filteredUpdates"
        :key="update.id"
        class="border-b border-default"
      >
        <AppUpdateItem :update="update" />
      </li>
    </ol>
  </div>
</template>
