<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const code = computed(() => props.error?.statusCode ?? 500)
const is404 = computed(() => code.value === 404)

const heading = computed(() => is404.value ? 'Seite nicht gefunden' : 'Da ist was schiefgelaufen')
const message = computed(() => is404.value
  ? 'Diese Seite gibt es nicht. Vielleicht ist der Knecht hier noch nicht fertig. Geh zurück zur Startseite.'
  : 'Auf unserer Seite ist ein unerwarteter Fehler aufgetreten. Der Knecht kümmert sich darum, versuch es gleich noch einmal.')

const localePath = useLocalePath()
// No hreflang or canonical on an error page, only the html lang/dir attributes.
const localeHead = useLocaleHead({ seo: false })

// error.vue replaces app.vue entirely, so it must re-apply the global html
// setup - color mode is disabled and the dark class is set manually there.
useHead(() => ({
  htmlAttrs: { ...localeHead.value.htmlAttrs, class: 'dark' },
  meta: [{ key: 'theme-color', name: 'theme-color', content: '#09090b' }]
}))
useSeoMeta({ title: () => `${code.value} – ${heading.value}` })

// clearError tears down the error state before navigating away.
const goHome = () => clearError({ redirect: localePath('/') })
const retry = () => clearError({ redirect: useRoute().fullPath })
</script>

<template>
  <NuxtLayout>
    <section class="relative overflow-hidden">
      <div class="container">
        <AppReveal
          appear
          class="col-span-full flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24"
        >
          <!-- Status code -->
          <p class="text-primary font-mono text-7xl font-bold tracking-tight tabular-nums sm:text-8xl">
            {{ code }}
          </p>

          <h1 class="mt-6 text-balance text-highlighted">
            {{ heading }}
          </h1>

          <p class="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted sm:text-lg">
            {{ message }}
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <UButton
              label="Zur Startseite"
              color="neutral"
              size="lg"
              @click="goHome"
            />
            <UButton
              v-if="!is404"
              label="Erneut versuchen"
              color="neutral"
              variant="outline"
              size="lg"
              @click="retry"
            />
          </div>
        </AppReveal>
      </div>
    </section>
  </NuxtLayout>
</template>
