<script setup lang="ts">
// Latest update articles from the `updates` content collection (newest first).
// The full archive lives on /updates.
const { data: updates } = await useAsyncData('home-updates', () =>
  queryCollection('updates').order('date', 'DESC').limit(4).all()
)
</script>

<template>
  <section
    id="updates"
  >
    <div class="container pt-default ">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="Updates" />

        <h2 class="mt-6 text-balance text-highlighted">
          Building in Public.
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Wir bauen Knecht offen. Jeder Meilenstein landet hier – kein Marketing,
          nur ehrlicher Fortschritt.
        </p>
      </AppReveal>

      <!-- Timeline -->
      <ol class="col-span-full border-t border-default mt-8 lg:mt-10">
        <AppReveal
          v-for="(update, i) in updates"
          :key="update.id"
          as="li"
          :delay="i * 0.07"
          class="border-b border-default"
        >
          <AppUpdateItem :update="update" />
        </AppReveal>
      </ol>

      <AppReveal class="col-span-full mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <NuxtLink
          to="/updates"
          class="inline-flex items-center gap-1.5 font-mono text-sm text-primary transition-opacity hover:opacity-70"
        >
          Alle Updates ansehen
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
        </NuxtLink>
      </AppReveal>
    </div>
  </section>
</template>
