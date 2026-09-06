// True while a sticky element actually sticks below the mobile header. The
// threshold is --ui-header-height (4rem) plus 1px tolerance. An element that
// already starts right below the header only counts once the page has
// scrolled as far as the header needs for its own scrolled state (20px).
export function usePinned(el: Ref<Element | null | undefined>) {
  const pinned = ref(false)

  function onScroll() {
    pinned.value = window.scrollY > 20 && !!el.value && el.value.getBoundingClientRect().top <= 65
  }

  onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

  return pinned
}
