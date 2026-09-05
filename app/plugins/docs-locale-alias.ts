// Docs routes are registered for 'en' only (see pages/docs/[...slug].vue).
// Nuxt UI's ULink resolves every internal link through localePath, and from a
// German page that lookup needs a route named docs-slug___de. Register the
// English docs routes again under the ___de name, with the same unprefixed
// path, so docs links stay clickable everywhere. No /de/docs URLs are created.
export default defineNuxtPlugin(() => {
  const router = useRouter()

  for (const route of router.getRoutes()) {
    if (typeof route.name !== 'string') continue
    if (!route.name.endsWith('___en') || !route.path.startsWith('/docs')) continue

    const deName = route.name.replace(/___en$/, '___de')
    if (!router.hasRoute(deName)) {
      router.addRoute({ ...route, name: deName })
    }
  }
})
