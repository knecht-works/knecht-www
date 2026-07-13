<script setup lang="ts">
// The one concrete story that explains the product better than any claim:
// a CMS security update needs a running database, so bots without a booted
// project can't do it. Rendered as the workflow run it actually is.
const steps = [
  {
    label: 'Trigger',
    title: 'Ein Security-Patch erscheint',
    text: 'Ein Webhook oder Cron-Trigger startet deinen Update-Workflow, für jedes betroffene Projekt.'
  },
  {
    label: 'Boot',
    title: 'Knecht bootet das Projekt',
    text: 'Das DDEV-Setup fährt als komplette Umgebung hoch: Webserver, Services und Datenbank.'
  },
  {
    label: 'Update',
    title: 'Composer-Update mit Migrations',
    text: 'Update läuft im echten Projekt. Migrations laufen gegen die Datenbank und schreiben ihre Files, die mit committet werden.'
  },
  {
    label: 'Test',
    title: 'Gegen die laufende App testen',
    text: 'Tests können in der gebooteten Umgebung laufen und mit der Preview kann auch manuell nochmal getestet werden.'
  },
  {
    label: 'Ergebnis',
    title: 'Pull Request mit Preview',
    text: 'Du bekommst einen fertigen PR plus Preview-Link. Prüfen, mergen, weiterarbeiten.'
  }
]
</script>

<template>
  <section id="anwendungsfall">
    <div class="container pt-default">
      <!-- Heading -->
      <AppReveal class="col-span-full max-w-2xl">
        <AppEyebrow label="Ein konkretes Beispiel" />

        <h2 class="mt-6 text-balance text-highlighted">
          Das Security-Update, das kein Bot einspielen kann.
        </h2>

        <p class="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Bei einem CMS braucht ein Update fast immer eine laufende Datenbank:
          Nach dem <code>composer update</code> laufen Migrations, die Files
          schreiben, und die müssen mit in den Commit. Dependabot kann das
          nicht, denn er hat kein laufendes Projekt. Knecht schon.
        </p>
      </AppReveal>

      <!-- Workflow run: the steps a single update actually goes through -->
      <div class="col-span-full mt-8 lg:mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AppReveal
          v-for="(step, i) in steps"
          :key="step.label"
          as="article"
          :y="0"
          :delay="i * 0.08"
          class="shadow-panel group relative flex flex-col rounded-xl border border-default bg-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-accented hover:shadow-panel-lg"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm tracking-wider text-primary">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="rounded-md border border-default bg-elevated px-2 py-1 font-mono text-xs text-dimmed">
              {{ step.label }}
            </span>
          </div>

          <h3 class="mt-6 text-base text-highlighted">
            {{ step.title }}
          </h3>

          <p class="mt-3 text-sm leading-relaxed text-muted">
            {{ step.text }}
          </p>
        </AppReveal>
      </div>

      <AppReveal
        :delay="0.1"
        class="col-span-full mt-6"
      >
        <p class="font-mono text-sm text-dimmed">
          Den Workflow baust du einmal. Danach läuft er für jedes deiner Projekte, bei jedem Patch.
        </p>
      </AppReveal>
    </div>
  </section>
</template>
