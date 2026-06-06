<script setup lang="ts">
type DotColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'orange' | 'violet'

const props = withDefaults(defineProps<{
  color?: DotColor
  pulse?: boolean
  /** Soft colored glow around the dot (matches the reference look). */
  glow?: boolean
}>(), {
  color: 'primary',
  pulse: true,
  glow: true
})

const colorClass = computed(() => ({
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-muted',
  // Mascot accents (match the reference dot palette).
  orange: 'text-[var(--accent-orange)]',
  violet: 'text-[var(--accent-violet)]'
}[props.color]))
</script>

<template>
  <span :class="['relative flex size-1.5 shrink-0', colorClass]">
    <span
      v-if="pulse"
      class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-40"
    />
    <span
      class="relative inline-flex size-1.5 rounded-full bg-current"
      :class="glow && '[box-shadow:0_0_8px_currentColor]'"
    />
  </span>
</template>
