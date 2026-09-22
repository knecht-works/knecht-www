<script setup lang="ts">
const props = defineProps<{
  filename: string
}>()

const root = useTemplateRef('root')

function download() {
  const code = root.value?.querySelector('pre')?.textContent ?? ''
  const url = URL.createObjectURL(new Blob([code], { type: 'application/yaml' }))
  const link = document.createElement('a')
  link.href = url
  link.download = props.filename
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    ref="root"
    class="my-5 [&_button]:cursor-pointer [&_pre]:rounded-t-none [&>div]:my-0"
  >
    <div class="flex items-center gap-1.5 rounded-t-md border border-b-0 border-default bg-default py-2 ps-4 pe-2">
      <UIcon
        name="i-lucide-file-code"
        class="size-4 shrink-0 text-muted"
      />
      <span class="text-sm/6 text-default">{{ filename }}</span>
      <UButton
        icon="i-lucide-download"
        label="Download"
        color="neutral"
        variant="ghost"
        size="sm"
        class="ms-auto"
        @click="download"
      />
    </div>
    <slot />
  </div>
</template>
