const USE_HTTPS = Number(import.meta.env.VITE_USE_HTTPS) === 1;

export const config: Record<"api_url" | "ws_url", string> = {
  api_url: USE_HTTPS ? import.meta.env.VITE_API_URL : "http://localhost:8000",
  ws_url: USE_HTTPS ? import.meta.env.VITE_WS_URL : "ws://localhost:8000/ws",
};
