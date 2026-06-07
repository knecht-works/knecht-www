<script setup lang="ts">
const props = defineProps<{
  update: {
    path: string
    title: string
    date: string
    tag?: string
    description?: string
  }
}>()

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(props.update.date))
)
</script>

<template>
  <NuxtLink
    :to="update.path"
    class="group grid gap-3 py-7 lg:grid-cols-[200px_1fr] lg:gap-8"
  >
    <div class="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
      <span class="font-mono text-sm text-muted">{{ formattedDate }}</span>
      <AppTag
        v-if="update.tag"
        :label="update.tag"
      />
    </div>

    <div class="max-w-2xl">
      <h3 class="text-highlighted transition-colors group-hover:text-primary">
        {{ update.title }}
      </h3>
      <p
        v-if="update.description"
        class="mt-2 text-sm leading-relaxed text-muted sm:text-base"
      >
        {{ update.description }}
      </p>
      <span class="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-primary">
        Weiterlesen
        <UIcon
          name="i-lucide-arrow-right"
          class="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </div>
  </NuxtLink>
</template>
