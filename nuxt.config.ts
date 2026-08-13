// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/seo',
    'nuxt-llms',
    'motion-v/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  app: {
    pageTransition: false,
    layoutTransition: false,

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
    defaultLocale: 'en'
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
    // Optional: raises the GitHub API rate limit for /api/github.
    githubToken: '',
    // Admin notification on new signups. Empty disables the notification.
    adminNotifyEmail: '',
    // Must be a verified Resend sender domain.
    adminNotifyFrom: 'Knecht <news@knecht.works>',
    // Optional: ID of a published Resend template. Empty falls back to the
    // plain inline mail built in the handler.
    adminNotifyTemplateId: ''
  },

  routeRules: {
    '/_ipx/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    // Long-lived cache for static assets. Filenames are stable, so bump the name
    // (or add ?v=) when you replace an asset, otherwise returning visitors keep
    // the cached version for up to a year.
    '/assets/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    preset: process.env.CF_PAGES ? 'cloudflare-pages' : undefined,
    cloudflare: {
      pages: {
        routes: {
          // Nitro auto-generates one _routes.json exclude rule per prerendered
          // file and silently truncates the list at Cloudflare's limit of 100.
          // Truncated paths then hit the worker, which cannot query Nuxt
          // Content and returns 404. These wildcards keep the list small so
          // every prerendered page and asset is served statically.
          exclude: [
            '/_ipx/*',
            '/__nuxt_content/*',
            '/assets/*',
            '/favicon/*',
            '/styleguide/*',
            '/raw/*',
            '/updates/*',
            '/datenschutz/*',
            '/impressum/*',
            '/de',
            '/de/*'
          ]
        }
      }
    },
    compressPublicAssets: { gzip: true, brotli: true },
    prerender: {
      crawlLinks: true,
      failOnError: true,
      // Emit flat files (updates.html) instead of updates/index.html. With
      // subfolder output Cloudflare Pages 308-redirects every canonical URL
      // (/updates -> /updates/), which Google Search Console reports as a
      // redirect error. Flat files serve the canonical URLs with a direct 200.
      autoSubfolderIndex: false,
      // Entry points per locale. The German tree is not reachable from the
      // English pages, so crawlLinks alone would never find it.
      routes: [
        '/',
        '/updates',
        '/impressum',
        '/datenschutz',
        '/de',
        '/de/updates',
        '/de/impressum',
        '/de/datenschutz'
      ]
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@unhead/schema-org/vue',
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

  i18n: {
    // Absolute URLs in hreflang, canonical and og:url are built from this.
    baseUrl: process.env.NUXT_SITE_URL || 'https://knecht.works',
    locales: [
      // `name` is the native label, it is what the switch announces.
      { code: 'en', name: 'English', language: 'en', dir: 'ltr', file: 'en.json' },
      { code: 'de', name: 'Deutsch', language: 'de', dir: 'ltr', file: 'de.json' }
    ],
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    // No automatic redirect. Every URL always serves the language it promises,
    // AppLocaleNotice offers the other one when the browser prefers it.
    detectBrowserLanguage: false
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
      title: 'Knecht - Full website content',
      description: 'The complete content of the Knecht website as a single document.'
    },
    sections: [
      {
        title: 'Legal (EN)',
        description: 'Legal pages',
        contentCollection: 'pages_en',
        contentFilters: [
          { field: 'extension', operator: '=', value: 'md' }
        ]
      },
      {
        title: 'Updates (EN)',
        description: 'Building-in-public update articles.',
        contentCollection: 'updates_en',
        contentFilters: [
          { field: 'extension', operator: '=', value: 'md' }
        ]
      },
      {
        title: 'Legal (DE)',
        description: 'Legal pages, German.',
        contentCollection: 'pages_de',
        contentFilters: [
          { field: 'extension', operator: '=', value: 'md' }
        ]
      },
      {
        title: 'Updates (DE)',
        description: 'Building-in-public update articles, German.',
        contentCollection: 'updates_de',
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
