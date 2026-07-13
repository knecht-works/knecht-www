// Query for a single update article, cached per path: each visited article is
// fetched once and reused on back/forward navigation.
export const useUpdate = (path: string) =>
  useAsyncData(`update-${path}`, () => queryCollection('updates').path(path).first())
