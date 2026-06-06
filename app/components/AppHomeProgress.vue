<script setup lang="ts">
import { animate, inView } from 'motion-v'

const progress = 42

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

const phases = [
  {
    status: 'Fertig',
    icon: '✓',
    title: 'Boot-Engine',
    text: 'DDEV-Projekte zuverlässig hochfahren, inkl. DB-Import und Service-Health-Checks.',
    circle: 'border-primary/50 bg-primary/15 text-primary',
    tag: 'text-primary',
    card: 'border-default hover:border-accented'
  },
  {
    status: 'In Arbeit',
    icon: '●',
    title: 'Agent-Testlauf',
    text: 'Agents navigieren die echte App, protokollieren Flows und melden Fehler reproduzierbar.',
    circle: 'border-[var(--accent-orange)]/55 text-[var(--accent-orange)] animate-pulse',
    tag: 'text-[var(--accent-orange)]',
    card: 'border-[var(--accent-orange)]/30'
  },
  {
    status: 'Als Nächstes',
    icon: '',
    title: 'Auto-Fix & PRs',
    text: 'Patch schreiben, gegen die laufende App verifizieren, Pull Request öffnen.',
    circle: 'border-accented text-dimmed',
    tag: 'text-dimmed',
    card: 'border-default hover:border-accented'
  },
  {
    status: 'Geplant',
    icon: '',
    title: 'Dashboard & Teams',
    text: 'Mehrere Projekte, Rollen und ein Live-Überblick für die ganze Agentur.',
    circle: 'border-accented text-dimmed',
    tag: 'text-dimmed',
    card: 'border-default opacity-75 hover:border-accented'
  }
]
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
          Wo Knecht gerade steht.
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
          Ziel: öffentliche Beta in Q4 2026 · Early-Access für Beta-Tester früher
        </p>
      </AppReveal>

      <!-- Phase cards: horizontally scrollable strip on mobile (native scroll-snap).
           overflow-x-auto forces overflow-y to `auto`, which would clip the hover
           lift — so on lg (where hover exists and the cards fill the row anyway)
           we switch to overflow:visible so the raised card isn't cut off. -->
      <div class="col-span-full mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:overflow-visible">
        <AppReveal
          v-for="(phase, i) in phases"
          :key="phase.title"
          as="article"
          :y="0"
          :delay="i * 0.08"
          class="shadow-panel flex w-70 shrink-0 snap-start flex-col rounded-xl border bg-muted p-6 transition duration-200 hover:-translate-y-1 z-10 relative hover:shadow-panel-lg sm:w-[320px] lg:w-auto lg:flex-1"
          :class="phase.card"
        >
          <!-- Status -->
          <div class="flex items-center gap-2.5">
            <span
              class="grid size-[22px] shrink-0 place-items-center rounded-full border text-[11px] leading-none"
              :class="phase.circle"
            >
              {{ phase.icon }}
            </span>
            <span
              class="font-mono text-[11px] font-medium uppercase tracking-[0.1em]"
              :class="phase.tag"
            >
              {{ phase.status }}
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
  </section>
</template>
