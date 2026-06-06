<script setup lang="ts">
type DotColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'orange' | 'violet'

withDefaults(defineProps<{
  /** Text shown in the badge (alternatively use the default slot). */
  label?: string
  /** Color of the leading status dot. */
  dotColor?: DotColor
  /** Show the leading status dot. */
  dot?: boolean
  /** Animate (pulse) the dot's color. */
  pulse?: boolean
  /** Optional leading icon, replaces the dot when set. */
  icon?: string
  /** Optional trailing icon. */
  trailingIcon?: string
  /** Render the badge as a link. */
  to?: string
  target?: string
}>(), {
  dotColor: 'primary',
  dot: true,
  pulse: true
})
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'span'"
    :to="to || undefined"
    :target="target"
    class="inline-flex items-center gap-2 rounded-full border border-default bg-white/[0.04] px-3 py-[7px] font-mono text-[12.5px] leading-none text-muted"
    :class="to && 'cursor-pointer transition-colors hover:border-accented hover:bg-white/[0.07]'"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="size-4"
    />
    <AppPulseDot
      v-else-if="dot"
      :color="dotColor"
      :pulse="pulse"
    />

    <slot>{{ label }}</slot>

    <UIcon
      v-if="trailingIcon"
      :name="trailingIcon"
      class="size-4"
    />
  </component>
</template>
