<script setup lang="ts">
// The home page is a pure Vue composition - no markdown collection backing it.
const title = 'Booten. Fixen. Testen. Vollautomatisch.'
const description = 'Knecht ist ein Dashboard auf deinem eigenen Server für '
  + 'Agenturen mit vielen DDEV-Projekten. Er bootet jedes Projekt als '
  + 'lauffähige Umgebung, erledigt Aufgaben in Workflows und '
  + 'liefert fertige Pull Requests mit Preview.'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('Knecht', { title, description })
</script>

<template>
  <div>
    <AppHomeHero />
    <AppHomeInfo />
    <AppHomeUseCase />
    <AppHomeDemo />
    <AppHomeProgress />
    <AppHomeUpdates />
  </div>
</template>
