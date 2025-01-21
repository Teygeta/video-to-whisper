import { themePreset } from './primeTheme'
import './env'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
  ],
  primevue: {
    options: {
      theme: {
        preset: themePreset,
      },
    },
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
})
