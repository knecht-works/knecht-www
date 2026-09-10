import type { MaybeRefOrGetter } from 'vue'

// Plays a stepped run exactly once, advancing `pos` every `stepMs` until it
// reaches `total`. The first advance comes after the shorter `firstMs`. Only
// one player on the page runs at a time: a card that
// scrolls into view waits until the running one has finished or left the
// viewport. A card that leaves the viewport mid-run pauses and hands over.
// `toggle` pauses or resumes the run by hand and restarts it once finished.
// A run paused by hand stays paused until it is resumed by hand.

interface Player {
  inView: boolean
  paused: boolean
  done: () => boolean
  start: () => void
  stop: () => void
}

interface RunPlayerOptions {
  stepMs?: number
  firstMs?: number
}

// Pause between one run finishing and the next card starting.
const GAP_MS = 1200

// Insertion order is mount order, so the topmost waiting card goes first.
const players = new Set<Player>()
let current: Player | null = null
let cooling = false

function next() {
  if (current || cooling || document.visibilityState !== 'visible') return
  for (const player of players) {
    if (!player.inView || player.paused || player.done()) continue
    current = player
    player.start()
    return
  }
}

function release(player: Player) {
  if (current !== player) return
  player.stop()
  current = null
}

export function useRunPlayer(target: MaybeRefOrGetter<HTMLElement | null | undefined>, total: number, { stepMs = 1500, firstMs = 900 }: RunPlayerOptions = {}) {
  const pos = ref(0)
  const playing = ref(false)
  let player: Player | null = null

  onMounted(() => {
    const el = toValue(target)
    if (!el) return

    // Reduced motion: rest on the finished state, only a click replays.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pos.value = total
    }

    let timer = 0
    const tick = () => {
      pos.value++
      if (player!.done()) {
        release(player!)
        cooling = true
        window.setTimeout(() => {
          cooling = false
          next()
        }, GAP_MS)
      } else {
        timer = window.setTimeout(tick, stepMs)
      }
    }
    player = {
      inView: false,
      paused: false,
      done: () => pos.value >= total,
      start() {
        playing.value = true
        timer = window.setTimeout(tick, firstMs)
      },
      stop() {
        playing.value = false
        window.clearTimeout(timer)
        timer = 0
      }
    }
    players.add(player)

    // A card counts as in view once it reaches the upper 60% of the viewport.
    const io = new IntersectionObserver(([entry]) => {
      player!.inView = !!entry?.isIntersecting
      if (!player!.inView) release(player!)
      next()
    }, { rootMargin: '0px 0px -40% 0px' })
    io.observe(el)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') next()
      else if (current) release(current)
    }
    document.addEventListener('visibilitychange', onVisibility)

    onBeforeUnmount(() => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      release(player!)
      players.delete(player!)
      player = null
      next()
    })
  })

  function toggle() {
    if (!player) return
    if (playing.value) {
      player.paused = true
      release(player)
      return
    }
    if (player.done()) pos.value = 0
    player.paused = false
    // A manual start takes over from whichever card is running.
    if (current) release(current)
    current = player
    player.start()
  }

  return { pos, playing, toggle }
}
