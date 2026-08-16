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
// Honeypot, stays empty for real users.
const website = ref('')

const { t } = useI18n()
const localePath = useLocalePath()

const modeItems = computed(() => [
  {
    value: 'beta',
    label: t('cta.modeBeta.label'),
    description: t('cta.modeBeta.description')
  },
  {
    value: 'updates',
    label: t('cta.modeUpdates.label'),
    description: t('cta.modeUpdates.description')
  }
])

const submitLabel = computed(() =>
  mode.value === 'beta' ? t('cta.submitBeta') : t('cta.submitUpdates')
)

const doneMessage = computed(() =>
  mode.value === 'beta' ? t('cta.doneBeta') : t('cta.doneUpdates')
)

const submit = async () => {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    error.value = t('cta.errorInvalid')
    return
  }
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: { email: email.value, mode: mode.value, website: website.value }
    })
    done.value = true
  } catch {
    error.value = t('cta.errorFailed')
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
            <AppEyebrow :label="$t('cta.eyebrow')" />

            <h2 class="mt-6 text-balance text-highlighted">
              {{ $t('cta.title') }}
            </h2>

            <i18n-t
              keypath="cta.description"
              tag="p"
              scope="global"
              class="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg lg:mx-0"
            >
              <template #link>
                <NuxtLink
                  :to="localePath('/updates/beta-tester')"
                  class="text-primary transition-opacity hover:opacity-70"
                >{{ $t('cta.descriptionLink') }}</NuxtLink>
              </template>
            </i18n-t>

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
                  :legend="$t('cta.legend')"
                  :ui="{
                    legend: 'text-sm text-muted mb-2',
                    fieldset: 'grid w-full grid-cols-1 gap-3 sm:grid-cols-2',
                    item: 'cursor-pointer',
                    base: 'cursor-pointer',
                    label: 'cursor-pointer'
                  }"
                />

                <div
                  class="hidden"
                  aria-hidden="true"
                >
                  <input
                    v-model="website"
                    type="text"
                    name="website"
                    tabindex="-1"
                    autocomplete="off"
                  >
                </div>

                <div class="flex w-full flex-col gap-3 sm:flex-row">
                  <UInput
                    v-model="email"
                    type="email"
                    :placeholder="$t('cta.emailPlaceholder')"
                    size="xl"
                    :color="error ? 'error' : 'neutral'"
                    :disabled="loading"
                    class="flex-1"
                    :aria-label="$t('cta.emailAria')"
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
              {{ $t('cta.note') }}
            </p>
          </div>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
