import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

export const requestAuthInterceptor = (config: InternalAxiosRequestConfig) => {
  try {
    const token = useAuthStore.getState().token;
    if (token && token !== "mock-jwt-token" && token !== "oauth-token") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // If running in an environment where zustand/localStorage is not ready, continue
  }
  return config;
};

export const responseErrorInterceptor = (error: AxiosError) => {
  if (error.response?.status === 401) {
    console.warn("[API] 401 Unauthorized encountered from backend");
    try {
      useAuthStore.getState().logout();
    } catch {
      // ignore
    }
  }
  return Promise.reject(error);
};
