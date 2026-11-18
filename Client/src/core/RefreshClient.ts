import axios from "axios";
import { config } from "./config";

// A bare-bone refresh client with no interceptors and a fixed refresh URL.
// Returns the access token or implicitly raises the error recieved in case of
// no token to keep being reusable.

const refreshClient = axios.create({
  baseURL: config.api_url,
  withCredentials: true, // enable cookies
  timeout: 5000, // set a timeout, to prevent indefinite waiting on hunup servers
});

export async function refresh() {
  const response = await refreshClient.post("/auth/refresh");
  return response.headers["x-auth-token"] as string;
}
