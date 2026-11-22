<script setup lang="ts">
const localePath = useLocalePath()

const boxEl = useTemplateRef<HTMLDivElement>('boxEl')
const canvasEl = useTemplateRef<HTMLCanvasElement>('canvasEl')
const ready = ref(false)

const DEG = Math.PI / 180
const LOOK_YAW = 55 // degrees the neck turns to either side of the body
const LOOK_PITCH = 22 // degrees the head looks up or down
const LOOK_DEPTH = 0.9 // how far in front of the robot the cursor sits, in artwork heights
const HEAD_X = 0.5 // head centre within the artwork box
const HEAD_Y = 0.15
const INTRO_HOLD = 0.4 // seconds the robot keeps looking away after it appears
const INTRO_TURN = 0.9 // seconds the head takes to face the visitor before the wave starts
const INTRO_YAW = 12 // degrees past the body's direction the head turns towards the visitor
const SCROLL_PITCH = 16 // degrees the head looks up at the top of the page and down after SCROLL_RANGE (touch)
const SCROLL_RANGE = 600 // px of scroll that maps to the full pitch range
const WAVE_DUR = 1.9 // seconds
const WAVE_ARM = 100 // degrees the upper arm lifts sideways
const WAVE_FOREARM = 55 // degrees the forearm bends upwards
const WAVE_SWING = 22 // degrees the forearm swings around that bend
const WAVE_FREQ = 9 // rad/s
const WAVE_PALM = 30 // degrees the wrist twists so the palm faces the viewer
const WAVE_WRIST = 18 // degrees the hand swings, trailing the forearm
const WAVE_KNUCKLE = 30 // degrees the fingers uncurl at the knuckle while waving
const WAVE_FINGERTIP = 60 // degrees the fingertips uncurl on top of that

type Pose = { arm: number, forearm: number, palm: number, wrist: number, open: number }
type Motion = { dur: number, at: (t: number, pose: Pose) => void }

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
const keyframed = (frames: [number, number][]) => (t: number) => {
  for (let i = 1; i < frames.length; i++) {
    const [t0, a0] = frames[i - 1]!
    const [t1, a1] = frames[i]!
    if (t <= t1) return a0 + (a1 - a0) * ease((t - t0) / (t1 - t0))
  }
  return frames[frames.length - 1]![1]
}
const lift = keyframed([[0, 0], [0.5, 1], [WAVE_DUR - 0.5, 1], [WAVE_DUR, 0]])
const wave = (t: number, pose: Pose) => {
  if (t >= WAVE_DUR) return
  const raised = lift(t)
  pose.arm += raised * WAVE_ARM
  pose.forearm += raised * (WAVE_FOREARM + WAVE_SWING * Math.sin((t - 0.5) * WAVE_FREQ))
  pose.palm += raised * WAVE_PALM
  pose.open += raised
  pose.wrist += raised * WAVE_WRIST * Math.sin((t - 0.5) * WAVE_FREQ - 0.8)
}
const waveMotion: Motion = { dur: WAVE_DUR, at: wave }
let greet = () => {}
const onMascotClick = () => greet()

