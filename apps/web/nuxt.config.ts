import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      wsUrl: process.env.NUXT_PUBLIC_WS_URL,
    },
  },
});
