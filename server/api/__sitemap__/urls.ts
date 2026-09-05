import { queryCollection } from '@nuxt/content/server'

export default defineSitemapEventHandler(async (event) => {
  // Content paths already carry the locale prefix, so they are the final URLs.
  const [pagesEn, pagesDe, updatesEn, updatesDe, docsEn] = await Promise.all([
    queryCollection(event, 'pages_en').all(),
    queryCollection(event, 'pages_de').all(),
    queryCollection(event, 'updates_en').all(),
    queryCollection(event, 'updates_de').all(),
    queryCollection(event, 'docs_en').all()
  ])

  return [
    ...docsEn.map(doc => asSitemapUrl({
      loc: doc.path
    })),
    ...[...pagesEn, ...pagesDe].map(page => asSitemapUrl({
      loc: page.path,
      lastmod: page.updatedAt
    })),
    ...[...updatesEn, ...updatesDe].map(update => asSitemapUrl({
      loc: update.path,
      lastmod: update.date
    }))
  ]
})
