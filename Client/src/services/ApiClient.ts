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
  500: "Internal Server Error",
};

const serverDownError: APIError = {
  status: 500,
  type: "Internal Server Error",
  msg: "No response from the server!",
  detail: "The server is likely down, Please try after sometime!",
};

class APIClient {
  private baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  protected instance: AxiosInstance;

  constructor(private endpoint: string) {
    this.instance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.endpoint = endpoint;

    this.instance.interceptors.request.use(
      function (config) {
        const token = localStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(
      function (response) {
        return response;
      },
      (error) => {
        /*
        Our api client has no idea what an error is about. Keep it that way, but rather minimalize 
        errors here in a structured, regular and predictable order for the components|hooks to handle
        */

        if (error.request && !error.response) {
          return Promise.reject(serverDownError);
        }

        const { status, response, config } = error as AxiosError;
        const expiryHeader = response?.headers["x-session-expire"];

        const expired = !!expiryHeader || expiryHeader === "true";

        if (status === 401 && (expired || !config?.headers.Authorization)) {
          console.log("Session expired! logging out ...");
          localStorage.removeItem("token");

          window.location.href = "/auth";
        }

        return Promise.reject(this.normalizeErrors(error));
      },
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
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return await this.instance.get<T>(`${this.endpoint}/${path ?? ""}`, config);
  }

  async post<TResponse, TBody>(
    path: string,
    data: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    return await this.instance.post<TResponse>(
      `${this.endpoint}/${path}`,
      data,
      config,
    );
  }

  async put() {}

  async delete(path: string) {
    await this.instance.delete(`${this.endpoint}/${path}`);
  }
}

export default APIClient;
