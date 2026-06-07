<script setup lang="ts">
import { animate, inView } from 'motion-v'

const progress = 10

// Bar fill + percentage count up together from a single value, kicked off the
// first time the panel scrolls into view (jumps straight to the target when the
// visitor prefers reduced motion).
const displayed = ref(0)
const barEl = useTemplateRef<HTMLElement>('barEl')

onMounted(() => {
  if (!barEl.value) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    displayed.value = progress
    return
  }

  const stop = inView(barEl.value, () => {
    animate(0, progress, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1], // fast start, long slow ease-out (easeOutExpo)
      onUpdate: v => (displayed.value = v)
    })
    stop?.() // fill once, then stop observing
  }, { amount: 0.6 })

  onBeforeUnmount(() => stop?.())
})

type Status = 'done' | 'progress' | 'rest'

// Per-status presentation: done = green, progress = orange, rest = dark.
// Everything else about a card is fixed; only this (color/icon) varies.
const statusMeta: Record<Status, { label: string, dot: 'primary' | 'orange' | 'neutral', pulse: boolean, text: string, icon?: string }> = {
  done: { label: 'Fertig', dot: 'primary', pulse: false, text: 'text-primary', icon: 'i-lucide-check' },
  progress: { label: 'In Arbeit', dot: 'orange', pulse: true, text: 'text-[var(--accent-orange)]' },
  rest: { label: 'Geplant', dot: 'neutral', pulse: false, text: 'text-dimmed' }
}

const phases: { status: Status, title: string, text: string }[] = [
  {
    status: 'done',
    title: 'Idee Validierung',
    text: 'Idee ist in einem vereinfachten Umfang validiert und funktioniert.'
  },
  {
    status: 'done',
    title: 'Branding & Organisation',
    text: 'Name, Logo, Branding Website, Social Media und alles drum herum wurde erstellt.'
  },
  {
    status: 'done',
    title: 'Tech Stack & Archtektur',
    text: 'Grobe Technologie Entscheidungen sind getroffen und validiert.'
  },
  {
    status: 'progress',
    title: 'Prototyp bauen',
    text: 'Ein Prototyp worin schon Projekte, Workflows inkl. AI Agent. erstellt werden können ist erstellt'
  },
  {
    status: 'progress',
    title: 'Beta Tester finden',
    text: 'Es sind genügend Beta Tester gefunden um Probleme zu identifzieren und das finale Produkt bauen zu können.'
  },
  {
    status: 'rest',
    title: 'Architektur re-check',
    text: 'Es ist verifiziert ob ursprüngliche Annahmen so übernommen werden können.'
  }
]

const trackEl = useTemplateRef<HTMLElement>('trackEl')

onMounted(() => {
  const track = trackEl.value
  if (!track) return

  let lastDone = -1
  phases.forEach((p, i) => {
    if (p.status === 'done') lastDone = i
  })
  if (lastDone < 1) return // none, or already at the start

  const card = track.children[lastDone] as HTMLElement | undefined
  if (!card) return

  requestAnimationFrame(() => {
    // Align the card to the content edge (track's inner padding), not the bled-out
    // border edge.
    const padLeft = parseFloat(getComputedStyle(track).paddingInlineStart) || 0
    track.scrollLeft += card.getBoundingClientRect().left - track.getBoundingClientRect().left - padLeft
  })
})
</script>

<template>
  <section
    id="roadmap"
  >
    <div class="container pt-default ">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="Roadmap" />

        <h2 class="mt-6 text-balance text-highlighted">
          Was der Knecht gerade macht.
        </h2>
      </AppReveal>

      <!-- Progress panel -->
      <AppReveal
        :delay="0.08"
        class="shadow-panel col-span-full mt-10 rounded-xl border border-default bg-muted p-6 lg:mt-12 lg:p-8"
      >
        <div class="flex items-baseline justify-between gap-4">
          <span class="font-mono text-sm text-muted">
            Fortschritt bis zur öffentlichen Beta
          </span>
          <span class="font-mono text-xl font-semibold tabular-nums text-highlighted sm:text-2xl">
            {{ Math.round(displayed) }}%
          </span>
        </div>

        <div
          ref="barEl"
          class="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]"
        >
          <div
            class="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-mint),color-mix(in_oklab,var(--accent-mint)_60%,var(--accent-orange)))] [box-shadow:0_0_16px_-2px_var(--accent-mint)]"
            :style="{ width: `${displayed}%` }"
          />
        </div>

        <p class="mt-5 font-mono text-xs text-dimmed">
          Ziel: öffentliche Beta in Q4 2026 · Early-Access in Q3
        </p>
      </AppReveal>

      <!-- Slider on every breakpoint. The track breaks out of the container's
           inline padding via -mx, then re-insets its content with matching px (and
           scroll-px so snap stops align to the content edge) - so cards bleed to the
           viewport edge while scrolling but rest flush with the content at the ends.
           Vertically, py + negative my give the hover lift/shadow room without being
           clipped by the overflow-y:auto that overflow-x-auto forces. -->
      <div class="col-span-full mt-4">
        <div
          ref="trackEl"
          class="slider-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pt-5 pb-3 -mt-5 -mb-3 -mx-[var(--container-margin-x)] px-[var(--container-margin-x)] scroll-px-[var(--container-margin-x)]"
        >
          <AppReveal
            v-for="(phase, i) in phases"
            :key="phase.title"
            as="article"
            :y="0"
            :delay="i * 0.08"
            class="shadow-panel flex w-70 shrink-0 snap-start flex-col rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented z-10 relative hover:shadow-panel-lg sm:w-[320px]"
          >
            <!-- Status -->
            <div class="flex h-[22px] items-center gap-2.5">
              <span
                v-if="statusMeta[phase.status].icon"
                class="grid size-[22px] shrink-0 place-items-center rounded-full border border-primary/55 text-primary"
              >
                <UIcon
                  :name="statusMeta[phase.status].icon!"
                  class="size-3"
                />
              </span>
              <AppPulseDot
                v-else
                :color="statusMeta[phase.status].dot"
                :pulse="statusMeta[phase.status].pulse"
              />
              <span
                class="font-mono text-[11px] font-medium uppercase tracking-[0.1em]"
                :class="statusMeta[phase.status].text"
              >
                {{ statusMeta[phase.status].label }}
              </span>
            </div>

            <h3 class="mt-6 text-highlighted">
              {{ phase.title }}
            </h3>

            <p class="mt-3 text-sm leading-relaxed text-muted">
              {{ phase.text }}
            </p>
          </AppReveal>
        </div>
      </div>
    </div>
  </section>
</template>
