export type Error = {
  type: string;
  status: number;
  message: string;
  details?: Record<string, unknown>;
};

export interface BaseResponse<T> {
  data: T | Error;
  type?: string;
  status: number;
  messsage: string;
  details?: Record<string, unknown>;
}
