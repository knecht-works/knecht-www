<script setup lang="ts">
// Offers the other language when the browser prefers it, instead of redirecting.
// The check runs after mount, so the prerendered HTML stays identical for every
// visitor and crawlers always get the language that the URL promises.
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Set on dismiss and on following the offer, so the notice stays away for a
// month either way instead of coming back on every visit.
const dismissed = useCookie<boolean>('locale-notice-dismissed', {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax'
})

const preferred = ref<'de' | 'en' | null>(null)

onMounted(() => {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  preferred.value = langs.some(lang => lang.toLowerCase().startsWith('de')) ? 'de' : 'en'
})

const target = computed(() => {
  if (dismissed.value || !preferred.value || preferred.value === locale.value) return null

  const path = switchLocalePath(preferred.value)
  return path ? { locale: preferred.value, path } : null
})

// Written in the language being offered, not in the one currently shown.
const COPY = {
  de: {
    text: 'Diese Seite gibt es auch auf Deutsch.',
    action: 'Auf Deutsch ansehen',
    close: 'Hinweis schließen'
  },
  en: {
    text: 'This page is also available in English.',
    action: 'View in English',
    close: 'Dismiss'
  }
}

const copy = computed(() => target.value ? COPY[target.value.locale] : null)
</script>

<template>
  <div
    v-if="target && copy"
    class="border-b border-default bg-elevated/60"
  >
    <div class="container">
      <div class="col-span-full flex items-center gap-3 py-2.5">
        <p class="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center font-mono text-sm">
          <span class="text-muted">{{ copy.text }}</span>
          <NuxtLink
            :to="target.path"
            class="inline-flex items-center gap-1.5 text-primary transition-opacity hover:opacity-70"
            @click="dismissed = true"
          >
            {{ copy.action }}
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5"
            />
          </NuxtLink>
        </p>

        <button
          type="button"
          :aria-label="copy.close"
          class="shrink-0 text-dimmed transition-colors hover:text-highlighted"
          @click="dismissed = true"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>
      </div>
    </div>
  </div>
</template>
