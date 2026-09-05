// Home page section ids, in document order. The header/footer nav links point at
// these via hash (e.g. /#roadmap). `cta` is included so the spy clears the previous
// section when the CTA is reached, even though no nav item targets it.
const SECTION_IDS = ['integrations', 'use-cases', 'dashboard', 'discord', 'roadmap', 'updates', 'cta']

// Current in-view home section. Populated by useSectionSpy (called once in
// AppShell) and read by the nav + footer via useNavActive.
export const useActiveSection = () => useState<string>('active-section', () => '')

// Scroll-spy over the home sections. Call ONCE, in AppShell. Off the home page
// there is nothing to track, so the state is reset to ''.
export const useSectionSpy = () => {
  const route = useRoute()
  const localePath = useLocalePath()
  const active = useActiveSection()
  let observer: IntersectionObserver | null = null

  const teardown = () => {
    observer?.disconnect()
    observer = null
  }

  const setup = () => {
    teardown()
    active.value = ''
    // The home page is `/` in the default locale and `/de` in German.
    if (route.path !== localePath('/')) return

    const visible = new Set<string>()
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // First section (in document order) currently crossing the band.
        const current = SECTION_IDS.find(id => visible.has(id))
        if (current) active.value = current
      },
      // Narrow band around the upper-middle: a section counts as active once it
      // crosses ~40% from the top and until it leaves ~45% from the bottom.
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  onMounted(() => requestAnimationFrame(setup))
  watch(() => route.path, () => nextTick(() => requestAnimationFrame(setup)))
  onBeforeUnmount(teardown)
}

// isActive(to) for nav + footer links. Home hash links are active when their
// section is in view, subpage hash links when their page is open, and plain
// route links when the current path matches.
export const useNavActive = () => {
  const route = useRoute()
  const localePath = useLocalePath()
  const active = useActiveSection()

  // Path part of a link: query and hash stripped, trailing slashes removed.
  const pathOf = (to: string) => {
    const path = to.split(/[?#]/)[0] ?? ''
    return path.replace(/\/+$/, '') || '/'
  }

  // Expects already localized links, the same values the nav renders.
  const isActive = (to?: string) => {
    if (!to || to.startsWith('mailto:')) return false

    // `/` in the default locale, `/de` in German.
    const home = localePath('/')
    const path = pathOf(to)
    const hashIndex = to.indexOf('#')

    // Home section links follow the scroll spy.
    if (hashIndex !== -1 && path === home) {
      return route.path === home && active.value === to.slice(hashIndex + 1)
    }
    if (path === home) return route.path === home
    // A link to a section of a subpage counts as active on that page.
    if (hashIndex !== -1) return route.path === path
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  // isActive, but a link loses to a more specific sibling in `all`: /updates
  // stays muted on /updates/beta-tester when a beta-tester link matches too.
  const isMostSpecificActive = (to: string | undefined, all: (string | undefined)[]) => {
    if (!to || !isActive(to)) return false
    return !all.some(other =>
      other !== undefined
      && other !== to
      && isActive(other)
      && pathOf(other).startsWith(`${pathOf(to)}/`)
    )
  }

  return { isActive, isMostSpecificActive }
}
