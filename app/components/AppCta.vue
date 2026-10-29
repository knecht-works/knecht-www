<script setup lang="ts">
const email = ref('')
const type = ref<'agency' | 'freelancer'>('agency')
const name = ref('')
const url = ref('')
const hosting = ref<string>()
const stack = ref<string[]>([])
const projects = ref<string>()
const done = ref(false)
const loading = ref(false)
const error = ref('')
// Honeypot, stays empty for real users.
const website = ref('')

const { t } = useI18n()
const localePath = useLocalePath()

const option = (group: string, value: string, key = value) => ({ value, label: t(`cta.details.${group}.${key}`) })
const hostingItems = computed(() => [
  option('hosting', 'managed'),
  option('hosting', 'self-hosted', 'selfHosted'),
  option('hosting', 'unsure')
])
const stackItems = computed(() =>
  ['craft', 'drupal', 'kirby', 'laravel', 'typo3', 'php', 'wordpress', 'shopware', 'node', 'other'].map(value => option('stack', value))
)
const projectItems = computed(() => [
  { value: 'none', label: t('cta.details.projects.none') },
  ...['1-5', '6-20', '21-50', '50+'].map(value => ({ value, label: value }))
])
const typeItems = computed(() => [
  { value: 'agency', label: t('cta.details.type.agency') },
  { value: 'freelancer', label: t('cta.details.type.freelancer') }
])

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
      body: {
        email: email.value,
        mode: 'beta',
        website: website.value,
        type: type.value,
        name: name.value,
        url: url.value,
        hosting: hosting.value,
        stack: stack.value,
        projects: projects.value
      }
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
      <div
        class="shadow-panel-lg relative col-span-full overflow-hidden rounded-2xl border border-default bg-gradient-to-br from-white/[0.05] to-white/[0.015]"
      >
        <div class="cta-glow" />

        <div class="relative flex flex-col items-center gap-8 px-4 py-6 lg:flex-row lg:gap-24 lg:p-14">
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

          <div class="flex-1">
            <h2 class="text-balance text-highlighted">
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
              class="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary lg:mx-0"
            >
              <AppPulseDot
                color="primary"
                :pulse="false"
              />
              {{ $t('cta.done') }}
            </div>

            <template v-else>
              <form
                class="mx-auto mt-7 flex w-full max-w-3xl flex-col gap-3 lg:mx-0"
                @submit.prevent="submit"
              >
                <div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  <UFormField :label="type === 'agency' ? $t('cta.details.name.agencyLabel') : $t('cta.details.name.freelancerLabel')">
                    <UFieldGroup
                      size="xl"
                      class="w-full"
                    >
                      <USelect
                        v-model="type"
                        :items="typeItems"
                        :aria-label="$t('cta.details.type.label')"
                        class="w-32 shrink-0"
                      />
                      <UInput
                        v-model="name"
                        :placeholder="type === 'agency' ? $t('cta.details.name.agencyPlaceholder') : $t('cta.details.name.freelancerPlaceholder')"
                        class="flex-1"
                        :autocomplete="type === 'agency' ? 'organization' : 'name'"
                      />
                    </UFieldGroup>
                  </UFormField>
                  <UFormField :label="$t('cta.details.url.label')">
                    <UInput
                      v-model="url"
                      type="url"
                      :placeholder="$t('cta.details.url.placeholder')"
                      size="xl"
                      class="w-full"
                      autocomplete="url"
                    />
                  </UFormField>
                  <UFormField :label="$t('cta.details.hosting.label')">
                    <USelect
                      v-model="hosting"
                      :items="hostingItems"
                      :placeholder="$t('cta.details.hosting.placeholder')"
                      size="xl"
                      class="w-full"
                    />
                  </UFormField>
                  <UFormField :label="$t('cta.details.projects.label')">
                    <UFieldGroup
                      size="xl"
                      class="w-full"
                    >
                      <USelect
                        v-model="projects"
                        :items="projectItems"
                        :placeholder="$t('cta.details.projects.placeholder')"
                        class="w-32 shrink-0"
                      />
                      <USelect
                        v-model="stack"
                        :items="stackItems"
                        :placeholder="$t('cta.details.stack.placeholder')"
                        multiple
                        class="min-w-0 flex-1"
                        :ui="{ value: 'truncate' }"
                      />
                    </UFieldGroup>
                  </UFormField>
                </div>

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

                <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
                  <UFormField
                    :label="$t('cta.emailLabel')"
                    class="flex-1"
                  >
                    <UInput
                      v-model="email"
                      type="email"
                      :placeholder="$t('cta.emailPlaceholder')"
                      size="xl"
                      :color="error ? 'error' : 'primary'"
                      :disabled="loading"
                      class="w-full"
                      autocomplete="email"
                    />
                  </UFormField>
                  <UButton
                    type="submit"
                    :label="$t('cta.submit')"
                    color="neutral"
                    size="xl"
                    class="h-10 text-sm"
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
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
