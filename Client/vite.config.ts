import { defineConfig } from "vite";
import path from "path";
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
export default defineConfig(function ({ mode }) {
  console.log(mode);

  return {
    /* configure what happends during build time 
    - npm run build
    */
    build: {
      rollupOptions:
        mode === "production"
          ? {
              // Instructions for rollup aka the bundler Vite uses under the hood
              output: {
                // How to output the built files
                manualChunks: {
                  // code splitting: Manually define which modules/files go together
                  "react-vendor": ["react", "react-dom", "react-router-dom"],

                  // use names for packages as in package.json
                  "state-management": ["@tanstack/react-query", "zustand"],
                  "ui-libs": ["react-icons", "lucide-react"],
                  "utils-libs": [
                    "axios",
                    "luxon",
                    "sonner",
                    "chance",
                    "motion",
                    "openapi-typescript",
                  ],
                },
              },
            }
          : undefined,
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
        "@": path.resolve(__dirname, "./src"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@stores": path.resolve(__dirname, "./src/stores"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@routes": path.resolve(__dirname, "./src/components/routes"),
      },
    },
  };
});
