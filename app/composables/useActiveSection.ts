// In document order. No nav item targets `cta`, it is listed so the spy clears
// the previous section once the CTA is reached.
const SECTION_IDS = ['integrations', 'use-cases', 'dashboard', 'discord', 'roadmap', 'updates', 'cta']

export const useActiveSection = () => useState<string>('active-section', () => '')

// Call once, in AppShell.
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
    if (route.path !== localePath('/')) return

    const visible = new Set<string>()
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
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

export const useNavActive = () => {
  const route = useRoute()
  const localePath = useLocalePath()
  const active = useActiveSection()

  const pathOf = (to: string) => {
    const path = to.split(/[?#]/)[0] ?? ''
    return path.replace(/\/+$/, '') || '/'
  }

  // Expects already localized links, the same values the nav renders.
  const isActive = (to?: string) => {
    if (!to || to.startsWith('mailto:')) return false

    const home = localePath('/')
    const path = pathOf(to)
    const hashIndex = to.indexOf('#')

    if (hashIndex !== -1 && path === home) {
      return route.path === home && active.value === to.slice(hashIndex + 1)
    }
    if (path === home) return route.path === home
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
