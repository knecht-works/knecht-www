<script setup lang="ts">
// Line between two diagram nodes with a dot travelling along it. Horizontal on
// large screens, vertical when the diagram stacks. The dot is hidden entirely
// for reduced motion instead of sitting frozen at the start.
withDefaults(defineProps<{
  accent?: 'mint' | 'orange'
  delay?: number
}>(), {
  accent: 'mint',
  delay: 0
})
</script>

<template>
  <div
    aria-hidden="true"
    class="relative bg-white/8 max-lg:mx-auto max-lg:h-10 max-lg:w-0.5 lg:mx-3 lg:h-0.5"
  >
    <span
      class="absolute size-2 rounded-full bg-current shadow-glow motion-reduce:hidden max-lg:-left-0.75 max-lg:animate-flow-y lg:-top-0.75 lg:animate-flow-x"
      :class="accent === 'orange' ? 'text-accent-orange' : 'text-accent-mint'"
      :style="{ animationDelay: `${delay}s` }"
    />
  </div>
</template>
