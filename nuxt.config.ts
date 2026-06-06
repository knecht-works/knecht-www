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
      ],

      script: [
        {
          // Set animation flags on <html> BEFORE first paint, so reveal targets
          // start hidden (no FOUC) only where they'll actually animate. See
          // AppReveal.vue. `motion-ok`: any non-reduced-motion device — gates the
          // hero on-load intro (incl. mobile). `reveal-on`: additionally requires a
          // fine pointer — gates scroll-section reveals (desktop only), so nothing
          // pops in while scrolling on touch.
          innerHTML: 'try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var d=document.documentElement;d.classList.add("motion-ok");if(matchMedia("(pointer: fine)").matches)d.classList.add("reveal-on")}}catch(e){}',
          tagPosition: 'head'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_SITE_URL || 'https://knecht.works',
    name: 'Knecht',
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
    colorMode: false,
    experimental: {
      componentDetection: true
    }
  },

  runtimeConfig: {
    resendApiKey: '',
    resendAudienceUpdates: '',
    resendAudienceBeta: ''
  },

  routeRules: {
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/assets/**': { headers: { 'cache-control': 'public, max-age=604800' } }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: process.env.CF_PAGES ? 'cloudflare-pages' : undefined,
    compressPublicAssets: { gzip: true, brotli: true },
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
    // `ipxStatic` only transforms at build/prerender time (correct for the
    // Cloudflare Pages deploy, which has no sharp runtime). In dev there is no
    // `/_ipx/` handler, so use on-demand `ipx` there to preview optimized images.
    provider: process.env.NODE_ENV === 'development' ? 'ipx' : 'ipxStatic',
    quality: 78
  },

  llms: {
    domain: 'https://knecht.works',
    title: 'Knecht',
    description: 'Knecht is a self-hostable orchestration tool that connects to your GitHub repos and uses workflows to boot up complete projects so that agents can fix and test in functional environments.',
    full: {
      title: 'Knecht — Full website content',
      description: 'The complete content of the Knecht website as a single document.'
    },
    sections: [
      {
        title: 'Legal',
        description: 'Legal pages',
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

  ogImage: { zeroRuntime: true },

  sitemap: {
    sources: ['/api/__sitemap__/urls']
  }
})
