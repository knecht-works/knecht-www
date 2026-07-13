<script setup lang="ts">
// Release tag comes from the cached /api/github proxy via useGithubStats.
// Without data the pill simply stays hidden.
const stats = useGithubStats()
const version = computed(() => stats.value.version)
</script>

<template>
  <UButton
    v-if="version"
    :to="`${GITHUB_REPO_URL}/releases/latest`"
    target="_blank"
    :label="version"
    :aria-label="`Aktuelles Release ${version}`"
    color="neutral"
    variant="subtle"
    size="xs"
    class="rounded-full px-2.5 font-mono text-muted"
  />
</template>
