import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";

import { type APIError, type PydanticValidationError } from "@/types/http";
import useAuthStore, { logout } from "@/stores/auth-store";
import { config } from "@/core/config";

const CONFIG: Record<number, string> = {
  400: "Bad Request",
  401: "Not authenticated",
  403: "Unauthorized",
  404: "Resource Not Found",
  422: "Invalid data",
  500: "Internal Server Error",
} as const;

class APIClient {
  private baseUrl: string = config.api_url;
  protected instance: AxiosInstance;

  constructor(private readonly endpoint: string) {
    this.instance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.endpoint = endpoint;

    this.instance.interceptors.request.use(
      function (config) {
        const token = useAuthStore.getState().token;

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      function (error) {
        return Promise.reject(error);
      },
    );

    this.instance.interceptors.response.use(function (response) {
      return response;
    }, this.onResponseError.bind(this));
  }

  private onResponseError(this: APIClient, error: AxiosError) {
    const { request, response } = error;

    if (!response && request) {
      const sde = {
        message: "Recieved no response from the server.",
        code: "server_down",
        status: 500,
      };

      return Promise.reject(sde);
    }

    const { headers } = response as AxiosResponse;

    if (headers["x-session-expire"] == "true") {
      logout("/auth");
    }

    return Promise.reject(this.normalizeErrors(response!));
  }

  private normalizeErrors(response: AxiosResponse): APIError {
    if (response.status === 422) {
      return {
        message: "Invalid input.",
        code: "validation_error",
        status: 422,
        detail: response,
      };
    }

    const { code, message, status } = (response.data as any).detail;

    return {
      code,
      message,
      status: status,
      detail: response,
    };
  }

  private getSlug(path: string | undefined) {
    return this.endpoint + (path ? `/${path}` : "");
  }

  async get<TData>(
    path?: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TData>> {
    return await this.instance.get<TData>(this.getSlug(path), config);
  }

  async post<TResponse, TBody>(
    path: string = "",
    data: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    return await this.instance.post<TResponse>(
      this.getSlug(path),
      data,
      config,
    );
  }

  async put<TData>(path: string, data: TData, config?: AxiosRequestConfig) {
    return await this.instance.put(this.getSlug(path), data, config);
  }

  async delete<TEntity = unknown>(path: string, config?: AxiosRequestConfig) {
    await this.instance.delete<TEntity>(this.getSlug(path), config);
  }
}

export default APIClient;
