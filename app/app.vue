<script setup lang="ts">
// Emits html lang/dir, hreflang alternates incl. x-default, the locale-aware
// canonical and the og:locale tags. Its canonical overrides the one from
// nuxt-seo-utils, which is registered with a low tag priority.
const localeHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    ...localeHead.value.htmlAttrs,
    class: 'dark'
  },
  link: [...localeHead.value.link ?? []],
  meta: [
    ...localeHead.value.meta ?? [],
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: '#09090b' }
  ]
}))

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
