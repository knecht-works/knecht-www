<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const {
  isOpen,
  isDockedBreakpoint,
  currentPage,
  pageContextDismissed,
  pendingPrompt,
  mood
} = useAssistant()
const route = useRoute()

// Remounting the chat with a new key starts a fresh conversation.
const chatKey = ref(0)

function startNewChat() {
  chatKey.value++
}

watch(pendingPrompt, (prompt) => {
  if (prompt) startNewChat()
})

watch(() => route.path, () => {
  pageContextDismissed.value = false
})

// The open state survives reloads and navigation.
const storedOpen = useLocalStorage('assistant-open', false)
onMounted(() => {
  isOpen.value = storedOpen.value
})
watch(isOpen, (value) => {
  storedOpen.value = value
})

defineShortcuts({
  meta_i: {
    handler: () => {
      isOpen.value = !isOpen.value
    },
    usingInput: true
  },
  meta_o: {
    handler: () => {
      if (!isOpen.value) return
      startNewChat()
    },
    usingInput: true
  },
  tab: {
    handler: () => {
      if (!isOpen.value || !currentPage.value) return
      pageContextDismissed.value = !pageContextDismissed.value
    },
    usingInput: true
  }
})
</script>

<template>
  <AssistantPanelShell
    v-model:open="isOpen"
    :docked="isDockedBreakpoint"
  >
    <template #title>
      <span class="inline-flex items-center gap-2 min-w-0">
        <span class="assistant-pop-in inline-flex">
          <AssistantIcon
            class="size-5 shrink-0"
            :mood="mood"
          />
        </span>
        <span class="truncate">{{ $t('assistant.name') }}</span>
        <UBadge
          variant="subtle"
          size="sm"
          class="shrink-0"
        >
          {{ $t('assistant.beta') }}
        </UBadge>
      </span>
    </template>

    <template #actions>
      <UTooltip
        :text="$t('assistant.newChat')"
        :kbds="['meta', 'O']"
      >
        <UButton
          icon="i-lucide-plus"
          color="neutral"
          variant="ghost"
          :aria-label="$t('assistant.newChat')"
          @click="startNewChat"
        />
      </UTooltip>
    </template>

    <template #close>
      <UTooltip
        :text="$t('assistant.close')"
        :kbds="['meta', 'I']"
      >
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          :aria-label="$t('assistant.close')"
          @click="isOpen = false"
        />
      </UTooltip>
    </template>

    <AssistantPanelChat :key="chatKey" />
  </AssistantPanelShell>
</template>

<style scoped>
.assistant-pop-in {
  animation: assistant-pop-in 0.3s ease-out 0.1s both;
}

@media (prefers-reduced-motion: reduce) {
  .assistant-pop-in { animation: none; }
}

@keyframes assistant-pop-in {
  from { opacity: 0; transform: scale(0.5); filter: blur(4px); }
  to { opacity: 1; transform: scale(1); filter: blur(0); }
}
</style>
