import { queryCollection } from '@nuxt/content/server'

export default defineSitemapEventHandler(async (event) => {
  const [pages, updates] = await Promise.all([
    queryCollection(event, 'pages').all(),
    queryCollection(event, 'updates').all()
  ])

  return [
    ...pages.map(page => asSitemapUrl({
      loc: page.path,
      lastmod: page.updatedAt
    })),
    ...updates.map(update => asSitemapUrl({
      loc: update.path,
      lastmod: update.date
    }))
  ]
})
