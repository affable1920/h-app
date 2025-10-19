import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

class APIClient<T> {
  private _baseUrl: string = import.meta.env.VITE_API_URL || "localhost:8000";

  protected api: AxiosInstance;
  protected _endpoint: string;

  constructor(endpointPath: string) {
    this._endpoint = endpointPath;
    this.api = axios.create({
      baseURL: this._baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async get(config?: AxiosRequestConfig): Promise<T> {
    return (await this.api.get<T>(this._endpoint, config)).data;
  }

  async post(postData: T, config?: AxiosRequestConfig): Promise<T> {
    return (await this.api.post<T>(this._endpoint, postData, config)).data;
  }
}

export default APIClient;
