<script setup lang="ts">
// Update posts get shared as deep links, so each one doubles as a landing
// page. This box answers "what is this product?" for readers who arrive cold.
// Styled as a small terminal window: on-brand, and visually distinct from the
// big CTA panel that follows further down the page.
</script>

<template>
  <aside
    aria-label="Was ist Knecht?"
    class="shadow-panel mt-12 overflow-hidden rounded-xl border border-default bg-muted"
  >
    <!-- Title bar -->
    <div class="flex items-center gap-4 border-b border-default bg-elevated px-4 py-3">
      <div class="flex shrink-0 items-center gap-2">
        <span class="size-3 rounded-full bg-error/80" />
        <span class="size-3 rounded-full bg-warning/80" />
        <span class="size-3 rounded-full bg-success/80" />
      </div>

      <span class="min-w-0 flex-1 justify-center truncate font-mono text-xs text-dimmed hidden sm:flex">
        knecht &middot; zsh
      </span>

      <span class="shrink-0 items-center gap-1.5 font-mono text-xs text-dimmed flex max-sm:ml-auto">
        <AppPulseDot
          color="primary"
          :pulse="false"
        />
        Neu hier?
      </span>
    </div>

    <!-- Transcript -->
    <div class="bg-default p-5 font-mono text-sm leading-relaxed lg:p-6">
      <p class="text-highlighted">
        <span class="select-none text-primary">$&nbsp;</span>knecht --help
      </p>

      <p class="mt-3 text-muted">
        Ein Dashboard auf deinem eigenen Server, gebaut für Agenturen mit
        vielen DDEV-Projekten. Bootet jedes Projekt als komplett lauffähige
        Umgebung, erledigt Aufgaben in Workflows und liefert
        fertige Pull Requests mit Preview.
      </p>

      <div class="mt-4 flex flex-wrap gap-x-8 gap-y-2">
        <NuxtLinkLocale
          to="/"
          class="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
          Startseite ansehen
        </NuxtLinkLocale>
        <NuxtLinkLocale
          to="/?signup=beta#cta"
          class="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
          Beta-Tester werden
        </NuxtLinkLocale>
      </div>
    </div>
  </aside>
</template>
