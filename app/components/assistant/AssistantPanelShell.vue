<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })

defineProps<{
  docked: boolean
}>()

// The site header is 5rem tall from lg up, the panel header matches it.
const sidebarUi = {
  container: 'bg-default',
  header: 'min-h-16 lg:min-h-20',
  body: 'p-0 gap-0 overflow-hidden',
  actions: 'gap-0.5'
} as const

const slideoverUi = {
  content: 'w-full max-w-none sm:max-w-96 max-h-svh p-0 flex flex-col',
  body: 'p-0 sm:p-0 gap-0 overflow-hidden',
  header: 'min-h-16 lg:min-h-20 flex items-center gap-1.5 overflow-hidden border-b border-default px-4 sm:px-4',
  wrapper: 'min-w-0 flex-1',
  title: 'text-highlighted font-semibold truncate',
  actions: 'flex items-center gap-1.5 shrink-0 gap-0.5',
  close: ''
} as const
</script>

<template>
  <USidebar
    v-if="docked"
    v-model:open="open"
    side="right"
    rail
    :style="{ '--sidebar-width': '24rem' }"
    :ui="sidebarUi"
  >
    <template #title>
      <slot name="title" />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
    <template #close>
      <slot name="close" />
    </template>
    <slot />
  </USidebar>

  <USlideover
    v-else
    v-model:open="open"
    side="right"
    :ui="slideoverUi"
  >
    <template #title>
      <slot name="title" />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
    <template #close>
      <slot name="close" />
    </template>
    <template #body>
      <slot />
    </template>
  </USlideover>
</template>
