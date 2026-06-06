<script setup lang="ts">
import type { MotionProps } from 'motion-v'

// Subtle, consistent reveal built on motion-v. Renders AS the given element
// (no extra wrapper node) so it can carry layout classes like `col-span-full`
// directly. Defaults to a scroll-triggered fade-rise; pass `appear` for an
// on-mount entrance (used above the fold in the hero).
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

// Typed as MotionProps so the object (incl. the cubic-bezier `ease` tuple) is
// contextually checked instead of widening — keeps <Motion> strictly typed.
// `<string>` because `as` is a dynamic tag (MotionProps<T> types `as` as T).
const motionProps = computed<MotionProps<string>>(() => ({
  as: props.as,
  initial: { opacity: 0, y: props.y },
  ...(props.appear
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 } }),
  inViewOptions: { once: true, margin: '-80px' },
  transition: { duration: props.duration, delay: props.delay, ease: [0.22, 1, 0.36, 1] }
}))
</script>

<template>
  <!-- @vue-expect-error motion-v's generic <Motion> props type is incompatible
       with vue-tsc; `motionProps` is validated as MotionProps<string> above. -->
  <Motion v-bind="motionProps">
    <slot />
  </Motion>
</template>
