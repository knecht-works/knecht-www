<script setup lang="ts">
const steps = [
  {
    number: '01',
    block: 'knecht boot',
    accent: 'var(--accent-mint)',
    title: 'Ein Klick, ganzes Projekt',
    text: 'Knecht startet dein DDEV-Setup als komplette Umgebung – Web, Services und Datenbank inklusive. Kein Mocking, keine halben Sachen.'
  },
  {
    number: '02',
    block: 'knecht test',
    accent: 'var(--accent-orange)',
    title: 'Agents testen die echte App',
    text: 'Statt gegen Stubs laufen die Agents gegen dein laufendes Projekt mit echten Daten – und finden genau die Bugs, die im Prod weh tun.'
  },
  {
    number: '03',
    block: 'knecht fix',
    accent: 'var(--accent-violet)',
    title: 'Fehler werden gefixt, nicht nur gemeldet',
    text: 'Reproduzieren, Patch schreiben, gegen die App verifizieren, PR öffnen. Du bekommst keinen Bug-Report, du bekommst die Lösung.'
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

        <h2 class="mt-6 text-balance text-highlighted">
          Drei Schritte.<br>Null Babysitting.
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          So soll Knecht funktionieren, wenn er fertig ist – ein Agent, der dein
          Projekt nicht nur anschaut, sondern wirklich laufen lässt.
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
