<script setup lang="ts">
// Latest update articles for the active locale (newest first).
// The full archive lives on /updates.
const { updates: collection, locale } = useContentCollections()

const { data: updates } = await useAsyncData(`home-updates-${locale.value}`, () =>
  queryCollection(collection.value).order('date', 'DESC').limit(4).all()
)
</script>

<template>
  <section
    id="updates"
  >
    <div class="container pt-default ">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow :label="$t('updates.eyebrow')" />

        <h2 class="mt-6 text-balance text-highlighted">
          {{ $t('updates.title') }}
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {{ $t('updates.description') }}
        </p>
      </AppReveal>

      <!-- Timeline -->
      <ol class="col-span-full border-t border-default mt-8 lg:mt-10">
        <AppReveal
          v-for="(update, i) in updates"
          :key="update.id"
          as="li"
          :delay="i * 0.07"
          class="border-b border-default"
        >
          <AppUpdateItem :update="update" />
        </AppReveal>
      </ol>

      <AppReveal class="col-span-full mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <NuxtLinkLocale
          to="/updates"
          class="inline-flex items-center gap-1.5 font-mono text-sm text-primary transition-opacity hover:opacity-70"
        >
          {{ $t('updates.all') }}
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
        </NuxtLinkLocale>
      </AppReveal>
    </div>
  </section>
</template>
