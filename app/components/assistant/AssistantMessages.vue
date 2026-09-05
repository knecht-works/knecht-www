<script setup lang="ts">
import type { Chat } from '@ai-sdk/vue'
import type { UIMessage } from 'ai'
import type { ChatMessagesProps } from '@nuxt/ui'

const props = defineProps<{
  chat: Chat<UIMessage>
  faqQuestions: FaqCategory[]
}>()

const emit = defineEmits<{
  askQuestion: [question: string]
}>()

function isAssistantPending(message: UIMessage): boolean {
  if (message.role !== 'assistant') return false

  const { status, messages } = props.chat
  if (status !== 'submitted' && status !== 'streaming') return false

  const last = messages.at(-1)
  return last?.role === 'assistant' && message.id === last.id
}

function canRegenerate(message: UIMessage): boolean {
  return message.id === props.chat.messages.at(-1)?.id && props.chat.status === 'ready'
}

// Cast: the prop is typed as Pick<any, ...>, which makes every key required.
const userMessage = { ui: { content: 'min-w-0 w-fit max-w-full' } } as ChatMessagesProps['user']
const assistantMessage = { ui: { body: 'flex-1', actions: 'has-data-[state=open]:opacity-100' } } as ChatMessagesProps['assistant']

const messagesRoot = useTemplateRef<{ $el: HTMLElement }>('messagesRoot')

function scrollMessages(to: 'top' | 'bottom') {
  if (!props.chat.messages.length) return

  let node: HTMLElement | null | undefined = messagesRoot.value?.$el
  while (node && node !== document.documentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) {
      node.scrollTo({ top: to === 'top' ? 0 : node.scrollHeight, behavior: 'smooth' })
      return
    }
    node = node.parentElement
  }
}

defineShortcuts({
  home: { usingInput: true, handler: () => scrollMessages('top') },
  end: { usingInput: true, handler: () => scrollMessages('bottom') }
})
</script>

<template>
  <UTheme :ui="ASSISTANT_CHAT_THEME">
    <UChatMessages
      v-if="chat.messages.length"
      ref="messagesRoot"
      should-auto-scroll
      :messages="chat.messages"
      :status="chat.status"
      compact
      class="gap-2 px-0"
      :user="userMessage"
      :assistant="assistantMessage"
    >
      <template #indicator>
        <AssistantIndicator />
      </template>

      <template #content="{ message }">
        <AssistantContent :message="message" />
      </template>

      <template #actions="{ message }">
        <AssistantMessageActions
          v-if="message.role === 'assistant'"
          :message="message"
          :streaming="isAssistantPending(message)"
          :can-regenerate="canRegenerate(message)"
          @regenerate="chat.regenerate()"
        />
      </template>
    </UChatMessages>

    <div
      v-else
      class="flex flex-col"
    >
      <div class="relative h-48 overflow-hidden rounded-lg mx-1">
        <AssistantShader />
      </div>

      <div class="flex flex-col gap-6 mt-6">
        <UPageLinks
          v-for="category in faqQuestions"
          :key="category.category"
          :title="category.category"
          :links="category.items.map(item => ({ label: item, onClick: () => emit('askQuestion', item) }))"
        />
      </div>
    </div>
  </UTheme>
</template>
