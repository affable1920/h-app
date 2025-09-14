import axios from "axios";

const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  (ex) => Promise.reject(ex)
);

// api exp backoff

export default api;
