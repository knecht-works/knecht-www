<script setup lang="ts">
withDefaults(defineProps<{
  /** Eyebrow text (alternatively use the default slot). */
  label?: string
  /** Show the leading status dot. */
  dot?: boolean
  dotColor?: 'primary' | 'discord'
}>(), {
  dot: true,
  dotColor: 'primary'
})
</script>

<template>
  <UBadge
    color="neutral"
    variant="soft"
    size="lg"
    class="gap-2 rounded-full font-mono text-xs font-medium uppercase tracking-widest text-muted bg-transparent"
  >
    <AppPulseDot
      v-if="dot"
      :color="dotColor"
      :pulse="false"
    />
    <slot>{{ label }}</slot>
  </UBadge>
</template>
