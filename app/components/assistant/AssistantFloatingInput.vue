<script setup lang="ts">
const { open, isOpen, showFloatingInput } = useAssistant()

const input = ref('')
const isSubmitting = ref(false)
const inputRef = ref<{ inputRef: HTMLInputElement } | null>(null)
let submitTimer: ReturnType<typeof setTimeout> | null = null

// Stays mounted and slides out of view with a CSS transition. A mount and
// unmount animation is not needed then, and nothing can interrupt it.
const hidden = computed(() => !showFloatingInput.value || isSubmitting.value || isOpen.value)

function handleSubmit() {
  if (!input.value.trim()) return

  const message = input.value
  isSubmitting.value = true

  // Let the exit animation play before the panel takes over.
  if (submitTimer) clearTimeout(submitTimer)
  submitTimer = setTimeout(() => {
    submitTimer = null
    open(message)
    input.value = ''
    isSubmitting.value = false
  }, 200)
}

onScopeDispose(() => {
  if (submitTimer) clearTimeout(submitTimer)
})

defineShortcuts({
  meta_i: {
    usingInput: true,
    handler: () => {
      if (hidden.value) return
      inputRef.value?.inputRef?.focus()
    }
  }
})

function onEscape() {
  inputRef.value?.inputRef?.blur()
}
</script>

<template>
  <div
    class="assistant-floating pointer-events-none fixed inset-x-0 z-10 bottom-[max(1.5rem,env(safe-area-inset-bottom))] px-4"
    :class="hidden ? 'assistant-floating--hidden' : 'assistant-floating--visible'"
    :inert="hidden"
  >
    <form
      class="pointer-events-none flex w-full justify-center"
      @submit.prevent="handleSubmit"
    >
      <div class="pointer-events-auto w-full max-w-96">
        <UInput
          ref="inputRef"
          v-model="input"
          :placeholder="$t('assistant.placeholder')"
          size="lg"
          maxlength="1000"
          :ui="{
            root: 'group w-full! min-w-0 sm:max-w-96 transition-all duration-300 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:focus-within:scale-105',
            base: 'bg-default shadow-lg rounded-xl text-base',
            trailing: 'pe-2'
          }"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.escape="onEscape"
        >
          <template #trailing>
            <div class="flex items-center gap-2">
              <div class="hidden sm:flex group-focus-within:hidden items-center gap-1">
                <UKbd value="meta" />
                <UKbd value="I" />
              </div>

              <UButton
                type="submit"
                icon="i-lucide-arrow-up"
                color="primary"
                size="xs"
                :disabled="!input.trim()"
              />
            </div>
          </template>
        </UInput>
      </div>
    </form>
  </div>
</template>

<style scoped>
.assistant-floating {
  will-change: transform, opacity;
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out,
    visibility 0s linear 0.2s;
}

.assistant-floating--visible {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
  transition-delay: 0s;
}

.assistant-floating--hidden {
  transform: translateY(100px);
  opacity: 0;
  visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .assistant-floating { transition: none; }
}
</style>
