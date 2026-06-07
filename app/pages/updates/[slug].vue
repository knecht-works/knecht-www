<script setup lang="ts">
definePageMeta({ layout: 'updates' })

const route = useRoute()

const { data: update } = await useUpdate(route.path)

if (!update.value) {
  throw createError({ statusCode: 404, statusMessage: 'Update nicht gefunden', fatal: true })
}

useSeoMeta({
  title: update.value.title,
  description: update.value.description
})

defineOgImage('Knecht', {
  title: update.value.title,
  description: update.value.description
})

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(update.value!.date))
)
</script>

<template>
  <article v-if="update">
    <NuxtLink
      to="/updates"
      class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Alle Updates
    </NuxtLink>

    <div class="mt-8 flex items-center gap-3 font-mono text-sm">
      <span class="text-muted">{{ formattedDate }}</span>
      <AppTag
        v-if="update.tag"
        :label="update.tag"
      />
    </div>

    <h1 class="mt-4 text-balance text-highlighted">
      {{ update.title }}
    </h1>

    <p
      v-if="update.description"
      class="mt-4 text-pretty text-lg leading-relaxed text-muted"
    >
      {{ update.description }}
    </p>

    <!-- Full blog body - styled by Nuxt UI's built-in Prose components.
         Hash-anchor offset is handled globally via html scroll-padding-top. -->
    <div class="richtext mt-8 max-w-(--text-width) border-t border-default pt-4">
      <ContentRenderer :value="update" />
    </div>
  </article>
</template>
