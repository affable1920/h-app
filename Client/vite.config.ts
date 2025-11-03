import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/*
- Vite config doc

The third paramter: the empty string loads all envs at the app level
regardless of the VITE_ prefix, all env vars with the given prefix 
ll be resolved and available on the env object 
*/

// https://vite.dev/config/
export default defineConfig(function () {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        // don't use the wildcard char for vite aliases. vite auto. resolves em'
        "@": path.resolve(__dirname, "./src"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@routes": path.resolve(__dirname, "./src/components/routes"),
      },
    },
  };
});
