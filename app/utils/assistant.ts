import type { UIMessage } from 'ai'
import { isTextUIPart } from 'ai'

export type AssistantMood = 'idle' | 'thinking' | 'happy'

export interface FaqCategory {
  category: string
  items: string[]
}

// Prose overrides for the compact chat column.
export const ASSISTANT_CHAT_THEME = {
  prose: {
    p: { base: 'my-2 text-sm/6' },
    li: { base: 'my-0.5 text-sm/6' },
    ul: { base: 'my-2' },
    ol: { base: 'my-2' },
    h1: { base: 'text-xl mb-4' },
    h2: { base: 'text-lg mt-6 mb-3' },
    h3: { base: 'text-base mt-4 mb-2' },
    h4: { base: 'text-sm mt-3 mb-1.5' },
    code: { base: 'text-xs' },
    pre: { root: 'my-2 max-w-full overflow-x-auto', base: 'text-xs/5' },
    table: { root: 'my-2' },
    hr: { base: 'my-4' }
  }
} as const

export const ASSISTANT_STREAMING_CARET = {
  class: 'inline-block w-2 h-[1em] bg-current align-middle ml-px opacity-80 animate-pulse'
}

// Consecutive text chunks render as one markdown block.
export function getMergedParts(parts: UIMessage['parts']): UIMessage['parts'] {
  const result: UIMessage['parts'] = []
  for (const part of parts) {
    const prev = result[result.length - 1]
    if (isTextUIPart(part) && prev && isTextUIPart(prev)) {
      result[result.length - 1] = { type: 'text', text: prev.text + part.text }
    } else {
      result.push(part)
    }
  }
  return result
}

export function getMessagePagePath(message: UIMessage): string | null {
  const path = (message.metadata as { pagePath?: string } | undefined)?.pagePath
  return typeof path === 'string' && path.length > 0 ? path : null
}
