<script setup lang="ts">
withDefaults(defineProps<{
  source: SourceKey
  size?: 'sm' | 'md'
}>(), {
  size: 'sm'
})
</script>

<template>
  <span
    class="grid shrink-0 place-items-center"
    :class="[
      SOURCE_META[source].tile,
      size === 'sm' ? 'size-[18px] rounded-[5px]' : 'size-9 rounded-[9px]'
    ]"
  >
    <UIcon
      :name="SOURCE_META[source].icon"
      :class="size === 'sm' ? 'size-3' : 'size-5'"
    />
  </span>
</template>
