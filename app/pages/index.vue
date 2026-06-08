<script setup lang="ts">
// The home page is a pure Vue composition - no markdown collection backing it.
const title = 'Booten. Fixen. Testen. Vollautomatisch.'
const description = 'Knecht bootet jedes DDEV-Projekt als komplett lauffähige '
  + 'Umgebung. Agents testen gegen die echte App, finden '
  + 'Bugs und fixen sie.'

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
    <AppHomeDemo />
    <AppHomeProgress />
    <AppHomeUpdates />
  </div>
</template>
