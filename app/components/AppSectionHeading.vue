<script setup lang="ts">
// Every home section opens the same way: eyebrow, h2, optional intro. Keeping it
// here means spacing and type scale change in one place.
defineProps<{
  eyebrow: string
  title: string
  /** Trailing part of the title, rendered in the primary color. */
  titleAccent?: string
  text?: string
  dotColor?: 'primary' | 'discord'
}>()
</script>

<template>
  <AppReveal class="col-span-full max-w-2xl">
    <AppEyebrow
      :label="eyebrow"
      :dot-color="dotColor"
    />

    <h2 class="mt-6 text-balance text-highlighted">
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
