export type ErrorResponse = {
  type: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};
