<script setup lang="ts">
type Mode = 'beta' | 'updates'

const email = ref('')
// Beta is the default - active testers + feedback are the primary goal.
// ?signup=updates|beta preselects the mode, e.g. from newsletter teasers.
const route = useRoute()
const signupParam = computed<Mode | null>(() =>
  route.query.signup === 'updates' || route.query.signup === 'beta'
    ? route.query.signup
    : null
)
const mode = ref<Mode>(signupParam.value ?? 'beta')
watch(signupParam, (value) => {
  if (value) mode.value = value
})
const done = ref(false)
const loading = ref(false)
const error = ref('')

const modeItems = [
  {
    value: 'beta',
    label: 'Ich will aktiv mittesten & Feedback geben',
    description: 'Früher Zugang, du gestaltest Knecht direkt mit.'
  },
  {
    value: 'updates',
    label: 'Nur Updates bekommen',
    description: 'Reine Fortschritts-Updates, kein Testen nötig.'
  }
]

const submitLabel = computed(() =>
  mode.value === 'beta' ? 'Beta-Tester werden' : 'Updates abonnieren'
)

const doneMessage = computed(() =>
  mode.value === 'beta'
    ? 'Drin! Du bist Beta-Tester der ersten Stunde, wir melden uns mit mehr Informationen.'
    : 'Drin! Du bekommst ab jetzt jedes Update.'
)

const submit = async () => {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    error.value = 'Bitte eine gültige E-Mail eingeben.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: { email: email.value, mode: mode.value }
    })
    done.value = true
  } catch {
    error.value = 'Hat nicht geklappt, bitte später nochmal versuchen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    id="cta"
  >
    <div class="container pt-default ">
      <AppReveal
        :y="22"
        :duration="0.7"
        class="shadow-panel-lg relative col-span-full overflow-hidden rounded-2xl border border-default bg-gradient-to-br from-white/[0.05] to-white/[0.015]"
      >
        <div class="cta-glow" />

        <div class="relative flex flex-col items-center gap-8 px-4 py-6 lg:flex-row lg:gap-24 lg:p-14">
          <!-- Mascot -->
          <div class="shrink-0">
            <img
              :src="'/assets/mascotRight.svg'"
              alt=""
              aria-hidden="true"
              width="299"
              height="560"
              loading="lazy"
              class="drop-shadow-mascot h-auto w-36 select-none lg:w-44 mx-auto"
            >
          </div>

          <!-- Content -->
          <div class="flex-1">
            <AppEyebrow label="Mitmachen" />

            <h2 class="mt-6 text-balance text-highlighted">
              Bau Knecht mit von Anfang an.
            </h2>

            <p class="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
              Knecht ist noch in Entwicklung. Werde Beta-Tester und gib direkt
              Feedback, oder bleib einfach per Update auf dem Laufenden.
            </p>

            <div
              v-if="done"
              class="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-sm text-primary lg:mx-0"
            >
              <AppPulseDot
                color="primary"
                :pulse="false"
              />
              {{ doneMessage }}
            </div>

            <template v-else>
              <form
                class="mx-auto mt-7 flex w-full max-w-3xl flex-col gap-4 lg:mx-0"
                @submit.prevent="submit"
              >
                <URadioGroup
                  v-model="mode"
                  :items="modeItems"
                  variant="card"
                  color="primary"
                  legend="Wie möchtest du dabei sein?"
                  :ui="{
                    legend: 'text-sm text-muted mb-2',
                    fieldset: 'grid w-full grid-cols-1 gap-3 sm:grid-cols-2'
                  }"
                />

                <div class="flex w-full flex-col gap-3 sm:flex-row">
                  <UInput
                    v-model="email"
                    type="email"
                    placeholder="dein@team.dev"
                    size="xl"
                    :color="error ? 'error' : 'neutral'"
                    :disabled="loading"
                    class="flex-1"
                    aria-label="E-Mail-Adresse"
                  />
                  <UButton
                    type="submit"
                    :label="submitLabel"
                    color="neutral"
                    size="xl"
                    :loading="loading"
                  />
                </div>
              </form>

              <p
                v-if="error"
                class="mt-2.5 font-mono text-sm text-error"
              >
                {{ error }}
              </p>
            </template>

            <p class="mt-4 font-mono text-xs text-dimmed">
              nur Fortschritt · jederzeit abbestellbar
            </p>
          </div>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
