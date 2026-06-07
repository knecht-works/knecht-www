<script setup lang="ts">
const stats = [
  { value: '~40s', label: 'Zielwert: bis ein Projekt komplett gebootet ist' },
  { value: '100%', label: 'echte Datenbank statt Mocks – von Anfang an' },
  { value: '24/7', label: 'Agents sollen testen, während du schläfst' }
]
</script>

<template>
  <section
    id="dashboard"
    class="overflow-hidden"
  >
    <div class="container pt-default ">
      <AppReveal class="col-span-full mx-auto flex max-w-3xl flex-col items-center text-center">
        <!-- Eyebrow -->
        <AppEyebrow label="So wird's aussehen" />

        <h2 class="mt-6 text-balance text-highlighted">
          Viele Projekte. <span class="text-primary">Ein Knecht.</span>
        </h2>

        <p class="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Ein erster Blick auf das Dashboard, an dem wir arbeiten: jedes gebootete
          Projekt mit Status auf einen Blick.
        </p>
      </AppReveal>

      <!-- Browser mockup -->
      <AppReveal
        :delay="0.1"
        :y="22"
        class="col-span-full mx-auto w-full max-w-6xl mt-8 lg:mt-10"
      >
        <AppBrowserFrame>
          <div class="relative">
            <div class="aspect-video flex items-center justify-center">
              <p>Coming Soon</p>
            </div>
            <!-- fade the screenshot into the panel -->
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ui-bg)] to-transparent" />
          </div>
        </AppBrowserFrame>
      </AppReveal>
    </div>
  </section>
</template>
