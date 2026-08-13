<script setup lang="ts">
// The home page is a pure Vue composition - no markdown collection backing it.
const { t } = useI18n()
const title = t('site.title')
const description = t('site.description')

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
    <AppHomeUseCase />
    <AppHomeProgress />
    <AppHomeUpdates />
  </div>
</template>
