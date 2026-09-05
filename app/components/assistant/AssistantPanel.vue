<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

const {
  isOpen,
  isDockedBreakpoint,
  currentPage,
  pageContextDismissed,
  pendingPrompt
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
      <AppLogo />
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
