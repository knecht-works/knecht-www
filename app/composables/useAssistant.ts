import { useMediaQuery } from '@vueuse/core'

// Pages the assistant can use as context. Index pages carry no useful context.
const CONTEXT_PAGE_PREFIXES = ['/docs/', '/updates/', '/de/updates/']
// Sections that show the floating "ask anything" input.
const FLOATING_INPUT_SECTIONS = ['/docs', '/updates', '/de/updates']

// Shared assistant state. Components in the header, the floating input and
// the panel all read from and write to the same refs.
export function useAssistant() {
  const route = useRoute()
  const { tm, rt } = useI18n()

  const isOpen = useState('assistant-open', () => false)
  const pendingPrompt = useState<string | null>('assistant-pending-prompt', () => null)
  const mood = useState<AssistantMood>('assistant-mood', () => 'idle')
  const pageContextDismissed = useState('assistant-context-dismissed', () => false)

  const currentPage = computed(() => {
    const path = route.path
    return CONTEXT_PAGE_PREFIXES.some(prefix => path.startsWith(prefix)) ? path : null
  })
  const pageContextEnabled = computed(() => Boolean(currentPage.value) && !pageContextDismissed.value)

  const showFloatingInput = computed(() =>
    FLOATING_INPUT_SECTIONS.some(section => route.path === section || route.path.startsWith(`${section}/`))
  )

  const isDockedBreakpoint = useMediaQuery('(min-width: 1280px)')

  const faqQuestions = computed<FaqCategory[]>(() => {
    const categories = tm('assistant.faq') as { category: string, items: string[] }[]
    return categories.map(category => ({
      category: rt(category.category),
      items: category.items.map(item => rt(item))
    }))
  })

  function consumePendingPrompt(): string | null {
    const value = pendingPrompt.value
    pendingPrompt.value = null
    return value
  }

  function open(initialMessage?: string) {
    if (initialMessage) pendingPrompt.value = initialMessage
    isOpen.value = true
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    open,
    toggle,
    pendingPrompt,
    consumePendingPrompt,
    mood,
    currentPage,
    pageContextDismissed,
    pageContextEnabled,
    showFloatingInput,
    isDockedBreakpoint,
    faqQuestions
  }
}
