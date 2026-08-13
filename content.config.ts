import { defineCollection, z } from '@nuxt/content'

const pageSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  updatedAt: z.string().optional()
})

const updateSchema = z.object({
  title: z.string(),
  date: z.string(),
  tag: z.string().optional(),
  description: z.string().optional()
})

// One collection per locale, suffixed with the locale code. `prefix` mirrors
// the i18n route prefix (`prefix_except_default`, default `en`), so a content
// item's path is identical to the route that renders it and queries can pass
// `route.path` straight through. Without an explicit prefix, Nuxt Content
// derives it from the glob and would produce `/en/updates/...`.
export const collections = {
  pages_en: defineCollection({
    type: 'page',
    source: { include: 'en/pages/**', prefix: '/' },
    schema: pageSchema
  }),
  pages_de: defineCollection({
    type: 'page',
    source: { include: 'de/pages/**', prefix: '/de' },
    schema: pageSchema
  }),
  updates_en: defineCollection({
    type: 'page',
    source: { include: 'en/updates/**', prefix: '/updates' },
    schema: updateSchema
  }),
  updates_de: defineCollection({
    type: 'page',
    source: { include: 'de/updates/**', prefix: '/de/updates' },
    schema: updateSchema
  })
}
