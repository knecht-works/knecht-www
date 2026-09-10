<script setup lang="ts">
const localePath = useLocalePath()

const headEl = useTemplateRef<HTMLImageElement>('headEl')

const MAX_TILT = 14 // degrees
const MOBILE_TILT_UP = 16 // degrees the head looks up at the top of the page (mobile)
const MOBILE_TILT_DOWN = 16 // degrees the head tilts down after scrolling SCROLL_RANGE
const SCROLL_RANGE = 600 // px of scroll that maps to the full downward tilt
const SHAKE_AMP = 13 // peak shake angle in degrees
const SHAKE_FREQ = 32 // shake speed (rad/s) → ~3 head turns
const SHAKE_DUR = 0.6 // seconds, click shake
const WAKE_DOWN = 16 // degrees the head hangs while asleep, mirrored by .mascot-head-asleep
const WAKE_HOLD = 1.2 // seconds the head keeps hanging while the hero fades in
const WAKE_UP = 1.9 // seconds at which the head is upright and the shake starts
const WAKE_SHAKE_DUR = 1.3 // seconds, longer than the click shake

// One-shot motions layered on top of the tracked tilt. Each returns the extra
// angle at time t (seconds) and ends after `dur`.
type Overlay = { dur: number, at: (t: number) => number }
// A shake that ramps in briefly and fades out smoothly over `dur` seconds.
const shake = (dur: number) => (t: number) => {
  const rampIn = Math.min(1, t / 0.15)
  const envelope = rampIn * rampIn * (1 - t / dur) ** 2
  return SHAKE_AMP * Math.sin(t * SHAKE_FREQ) * envelope
}
const shakeMotion: Overlay = { dur: SHAKE_DUR, at: shake(SHAKE_DUR) }
// Cubic ease-in-out for the keyframe segments.
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
// Interpolates between keyframes [time, angle] with eased segments.
const keyframed = (frames: [number, number][]) => (t: number) => {
  for (let i = 1; i < frames.length; i++) {
    const [t0, a0] = frames[i - 1]!
    const [t1, a1] = frames[i]!
    if (t <= t1) return a0 + (a1 - a0) * ease((t - t0) / (t1 - t0))
  }
  return frames[frames.length - 1]![1]
}
// Wake-up: the head hangs while the hero fades in, lifts to neutral, then
// shakes itself awake.
const wake = keyframed([
  [0, -WAKE_DOWN],
  [WAKE_HOLD, -WAKE_DOWN],
  [WAKE_UP, 0]
])
const wakeShake = shake(WAKE_SHAKE_DUR)
const wakeMotion: Overlay = {
  dur: WAKE_UP + WAKE_SHAKE_DUR,
  at: t => (t < WAKE_UP ? wake(t) : wakeShake(t - WAKE_UP))
}

