<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const props = defineProps<{
  links: TocLink[]
}>()

// Flatten the nested TOC (h2 with h3 children) into a single ordered list for
// rendering and scrollspy. Depth drives the indentation.
const flat = computed<TocLink[]>(() => {
  const out: TocLink[] = []
  const walk = (items: TocLink[]) => {
    for (const item of items) {
      out.push(item)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(props.links ?? [])
  return out
})

const activeId = ref('')
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  observer?.disconnect()
  if (!import.meta.client || !flat.value.length) return

  const visible = new Set<string>()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id)
        else visible.delete(entry.target.id)
      }
      // Highlight the first heading (in document order) that is on screen.
      const current = flat.value.find(link => visible.has(link.id))
      if (current) activeId.value = current.id
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )

  for (const link of flat.value) {
    const el = document.getElementById(link.id)
    if (el) observer.observe(el)
  }
}

onMounted(setupObserver)
watch(() => props.links, () => nextTick(setupObserver))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav
    v-if="flat.length"
    aria-label="Inhaltsverzeichnis"
  >
    <p class="font-mono text-[11px] uppercase tracking-[0.08em] text-dimmed">
      Auf dieser Seite
    </p>

    <ul class="mt-4 border-l border-default">
      <li
        v-for="link in flat"
        :key="link.id"
      >
        <!-- NuxtLink (not a plain <a>) so the hash click routes through
             vue-router and honors scrollBehaviorType: 'smooth'. -->
        <NuxtLink
          :to="{ hash: `#${link.id}` }"
          class="-ml-px block border-l py-1.5 text-sm leading-snug transition-colors"
          :class="[
            link.depth > 2 ? 'pl-7' : 'pl-4',
            activeId === link.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-highlighted'
          ]"
        >
          {{ link.text }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
