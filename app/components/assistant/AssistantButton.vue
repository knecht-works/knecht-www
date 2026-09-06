<script setup lang="ts">
const { toggle, isOpen } = useAssistant()
</script>

<template>
  <UButton
    icon="i-lucide-sparkles"
    color="neutral"
    variant="ghost"
    :active="isOpen"
    active-variant="soft"
    :aria-label="$t('assistant.ask')"
    :aria-pressed="isOpen"
    active-class="text-highlighted"
    inactive-class="text-muted hover:text-highlighted"
    :ui="{ label: 'hidden xl:inline-flex cursor-pointer' }"
    @click="toggle"
  />
</template>
