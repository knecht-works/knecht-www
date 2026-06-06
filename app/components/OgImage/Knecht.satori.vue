<script setup>
// OG / social preview template (1200×630), rendered to PNG via Satori.
// Satori only supports flexbox and is strict: every <div> with more than one
// child MUST declare display:flex explicitly — so this uses inline styles
// throughout (no reliance on Tailwind class translation) and brand hex colors.
//
// Props use the runtime object form (not the type-only generic): nuxt-og-image
// scans declared prop names to know it may auto-fill `title`/`description` from
// each page's <title> + meta description.
defineProps({
  title: { type: String, required: false, default: 'Knecht' },
  description: { type: String, required: false, default: '' }
})
</script>

<template>
  <div
    style="display: flex; flex-direction: column; justify-content: space-between; width: 100%; height: 100%; padding: 72px; background-color: #0a0a0a; position: relative; font-family: 'Geist'"
  >
    <!-- accent glow -->
    <div
      style="position: absolute; top: -220px; right: -160px; width: 640px; height: 640px; border-radius: 9999px; background-image: radial-gradient(circle, rgba(183,248,162,0.18), transparent 60%)"
    />

    <!-- brand -->
    <div style="display: flex; align-items: center; gap: 20px">
      <div style="display: flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 18px; background-color: #6ba96d">
        <div style="width: 28px; height: 28px; border-radius: 7px; background-color: #fa7a2c" />
      </div>
      <div style="font-size: 42px; font-weight: 700; letter-spacing: -0.02em; color: #ffffff">
        Knecht
      </div>
    </div>

    <!-- title + description -->
    <div style="display: flex; flex-direction: column">
      <div style="font-size: 72px; font-weight: 600; line-height: 1.08; letter-spacing: -0.03em; color: #ffffff; max-width: 1000px">
        {{ title }}
      </div>
      <div
        v-if="description"
        style="margin-top: 28px; font-size: 30px; line-height: 1.4; color: #a1a1aa; max-width: 920px"
      >
        {{ description }}
      </div>
    </div>

    <!-- footer -->
    <div style="display: flex; align-items: center; gap: 16px">
      <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: #b7f8a2" />
      <div style="font-size: 27px; color: #71717a">
        knecht.works
      </div>
    </div>
  </div>
</template>
