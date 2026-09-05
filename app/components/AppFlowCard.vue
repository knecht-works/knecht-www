<script setup lang="ts">
// One node in the integrations diagram: a trigger (with a source tile) or a
// result (with a small colored icon in front of the title).
defineProps<{
  title: string
  text: string
  /** Renders the 36px source tile on the left. */
  source?: SourceKey
  /** Inline icon before the title, used for results. */
  icon?: string
  /** Color of the inline icon, as a CSS color value. */
  accent?: string
  /** Dashed outline for triggers that are not tool integrations. */
  dashed?: boolean
}>()
</script>

<template>
  <div
    class="flex items-center gap-3.5 rounded-xl border px-4 py-3.5"
    :class="dashed ? 'border-dashed border-accented' : 'border-default bg-elevated'"
  >
    <AppSourceMark
      v-if="source"
      :source="source"
      size="md"
    />

    <div class="min-w-0">
      <div class="flex items-center gap-2 text-[15px] font-semibold text-highlighted">
        <UIcon
          v-if="icon"
          :name="icon"
          class="size-4 shrink-0"
          :style="accent ? { color: accent } : undefined"
        />
        {{ title }}
      </div>
      <div class="mt-1 text-sm leading-snug text-muted">
        {{ text }}
      </div>
    </div>
  </div>
</template>
