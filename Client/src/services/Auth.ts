import type { paths } from "@/types/api";
import type { AxiosResponse } from "axios";
import APIClient from "@/services/ApiClient";

type LoginUser =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

type DBUser =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

type CreateUser =
  paths["/auth/register"]["post"]["requestBody"]["content"]["application/json"];

class AuthClient extends APIClient {
  constructor() {
    super("/auth");

    this.instance.interceptors.request.use(
      function (config) {
        const token = localStorage.getItem("token");

        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      function (ex) {
        return Promise.reject(ex);
      }
    );
  }

  private _setSessionToken(headers: AxiosResponse["headers"]) {
    const token = headers["x-auth-token"];
    if (!token) {
      throw new Error("Please login again !");
    }

    localStorage.setItem("token", token);
    console.log("token successfully set in local storage");
  }

  async login(user: LoginUser) {
    const response = await this.post<DBUser, LoginUser>("login", { ...user });
    this._setSessionToken(response.headers);
  }

  async register(user: CreateUser): Promise<DBUser> {
    const response = await this.post<DBUser, CreateUser>("register", {
      ...user,
    });

    this._setSessionToken(response.headers);
    return response.data;
  }

  async profile() {
    const response = await this.get("me");
    console.log(response.data);
  }
}

const authClient = new AuthClient();
export default authClient;
