<script setup lang="ts">
defineProps<{
  /** Tag text (alternatively use the default slot). */
  label?: string
}>()
</script>

<template>
  <span class="rounded-full border border-primary/30 px-2.5 pb-0.5 pt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-primary">
    <slot>{{ label }}</slot>
  </span>
</template>