onMounted(async () => {
  const box = boxEl.value
  const canvas = canvasEl.value
  if (!box || !canvas) return
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let unmounted = false
  let cleanup = () => {}
  onBeforeUnmount(() => {
    unmounted = true
    greet = () => {}
    cleanup()
  })

  // Imported on demand so three.js stays out of the entry bundle.
  const mascot = await import('~/utils/mascot')
    .then(m => m.createMascot(canvas, '/assets/mascot.glb'))
    .catch(() => null)
  if (!mascot) return
  if (unmounted) {
    mascot.dispose()
    return
  }

  const head = mascot.joints.head!
  const arm = mascot.joints.arm_L!
  const forearm = mascot.joints.forearm_L!
  const armRest = arm.rotation.z
  const hand = mascot.joints.hand_L!
  const handRest = hand.rotation.clone()
  const fingers = Object.entries(mascot.joints)
    .filter(([name]) => name.startsWith('finger_L'))
    .map(([name, joint]) => ({ joint, uncurl: name.endsWith('_tip') ? WAVE_FINGERTIP : WAVE_KNUCKLE }))
  const bodyYaw = mascot.joints.mascot!.rotation.y / DEG
  const restYaw = head.rotation.y / DEG
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  let targetYaw = restYaw
  let targetPitch = 0
  let yaw = restYaw
  let pitch = 0
  let raf = 0
  let running = false
  let active: { motion: Motion, t0: number }[] = []

  const tick = () => {
    yaw += (targetYaw - yaw) * 0.08
    pitch += (targetPitch - pitch) * 0.08

    const now = performance.now()
    const pose: Pose = { arm: 0, forearm: 0, palm: 0, wrist: 0, open: 0 }
    active = active.filter(a => now - a.t0 < a.motion.dur * 1000)
    for (const a of active) a.motion.at((now - a.t0) / 1000, pose)

    head.rotation.set(pitch * DEG, yaw * DEG, 0)
    arm.rotation.z = armRest + pose.arm * DEG
    forearm.rotation.z = pose.forearm * DEG
    hand.rotation.y = handRest.y + pose.palm * DEG
    hand.rotation.z = handRest.z + pose.wrist * DEG
    for (const { joint, uncurl } of fingers) joint.rotation.z = pose.open * uncurl * DEG
    mascot.render()
    ready.value = true

    if (active.length || Math.abs(targetYaw - yaw) > 0.01 || Math.abs(targetPitch - pitch) > 0.01) {
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
  const play = (motion: Motion) => {
    active = active.filter(a => a.motion !== motion)
    active.push({ motion, t0: performance.now() })
    kick()
  }

  if (!still) {
    greet = () => {
      play(waveMotion)
    }
  }

  const resize = new ResizeObserver(() => {
    mascot.setSize(box.clientWidth, box.clientHeight)
    kick()
  })
  resize.observe(box)

  let unlisten = () => {}
  if (still) {
    kick()
  } else if (window.matchMedia('(pointer: fine)').matches) {
    const onMove = (e: MouseEvent) => {
      if (intro) return
      const r = box.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width * HEAD_X)
      const dy = e.clientY - (r.top + r.height * HEAD_Y)
      const depth = r.height * LOOK_DEPTH
      targetYaw = clamp(Math.atan2(dx, depth) / DEG - bodyYaw, -LOOK_YAW, LOOK_YAW)
      targetPitch = clamp(Math.atan2(dy, Math.hypot(dx, depth)) / DEG, -LOOK_PITCH, LOOK_PITCH)
      kick()
    }
    const onLeave = () => {
      targetYaw = restYaw
      targetPitch = 0
      kick()
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    unlisten = () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  } else {
    const onScroll = () => {
      targetPitch = (clamp(window.scrollY / SCROLL_RANGE, 0, 1) * 2 - 1) * SCROLL_PITCH
      kick()
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    unlisten = () => window.removeEventListener('scroll', onScroll)
  }

  let intro = !still
  const timers = still
    ? []
    : [
        setTimeout(() => {
          targetYaw = INTRO_YAW
          kick()
        }, INTRO_HOLD * 1000),
        setTimeout(() => greet(), (INTRO_HOLD + INTRO_TURN) * 1000),
        setTimeout(() => {
          intro = false
        }, (INTRO_HOLD + INTRO_TURN + WAVE_DUR) * 1000)
      ]

  cleanup = () => {
    unlisten()
    timers.forEach(clearTimeout)
    resize.disconnect()
    cancelAnimationFrame(raf)
    mascot.dispose()
  }

  mascot.setSize(box.clientWidth, box.clientHeight)
})
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="container pt-8 sm:pt-12 lg:pt-18 md:pb-16">
      <div class="col-span-full md:col-span-7">
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

        <div
          class="mt-8 flex flex-wrap items-center gap-3"
        >
          <UButton
            :label="$t('hero.ctaPrimary')"
            color="neutral"
            size="lg"
            :to="localePath('/#cta')"
          />
          <UButton
            :label="$t('hero.ctaSecondary')"
            color="neutral"
            variant="outline"
            size="lg"
            to="/docs/get-started/introduction"
          />
        </div>
      </div>

      <div
        class="max-md:hidden md:col-span-5 md:relative md:ml-10"
      >
        <div
          ref="boxEl"
          class="absolute left-1/2 top-0 aspect-[654/1199] h-[calc(100%+4rem)] w-auto -translate-x-1/2 cursor-pointer select-none"
          @click="onMascotClick"
        >
          <img
            src="/assets/mascot.webp"
            :alt="$t('hero.mascotAlt')"
            width="1260"
            height="1584"
            loading="lazy"
            class="drop-shadow-mascot pointer-events-none absolute bottom-0 left-[-30%] h-[120%] w-[175%] max-w-none"
            :class="{ 'opacity-0': ready }"
          >
          <canvas
            ref="canvasEl"
            aria-hidden="true"
            class="drop-shadow-mascot pointer-events-none absolute bottom-0 max-w-none"
            :class="{ 'opacity-0': !ready }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
