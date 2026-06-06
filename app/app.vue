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

const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
  onBeforeEnter() {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }
}
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLayout>
      <NuxtPage
        :transition="pageTransition"
        :page-key="route => route.path"
      />
    </NuxtLayout>
  </UApp>
</template>
