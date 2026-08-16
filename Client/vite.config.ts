import path from "path";
import { defineConfig, type CommonServerOptions } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import react from "@vitejs/plugin-react";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

const useHttps = Number(process.env.VITE_USE_HTTPS) === 1;
const is_using_container = Number(process.env.VITE_IS_USING_CONTAINER) === 1;

console.log(
  `Running vite dev server ${is_using_container ? "inside" : "outside"} container
  in ${useHttps ? "https" : "http"} mode.`,
);

const DIR_NAME = import.meta.dirname;

const https: CommonServerOptions["https"] = !useHttps
  ? undefined
  : {
      key: fs.readFileSync(
        path.resolve(
          DIR_NAME,
          is_using_container ? "../certs/key.pem" : "../localhost+3-key.pem",
        ),
      ),
      cert: fs.readFileSync(
        path.resolve(
          DIR_NAME,
          is_using_container ? "../certs/cert.pem" : "../localhost+3.pem",
        ),
      ),
    };

const protocol = (useHttps ? "https" : "http") + "://";
const wsProtocol = (useHttps ? "wss" : "ws") + "://";
const host = is_using_container ? "server:8000" : "localhost:8000";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
    }),
  ],

  server: {
    https,
    watch: useHttps
      ? {
          // must be true for HMR to work inside container
          usePolling: true,
        }
      : undefined,
    host: useHttps ? "0.0.0.0" : "127.0.0.1",
    proxy: {
      "/api": {
        target: protocol + host,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ws": {
        target: wsProtocol + host,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(DIR_NAME, "./src"),
      "@hooks": path.resolve(DIR_NAME, "./src/hooks"),
      "@stores": path.resolve(DIR_NAME, "./src/stores"),
      "@services": path.resolve(DIR_NAME, "./src/services"),
      "@components": path.resolve(DIR_NAME, "./src/components"),
      "@routes": path.resolve(DIR_NAME, "./src/components/routes"),
    },
  },
});
