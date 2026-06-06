// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/ui',
    '@nuxtjs/seo',
    'nuxt-llms',
    'motion-v/nuxt'
  ],

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' },

    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-title', content: 'Knecht' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://knecht.works',
    name: 'Knecht'
  },

  content: {
    experimental: {
      sqliteConnector: 'native'
    }
  },

  mdc: {
    highlight: {
      noApiRoute: false
    }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [
        '/',
        '/updates',
        '/impressum',
        '/datenschutz'
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  llms: {
    domain: 'https://knecht.works',
    title: 'Knecht',
    description: 'Knecht is a self-hostable orchestration tool that connects to your GitHub repos and uses your own AI code agent to boot environments, fix issues, and deliver finished pull requests.',
    full: {
      title: 'Knecht — Full website content',
      description: 'The complete content of the Knecht website as a single document.'
    },
    sections: [
      {
        title: 'Legal',
        description: 'Legal pages (Impressum, Datenschutz).',
        contentCollection: 'pages',
        contentFilters: [
          { field: 'extension', operator: '=', value: 'md' }
        ]
      },
      {
        title: 'Updates',
        description: 'Building-in-public update articles.',
        contentCollection: 'updates',
        contentFilters: [
          { field: 'extension', operator: '=', value: 'md' }
        ]
      }
    ]
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls']
  }
})
