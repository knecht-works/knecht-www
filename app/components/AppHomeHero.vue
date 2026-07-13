<script setup lang="ts">
const headEl = useTemplateRef<HTMLImageElement>('headEl')

const MAX_TILT = 14 // degrees
const MOBILE_TILT_UP = 16 // degrees the head looks up at the top of the page (mobile)
const MOBILE_TILT_DOWN = 16 // degrees the head tilts down after scrolling SCROLL_RANGE
const SCROLL_RANGE = 600 // px of scroll that maps to the full downward tilt
const SHAKE_AMP = 13 // peak shake angle in degrees
const SHAKE_FREQ = 32 // shake speed (rad/s) → ~3 head turns
const SHAKE_DUR = 0.6 // seconds
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
  let shakeT0 = 0
  let shaking = false

  const tick = () => {
    curRot += (targetRot - curRot) * 0.12

    // Damped "no" shake layered on top of the tracked tilt.
    let shake = 0
    if (shaking) {
      const t = (performance.now() - shakeT0) / 1000
      if (t >= SHAKE_DUR) {
        shaking = false
      } else {
        shake = SHAKE_AMP * Math.sin(t * SHAKE_FREQ) * (1 - t / SHAKE_DUR)
      }
    }

    el.style.transform = `rotate(${(curRot + shake).toFixed(2)}deg)`
    if (Math.abs(targetRot - curRot) > 0.01 || shaking) {
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

  triggerShake = () => {
    shakeT0 = performance.now()
    shaking = true
    kick()
  }

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
          <NuxtLink
            to="/#roadmap"
            class="inline-flex items-center gap-3 rounded-full border border-default bg-elevated py-1.5 pl-3 pr-4 text-sm transition-colors hover:border-accented group"
          >
            <span class="flex items-center gap-2 font-medium text-muted">
              <AppPulseDot color="primary" />
              In Entwicklung
            </span>
            <span class="h-4 w-px bg-border" />
            <span class="flex items-center gap-1.5 font-mono text-muted ">
              Roadmap ansehen
              <UIcon
                name="i-lucide-arrow-right"
                class="w-3 h-3"
              />
            </span>
          </NuxtLink>
        </AppReveal>

        <AppReveal
          as="h1"
          appear
          :delay="0.13"
          class="mt-7 text-balance text-highlighted mega"
        >
          Booten. Fixen. Testen.
          <span class="block text-primary">Vollautomatisch.</span>
        </AppReveal>

        <AppReveal
          as="p"
          appear
          :delay="0.21"
          class="mt-6 max-w-(--text-width) text-base leading-relaxed text-muted sm:text-lg"
        >
          Knecht ist ein Dashboard auf deinem Server, gebaut für Agenturen mit vielen DDEV-Projekten. Er bootet jedes Projekt als komplett lauffähige Umgebung, erledigt Aufgaben und liefert fertige Pull Requests mit Preview.
        </AppReveal>

        <!-- CTAs -->
        <AppReveal
          appear
          :delay="0.29"
          class="mt-8 flex flex-wrap items-center gap-3"
        >
          <UButton
            label="Beta-Tester werden"
            color="neutral"
            size="lg"
            to="/#cta"
          />
          <UButton
            label="Fortschritt verfolgen"
            color="neutral"
            variant="outline"
            size="lg"
            to="/#updates"
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
            label="DDEV-nativ"
          />
          <AppBadge
            dot-color="orange"
            label="EU · Self-hostable"
          />
          <AppBadge
            dot-color="violet"
            label="Beta-Plätze offen"
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
            alt="Knecht – der Roboter-Knecht mit Röhren-TV-Kopf"
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
