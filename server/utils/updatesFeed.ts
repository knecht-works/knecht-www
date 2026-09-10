import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'

const FEEDS = {
  en: {
    collection: 'updates_en',
    path: '/updates/rss.xml',
    title: 'Knecht Updates',
    description: 'Building in Public, every milestone of Knecht documented honestly.'
  },
  de: {
    collection: 'updates_de',
    path: '/de/updates/rss.xml',
    title: 'Knecht Updates',
    description: 'Building in Public, jeder Meilenstein von Knecht wird ehrlich dokumentiert.'
  }
} as const

function escape(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// RSS 2.0 feed of the update posts for one locale. Rendered at prerender time,
// like the sitemap, since the Cloudflare worker cannot query Nuxt Content.
export async function buildUpdatesFeed(event: H3Event, locale: keyof typeof FEEDS) {
  const feed = FEEDS[locale]
  const siteUrl = getSiteConfig(event).url
  const updates = await queryCollection(event, feed.collection).order('date', 'DESC').all()

  const items = updates.map(update => `
    <item>
      <title>${escape(update.title)}</title>
      <link>${siteUrl}${update.path}</link>
      <guid>${siteUrl}${update.path}</guid>
      <pubDate>${new Date(update.date).toUTCString()}</pubDate>
      ${update.description ? `<description>${escape(update.description)}</description>` : ''}
    </item>`).join('')

  setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${feed.title}</title>
    <link>${siteUrl}${feed.path.replace('/rss.xml', '')}</link>
    <description>${escape(feed.description)}</description>
    <language>${locale}</language>
    <atom:link href="${siteUrl}${feed.path}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>
`
}
