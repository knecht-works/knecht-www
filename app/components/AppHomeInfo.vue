<script setup lang="ts">
const steps = [
  {
    number: '01',
    block: 'Projekte',
    accent: 'var(--accent-mint)',
    title: 'Ein Klick, ganzes Projekt',
    text: 'Knecht startet dein DDEV-Setup als komplette Umgebung, Web, Services und Datenbank inklusive. Jedes Projekt enthält alle Informationen die es für einen Vollständigen Boot braucht.'
  },
  {
    number: '02',
    block: 'Workflows',
    accent: 'var(--accent-orange)',
    title: 'Deterministische Workflows',
    text: 'Abläufe aus Bausteinen, die immer gleich passieren, statt einen Agent wild loszuschicken. Getriggert per Hand oder Webhook, etwa aus einem Github Issue oder Jira Ticket.'
  },
  {
    number: '03',
    block: 'Knecht',
    accent: 'var(--accent-violet)',
    title: 'AI Agent',
    text: 'Mit einem API Key von Opencode kann der AI Agent in Workflows Bugs in der laufenden Umgebung reproduzieren, fixen und direkt gegen die echte App testen – ganz ohne raten, ob die Änderung wirklich funktioniert.'
  }
]
</script>

<template>
  <section
    id="idee"
  >
    <div class="container pt-16 sm:pt-24">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="Die Idee" />

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          AI Agents sollten nicht raten müssen ob Änderungen die gemacht wurden auch wirklich funktionieren.
        </p>
      </AppReveal>

      <!-- Steps -->
      <div class="col-span-full mt-7 lg:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AppReveal
          v-for="(step, i) in steps"
          :key="step.number"
          as="article"
          :y="0"
          :delay="i * 0.1"
          class="shadow-panel group relative flex flex-col overflow-hidden rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented hover:shadow-panel-lg lg:p-7"
          :style="{ '--a': step.accent }"
        >
          <!-- Header row -->
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm tracking-wider text-[var(--a)]">{{ step.number }}</span>
            <span class="rounded-md border border-default bg-elevated px-2 py-1 font-mono text-xs text-dimmed">
              {{ step.block }}
            </span>
          </div>

          <h3 class="mt-8 text-highlighted">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ step.text }}
          </p>
        </AppReveal>
      </div>
    </div>
  </section>
</template>
