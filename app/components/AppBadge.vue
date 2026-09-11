<script setup lang="ts">
type DotColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'orange' | 'violet'

withDefaults(defineProps<{
  label?: string
  dotColor?: DotColor
  dot?: boolean
  pulse?: boolean
  icon?: string
  trailingIcon?: string
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
