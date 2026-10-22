import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";

/**
 * Checks if a string has the valid structure of a 3-part signed JWT.
 */
export function isValidJwt(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  return parts.length === 3;
}

/**
 * Checks if a JWT token has expired based on its embedded exp claim.
 * Non-JWT session tokens are NOT considered expired.
 */
export function isJwtExpired(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  if (!isValidJwt(token)) return false;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && Date.now() >= (payload.exp - 5) * 1000) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Returns the current authenticated token if one exists in the auth store.
 */
export async function ensureValidAuthToken(): Promise<string | null> {
  const currentToken = useAuthStore.getState().token;
  return currentToken || null;
}

function extractUserId(user: any, refreshToken: string): string | null {
  if (user?.id) return user.id;
  try {
    const payload = JSON.parse(atob(refreshToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export const requestAuthInterceptor = async (config: InternalAxiosRequestConfig) => {
  try {
    const { token, refreshToken, user, setTokens } = useAuthStore.getState();

    // Only attach Authorization header if the token is a real valid JWT
    if (!token || !isValidJwt(token)) {
      return config;
    }

    // Proactively refresh if access token expired and refreshToken is present
    if (isJwtExpired(token) && refreshToken && isValidJwt(refreshToken)) {
      const userId = extractUserId(user, refreshToken);
      if (userId) {
        try {
          const res = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
            userId,
            refreshToken,
          });
          if (res.data?.accessToken) {
            const newAccess = res.data.accessToken;
            const newRefresh = res.data.refreshToken || refreshToken;
            setTokens(newAccess, newRefresh);
            config.headers.Authorization = `Bearer ${newAccess}`;
            return config;
          }
        } catch {
          // Refresh failed, proceed with existing token
        }
      }
    }

    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Continue if running in non-browser context
  }
  return config;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

  // If 401 Unauthorized, attempt refresh if a valid refreshToken exists
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    const { refreshToken, user, setTokens } = useAuthStore.getState();

    if (refreshToken && isValidJwt(refreshToken)) {
      const userId = extractUserId(user, refreshToken);
      if (userId) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((newToken) => {
              if (newToken && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axios(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
            userId,
            refreshToken,
          });
          const newAccessToken = res.data?.accessToken;
          const newRefreshToken = res.data?.refreshToken || refreshToken;

          if (newAccessToken) {
            setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return axios(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
        } finally {
          isRefreshing = false;
        }
      }
    }
  }

  // Do NOT wipe or destroy the user's login session on 401 responses.
  // The user remains logged in until they explicitly click Sign Out / Logout.
  return Promise.reject(error);
};

