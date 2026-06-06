import { defineCollection, z } from '@nuxt/content'

export const collections = {
  // Standalone markdown pages (legal texts: Impressum, Datenschutz, …).
  // `prefix: '/'` serves content/pages/impressum.md at /impressum.
  pages: defineCollection({
    type: 'page',
    source: {
      include: 'pages/**',
      prefix: '/'
    },
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      updatedAt: z.string().optional()
    })
  }),

  // Update articles ("Building in Public"), loaded as a list on the home page.
  updates: defineCollection({
    type: 'page',
    source: 'updates/**',
    schema: z.object({
      title: z.string(),
      date: z.string(),
      tag: z.string().optional(),
      description: z.string().optional()
    })
  })
}
