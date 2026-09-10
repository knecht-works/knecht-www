<script setup lang="ts">
interface Logo {
  name: string
  url: string
  src: string
  width: number
  height: number
  recolor?: boolean
}

const logos: Logo[] = [
  { name: 'Anwesoft', url: 'https://www.anwesoft.com', src: '/assets/logos/anwesoft-logo.webp', width: 384, height: 100, recolor: true },
  { name: 'Justin Holt', url: 'https://justinholt.com', src: '/assets/logos/justinholt-logo.svg', width: 100, height: 100 },
  { name: 'Samuel Reichör', url: 'https://samuelreichor.at', src: '/assets/logos/sr-logo.svg', width: 544, height: 544 },
  { name: 'More Things Digial', url: 'https://www.morethings.digital/de', src: '/assets/logos/morethingsdigital-logo.svg', width: 100, height: 100 },
]

// Repeat the short list so one half of the track is wider than the viewport.
const track = Array.from({ length: 3 }, () => logos).flat()
</script>

<template>
  <section>
    <AppReveal
      class="container pt-20 sm:pt-24 2xl:pt-28"
      :delay="0.08"
    >
      <div class="col-span-full overflow-hidden mask-x-from-88% mask-x-to-100%">
        <!-- The track is rendered twice so the -50% loop is seamless. -->
        <div class="flex w-max items-center gap-14 py-2 animate-marquee hover:paused motion-reduce:animate-none sm:gap-20">
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
                class="aspect-[3/1] h-10 w-auto object-contain sm:h-11"
                :class="{ 'brightness-0 invert': logo.recolor }"
              >
            </a>
          </template>
        </div>
      </div>
    </AppReveal>
  </section>
</template>
