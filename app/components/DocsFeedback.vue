<script setup lang="ts">
defineProps<{
  issueUrl: string
}>()

const route = useRoute()
const vote = ref<'up' | 'down' | null>(null)

// Nothing is stored on the device, so a reload allows voting again.
function submit(value: 'up' | 'down') {
  vote.value = value
  $fetch('/api/docs-feedback', {
    method: 'POST',
    body: { path: route.path, vote: value }
  }).catch(() => {})
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center gap-4 text-sm">
      <template v-if="!vote">
        <span class="text-muted">Was this page helpful?</span>
        <UFieldGroup>
          <UButton
            icon="i-lucide-thumbs-up"
            color="neutral"
            variant="subtle"
            size="sm"
            class="cursor-pointer"
            aria-label="Yes, this page was helpful"
            @click="submit('up')"
          />
          <UButton
            icon="i-lucide-thumbs-down"
            color="neutral"
            variant="subtle"
            size="sm"
            class="cursor-pointer"
            aria-label="No, this page was not helpful"
            @click="submit('down')"
          />
        </UFieldGroup>
      </template>

      <template v-else>
        <span class="text-muted">Thanks for your feedback.</span>
        <NuxtLink
          v-if="vote === 'down'"
          :to="issueUrl"
          target="_blank"
          class="inline-flex items-center gap-1.5 text-primary transition-opacity hover:opacity-70"
        >
          Tell us what is missing
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5"
          />
        </NuxtLink>
      </template>
    </div>

    <USeparator>
      <NuxtLink
        :to="issueUrl"
        target="_blank"
        class="text-sm transition-colors hover:text-primary"
      >
        Provide Feedback to this Page
      </NuxtLink>
    </USeparator>
  </div>
</template>
