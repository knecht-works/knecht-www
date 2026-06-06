<script setup lang="ts">
const email = ref('')
const done = ref(false)
const error = ref(false)

const submit = () => {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    error.value = true
    return
  }
  error.value = false
  done.value = true
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

        <div class="relative flex flex-col items-center gap-8 px-4 py-6 text-center lg:flex-row lg:gap-12 lg:p-14 lg:text-left">
          <!-- Mascot -->
          <div class="shrink-0">
            <img
              :src="'/assets/mascotRight.svg'"
              alt=""
              aria-hidden="true"
              width="299"
              height="560"
              loading="lazy"
              class="drop-shadow-mascot h-auto w-36 select-none lg:w-44"
            >
          </div>

          <!-- Content -->
          <div class="flex-1">
            <AppEyebrow label="Warteliste" />

            <h2 class="mt-6 text-balance text-highlighted">
              Sei dabei, bevor's<br>alle haben.
            </h2>

            <p class="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
              Knecht ist noch in Entwicklung. Trag dich ein und du bekommst
              Fortschritts-Updates – und als Agentur oder Freelancer mit mehreren
              Projekten zuerst Zugang zur Beta.
            </p>

            <div
              v-if="done"
              class="mx-auto mt-7 inline-flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 font-mono text-sm text-primary lg:mx-0"
            >
              <AppPulseDot
                color="primary"
                :pulse="false"
              />
              Drin! Du bekommst ab jetzt jedes Update – und den Beta-Zugang als Erste:r.
            </div>

            <template v-else>
              <form
                class="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row lg:mx-0"
                @submit.prevent="submit"
              >
                <UInput
                  v-model="email"
                  type="email"
                  placeholder="dein@team.dev"
                  size="xl"
                  :color="error ? 'error' : 'neutral'"
                  class="flex-1"
                  aria-label="E-Mail-Adresse"
                />
                <UButton
                  type="submit"
                  label="Eintragen"
                  color="neutral"
                  size="xl"
                />
              </form>

              <p
                v-if="error"
                class="mt-2.5 font-mono text-sm text-error"
              >
                Bitte eine gültige E-Mail eingeben.
              </p>
            </template>

            <p class="mt-4 font-mono text-xs text-dimmed">
              Kein Spam · nur Fortschritt · jederzeit abbestellbar
            </p>
          </div>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
