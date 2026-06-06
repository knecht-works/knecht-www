<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: '#09090b' }
  ],
  htmlAttrs: {
    lang: 'de',
    class: 'dark'
  }
})

useSeoMeta({
  twitterCard: 'summary_large_image'
})

defineOgImage('Knecht')
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
