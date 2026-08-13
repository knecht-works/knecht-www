// Query for a single update article, cached per path: each visited article is
// fetched once and reused on back/forward navigation. The path carries the
// locale prefix, so it doubles as the per-locale cache key.
export const useUpdate = (path: string) => {
  const { updates } = useContentCollections()

  return useAsyncData(`update-${path}`, () => queryCollection(updates.value).path(path).first())
}

// Full archive (newest first). The index page and the article pages share this
// key, so the list is fetched at most once per locale.
export const useUpdates = () => {
  const { updates, locale } = useContentCollections()

  return useAsyncData(`updates-index-${locale.value}`, () =>
    queryCollection(updates.value).order('date', 'DESC').all())
}
