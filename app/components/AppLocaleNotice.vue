<script setup lang="ts">
// Offers the other language when the browser prefers it, instead of redirecting.
// The check runs after mount, so the prerendered HTML stays identical for every
// visitor and crawlers always get the language that the URL promises.
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Set on dismiss and on following the offer, so the notice stays away either way.
const dismissed = useCookie<boolean>('locale-notice-dismissed', {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax'
})

const preferred = ref<'de' | 'en' | null>(null)

onMounted(() => {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  preferred.value = langs.some(lang => lang.toLowerCase().startsWith('de')) ? 'de' : 'en'
})

const route = useRoute()

// Content routes only count as translated when the other locale's collection
// holds the counterpart. Static routes (home, updates index) always exist.
const counterpartCollection = (to: 'de' | 'en') => {
  const name = String(route.name ?? '').replace(/___\w+$/, '')
  if (name === 'slug') return `pages_${to}` as const
  if (name === 'updates-slug') return `updates_${to}` as const
  return null
}

const counterpart = ref<{ locale: 'de' | 'en', path: string } | null>(null)

watch([preferred, () => route.path], async ([to, current]) => {
  counterpart.value = null
  // Docs exist in English only, the German site links straight to them.
  if (!to || to === locale.value || current.startsWith('/docs')) return

  const path = switchLocalePath(to)
  if (!path) return

  const collection = counterpartCollection(to)
  if (collection && !(await queryCollection(collection).path(path).first())) return
  // Ignore a result that arrives after navigating on.
  if (route.path !== current) return

  counterpart.value = { locale: to, path }
}, { immediate: true })

const target = computed(() => dismissed.value ? null : counterpart.value)

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
