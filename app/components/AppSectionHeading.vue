<script setup lang="ts">
// Every home section opens the same way: h2, optional intro. Keeping it here
// means spacing and type scale change in one place.
defineProps<{
  title: string
  titleAccent?: string
  /** Text that follows the accent when the accent sits mid-sentence. */
  titleAfter?: string
  text?: string
}>()
</script>

<template>
  <div class="col-span-full max-w-2xl">
    <h2 class="text-balance text-highlighted">
      {{ title }}
      <span
        v-if="titleAccent"
        class="text-primary"
      >{{ titleAccent }}</span>
      <template v-if="titleAfter">
        {{ ' ' + titleAfter }}
      </template>
    </h2>

    <p
      v-if="text"
      class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg"
    >
      {{ text }}
    </p>

    <slot />
  </div>
</template>
