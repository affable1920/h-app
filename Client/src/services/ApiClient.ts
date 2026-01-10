import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";

import {
  isPydanticError,
  type APIError,
  type PydanticValidationError,
} from "@/types/errors";

const CONFIG: Record<number, string> = {
  400: "Bad Request",
  401: "Not authenticated",
  403: "Unauthorized",
  404: "Resource Not Found",
  422: "Invalid data",
};

const internalServerError: APIError = {
  status: 500,
  type: "Internal Server Error",
  msg: "No response from the server!",
  detail: "The server is likely down, Please try after sometime!",
};

class APIClient {
  private _baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  protected instance: AxiosInstance;

  constructor(slug: string) {
    this.instance = axios.create({
      baseURL: this._baseUrl + `/${slug}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (ex: AxiosError) => {
        /*
        Our api client has no idea what an error is about. Keep it that way, but rather minimalize 
        errors here in a structured regular and predictable order for the components|hooks to handle
        */

        if (ex.request && !ex.response) {
          return Promise.reject(internalServerError);
        }

        return Promise.reject(this.normalizeErrors(ex));
      }
    );
  }

  private formatValidationMsg(error: PydanticValidationError) {
    if (error!.length > 0) {
      const field = error?.[0].loc.slice(1).join(".");
      return `${field}: ${field} ${error?.[0].msg
        .split(" ")
        .slice(1)
        .join(" ")
        .trim()}`;
    }
  }

  private normalizeErrors(error: AxiosError): APIError {
    const { status, response } = error;

    if (status === 422 && isPydanticError((response?.data as any).detail)) {
      return {
        msg: this.formatValidationMsg((response?.data as any).detail) as string,
        status,
        detail: response,
        type: CONFIG[status],
      };
    }

    return {
      detail: response,
      status: status as number,
      msg: (response?.data as any).detail?.["msg"],
      type: CONFIG[status as number] ?? response?.statusText,
    };
  }

  async get<T>(
    path?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await this.instance.get<T>(path ? `/${path}` : "", config);
  }

  async post<TResponse, TBody>(
    path: string,
    data: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    return await this.instance.post<TResponse>(`/${path}`, data, config);
  }

  async request(config: AxiosRequestConfig) {
    return await axios(config);
  }
}

export const doctorApi = new APIClient("doctors");
export default APIClient;
