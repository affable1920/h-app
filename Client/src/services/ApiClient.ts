import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class APIClient {
  private _baseUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  protected _api: AxiosInstance;
  protected _endpoint: string;

  constructor(endpointPath: string) {
    this._endpoint = endpointPath;
    this._api = axios.create({
      baseURL: this._baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get<T>(config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await this._api.get<T>(this._endpoint, config);
  }

  async post<T>(
    postData: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return await this._api.post<T>(this._endpoint, postData, config);
  }
}

export default APIClient;
