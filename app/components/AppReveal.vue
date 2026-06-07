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

onMounted(() => {
  const node = el.value
  if (!node) return
  const flags = document.documentElement.classList

  // One reveal, driven entirely via the Web Animations API. This keeps the CSS off
  // the element's `transition`/`transform` - so any Tailwind hover transitions
  // (e.g. `translate`, border, shadow) on the same element stay intact - and is
  // robust to the stylesheet load order (Vite injects CSS as JS in dev). The
  // element only starts hidden via CSS (opacity:0); `fill: both` holds opacity:0
  // through the (stagger) delay and pins the final visible state.
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

  // `appear` = on-load intro (hero). Runs on every non-reduced-motion device
  // (flag `motion-ok`), incl. mobile - it's above-the-fold and on-load, so there's
  // no scroll jank.
  if (props.appear) {
    if (flags.contains('motion-ok')) reveal()
    return
  }

  // Scroll reveal: desktop only (flag `reveal-on` = pointer-fine + motion-ok). On
  // touch/mobile we skip it entirely so nothing pops in while scrolling.
  if (!flags.contains('reveal-on')) return

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
  >
    <slot />
  </component>
</template>
