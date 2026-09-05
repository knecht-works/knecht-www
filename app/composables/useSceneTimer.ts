import type { MaybeRefOrGetter } from 'vue'

interface SceneTimerOptions {
  /** Milliseconds per tick. */
  stepMs?: number
  /** Share of the target that has to be visible before the clock runs. */
  threshold?: number
}

/**
 * Clock for an animated scene on the home page. `tick` starts at 0 and increases
 * every `stepMs` while `target` is in the viewport and the tab is visible, so a
 * scene begins when the visitor reaches it and costs nothing while hidden. With
 * reduced motion the clock never starts and `frozen` tells the scene to render
 * its finished state instead.
 */
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
