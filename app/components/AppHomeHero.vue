<script setup lang="ts">
const localePath = useLocalePath()

const headEl = useTemplateRef<HTMLImageElement>('headEl')

const MAX_TILT = 14 // degrees
const MOBILE_TILT_UP = 16 // degrees the head looks up at the top of the page (mobile)
const MOBILE_TILT_DOWN = 16 // degrees the head tilts down after scrolling SCROLL_RANGE
const SCROLL_RANGE = 600 // px of scroll that maps to the full downward tilt
const SHAKE_AMP = 13 // peak shake angle in degrees
const SHAKE_FREQ = 32 // shake speed (rad/s) → ~3 head turns
const SHAKE_DUR = 0.6 // seconds
const GLANCE_DOWN = 15 // degrees the head lowers to look at the content below
const GLANCE_OVERSHOOT = 3 // degrees it swings past neutral on the way back up
const GLANCE_DELAY = 1200 // ms after mount, once the hero intro has settled

// One-shot motions layered on top of the tracked tilt. Each returns the extra
// angle at time t (seconds) and ends after `dur`.
type Overlay = { dur: number, at: (t: number) => number }
const shakeMotion: Overlay = {
  dur: SHAKE_DUR,
  at: t => SHAKE_AMP * Math.sin(t * SHAKE_FREQ) * (1 - t / SHAKE_DUR)
}
// Cubic ease-in-out for the glance segments.
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
// A deliberate glance down at the page, a short hold, then back up with a
// small overshoot before settling.
const glanceMotion: Overlay = {
  dur: 2.0,
  at: keyframed([
    [0, 0],
    [0.55, -GLANCE_DOWN],
    [1.0, -GLANCE_DOWN],
    [1.6, GLANCE_OVERSHOOT],
    [2.0, 0]
  ])
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

  // Greet the visitor once the hero has faded in.
  const glanceTimer = window.setTimeout(() => play(glanceMotion), GLANCE_DELAY)

  let cleanup: () => void

  if (cssTilt) {
    // CSS drives the tilt via the `rotate` property; JS only adds the click
    // shake on top through `transform`. Nothing to wire up here.
    cleanup = () => {}
  } else if (fine) {
    const onMove = (e: MouseEvent) => {
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
    // Snap to the current scroll position on load without animating in.
    curRot = targetRot = rotForScroll()
    el.style.transform = `rotate(${curRot.toFixed(2)}deg)`
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanup = () => window.removeEventListener('scroll', onScroll)
  }

  onBeforeUnmount(() => {
    triggerShake = () => {}
    cleanup()
    window.clearTimeout(glanceTimer)
    cancelAnimationFrame(raf)
  })
})
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="container pt-8 sm:pt-12 lg:pt-18">
      <!-- Content (≈70%) -->
      <div class="col-span-full md:col-span-7">
        <!-- Announcement badge -->
        <AppReveal
          appear
          :delay="0.05"
        >
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
        </AppReveal>

        <AppReveal
          as="h1"
          appear
          :delay="0.13"
          class="mt-7 text-balance text-highlighted mega"
        >
          {{ $t('hero.title') }}
          <span class="block text-primary">{{ $t('hero.titleAccent') }}</span>
        </AppReveal>

        <AppReveal
          as="p"
          appear
          :delay="0.21"
          class="mt-6 max-w-(--text-width) text-base leading-relaxed text-muted sm:text-lg"
        >
          {{ $t('hero.description') }}
        </AppReveal>

        <!-- CTAs -->
        <AppReveal
          appear
          :delay="0.29"
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
            :to="localePath('/#use-cases')"
          />
        </AppReveal>

        <!-- Status pills -->
        <AppReveal
          appear
          :delay="0.37"
          class="mt-9 flex flex-wrap items-center gap-2.5"
        >
          <AppBadge
            dot-color="primary"
            :label="$t('hero.badgeDdev')"
          />
          <AppBadge
            dot-color="orange"
            :label="$t('hero.badgeEu')"
          />
          <AppBadge
            dot-color="violet"
            :label="$t('hero.badgeBeta')"
          />
        </AppReveal>
      </div>

      <!-- Mascot (≈30%) -->
      <AppReveal
        appear
        :delay="0.2"
        :y="24"
        :duration="0.8"
        class="col-span-full max-md:mt-16 md:col-span-4 md:relative md:ml-10"
      >
        <div
          class="relative max-md:mx-auto aspect-[654/1199] w-1/2 cursor-pointer select-none md:absolute md:left-1/2 md:top-1/2 md:h-full md:w-auto md:-translate-x-1/2 md:-translate-y-1/2"
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
            class="mascot-head-scroll absolute inset-0 h-full w-full object-contain will-change-transform"
            style="transform-origin: 49.4% 32.2%"
          >
        </div>
      </AppReveal>
    </div>
  </section>
</template>
