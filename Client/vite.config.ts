import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

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
        "@": path.resolve(__dirname, "./src"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@types": path.resolve(__dirname, "./src/types"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@styles": path.dirname(__filename) + "./src/styles",
        "@services": path.resolve(__dirname, "./src/services"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@routes": path.resolve(__dirname, "./src/components/routes"),
      },
    },
  };
});
