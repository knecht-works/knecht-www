<script setup lang="ts">
// Shared page chrome: background field, header and footer. Used by every layout
// so the visual frame stays identical no matter the content arrangement.

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
      <div class="relative z-10">
        <AppLocaleNotice />

        <AppHeader />

        <UMain>
          <slot />
        </UMain>

        <!-- Site-wide CTA, shown at the bottom of every page above the footer. -->
        <AppCta />

        <AppFooter />
      </div>
    </MotionConfig>
  </div>
</template>
