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
          Alle Projekte. <span class="text-primary">Ein Knecht.</span>
        </h2>

        <p class="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Ein erster Blick auf das Dashboard, an dem wir arbeiten: jedes gebootete
          Projekt mit Status auf einen Blick. Design und Funktionen ändern sich
          noch – das ist ein Vorab-Mockup.
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
            <NuxtPicture
              src="/assets/demo.png"
              alt="Knecht Dashboard mit allen gebooteten Projekten und ihrem Status"
              width="1788"
              height="853"
              loading="lazy"
              format="avif,webp"
              sizes="100vw lg:1152px"
              :img-attrs="{ class: 'block w-full' }"
            />
            <!-- fade the screenshot into the panel -->
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ui-bg)] to-transparent" />
          </div>
        </AppBrowserFrame>
      </AppReveal>

      <!-- Stats -->
      <dl class="col-span-full mx-auto mt-8 grid w-full max-w-6xl gap-y-6 sm:grid-cols-3 lg:mt-10">
        <AppReveal
          v-for="(stat, i) in stats"
          :key="stat.value"
          as="div"
          :delay="i * 0.1"
          class="flex flex-col gap-1.5 border-l border-accented px-6"
        >
          <dt class="font-mono text-3xl font-bold tabular-nums tracking-tight text-highlighted">
            {{ stat.value }}
          </dt>
          <dd class="text-sm leading-relaxed text-muted">
            {{ stat.label }}
          </dd>
        </AppReveal>
      </dl>
    </div>
  </section>
</template>
