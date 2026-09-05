<script setup lang="ts">
const {
  isOpen,
  faqQuestions,
  currentPage,
  pageContextDismissed,
  pageContextEnabled,
  consumePendingPrompt,
  mood
} = useAssistant()

const contextPathLabel = computed(() => currentPage.value?.replace(/^\//, '') ?? '')

const { chat, input, canSubmit, send, onSubmit } = useAssistantChat({ consumePendingPrompt })

const isSubmitDisabled = computed(() => chat.status === 'ready' && !canSubmit.value)

watch(() => chat.status, (status) => {
  if (status === 'streaming' || status === 'submitted') mood.value = 'thinking'
  else if (status === 'ready' && chat.messages.length > 0) mood.value = 'happy'
  else mood.value = 'idle'
}, { immediate: true })

const promptRef = useTemplateRef('promptRef')
watch(isOpen, (value) => {
  if (value) {
    nextTick(() => {
      promptRef.value?.textareaRef?.focus()
    })
  }
})
</script>

<template>
  <div class="flex h-full min-h-0 flex-1 flex-col">
    <div class="flex-1 min-h-0 overflow-y-auto p-4">
      <AssistantMessages
        :chat="chat"
        :faq-questions="faqQuestions"
        class="flex flex-col gap-4"
        @ask-question="send"
      />
    </div>

    <div class="flex w-full shrink-0 flex-col border-y border-default">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="pageContextEnabled"
          class="flex items-center gap-2 border-b border-default px-4 py-2.5"
        >
          <div class="min-w-0 flex-1 flex items-center gap-1.5 text-xs">
            <span class="shrink-0 text-dimmed">{{ $t('assistant.usingPage') }}</span>
            <AppLogoMark class="size-3.5 shrink-0" />
            <span
              class="min-w-0 truncate font-medium text-highlighted"
              :title="currentPage ?? undefined"
            >{{ contextPathLabel }}</span>
          </div>
          <UTooltip
            :text="$t('assistant.stopContext')"
            :kbds="['tab']"
          >
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="shrink-0 text-dimmed hover:text-default -m-1"
              :aria-label="$t('assistant.stopContext')"
              @click="pageContextDismissed = true"
            />
          </UTooltip>
        </div>
      </Transition>

      <UChatPrompt
        ref="promptRef"
        v-model="input"
        :error="chat.error"
        :placeholder="$t('assistant.placeholder')"
        variant="naked"
        size="sm"
        :rows="2"
        :maxrows="5"
        autofocus
        :ui="{
          root: 'px-4 pb-2',
          body: 'px-0',
          base: 'px-0 rounded-none',
          footer: 'px-0 items-baseline'
        }"
        @submit="onSubmit"
      >
        <template #footer>
          <div class="flex items-center gap-2 text-xs text-dimmed">
            <UTooltip
              v-if="currentPage && !pageContextEnabled"
              :text="$t('assistant.useContext')"
              :kbds="['tab']"
            >
              <UButton
                type="button"
                icon="i-lucide-file-plus"
                color="neutral"
                variant="ghost"
                size="sm"
                class="-my-1 -mx-1.5 text-dimmed hover:text-default"
                :aria-label="$t('assistant.useContext')"
                @click.stop="pageContextDismissed = false"
              />
            </UTooltip>
          </div>

          <UChatPromptSubmit
            color="neutral"
            size="sm"
            :status="chat.status"
            :disabled="isSubmitDisabled"
            @stop="chat.stop()"
            @reload="chat.regenerate()"
          />
        </template>
      </UChatPrompt>
    </div>
  </div>
</template>
