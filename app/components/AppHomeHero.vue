<script setup lang="ts">
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="container pt-8 sm:pt-12 lg:pt-18">
      <!-- Content (≈70%) -->
      <div class="col-span-full md:col-span-7">
        <!-- Announcement badge -->
        <AppReveal
          appear
          :delay="0.05"
        >
          <NuxtLink
            to="#roadmap"
            class="inline-flex items-center gap-3 rounded-full border border-default bg-elevated py-1.5 pl-3 pr-4 text-sm transition-colors hover:border-accented group"
          >
            <span class="flex items-center gap-2 font-medium text-muted">
              <AppPulseDot color="primary" />
              In Entwicklung
            </span>
            <span class="h-4 w-px bg-border" />
            <span class="flex items-center gap-1.5 font-mono text-muted ">
              Roadmap ansehen
              <UIcon
                name="i-lucide-arrow-right"
                class="w-3 h-3"
              />
            </span>
          </NuxtLink>
        </AppReveal>

        <AppReveal
          as="h1"
          appear
          :delay="0.13"
          class="mt-7 text-balance text-highlighted mega"
        >
          Booten. Fixen. Testen.
          <span class="block text-primary">Vollautomatisch.</span>
        </AppReveal>

        <AppReveal
          as="p"
          appear
          :delay="0.21"
          class="mt-6 max-w-(--text-width) text-base leading-relaxed text-muted sm:text-lg"
        >
          Knecht soll jedes DDEV-Projekt als komplett lauffähige Umgebung booten –
          inklusive Datenbank. Agents testen dann gegen die echte App, finden Bugs und
          fixen sie. Wir bauen gerade daran. Sei von Anfang an dabei.
        </AppReveal>

        <!-- CTAs -->
        <AppReveal
          appear
          :delay="0.29"
          class="mt-8 flex flex-wrap items-center gap-3"
        >
          <UButton
            label="Auf die Warteliste"
            color="neutral"
            size="lg"
            to="#cta"
          />
          <UButton
            label="Fortschritt verfolgen"
            color="neutral"
            variant="outline"
            size="lg"
            to="#updates"
          />
        </AppReveal>

        <!-- Status pills -->
        <AppReveal
          appear
          :delay="0.37"
          class="mt-9 flex flex-wrap items-center gap-2.5"
        >
          <AppBadge
            dot-color="primary"
            label="DDEV-nativ"
          />
          <AppBadge
            dot-color="orange"
            label="EU · Self-hosted"
          />
          <AppBadge
            dot-color="violet"
            label="Beta-Plätze offen"
          />
        </AppReveal>
      </div>

      <!-- Mascot (≈30%) -->
      <AppReveal
        appear
        :delay="0.2"
        :y="24"
        :duration="0.8"
        class="col-span-full max-md:mt-16 md:col-span-4 md:relative ml-10"
      >
        <NuxtImg
          src="/assets/mascotLeft.png"
          alt="Knecht – der Roboter-Knecht mit Röhren-TV-Kopf"
          width="299"
          height="560"
          format="webp"
          quality="80"
          densities="1x 2x"
          fetchpriority="high"
          class="drop-shadow-mascot w-1/3 h-auto object-contain md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-auto md:h-full"
        />
      </AppReveal>
    </div>
  </section>
</template>
