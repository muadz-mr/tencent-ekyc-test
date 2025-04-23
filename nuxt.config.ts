// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/fonts", "@nuxt/test-utils", "@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "Tencent e-KYC Test",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: import.meta.env.NUXT_PUBLIC_API_BASE_URL,
    },
  },
});
