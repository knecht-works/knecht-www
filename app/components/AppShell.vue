<script setup lang="ts">
withDefaults(defineProps<{ cta?: boolean }>(), { cta: true })

useSectionSpy()
</script>

<template>
  <div>
    <div
      class="bg-field"
      aria-hidden="true"
    >
      <div class="bg-grid" />
      <div class="glow glow-a" />
      <div class="glow glow-b" />
    </div>

    <MotionConfig :reduced-motion="'user'">
      <!-- The docked assistant panel sits next to the page column and pushes
           it aside, so the page keeps its own scroll and the header stays
           within its column. -->
      <div class="relative z-10 flex">
        <div class="min-w-0 flex-1">
          <AppLocaleNotice />

          <AppHeader />

          <UMain>
            <slot />
          </UMain>

          <AppCta v-if="cta" />

          <AppFooter />
        </div>

        <ClientOnly>
          <LazyAssistantFloatingInput />
          <LazyAssistantPanel />
        </ClientOnly>
      </div>
    </MotionConfig>

    <AppSearch />
  </div>
</template>