let triggerShake = () => {}
const onMascotClick = () => triggerShake()

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const el = headEl.value
  if (reduce || !el) return

  const fine = window.matchMedia('(pointer: fine)').matches
  // On mobile, prefer the CSS scroll-driven tilt (see main.css): it runs on the
  // compositor thread, so the URL bar resizing the viewport never janks it. Only
  // fall back to the JS scroll handler when the browser lacks support.
  const cssTilt = !fine && CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  let targetRot = 0
  let curRot = 0
  let raf = 0
  let running = false
  let overlay: Overlay | null = null
  let overlayT0 = 0

  const tick = () => {
    curRot += (targetRot - curRot) * 0.12

    let extra = 0
    if (overlay) {
      const t = (performance.now() - overlayT0) / 1000
      if (t >= overlay.dur) {
        overlay = null
      } else {
        extra = overlay.at(t)
      }
    }

    el.style.transform = `rotate(${(curRot + extra).toFixed(2)}deg)`
    if (Math.abs(targetRot - curRot) > 0.01 || overlay) {
      raf = requestAnimationFrame(tick)
    } else {
      running = false
    }
  }
  const kick = () => {
    if (!running) {
      running = true
      raf = requestAnimationFrame(tick)
    }
  }

  const play = (motion: Overlay) => {
    overlay = motion
    overlayT0 = performance.now()
    kick()
  }

  triggerShake = () => play(shakeMotion)

  // CSS already renders the head hanging; from here JS owns the pose.
  play(wakeMotion)

  let cleanup: () => void

  if (cssTilt) {
    // CSS drives the tilt via the `rotate` property; JS only adds the click
    // shake on top through `transform`. Nothing to wire up here.
    cleanup = () => {}
  } else if (fine) {
    const onMove = (e: MouseEvent) => {
      // Let the wake-up finish before the head starts following the cursor.
      if (overlay === wakeMotion) return
      const r = el.getBoundingClientRect()
      const dy = e.clientY - (r.top + r.height * 0.322) // cursor offset from the neck pivot
      targetRot = clamp(-dy / 28, -MAX_TILT, MAX_TILT) // mouse lower → head tilts further down
      kick()
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    cleanup = () => window.removeEventListener('mousemove', onMove)
  } else {
    // Look up at the top of the page, then tilt down as the user scrolls.
    const rotForScroll = () => {
      const p = clamp(window.scrollY / SCROLL_RANGE, 0, 1)
      return MOBILE_TILT_UP - p * (MOBILE_TILT_UP + MOBILE_TILT_DOWN)
    }
    const onScroll = () => {
      targetRot = rotForScroll()
      kick()
    }
    // Snap to the current scroll position on load without animating in. The
    // wake-up tick is already running and writes the pose on the next frame.
    curRot = targetRot = rotForScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanup = () => window.removeEventListener('scroll', onScroll)
  }

  onBeforeUnmount(() => {
    triggerShake = () => {}
    cleanup()
    cancelAnimationFrame(raf)
  })
})
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="container pt-8 sm:pt-12 lg:pt-18 md:pb-16">
      <!-- Content (≈70%) -->
      <div class="col-span-full md:col-span-7">
        <!-- Announcement badge -->
        <div>
          <NuxtLinkLocale
            to="/#roadmap"
            class="inline-flex items-center gap-3 rounded-full border border-default bg-elevated py-1.5 pl-3 pr-4 text-sm transition-colors hover:border-accented group"
          >
            <span class="flex items-center gap-2 font-medium text-muted">
              <AppPulseDot color="primary" />
              {{ $t('hero.status') }}
            </span>
            <span class="h-4 w-px bg-border" />
            <span class="flex items-center gap-1.5 font-mono text-muted ">
              {{ $t('hero.roadmapLink') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="w-3 h-3"
              />
            </span>
          </NuxtLinkLocale>
        </div>

        <h1
          class="mt-7 text-balance text-highlighted mega"
        >
          {{ $t('hero.title') }}
          <span class="block text-primary">{{ $t('hero.titleAccent') }}</span>
        </h1>

        <p
          class="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {{ $t('hero.description') }}
        </p>

        <!-- CTAs -->
        <div
          class="mt-8 flex flex-wrap items-center gap-3"
        >
          <UButton
            :label="$t('hero.ctaPrimary')"
            color="neutral"
            size="lg"
            :to="localePath('/?signup=beta#cta')"
          />
          <UButton
            :label="$t('hero.ctaSecondary')"
            color="neutral"
            variant="outline"
            size="lg"
            to="/docs"
          />
        </div>
      </div>

      <!-- Mascot (≈30%) -->
      <div
        class="max-md:hidden md:col-span-5 md:relative md:ml-10"
      >
        <div
          class="absolute left-1/2 top-0 aspect-[654/1199] h-[calc(100%+4rem)] w-auto -translate-x-1/2 cursor-pointer select-none"
          @click="onMascotClick"
        >
          <img
            :src="'/assets/mascotLeft-body.svg'"
            :alt="$t('hero.mascotAlt')"
            width="654"
            height="1199"
            fetchpriority="high"
            class="drop-shadow-mascot absolute inset-0 h-full w-full object-contain"
          >
          <img
            ref="headEl"
            :src="'/assets/mascotLeft-head.svg'"
            alt=""
            aria-hidden="true"
            width="654"
            height="1199"
            fetchpriority="high"
            class="mascot-head-asleep mascot-head-scroll absolute inset-0 h-full w-full object-contain will-change-transform"
            style="transform-origin: 49.4% 32.2%"
          >
        </div>
      </div>
    </div>
  </section>
</template>
