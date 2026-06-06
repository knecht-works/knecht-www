<script setup lang="ts">
withDefaults(defineProps<{
  /** URL shown in the fake address bar. */
  url?: string
  /** Label shown on the right side of the title bar. */
  action?: string
}>(), {
  url: 'app.knecht.dev/projects',
  action: 'Vorschau'
})
</script>

<template>
  <div class="shadow-browser overflow-hidden rounded-xl border border-default bg-muted">
    <!-- Title bar -->
    <div class="flex items-center gap-4 border-b border-default bg-elevated px-4 py-3">
      <!-- Traffic lights -->
      <div class="flex shrink-0 items-center gap-2">
        <span class="size-3 rounded-full bg-error/80" />
        <span class="size-3 rounded-full bg-warning/80" />
        <span class="size-3 rounded-full bg-success/80" />
      </div>

      <!-- Address bar -->
      <div class="flex min-w-0 flex-1 items-center justify-center">
        <span class="flex items-center gap-2 truncate rounded-md bg-default px-3 py-1 font-mono text-xs text-muted">
          <UIcon
            name="i-lucide-lock"
            class="size-3 shrink-0"
          />
          {{ url }}
        </span>
      </div>

      <!-- Action -->
      <span
        v-if="action"
        class="hidden shrink-0 items-center gap-1.5 font-mono text-xs text-dimmed sm:flex"
      >
        <AppPulseDot
          color="neutral"
          :pulse="false"
        />
        {{ action }}
      </span>
    </div>

    <!-- Content -->
    <div class="bg-default">
      <slot />
    </div>
  </div>
</template>
