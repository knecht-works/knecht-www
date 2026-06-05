<script setup lang="ts">
definePageMeta({
  colorMode: 'dark'
})

const { data: page } = await useAsyncData('index', () => queryCollection('content').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const heroTitle = computed(() => {
  const [primary = '', ...secondaryParts] = (page.value?.title ?? '').split('\n')

  return {
    primary,
    secondary: secondaryParts.join(' ').trim()
  }
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      :ui="{
        container: 'relative z-10 lg:py-32',
        wrapper: 'flex flex-col items-center',
        title: 'sm:text-6xl lg:text-7xl tracking-tighter leading-[1.05]',
        description: 'mt-5 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-default',
        links: 'gap-3'
      }"
    >
      <template
        v-if="page.hero.headline"
        #headline
      >
        <UBadge
          color="neutral"
          variant="soft"
          :label="page.hero.headline"
          class="rounded-full px-3 py-1.5 gap-1.5"
        >
          <template #leading>
            <UChip
              inset
              standalone
              :ui="{ base: 'animate-pulse ring-0' }"
            />
          </template>
        </UBadge>
      </template>

      <template #title>
        {{ heroTitle.primary }}
        <br v-if="heroTitle.secondary">
        <span
          v-if="heroTitle.secondary"
          class="text-primary"
        >
          {{ heroTitle.secondary }}
        </span>
      </template>

      <template #description>
        {{ page.description }}
      </template>

      <template #links>
        <UButton
          v-for="link in page.hero.links"
          :key="link.label"
          v-bind="link"
        />
      </template>
    </UPageHero>
  </div>
</template>
