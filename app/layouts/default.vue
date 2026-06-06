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
        <AppHeader />

        <UMain>
          <slot />
        </UMain>

        <AppFooter />
      </div>
    </MotionConfig>
  </div>
</template>
