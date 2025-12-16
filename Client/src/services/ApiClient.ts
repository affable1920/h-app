import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

const CONFIG: Record<number, { name: string }> = {
  400: { name: "Bad Request" },
  401: { name: "Unauthenticated" },
  422: { name: "Invalid data" },
  500: { name: "Server Error" },
};

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

    this.instance.interceptors.response.use(
      (response) => response,
      function (e: AxiosError) {
        if (e.request && !e.response) {
          return Promise.reject({
            status: e.status,
            detail: null,
            msg: "No response from the server!",
            description:
              "The server is likely down, Please try after sometime!",
          });
        }

        const { response, status } = e;
        const clientError = status && status < 500 && status >= 400;

        if (clientError) {
          return Promise.reject({
            status,
            detail: e,
            description: CONFIG[status ?? 500]?.name,
            msg: (response?.data as any)?.detail,
          });
        }

        return Promise.reject({
          status,
          detail: e,
          msg: (response?.data as any).detail,
          description: CONFIG[status ?? 500].name,
        });
      }
    );
  }

  async get<T>(
    path?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    console.log(this.endpoint);

    const url = this.endpoint + (path ? `/${path}` : "");
    return await this.instance.get<T>(url, config);
  }

  // T as the post request's data and R as the response's type.
  async post<TResponse, TBody>(
    path: string,
    data: TBody,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<TResponse>> {
    const url = this.endpoint + "/" + (path ?? "");
    return await this.instance.post<TResponse>(url, data, {
      ...config,
    });
  }

  async request(config: AxiosRequestConfig) {
    return await axios(config);
  }
}

export default APIClient;
