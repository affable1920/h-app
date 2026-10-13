export type APIError = {
  message: string;
  code: string;
  status: number;
  ctx?: unknown;
  detail?: unknown;
};
