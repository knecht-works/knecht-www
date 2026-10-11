// 65 is --ui-header-height (4rem) plus 1px tolerance. The 20px scroll gate
// matches the header's own scrolled state, so an element that already starts
// right below the header does not count on load.
export function usePinned(el: Ref<Element | null | undefined>) {
  const pinned = ref(false)
  const subnavPinned = useSubnavPinned()

  function onScroll() {
    const rect = el.value?.getBoundingClientRect()
    // A display:none element (the mobile bar on desktop) reports a zero rect
    // and must not overwrite the state of the visible one.
    if (!rect?.height) {
      pinned.value = false
      return
    }
    pinned.value = window.scrollY > 20 && rect.top <= 65
    subnavPinned.value = pinned.value
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    subnavPinned.value = false
  })

  return pinned
}

export function useSubnavPinned() {
  return useState('subnav-pinned', () => false)
}
