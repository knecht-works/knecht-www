// Native View Transitions (nuxt.config experimental.viewTransition) freeze the
// page on iOS. WebKit leaves the `::view-transition` snapshot overlay stuck, so
// the content looks frozen while the document keeps scrolling underneath (the
// scrollbar moves, the page does not). All iOS browsers are WebKit, so this also
// hits "Chrome" on iOS. The API is supported there since iOS 18, the bug is in
// WebKit's implementation, not a missing feature. Skip the transition on iOS
// (navigation stays instant); every other platform keeps the crossfade.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const ua = navigator.userAgent
  // iPadOS 13+ reports as "Macintosh", so fall back to touch points there.
  const isIos = /iP(hone|ad|od)/.test(ua)
    || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)

  if (isIos) {
    to.meta.viewTransition = false
  }
})
