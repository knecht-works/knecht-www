<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`page-${route.path}`, () =>
  queryCollection('pages').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Seite nicht gefunden', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})

defineOgImage('Knecht', {
  title: page.value.title,
  description: page.value.description
})

const updatedAt = computed(() =>
  page.value?.updatedAt
    ? new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(page.value.updatedAt))
    : null
)
</script>

<template>
  <div
    v-if="page"
    class="container pt-hero"
  >
    <article class="col-span-full">
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

      <h1 class="mt-8 text-balance text-highlighted">
        {{ page.title }}
      </h1>

      <p
        v-if="updatedAt"
        class="mt-3 font-mono text-xs text-dimmed"
      >
        Zuletzt aktualisiert: {{ updatedAt }}
      </p>

      <div class="mt-6 max-w-(--text-width)">
        <ContentRenderer :value="page" />
      </div>
    </article>
  </div>
</template>
