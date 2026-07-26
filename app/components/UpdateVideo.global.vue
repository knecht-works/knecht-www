<script setup lang="ts">
// Demo video for update posts, used from markdown as ::update-video{src="..."}.
// The .global suffix registers it for MDC. Plays as a muted loop, but only
// while visible in the viewport; native controls appear on hover (or first
// tap on touch devices).
defineProps<{
  src: string
  caption?: string
  poster?: string
}>()

const video = ref<HTMLVideoElement | null>(null)
const showControls = ref(false)

let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!video.value) return
  observer = new IntersectionObserver(([entry]) => {
    const el = video.value
    if (!el) return
    // play() returns a promise that rejects when autoplay is blocked.
    if (entry.isIntersecting) el.play().catch(() => {})
    else el.pause()
  }, { threshold: 0.4 })
  observer.observe(video.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <figure class="my-6">
    <video
      ref="video"
      :src="src"
      :poster="poster"
      :controls="showControls"
      loop
      muted
      playsinline
      preload="metadata"
      class="w-full rounded-md border border-default"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
      @touchstart.passive="showControls = true"
    />
    <figcaption
      v-if="caption"
      class="mt-2 text-center font-mono text-sm text-muted"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
