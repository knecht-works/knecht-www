<script setup lang="ts">
const { data: updates } = await useAsyncData('updates-index', () =>
  queryCollection('updates').order('date', 'DESC').all()
)

useSeoMeta({
  title: 'Updates',
  description: 'Building in Public, jeder Meilenstein von Knecht wird ehrlich dokumentiert.'
})

defineOgImage('Knecht', {
  title: 'Updates',
  description: 'Building in Public, jeder Meilenstein von Knecht wird ehrlich dokumentiert.'
})
</script>

<template>
  <div class="container pt-hero">
    <div class="col-span-full">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        Zur Startseite
      </NuxtLink>

      <div class="mt-8">
        <AppEyebrow label="Updates" />
      </div>

      <h1 class="mt-6 text-balance text-highlighted">
        Building in Public.
      </h1>

      <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
        Wir bauen Knecht offen für alle. Jeder Meilenstein landet hier.
      </p>
    </div>

    <ol class="col-span-full border-t border-default mt-8 lg:mt-10">
      <li
        v-for="update in updates"
        :key="update.id"
        class="border-b border-default"
      >
        <AppUpdateItem :update="update" />
      </li>
    </ol>
  </div>
</template>
