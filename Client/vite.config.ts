import path from "path";
import { defineConfig, type CommonServerOptions } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

const useHttps = Number(process.env.VITE_USE_HTTPS) === 1;
const is_using_container = Number(process.env.VITE_IS_USING_CONTAINER) === 1;

console.log(
  `Running vite dev server ${is_using_container ? "inside" : "outside"} container
  in ${useHttps ? "https" : "http"} mode.`,
);

const https: CommonServerOptions["https"] = !useHttps
  ? undefined
  : {
      key: fs.readFileSync(
        is_using_container
          ? "/certs/key.pem"
          : path.resolve(__dirname, "../localhost+3-key.pem"),
      ),
      cert: fs.readFileSync(
        is_using_container
          ? "/certs/cert.pem"
          : path.resolve(__dirname, "../localhost+3.pem"),
      ),
    };

const protocol = (useHttps ? "https" : "http") + "://";
const wsProtocol = (useHttps ? "wss" : "ws") + "://";

export default defineConfig({
  plugins: [react(), tailwindcss()],

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
        target:
          protocol + (is_using_container ? "server:8000" : "localhost:8000"),
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/ws": {
        target:
          wsProtocol + (is_using_container ? "server:8000" : "localhost:8000"),
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@routes": path.resolve(__dirname, "./src/components/routes"),
    },
  },
});
