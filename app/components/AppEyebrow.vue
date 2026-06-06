<script setup lang="ts">
withDefaults(defineProps<{
  /** Eyebrow text (alternatively use the default slot). */
  label?: string
  /** Show the leading status dot. */
  dot?: boolean
}>(), {
  dot: true
})
</script>

<template>
  <UBadge
    color="neutral"
    variant="soft"
    size="lg"
    class="gap-2 rounded-full font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted bg-transparent"
  >
    <AppPulseDot
      v-if="dot"
      color="primary"
      :pulse="false"
    />
    <slot>{{ label }}</slot>
  </UBadge>
</template>
