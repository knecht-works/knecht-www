import type { Collections } from '@nuxt/content'

type PageCollection = Extract<keyof Collections, `pages_${string}`>
type UpdateCollection = Extract<keyof Collections, `updates_${string}`>

export const useContentCollections = () => {
  const { locale } = useI18n()

  return {
    locale,
    pages: computed(() => `pages_${locale.value}` as PageCollection),
    updates: computed(() => `updates_${locale.value}` as UpdateCollection)
  }
}
