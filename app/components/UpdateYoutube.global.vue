<script setup lang="ts">
// Used from markdown as ::update-youtube{id="..."}. The .global suffix
// registers it for MDC.
const props = defineProps<{
  id: string
  title: string
  caption?: string
}>()

const src = computed(() => `https://www.youtube-nocookie.com/embed/${props.id}`)
</script>

<template>
  <figure class="my-6">
    <iframe
      :src="src"
      :title="title"
      width="1280"
      height="720"
      class="w-full rounded-md border border-default"
      style="aspect-ratio: 16 / 9; height: auto"
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
    <figcaption
      v-if="caption"
      class="mt-2 text-center font-mono text-sm text-muted"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
