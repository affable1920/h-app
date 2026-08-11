const isProd = import.meta.env.PROD;

export const config: Record<"api_url" | "ws_url", string> = {
  api_url: isProd ? import.meta.env.VITE_API_URL : "/api",
  ws_url: isProd ? import.meta.env.VITE_WS_URL : `/ws`,
};
