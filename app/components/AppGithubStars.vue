<script setup lang="ts">
// The site is prerendered, so the star count is fetched client-side.
// localStorage makes revisits render the count instantly, and the count
// area below reserves its space, so the button never changes width.
const stars = ref<number | null>(null)

const formatted = computed(() =>
  stars.value === null
    ? null
    : new Intl.NumberFormat('en', { notation: 'compact' }).format(stars.value)
)

onMounted(async () => {
  const cached = localStorage.getItem('gh-stars')
  if (cached !== null && !Number.isNaN(Number(cached))) {
    stars.value = Number(cached)
  }

  try {
    const repo = await $fetch<{ stargazers_count: number }>(
      `https://api.github.com/repos/${GITHUB_REPO}`
    )
    stars.value = repo.stargazers_count
    localStorage.setItem('gh-stars', String(repo.stargazers_count))
  } catch {
    // Rate limit or offline: the link still works without a count.
  }
})
</script>

<template>
  <UButton
    :to="GITHUB_REPO_URL"
    target="_blank"
    color="neutral"
    variant="subtle"
    size="lg"
    icon="i-simple-icons-github"
    aria-label="Knecht auf GitHub"
    :ui="{ base: 'px-3.5' }"
  >
    <span class="flex items-center gap-1 text-muted tabular-nums">
      <UIcon
        name="i-lucide-star"
        class="size-3.5"
      />
      <span
        class="min-w-[2ch] text-left transition-opacity duration-300"
        :class="formatted ? 'opacity-100' : 'opacity-0'"
      >{{ formatted }}</span>
    </span>
  </UButton>
</template>
