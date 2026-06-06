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

  // `appear` = on-load intro (hero). Runs on every device that isn't reduced-motion
  // (flag `motion-ok`), incl. mobile — it's above-the-fold and on-load, so there's
  // no scroll jank. Driven via the Web Animations API instead of the CSS-class
  // transition: it fires right after mount, which can race the stylesheet (Vite
  // injects CSS as JS in dev, so the transition gets skipped). WAAPI animates
  // deterministically regardless of when the CSS lands; `fill:both` holds opacity:0
  // through the stagger delay and pins the final visible state.
  if (props.appear) {
    if (!flags.contains('motion-ok')) return
    node.animate(
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
    return
  }

  // Scroll reveal: desktop only (flag `reveal-on` = pointer-fine + motion-ok). On
  // touch/mobile we skip it entirely so nothing pops in while scrolling.
  if (!flags.contains('reveal-on')) return

  // Flip once, when the section comfortably enters the viewport.
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
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
    :style="{
      '--reveal-y': `${y}px`,
      '--reveal-duration': `${duration}s`,
      '--reveal-delay': `${delay}s`
    }"
  >
    <slot />
  </component>
</template>
