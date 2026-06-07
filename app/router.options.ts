import type { RouterConfig } from '@nuxt/schema'

// Keep Nuxt's built-in scrollBehavior (scroll to top on navigation, restore on
// back/forward, transition-aware timing). We only opt hash-anchor scrolling into
// smooth. Plain navigation stays instant (no behavior field -> uses CSS, which
// is no longer `scroll-behavior: smooth`), so there is no slow scroll-to-top.
// The header offset for hash targets comes from html { scroll-padding-top }.
export default {
  scrollBehaviorType: 'smooth'
} satisfies RouterConfig
