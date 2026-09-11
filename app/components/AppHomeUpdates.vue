<script setup lang="ts">
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
      <AppSectionHeading
        :title="$t('updates.title')"
        :text="$t('updates.description')"
      />

      <ol class="col-span-full border-t border-default mt-8 lg:mt-10">
        <li
          v-for="update in updates"
          :key="update.id"
          class="border-b border-default"
        >
          <AppUpdateItem :update="update" />
        </li>
      </ol>

      <div class="col-span-full mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
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
      </div>
    </div>
  </section>
</template>
