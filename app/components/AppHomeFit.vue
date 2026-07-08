<script setup lang="ts">
// Honest positioning: the target group gets the stage as four criteria cards,
// while "who this is NOT for" stays a quiet dashed footnote instead of an
// equally weighted comparison card. Saying it at all defuses the loudest
// criticism (mature platform teams judging Knecht against their own stack).
const fits = [
  {
    icon: 'i-lucide-layers',
    accent: 'var(--accent-mint)',
    title: 'Viele Projekte, ein Workflow',
    text: 'Security-Updates und Bugfixes fallen bei euch ständig an. Einen Workflow baut ihr einmal, danach läuft er für alle Projekte.'
  },
  {
    icon: 'i-lucide-container',
    accent: 'var(--accent-orange)',
    title: 'DDEV liegt schon bereit',
    text: 'Knecht nutzt das DDEV-Setup, das in euren Projekten meist schon steckt. Kein neues Tooling, kein Umbau.'
  },
  {
    icon: 'i-lucide-timer',
    accent: 'var(--accent-violet)',
    title: 'Mehr Zeit fürs Wesentliche',
    text: 'Updates, Tests und Previews laufen im Hintergrund, während ihr an den Dingen arbeitet, die eure Kunden wirklich sehen.'
  },
  {
    icon: 'i-lucide-server',
    accent: 'var(--accent-mint)',
    title: 'Alles bleibt bei euch',
    text: 'Knecht läuft self-hosted auf eurem eigenen Server in der EU. Eure Projekte und Daten verlassen euer Haus nicht.'
  }
]

const noFits = [
  'Platform-Team',
  'Kubernetes-Pipelines',
  'Air-gapped'
]
</script>

<template>
  <section id="zielgruppe">
    <div class="container pt-default">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="Für wen" />

        <h2 class="mt-6 text-balance text-highlighted">
          Gebaut für den Agentur-Alltag.
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Knecht nimmt Agenturen und Freelancern die wiederkehrende Reibung
          ab, die viele Projekte mit sich bringen: Updates, Bugfixes,
          Previews. Ohne eigenes Platform-Team und ohne neue Infrastruktur.
        </p>
      </AppReveal>

      <!-- Fit criteria -->
      <div class="col-span-full mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4">
        <AppReveal
          v-for="(fit, i) in fits"
          :key="fit.title"
          as="article"
          :y="0"
          :delay="i * 0.08"
          class="shadow-panel group relative flex flex-col rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented hover:shadow-panel-lg lg:p-7"
          :style="{ '--a': fit.accent }"
        >
          <div class="flex items-center justify-between">
            <span class="grid size-9 place-items-center rounded-lg border border-default bg-elevated text-[var(--a)]">
              <UIcon
                :name="fit.icon"
                class="size-4"
              />
            </span>
            <UIcon
              name="i-lucide-check"
              class="size-4 text-primary"
            />
          </div>

          <h3 class="mt-6 text-base text-highlighted">
            {{ fit.title }}
          </h3>

          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ fit.text }}
          </p>
        </AppReveal>
      </div>

      <!-- Who it is not for: a quiet footnote, not a competing card -->
      <AppReveal
        :delay="0.1"
        class="col-span-full mt-4"
      >
        <div class="flex flex-col gap-4 rounded-xl border border-dashed border-default px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-dimmed">
              Schon alles im Griff?
            </span>
            <span
              v-for="item in noFits"
              :key="item"
              class="inline-flex items-center gap-1.5 rounded-md border border-default bg-elevated px-2 py-1 font-mono text-xs text-muted"
            >
              <UIcon
                name="i-lucide-minus"
                class="size-3 text-dimmed"
              />
              {{ item }}
            </span>
          </div>

          <p class="text-sm leading-relaxed text-dimmed lg:text-right">
            Dann braucht ihr Knecht vermutlich nicht. Er ist für alle, die genau das nicht aufbauen wollen.
          </p>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
