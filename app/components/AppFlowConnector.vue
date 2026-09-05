<script setup lang="ts">
// Line between two diagram nodes with a dot travelling along it. Horizontal on
// large screens, vertical when the diagram stacks. The dot is hidden entirely
// for reduced motion instead of sitting frozen at the start.
withDefaults(defineProps<{
  accent?: string
  delay?: number
}>(), {
  accent: 'var(--accent-mint)',
  delay: 0
})
</script>

<template>
  <div
    aria-hidden="true"
    class="relative bg-white/8 max-lg:mx-auto max-lg:h-10 max-lg:w-0.5 lg:mx-3 lg:h-0.5"
    :style="{ '--a': accent }"
  >
    <span
      class="absolute size-2 rounded-full bg-[var(--a)] [box-shadow:0_0_10px_var(--a)] motion-reduce:hidden max-lg:-left-[3px] max-lg:animate-[flow-y_2.4s_linear_infinite] lg:-top-[3px] lg:animate-[flow-x_2.4s_linear_infinite]"
      :style="{ animationDelay: `${delay}s` }"
    />
  </div>
</template>
