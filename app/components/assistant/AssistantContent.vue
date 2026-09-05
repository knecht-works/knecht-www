<script setup lang="ts">
import type { UIMessage } from 'ai'
import { isReasoningUIPart, isTextUIPart } from 'ai'
import { isPartStreaming } from '@nuxt/ui/utils/ai'
import highlight from '@comark/nuxt/plugins/highlight'

defineProps<{
  message: UIMessage
}>()

const plugins = [highlight()]

function getUserTextParts(message: UIMessage) {
  return message.parts.filter((part): part is Extract<UIMessage['parts'][number], { type: 'text' }> =>
    isTextUIPart(part) && part.text.length > 0
  )
}
</script>

<template>
  <div
    v-if="message.role === 'user'"
    class="flex flex-col items-start gap-1.5"
  >
    <div
      v-if="getMessagePagePath(message)"
      class="flex items-center gap-1 w-fit"
    >
      <AppLogoMark class="size-3.5 shrink-0" />
      <span class="text-xs text-muted">{{ getMessagePagePath(message)!.replace(/^\//, '') }}</span>
    </div>

    <p
      v-for="(part, index) in getUserTextParts(message)"
      :key="`${message.id}-text-${index}`"
      class="whitespace-pre-wrap text-sm/6"
    >
      {{ part.text }}
    </p>
  </div>

  <template v-else>
    <template
      v-for="(part, index) in getMergedParts(message.parts)"
      :key="`${message.id}-${part.type}-${index}`"
    >
      <UChatReasoning
        v-if="isReasoningUIPart(part)"
        :text="part.text"
        :streaming="isPartStreaming(part)"
        icon="i-lucide-brain"
        chevron="leading"
      >
        <Markdown
          :value="part.text"
          :streaming="isPartStreaming(part)"
          :caret="isPartStreaming(part) ? ASSISTANT_STREAMING_CARET : false"
          :plugins="plugins"
          class="*:first:mt-0 *:last:mb-0"
        />
      </UChatReasoning>

      <Markdown
        v-else-if="isTextUIPart(part) && part.text.length > 0"
        :value="part.text"
        :streaming="isPartStreaming(part)"
        :caret="isPartStreaming(part) ? ASSISTANT_STREAMING_CARET : false"
        :plugins="plugins"
        class="*:first:mt-0 *:last:mb-0"
      />
    </template>
  </template>
</template>
