// 65 is --ui-header-height (4rem) plus 1px tolerance. The 20px scroll gate
// matches the header's own scrolled state, so an element that already starts
// right below the header does not count on load.
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
