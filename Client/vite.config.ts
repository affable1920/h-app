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
export default defineConfig(function ({ mode }) {
  return {
    /* configure what happens during build time 
    - npm run build */
    // build: {
    //   rollupOptions: {
    //     // Instructions for rollup aka the bundler Vite uses under the hood
    //     output: {
    //       // How to output the built files
    //       // use names for packages as in package.json
    //       // code splitting: Manually define which modules/files go together
    //       manualChunks(id) {
    //         if (id.includes("node_modules")) {
    //           if (
    //             id.includes("react") ||
    //             id.includes("react-dom") ||
    //             id.includes("react-router-dom")
    //           ) {
    //             return "react-vendor";
    //           }
    //         }

    //         return "react-vendor";
    //       },
    //     },
    //   },
    // },

    plugins: [react(), tailwindcss()],

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
