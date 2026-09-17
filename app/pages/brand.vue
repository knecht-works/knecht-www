<script setup lang="ts">
const { t } = useI18n()

const items = [
  { key: 'icon', file: 'knecht-icon', light: false },
  { key: 'iconLight', file: 'knecht-icon-light', light: true },
  { key: 'logoDark', file: 'knecht-logo-dark', light: false },
  { key: 'logoLight', file: 'knecht-logo-light', light: true },
  { key: 'mascotRight', file: 'knecht-mascot-looking-right', light: false },
  { key: 'mascotLeft', file: 'knecht-mascot-looking-left', light: false }
]

useSeoMeta({
  title: t('brand.title'),
  description: t('brand.seoDescription')
})

defineOgImage('Knecht', {
  title: t('brand.title'),
  description: t('brand.seoDescription')
})
</script>

<template>
  <div class="container pt-hero">
    <div class="col-span-full">
      <NuxtLinkLocale
        to="/"
        class="inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors hover:text-primary"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        {{ $t('common.home') }}
      </NuxtLinkLocale>

      <h1 class="mt-8 text-balance text-highlighted">
        {{ $t('brand.title') }}
      </h1>

      <p class="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
        {{ $t('brand.description') }}
      </p>

      <UButton
        :label="$t('brand.downloadAll')"
        icon="i-lucide-download"
        color="neutral"
        size="lg"
        class="mt-8"
        to="/assets/brand/knecht-brand.zip"
        external
        download
      />
    </div>

    <ul class="col-span-full mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12">
      <li
        v-for="item in items"
        :key="item.key"
        class="overflow-hidden rounded-xl border border-default bg-card"
      >
        <div
          class="flex aspect-[3/2] items-center justify-center p-10"
          :class="item.light ? 'bg-white' : 'bg-default'"
        >
          <img
            :src="`/assets/brand/${item.file}.svg`"
            :alt="$t(`brand.items.${item.key}`)"
            class="h-full w-full object-contain"
          >
        </div>

        <div class="flex items-center justify-between gap-4 border-t border-default px-4 py-3">
          <span class="font-mono text-sm text-highlighted">
            {{ $t(`brand.items.${item.key}`) }}
          </span>

          <div class="flex gap-2">
            <UButton
              v-for="format in ['svg', 'png']"
              :key="format"
              :label="format.toUpperCase()"
              color="neutral"
              variant="outline"
              size="xs"
              :to="`/assets/brand/${item.file}.${format}`"
              external
              download
            />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
