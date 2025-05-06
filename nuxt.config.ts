export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    '@nuxtjs/supabase'
  ],
  css: ['~/assets/css/main.css'],
  supabase: {
    redirect: false
  },

  // For Vite (vite.config.ts or nuxt.config.ts)
  pwa: {
    injectRegister: 'auto',
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.png', 'favicon.ico'], // Include static assets
    manifest: {
      name: 'FJL Wells Primary School App',
      short_name: 'FJL Wells',
      description: 'School App',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: 'icons/icon-192x192.png', // Path relative to public/
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },

    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/announcements/,/^\/newsletters/, /^\/dashboard/, /^\/login/],
    },
    




    devOptions: {
      enabled: true,
      type: 'module',

    }
  },


  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    public: {
      SCHOOL_ID:process.env.SCHOOL_ID,
      VAPID_KEY: process.env.VAPID_KEY,
      PUBLIC_VAPID_KEY: process.env.PUBLIC_VAPID_KEY,
      FIREBASE_apiKey: process.env.FIREBASE_apiKey,
      FIREBASE_authDomain: process.env.FIREBASE_authDomain,
      FIREBASE_projectId: process.env.FIREBASE_projectId,
      FIREBASE_storageBucket: process.env.FIREBASE_storageBucket,
      FIREBASE_messagingSenderId: process.env.FIREBASE_messagingSenderId,
      FIREBASE_appId: process.env.FIREBASE_appId,
      FIREBASE_measurementId: process.env.FIREBASE_measurementId,
      FIREBASE_clientEmail: process.env.FIREBASE_clientEmail,
      FIREBASE_privateKey: process.env.FIREBASE_privateKey,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      showMenu: process.env.SHOW_MENU,
      address:process.env.ADDRESS,
      email:process.env.EMAIL,
      tel:process.env.TEL
      
    }
  },

  nitro: {
    publicAssets: [
      {
        dir: 'public',
        maxAge: 3600
      }
    ],
    plugins: ['~/server/index.ts']
  },

  experimental: {
    payloadExtraction: true
  }
})
