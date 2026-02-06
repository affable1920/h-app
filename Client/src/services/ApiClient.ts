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
} from "@/types/http";

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
  private baseUrl: string = "http://localhost:8000";
  // import.meta.env.VITE_NGROK_URL ||
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
      (config) => {
        const token = localStorage.getItem("token");

        console.log(token);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          delete config.headers.Authorization;
        }

        return config;
      },
      function (error) {
        console.log("request error", error);
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

        const { status, response } = error as AxiosError;

        if (status === 401 && response?.headers?.["x-auth-token"] === "true") {
          const msg = "sessioen expired. Please login again";
          console.log(msg);
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

    const expired =
      (response?.headers?.["x-session-expire"] as string) === "true";

    if (expired) {
      return {
        msg: "Your session has expired! please login again",
        status: 401,
        type: "session-expiry",
        detail: response,
      };
    }

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

  private getSlug(path: string | undefined) {
    return this.endpoint + (path ? `/${path}` : "");
  }

  async get<T>(
    path?: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    console.log(this.baseUrl);
    return await this.instance.get<T>(this.getSlug(path), config);
  }

  async post<TResponse, TBody>(
    path: string = "",
    data: TBody,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    console.log("axios instance defaults:", this.instance.defaults);

    return await this.instance.post<TResponse>(
      this.getSlug(path),
      data,
      config,
    );
  }

  async put<TData>(path: string, data: TData, config?: AxiosRequestConfig) {
    return await this.instance.put(this.getSlug(path), data, config);
  }

  async delete(path: string, config?: AxiosRequestConfig) {
    await this.instance.delete(this.getSlug(path), config);
  }
}

export default APIClient;
