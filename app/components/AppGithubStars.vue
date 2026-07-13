<script setup lang="ts">
// Star count comes from the cached /api/github proxy via useGithubStats.
// The count area below reserves its space, so the link never changes width.
const stats = useGithubStats()

const formatted = computed(() =>
  stats.value.stars === null
    ? null
    : new Intl.NumberFormat('en', { notation: 'compact' }).format(stats.value.stars)
)
</script>

<template>
  <NuxtLink
    :to="GITHUB_REPO_URL"
    target="_blank"
    aria-label="Knecht auf GitHub"
    class="flex items-center gap-1.5 px-1 text-sm text-muted tabular-nums transition-colors hover:text-highlighted"
  >
    <UIcon
      name="i-simple-icons-github"
      class="size-5"
    />
    <span class="flex items-center gap-0.5">
      <UIcon
        name="i-lucide-star"
        class="size-3.5"
      />
      <span
        class="min-w-[1ch] text-left transition-opacity duration-300"
        :class="formatted ? 'opacity-100' : 'opacity-0'"
      >{{ formatted }}</span>
    </span>
  </NuxtLink>
</template>
