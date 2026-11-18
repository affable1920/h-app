import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";

import { type APIError, type IncomingErrorPayload } from "@/types/http";
import useAuthStore from "@stores/auth-store";
import { config } from "@core/config";
import { getFreshAccessToken } from "@/routing/restoreSession";

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
          config.headers.set("Authorization", `Bearer ${token}`);
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

  private async onResponseError(
    this: APIClient,
    error: AxiosError<IncomingErrorPayload>,
  ) {
    const { response } = error;

    if (!response) {
      const sde = {
        message: "Recieved no response from the server.",
        code: "server_down",
        statusCode: 500,
      };

      return Promise.reject(sde);
    }

    // save the original request config object and additionally a flag with it
    // determining if the request retried.
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original) {
      return Promise.reject(this.normalizeErrors(response));
    }

    if (
      response.status === 401 &&
      response.headers["x-session-expire"] == "true" &&
      !original._retry // only retry if not already
    ) {
      original._retry = true;

      const authorization = original.headers?.Authorization ?? "";

      const sentToken = authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : null;

      const currentToken = useAuthStore.getState().token;

      if (currentToken && currentToken !== sentToken) {
        return this.instance(original);
      }

      try {
        const newToken = await getFreshAccessToken();

        if (newToken !== sentToken) {
          return this.instance(original);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(this.normalizeErrors(response));
  }

  private normalizeErrors(
    response: AxiosResponse<IncomingErrorPayload>,
  ): APIError {
    if (response.status === 422) {
      return {
        ...response.data,
        message: "Invalid input.",
        code: "validation_error",
        statusCode: response.data.status_code,
        details: response.data,
      };
    }

    return {
      ...response.data,
      statusCode: response.data.status_code,
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
    data?: TBody,
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

  async patch<TResponse, TBody>(
    path: string,
    data: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    return await this.instance.patch<TResponse>(
      this.getSlug(path),
      data,
      config,
    );
  }

  async delete<TResponse>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    return await this.instance.delete<TResponse>(this.getSlug(path), config);
  }
}

export default APIClient;
