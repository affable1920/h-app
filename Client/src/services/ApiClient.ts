import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class APIClient {
  private _baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  protected instance: AxiosInstance;

  constructor(public readonly endpoint: string) {
    this.instance = axios.create({
      baseURL: this._baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.endpoint = endpoint;
  }

  async get<T>(
    path?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const url = this.endpoint + "/" + (path ?? "");
    return await this.instance.get<T>(url, config);
  }

  // T as the post request's data and R as the response's type.
  async post<TResponse, TBody>(
    path: string,
    data: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    const url = this.endpoint + "/" + (path ?? "");
    return await this.instance.post<TResponse>(url, data, config);
  }

  async request(config: AxiosRequestConfig) {
    return await axios(config);
  }
}

export default APIClient;
