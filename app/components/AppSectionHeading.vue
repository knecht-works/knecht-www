<script setup lang="ts">
// Every home section opens the same way: h2, optional intro. Keeping it here
// means spacing and type scale change in one place.
defineProps<{
  title: string
  /** Trailing part of the title, rendered in the primary color. */
  titleAccent?: string
  text?: string
}>()
</script>

<template>
  <AppReveal class="col-span-full max-w-2xl">
    <h2 class="text-balance text-highlighted">
      {{ title }}
      <span
        v-if="titleAccent"
        class="text-primary"
      >{{ titleAccent }}</span>
    </h2>

    <p
      v-if="text"
      class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg"
    >
      {{ text }}
    </p>

    <slot />
  </AppReveal>
</template>
