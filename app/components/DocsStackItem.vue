<script setup lang="ts">
defineProps<{
  icon: string
  to?: string
}>()
</script>

<template>
  <component
    :is="to ? 'a' : 'div'"
    :href="to"
    :target="to ? '_blank' : undefined"
    :rel="to ? 'noopener noreferrer' : undefined"
    class="flex items-center gap-2 rounded-full border border-default bg-elevated px-3 py-1.5 text-sm text-highlighted"
    :class="to ? 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors' : ''"
  >
    <UIcon :name="icon" class="size-4 shrink-0" />
    <slot mdc-unwrap="p" />
  </component>
</template>
