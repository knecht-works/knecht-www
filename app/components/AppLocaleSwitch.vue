<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

// Flag trigger with a dropdown. circle-flags ships `lang-*` variants made for
// language pickers, so English is not pinned to a single country's flag.
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const flag = (code: string) => `i-circle-flags-lang-${code}`

const items = computed<DropdownMenuItem[]>(() => locales.value.map(item => ({
  label: item.name ?? item.code,
  icon: flag(item.code),
  to: switchLocalePath(item.code) || localePath('/', item.code),
  locale: false,
  isCurrent: item.code === locale.value,
  class: item.code === locale.value ? 'text-highlighted' : undefined
})))

// The trigger label speaks the language the visitor is currently reading.
const TRIGGER_LABEL: Record<string, string> = {
  en: 'Change language',
  de: 'Sprache wechseln'
}

const triggerLabel = computed(() => TRIGGER_LABEL[locale.value] ?? 'Change language')
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'w-40' }"
  >
    <UButton
      :icon="flag(locale)"
      :aria-label="triggerLabel"
      color="neutral"
      variant="ghost"
      size="sm"
      trailing-icon="i-lucide-chevron-down"
      class="-mt-1.5"
      :ui="{ leadingIcon: 'size-4.5', trailingIcon: 'size-3' }"
    />

    <template #item-trailing="{ item }">
      <UIcon
        v-if="item.isCurrent"
        name="i-lucide-check"
        class="size-4 shrink-0 text-primary"
      />
    </template>
  </UDropdownMenu>
</template>
