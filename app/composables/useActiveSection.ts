// Home page section ids, in document order. The header/footer nav links point at
// these via hash (e.g. /#idee). `cta` is included so the spy clears the previous
// section when the CTA is reached, even though no nav item targets it.
const SECTION_IDS = ['idee', 'dashboard', 'roadmap', 'updates', 'cta']

// Current in-view home section. Populated by useSectionSpy (called once in
// AppShell) and read by the nav + footer via useNavActive.
export const useActiveSection = () => useState<string>('active-section', () => '')

// Scroll-spy over the home sections. Call ONCE, in AppShell. Off the home page
// there is nothing to track, so the state is reset to ''.
export const useSectionSpy = () => {
  const route = useRoute()
  const active = useActiveSection()
  let observer: IntersectionObserver | null = null

  const teardown = () => {
    observer?.disconnect()
    observer = null
  }

  const setup = () => {
    teardown()
    active.value = ''
    if (route.path !== '/') return

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

// isActive(to) for nav + footer links. Hash links are active only on the home
// page when their section is in view; route links match the current path.
export const useNavActive = () => {
  const route = useRoute()
  const active = useActiveSection()

  const isActive = (to?: string) => {
    if (!to || to.startsWith('mailto:')) return false

    const hashIndex = to.indexOf('#')
    if (hashIndex !== -1) {
      return route.path === '/' && active.value === to.slice(hashIndex + 1)
    }

    const path = to.replace(/\/+$/, '') || '/'
    if (path === '/') return route.path === '/'
    return route.path === path || route.path.startsWith(`${path}/`)
  }

  return { isActive }
}
