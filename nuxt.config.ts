// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '@/assets/css/main.css'
  ],
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap' }
      ]
    }
  }
})