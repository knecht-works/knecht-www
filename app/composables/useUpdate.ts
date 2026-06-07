// Shared query for a single update article. The page and the updates layout both
// call this with the same path, so they share one useAsyncData entry (no second
// fetch, and the TOC is available to the layout before it renders).
export const useUpdate = (path: string) =>
  useAsyncData(`update-${path}`, () => queryCollection('updates').path(path).first())
