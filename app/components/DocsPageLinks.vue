<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const route = useRoute()
const toast = useToast()
const site = useSiteConfig()
const { copy, copied } = useClipboard()
const isCopying = ref(false)

// The raw markdown route comes from @nuxt/content's llms feature.
const rawPath = computed(() => `/raw${route.path}.md`)
const rawUrl = computed(() => `${site.url}${rawPath.value}`)
const prompt = computed(() => encodeURIComponent(`Read ${rawUrl.value} so I can ask questions about it.`))

const items = computed(() => [
  {
    label: 'Copy Markdown link',
    icon: 'i-lucide-link',
    onSelect() {
      copy(rawUrl.value)
      toast.add({ title: 'Copied to clipboard', icon: 'i-lucide-check-circle' })
    }
  },
  {
    label: 'View as Markdown',
    icon: 'i-simple-icons-markdown',
    to: rawPath.value,
    target: '_blank'
  },
  {
    label: 'Open in ChatGPT',
    icon: 'i-simple-icons-openai',
    to: `https://chatgpt.com/?hints=search&q=${prompt.value}`,
    target: '_blank'
  },
  {
    label: 'Open in Claude',
    icon: 'i-simple-icons-anthropic',
    to: `https://claude.ai/new?q=${prompt.value}`,
    target: '_blank'
  }
])

async function copyPage() {
  isCopying.value = true
  copy(await $fetch<string>(rawPath.value))
  isCopying.value = false
}
</script>

<template>
  <UFieldGroup>
    <UButton
      label="Copy page"
      :icon="copied ? 'i-lucide-clipboard-check' : 'i-lucide-clipboard'"
      color="neutral"
      variant="subtle"
      size="sm"
      :loading="isCopying"
      :ui="{ leadingIcon: 'size-3.5' }"
      @click="copyPage"
    />
    <UDropdownMenu
      :items="items"
      size="sm"
      :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
      :ui="{ content: 'w-48' }"
    >
      <UButton
        icon="i-lucide-chevron-down"
        size="sm"
        color="neutral"
        variant="subtle"
        aria-label="Open copy options"
        :ui="{ leadingIcon: 'size-3.5' }"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
