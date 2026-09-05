<script setup lang="ts">
// Shared page chrome: background field, header and footer. Used by every layout
// so the visual frame stays identical no matter the content arrangement.

// Docs pages hide the marketing CTA between content and footer.
withDefaults(defineProps<{ cta?: boolean }>(), { cta: true })

// Scroll-spy for the home sections, mounted once here so the nav + footer can
// reflect the active section.
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

          <!-- Site-wide CTA, shown at the bottom of every page above the footer. -->
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
