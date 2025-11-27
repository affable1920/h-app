import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

/*
- Vite config doc

The third paramter: the empty string loads all envs at the app level
regardless of the VITE_ prefix, all env vars with the given prefix 
ll be resolved and available on the env object 
*/

// https://vite.dev/config/
export default defineConfig(function () {
  return {
    /* configure what happends during build time 
    - npm run build
    */
    build: {
      rollupOptions: {
        // Instructions for rollup aka the bundler Vite uses under the hood
        output: {
          // How to output the built files
          manualChunks: {
            // code splitting: Manually define which modules/files go together
            reactVendor: ["react", "react-dom", "react-router-dom"],

            // use names for packages as in package.json
            state: ["@tanstack/react-query", "zustand"],
            components: ["react-icons", "lucide-react"],
            utils: [
              "axios",
              "luxon",
              "sonner",
              "chance",
              "motion",
              "openapi-typescript",
            ],
          },
        },
      },
    },

    plugins: [
      react(),
      tailwindcss(),
      // the rollup visualizer below shows us a visual breakdown of our bundle
      visualizer({ open: true, gzipSize: true, brotliSize: true }),
    ],

    resolve: {
      alias: {
        // don't use the wildcard char for vite aliases. vite auto. resolves em'
        "@": "./src",
        "@hooks": "./src/hooks",
        "@stores": "./src/stores",
        "@services": "./src/services",
        "@components": "./src/components",
        "@routes": "./src/components/routes",
      },
    },
  };
});
