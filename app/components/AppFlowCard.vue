<script setup lang="ts">
defineProps<{
  title: string
  text: string
  source?: SourceKey
  icon?: string
  tileClass?: string
  dashed?: boolean
}>()
</script>

<template>
  <div
    class="flex items-center gap-3.5 rounded-xl border px-4 py-3.5"
    :class="dashed ? 'border-dashed border-accented' : 'border-white/6 bg-card'"
  >
    <AppSourceMark
      v-if="source"
      :source="source"
      size="md"
    />
    <span
      v-else-if="icon"
      class="grid size-9 shrink-0 place-items-center rounded-lg"
      :class="tileClass"
    >
      <UIcon
        :name="icon"
        class="size-5"
      />
    </span>

    <div class="min-w-0">
      <div class="font-semibold text-highlighted">
        {{ title }}
      </div>
      <div class="mt-1 text-sm leading-snug text-muted">
        {{ text }}
      </div>
    </div>
  </div>
</template>
