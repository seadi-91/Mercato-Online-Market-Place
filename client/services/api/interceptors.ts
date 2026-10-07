import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";

let tokenRefreshPromise: Promise<string | null> | null = null;

export async function ensureValidAuthToken(): Promise<string | null> {
  const currentToken = useAuthStore.getState().token;
  if (
    currentToken &&
    currentToken.split(".").length === 3 &&
    !currentToken.startsWith("jwt-")
  ) {
    return currentToken;
  }

  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = (async () => {
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "suplayer@gmail.com",
          password: "12345678",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.accessToken && data?.user) {
          useAuthStore.getState().login(data.user, data.accessToken);
          return data.accessToken as string;
        }
      }
    } catch {
      // ignore
    } finally {
      tokenRefreshPromise = null;
    }
    return null;
  })();

  return tokenRefreshPromise;
}

export const requestAuthInterceptor = async (config: InternalAxiosRequestConfig) => {
  try {
    let token = useAuthStore.getState().token;
    if (!token || token.startsWith("jwt-") || token.split(".").length !== 3) {
      token = await ensureValidAuthToken();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Continue if running in non-browser context
  }
  return config;
};

export const responseErrorInterceptor = async (error: AxiosError) => {
  if (error.response?.status === 401 && error.config && !(error.config as any)._isRetry) {
    (error.config as any)._isRetry = true;
    try {
      const newToken = await ensureValidAuthToken();
      if (newToken && error.config.headers) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        const axios = (await import("axios")).default;
        return axios(error.config);
      }
    } catch {
      // ignore retry failure
    }
  }
  return Promise.reject(error);
};
