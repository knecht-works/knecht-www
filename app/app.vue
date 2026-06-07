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

// Page transitions: native View Transitions API, enabled via
// experimental.viewTransition in nuxt.config. No :transition prop here.
// Scroll-to-top / hash / back-forward is left to Nuxt's default scrollBehavior.
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
