<script setup lang="ts">
type DotColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'orange' | 'violet' | 'discord'

const props = withDefaults(defineProps<{
  color?: DotColor
  pulse?: boolean
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
  orange: 'text-accent-orange',
  violet: 'text-accent-violet',
  discord: 'text-accent-discord'
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
      :class="glow && 'shadow-glow'"
    />
  </span>
</template>
