<script setup lang="ts">
const route = useRoute()

const { data: update } = await useAsyncData(`update-${route.path}`, () =>
  queryCollection('updates').path(route.path).first()
)

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
  <div
    v-if="update"
    class="container pt-hero"
  >
    <article class="col-span-full">
      <NuxtLink
        to="/#updates"
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
        <span
          v-if="update.tag"
          class="rounded-full border border-primary/30 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.08em] text-primary"
        >
          {{ update.tag }}
        </span>
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

      <!-- Full blog body — styled by Nuxt UI's built-in Prose components. -->
      <div class="mt-10 border-t border-default pt-8 max-w-(--text-width)">
        <ContentRenderer :value="update" />
      </div>
    </article>
  </div>
</template>
