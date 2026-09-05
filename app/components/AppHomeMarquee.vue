<script setup lang="ts">
interface Logo {
  name: string
  url: string
  src: string
  width: number
  height: number
  /** Raster logos are forced to white, the SVGs are already styled. */
  recolor?: boolean
}

const logos: Logo[] = [
  { name: 'Anwesoft', url: 'https://www.anwesoft.com', src: '/assets/logos/anwesoft-logo.webp', width: 384, height: 100, recolor: true },
  { name: 'Justin Holt', url: 'https://justinholt.com', src: '/assets/logos/justinholt-logo.svg', width: 100, height: 100 },
  { name: 'Samuel Reichör', url: 'https://samuelreichor.at', src: '/assets/logos/sr-logo.svg', width: 544, height: 544 }
]

// Repeat the short list so one half of the track is wider than the viewport.
const track = Array.from({ length: 3 }, () => logos).flat()
</script>

<template>
  <section>
    <div class="container pt-16 sm:pt-20">
      <div class="col-span-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <!-- The track is rendered twice so the -50% loop is seamless. -->
        <div class="flex w-max items-center gap-12 py-2 animate-[marquee_36s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none sm:gap-16">
          <template
            v-for="pass in 2"
            :key="pass"
          >
            <a
              v-for="(logo, index) in track"
              :key="`${pass}-${index}`"
              :href="logo.url"
              target="_blank"
              rel="noopener"
              :tabindex="pass === 1 && index < logos.length ? undefined : -1"
              :aria-hidden="pass === 2 || index >= logos.length ? 'true' : undefined"
              class="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            >
              <img
                :src="logo.src"
                :alt="logo.name"
                :width="logo.width"
                :height="logo.height"
                loading="lazy"
                class="h-7 w-auto sm:h-8"
                :class="{ 'brightness-0 invert': logo.recolor }"
              >
            </a>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
