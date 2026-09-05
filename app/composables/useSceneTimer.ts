import type { MaybeRefOrGetter } from 'vue'

interface SceneTimerOptions {
  stepMs?: number
  threshold?: number
}

export function useSceneTimer(target: MaybeRefOrGetter<HTMLElement | null | undefined>, { stepMs = 1500, threshold = 0.1 }: SceneTimerOptions = {}) {
  const tick = ref(0)
  const frozen = ref(false)

  onMounted(() => {
    const el = toValue(target)
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frozen.value = true
      return
    }

    let interval = 0
    let inView = false

    const sync = () => {
      const shouldRun = inView && document.visibilityState === 'visible'
      if (shouldRun && !interval) {
        interval = window.setInterval(() => tick.value++, stepMs)
      } else if (!shouldRun && interval) {
        window.clearInterval(interval)
        interval = 0
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting
      sync()
    }, { threshold })
    io.observe(el)
    document.addEventListener('visibilitychange', sync)

    onBeforeUnmount(() => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.clearInterval(interval)
    })
  })

  return { tick, frozen }
}
