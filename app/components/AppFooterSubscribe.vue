<script setup lang="ts">
const email = ref('')
const done = ref(false)
const loading = ref(false)
const error = ref('')
// Honeypot, stays empty for real users.
const website = ref('')

const { t } = useI18n()

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
      body: { email: email.value, mode: 'updates', website: website.value }
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
  <div>
    <p class="text-sm text-muted">
      {{ $t('footer.subscribe.description') }}
    </p>

    <p
      v-if="done"
      class="mt-3 text-sm text-primary"
    >
      {{ $t('footer.subscribe.done') }}
    </p>

    <form
      v-else
      class="mt-3 flex gap-2"
      @submit.prevent="submit"
    >
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
      <UInput
        v-model="email"
        type="email"
        :placeholder="$t('footer.subscribe.placeholder')"
        :aria-label="$t('footer.subscribe.emailLabel')"
        size="md"
        :color="error ? 'error' : 'primary'"
        :disabled="loading"
        class="flex-1"
        autocomplete="email"
      />
      <UButton
        type="submit"
        :label="$t('footer.subscribe.submit')"
        color="neutral"
        size="md"
        :loading="loading"
      />
    </form>
    <p
      v-if="error"
      class="mt-2 font-mono text-xs text-error"
    >
      {{ error }}
    </p>
  </div>
</template>
