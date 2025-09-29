import axios, { AxiosError } from "axios";
import type { ErrorResponse } from "../types/responses";

const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ERRORS: Record<number, ErrorResponse> = {
  400: { status: 400, type: "Bad Request", message: "Invalid request." },
  401: { status: 401, type: "Unauthorized", message: "Invalid credentials." },

  // 403 - Admin privileges
  403: { status: 403, type: "Forbidden", message: "Access denied." },
  404: { status: 404, type: "Not Found", message: "Resource not found." },
  500: {
    status: 500,
    type: "Internal Server Error",
    message: "Something went wrong.",
  },
  0: {
    status: 0,
    type: "Service Unavailable",
    message: "Service is currently unavailable.",
  },
};

const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config,
  (ex) => Promise.reject(ex)
);

api.interceptors.response.use(
  (config) => config,
  (ex: AxiosError) => {
    if (!ex.response) return Promise.reject(ERRORS[ex.status || 0]);

    const { response } = ex;
    console.log(response);

    const exObject = { ...ERRORS[response.status], details: response.data };
    return Promise.reject(exObject);
  }
);

export default api;
