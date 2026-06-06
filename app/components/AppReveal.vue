<script setup lang="ts">
import type { MotionProps } from 'motion-v'

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

const isTouch = ref(false)
onMounted(() => {
  isTouch.value = window.matchMedia('(pointer: coarse)').matches
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
  inViewOptions: { once: true, margin: isTouch.value ? '0px 0px 10% 0px' : '0px 0px -10% 0px' },
  transition: {
    duration: isTouch.value ? Math.min(props.duration, 0.4) : props.duration,
    delay: props.delay,
    ease: [0.22, 1, 0.36, 1]
  }
}))
</script>

<template>
  <!-- @vue-expect-error motion-v's generic <Motion> props type is incompatible
       with vue-tsc; `motionProps` is validated as MotionProps<string> above. -->
  <Motion v-bind="motionProps">
    <slot />
  </Motion>
</template>
