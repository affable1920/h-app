import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

class APIClient {
  private _baseUrl: string = import.meta.env.VITE_API_URL || "localhost:8000";
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: this._baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.api.get(endpoint, config)).data;
  }

  async post<T>(
    endpoint: string,
    postData: T,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return (await this.api.post(endpoint, postData, config)).data;
  }
}

export default new APIClient();
