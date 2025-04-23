import axios from "axios";

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig();
  axios.defaults.baseURL = config.public.apiBaseUrl;
  axios.defaults.headers["Accept"] = "application/json";
  axios.defaults.headers["Content-Type"] = "application/json";

  return {
    provide: {
      axios: axios,
    },
  };
});
