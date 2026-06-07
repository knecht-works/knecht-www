<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  delay?: number
  y?: number
  duration?: number
  appear?: boolean
}>(), {
  as: 'div',
  delay: 0,
  y: 14,
  duration: 0.6,
  appear: false
})

const el = useTemplateRef<HTMLElement>('el')

// `appear` (the above-the-fold hero intro) is driven purely via CSS (see
// main.css). The `motion-ok` flag is set synchronously in <head>, so the CSS
// animation runs at first paint - the content does NOT wait for the JS bundle to
// download and hydrate. These inline custom properties feed the stagger delay,
// distance and duration into that animation.
const appearStyle = computed(() => props.appear
  ? {
      '--reveal-delay': `${props.delay}s`,
      '--reveal-y': `${props.y}px`,
      '--reveal-duration': `${props.duration}s`
    }
  : undefined
)

onMounted(() => {
  // Only the scroll reveal needs JS. `appear` already ran via CSS.
  if (props.appear) return

  const node = el.value
  if (!node) return
  const flags = document.documentElement.classList

  // Scroll reveal: desktop only (flag `reveal-on` = pointer-fine + motion-ok). On
  // touch/mobile we skip it entirely so nothing pops in while scrolling.
  if (!flags.contains('reveal-on')) return

  // Driven via the Web Animations API. This keeps the CSS off the element's
  // `transition`/`transform` - so any Tailwind hover transitions stay intact -
  // and `fill: both` pins the final visible state.
  const reveal = () => node.animate(
    [
      { opacity: 0, transform: `translateY(${props.y}px)` },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    {
      duration: props.duration * 1000,
      delay: props.delay * 1000,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    }
  )

  // Reveal once, when the section comfortably enters the viewport.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      reveal()
      io.disconnect()
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 })
  io.observe(node)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <component
    :is="as"
    ref="el"
    :class="appear ? 'app-reveal-appear' : 'app-reveal-section'"
    :style="appearStyle"
  >
    <slot />
  </component>
</template>
