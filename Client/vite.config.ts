import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";

const useHttps = Number(process.env.VITE_USE_HTTPS) === 1;
console.log("USE HTTPS", useHttps);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    watch: {
      ignored: [
        "**/Server/**",
        "**/server/**",
        "**/data/**",
        "**/node_modules/**",
        "**/.git/**",
      ],
    },
    allowedHosts: ["unsecretively-nontraditional-alana.ngrok-free.dev"],

    https: useHttps
      ? {
          key: fs.readFileSync(path.resolve(__dirname, "../key.pem")),
          cert: fs.readFileSync(path.resolve(__dirname, "../cert.pem")),
        }
      : undefined,
    host: "0.0.0.0",
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
