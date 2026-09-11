<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

defineProps<{
  links: TocLink[]
}>()

const toc = useTemplateRef('toc')

// ContentToc renders a fragment, so $el is a comment anchor, not the bar
// itself - the actual element is the next element sibling.
const pinned = usePinned(computed(() => {
  const node = (toc.value as { $el?: Element | CharacterData } | null)?.$el
  return node instanceof Element ? node : node?.nextElementSibling
}))
</script>

<template>
  <!-- On lg the bar sticks below the taller desktop header (h-20), hence the
       larger top offset. -->
  <UContentToc
    ref="toc"
    :links="links"
    title="Auf dieser Seite"
    highlight
    highlight-variant="circuit"
    :class="pinned ? 'max-lg:rounded-b-xl! -mx-(--container-margin-x)! outside-container!' : 'bg-transparent!'"
    :ui="{
      root: 'max-lg:bg-default/95 max-lg:border-b max-lg:border-default/95 backdrop-blur-none transition-colors lg:top-24 lg:bg-transparent lg:overflow-visible lg:max-h-none max-lg:mt-4! !mx-0 !px-0',
      container: 'lg:p-0 border-0!',
      trigger: 'font-mono text-xs font-normal uppercase tracking-widest text-dimmed',
      content: 'lg:mt-3'
    }"
  />
</template>
