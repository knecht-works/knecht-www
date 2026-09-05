<script setup lang="ts">
const { toggle, isOpen, isDockedBreakpoint } = useAssistant()

// The docked sidebar has its own close control, so the header button leaves.
// The overlay keeps it as the toggle.
const isDockedOpen = computed(() => isOpen.value && isDockedBreakpoint.value)
</script>

<template>
  <UButton
    v-if="!isDockedOpen"
    icon="i-lucide-sparkles"
    color="neutral"
    variant="ghost"
    :active="isOpen"
    active-variant="soft"
    :label="$t('assistant.ask')"
    :aria-label="$t('assistant.ask')"
    :aria-pressed="isOpen"
    active-class="text-highlighted"
    inactive-class="text-muted hover:text-highlighted"
    :ui="{ label: 'hidden xl:inline-flex' }"
    @click="toggle"
  />
</template>
