// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/image',
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
    url: process.env.NUXT_SITE_URL || 'https://knecht.works',
    name: 'Knecht',
    // German site — drives <html lang> (via nuxt-seo-utils) and og:locale.
    defaultLocale: 'de'
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

  ui: {
    colorMode: false
  },

  // Server-only secrets — set via NUXT_RESEND_API_KEY etc. in the environment.
  runtimeConfig: {
    resendApiKey: '',
    resendAudienceUpdates: '',
    resendAudienceBeta: ''
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: 'cloudflare-pages',
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

  fonts: {
    defaults: {
      subsets: ['latin'],
      preload: true
    }
  },

  image: {
    quality: 78
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
