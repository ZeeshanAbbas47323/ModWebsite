import axios from "axios";
import { getToken } from "@/lib/auth-storage";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";
    const wrapped = new Error(message);


    Object.assign(wrapped, { status: error.response?.status });
    return Promise.reject(wrapped);
  }
);

export default apiClient;
