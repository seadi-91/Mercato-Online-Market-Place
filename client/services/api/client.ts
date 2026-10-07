import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "@/config/api.config";
import { requestAuthInterceptor, responseErrorInterceptor } from "./interceptors";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

apiClient.interceptors.request.use(requestAuthInterceptor, (error) => Promise.reject(error));
apiClient.interceptors.response.use((response) => response, responseErrorInterceptor);

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  upload: <T>(url: string, formData: FormData, config?: AxiosRequestConfig) =>
    apiClient
      .post<T>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data),
};

export default api;
