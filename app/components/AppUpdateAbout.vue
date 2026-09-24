<script setup lang="ts">
</script>

<template>
  <aside
    :aria-label="$t('updates.about.label')"
    class="shadow-panel mt-12 overflow-hidden rounded-xl border border-default bg-muted"
  >
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
        {{ $t('updates.about.newHere') }}
      </span>
    </div>

    <div class="bg-default p-5 font-mono text-sm leading-relaxed lg:p-6">
      <p class="text-highlighted">
        <span class="select-none text-primary">$&nbsp;</span>knecht --help
      </p>

      <p class="mt-3 text-muted">
        {{ $t('updates.about.help') }}
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
          {{ $t('updates.about.home') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale
          to="/?signup=beta#cta"
          class="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-highlighted"
        >
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
          {{ $t('updates.about.beta') }}
        </NuxtLinkLocale>
      </div>
    </div>
  </aside>
</template>
