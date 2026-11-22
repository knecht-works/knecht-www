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
const DANCE_BEAT = 0.45 // seconds per dance pose
const DANCE_BOUNCE = 14 // degrees the knees dip on every beat
const LEG_LENGTH = 2.8 // thigh plus shin in model units, to lower the hips by what the knees bend

// Degrees added to a joint axis (`arm_L.z`), plus `open` (waving hand, 0 to 1) and `bend` (knees).
type Pose = Record<string, number>
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
const add = (pose: Pose, key: string, value: number) => {
  pose[key] = (pose[key] ?? 0) + value
}
const wave = (t: number, pose: Pose) => {
  if (t >= WAVE_DUR) return
  const raised = lift(t)
  add(pose, 'arm_L.z', raised * WAVE_ARM)
  add(pose, 'forearm_L.z', raised * (WAVE_FOREARM + WAVE_SWING * Math.sin((t - 0.5) * WAVE_FREQ)))
  add(pose, 'hand_L.y', raised * WAVE_PALM)
  add(pose, 'hand_L.z', raised * WAVE_WRIST * Math.sin((t - 0.5) * WAVE_FREQ - 0.8))
  add(pose, 'open', raised)
}
const waveMotion: Motion = { dur: WAVE_DUR, at: wave }

const GROOVE: Pose = { 'arm_R.z': -75, 'forearm_R.z': -35, 'arm_L.z': 45, 'torso.z': 6, 'head.z': -6 }
const GROOVE_BACK: Pose = { 'arm_L.z': 75, 'forearm_L.z': 35, 'arm_R.z': -45, 'torso.z': -6, 'head.z': 6 }
const PUMP: Pose = { 'arm_L.z': 80, 'forearm_L.z': 100, 'head.z': 12 }
const CHEER: Pose = { 'arm_L.z': 135, 'forearm_L.z': 20, 'arm_R.z': -135, 'forearm_R.z': -20, 'bend': 12 }
const POINT: Pose = { 'arm_R.z': -125, 'arm_L.z': 25, 'torso.z': 5, 'head.z': -8 }
const DAB: Pose = { 'arm_L.z': 95, 'arm_R.z': -30, 'torso.z': -8, 'head.z': 15 }
const DANCE = [GROOVE, GROOVE_BACK, GROOVE, GROOVE_BACK, PUMP, CHEER, CHEER, POINT, DAB]
const REST: Pose = {}
const dance = (t: number, pose: Pose) => {
  const beat = Math.floor(t / DANCE_BEAT)
  const from = DANCE[beat - 1] ?? REST
  const to = DANCE[beat] ?? REST
  // Poses snap in over the first part of a beat and hold for the rest.
  const u = ease(Math.min(1, (t / DANCE_BEAT - beat) / 0.6))
  for (const key in from) add(pose, key, from[key]! * (1 - u))
  for (const key in to) add(pose, key, to[key]! * u)
  const fade = Math.min(1, t / DANCE_BEAT, (danceMotion.dur - t) / DANCE_BEAT)
  add(pose, 'bend', fade * DANCE_BOUNCE * (0.5 - 0.5 * Math.cos(t / DANCE_BEAT * 2 * Math.PI)))
}
const danceMotion: Motion = { dur: (DANCE.length + 1) * DANCE_BEAT, at: dance }

let boogie = () => {}
const onMascotClick = () => boogie()

onMounted(async () => {
  const box = boxEl.value
  const canvas = canvasEl.value
  if (!box || !canvas) return
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let unmounted = false
  let cleanup = () => {}
  onBeforeUnmount(() => {
    unmounted = true
    boogie = () => {}
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
  const pelvis = mascot.joints.pelvis!
  const pelvisRest = pelvis.position.y
  const posed = Object.entries(mascot.joints)
    .filter(([name]) => name !== 'head')
    .map(([name, joint]) => ({ name, joint, rest: joint.rotation.clone() }))
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
    const pose: Pose = {}
    active = active.filter(a => now - a.t0 < a.motion.dur * 1000)
    for (const a of active) a.motion.at((now - a.t0) / 1000, pose)

    const bend = pose.bend ?? 0
    for (const side of ['L', 'R']) {
      add(pose, `leg_${side}.x`, -bend)
      add(pose, `shin_${side}.x`, 2 * bend)
      add(pose, `foot_${side}.x`, -bend)
    }
    for (const { name, joint, rest } of posed) {
      joint.rotation.set(
        rest.x + (pose[`${name}.x`] ?? 0) * DEG,
        rest.y + (pose[`${name}.y`] ?? 0) * DEG,
        rest.z + (pose[`${name}.z`] ?? 0) * DEG
      )
    }
    head.rotation.set(pitch * DEG, yaw * DEG, (pose['head.z'] ?? 0) * DEG)
    pelvis.position.y = pelvisRest - LEG_LENGTH * (1 - Math.cos(bend * DEG))
    for (const { joint, uncurl } of fingers) joint.rotation.z += (pose.open ?? 0) * uncurl * DEG
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
    boogie = () => {
      if (active.some(a => a.motion === danceMotion)) return
      active = active.filter(a => a.motion !== waveMotion)
      play(danceMotion)
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
        setTimeout(() => play(waveMotion), (INTRO_HOLD + INTRO_TURN) * 1000),
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
