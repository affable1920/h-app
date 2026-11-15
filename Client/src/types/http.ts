export type APIError = {
  message: string;
  code: string;
  statusCode: number;
  ctx?: unknown;
  details?: unknown;
};
