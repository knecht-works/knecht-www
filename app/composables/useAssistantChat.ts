import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'

// One chat session against /api/assistant. A new instance means a new chat.
export function useAssistantChat(options: { consumePendingPrompt: () => string | null }) {
  const { pageContextEnabled, currentPage } = useAssistant()

  const input = ref('')
  const canSubmit = computed(() => input.value.trim().length > 0)

  function contextPage(): string | null {
    return pageContextEnabled.value && currentPage.value ? currentPage.value : null
  }

  const chat = new Chat({
    transport: new DefaultChatTransport({
      api: '/api/assistant',
      // Resolved per request, so toggling the page context applies immediately.
      body: () => {
        const pagePath = contextPage()
        return pagePath ? { pagePath } : {}
      }
    })
  })

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const pagePath = contextPage()
    chat.sendMessage({
      text: trimmed,
      metadata: pagePath ? { pagePath } : undefined
    })
  }

  function onSubmit() {
    if (!canSubmit.value) return
    const text = input.value
    input.value = ''
    send(text)
  }

  onMounted(() => {
    const pending = options.consumePendingPrompt()
    if (pending) send(pending)
  })

  return { chat, input, canSubmit, send, onSubmit }
}
