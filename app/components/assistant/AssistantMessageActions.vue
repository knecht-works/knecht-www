<script setup lang="ts">
import type { UIMessage } from 'ai'
import { isTextUIPart } from 'ai'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  message: UIMessage
  streaming?: boolean
  canRegenerate?: boolean
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const { copy, copied } = useClipboard()

const textContent = computed(() => props.message.parts
  .filter(isTextUIPart)
  .map(part => part.text)
  .join('\n')
)
</script>

<template>
  <div
    v-if="!streaming"
    class="flex items-center gap-0.5"
  >
    <UTooltip :text="copied ? $t('assistant.copied') : $t('assistant.copy')">
      <UButton
        :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
        :aria-label="copied ? $t('assistant.copied') : $t('assistant.copyResponse')"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="copy(textContent)"
      />
    </UTooltip>

    <UTooltip
      v-if="canRegenerate"
      :text="$t('assistant.regenerate')"
    >
      <UButton
        icon="i-lucide-rotate-ccw"
        :aria-label="$t('assistant.regenerate')"
        color="neutral"
        variant="ghost"
        size="xs"
        @click="emit('regenerate')"
      />
    </UTooltip>
  </div>
</template>
