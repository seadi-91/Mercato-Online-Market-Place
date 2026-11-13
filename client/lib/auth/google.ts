"use client";

import { API_CONFIG } from "@/config/api.config";
import type { UserRole } from "@/store/auth-store";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              error_uri?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (error: unknown) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: "popup" | "redirect";
            redirect_uri?: string;
            callback?: (response: { code?: string; error?: string }) => void;
            error_callback?: (error: unknown) => void;
          }) => {
            requestCode: () => void;
          };
        };
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

/**
 * Dynamically loads the official Google Identity Services SDK script once
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) return resolve();

    const loadError = () =>
      new Error(
        "Could not load Google Identity Services. Check your internet connection or browser ad-blockers."
      );

    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
        return resolve();
      }
      existingScript.addEventListener(
        "load",
        () => {
          setTimeout(resolve, 50);
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => {
          existingScript.remove();
          reject(loadError());
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(resolve, 50);
    };
    script.onerror = () => {
      script.remove();
      reject(loadError());
    };
    document.head.appendChild(script);
  });
}

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: UserRole;
    avatar?: string;
    avatarUrl?: string;
  };
}

export interface GoogleOAuthIntent {
  role: UserRole;
  isRegistration: boolean;
  postLoginDest: string;
  redirectUri: string;
  timestamp: number;
}

const GOOGLE_INTENT_KEY = "mercatox_google_oauth_intent";

function isPlaceholderClientId(clientId?: string | null): boolean {
  if (!clientId) return true;
  const trimmed = clientId.trim();
  return (
    !trimmed ||
    trimmed.includes("your_google_client_id") ||
    trimmed.toLowerCase().includes("placeholder")
  );
}

async function resolveGoogleClientId(): Promise<string> {
  // Prefer live server config so client & server OAuth credentials never drift out of sync
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_CONFIG.baseURL}/auth/oauth-config`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        if (!isPlaceholderClientId(data?.googleClientId)) {
          return String(data.googleClientId).trim();
        }
      }
    } catch {
      // fall back to NEXT_PUBLIC_GOOGLE_CLIENT_ID
    }
  }

  const envClientId =
    API_CONFIG.googleClientId ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";

  if (!isPlaceholderClientId(envClientId)) {
    return envClientId.trim();
  }

  throw new Error(
    "Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID or configure GOOGLE_CLIENT_ID on the server."
  );
}

function extractServerErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  if (Array.isArray(data.message) && data.message.length > 0) {
    return String(data.message[0]);
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }
  return fallback;
}

export function getStoredGoogleOAuthIntent(): GoogleOAuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GOOGLE_INTENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GoogleOAuthIntent;
  } catch {
    return null;
  }
}

export function clearStoredGoogleOAuthIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(GOOGLE_INTENT_KEY);
  } catch {
    // ignore
  }
}

export function startGoogleRedirectOAuth(options: {
  clientId: string;
  role?: UserRole;
  isRegistration?: boolean;
  postLoginDest?: string;
}): void {
  if (typeof window === "undefined") return;
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  const postLoginDest =
    options.postLoginDest ||
    (() => {
      try {
        return sessionStorage.getItem("mercatox_auth_redirect") || "/";
      } catch {
        return "/";
      }
    })();

  const intent: GoogleOAuthIntent = {
    role: options.role || "CUSTOMER",
    isRegistration: Boolean(options.isRegistration),
    postLoginDest,
    redirectUri,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(GOOGLE_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // ignore
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", options.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("prompt", "select_account");
  authUrl.searchParams.set("access_type", "offline");
  if (postLoginDest && postLoginDest.startsWith("/")) {
    authUrl.searchParams.set("state", postLoginDest);
  }

  window.location.href = authUrl.toString();
}

function getGoogleErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const details = error as {
      message?: unknown;
      error?: unknown;
      type?: unknown;
      error_description?: unknown;
    };
    for (const value of [
      details.message,
      details.error_description,
      details.error,
      details.type,
    ]) {
      if (typeof value === "string" && value) {
        if (value === "popup_closed") {
          return "Sign-in popup was closed before completing.";
        }
        return value;
      }
    }
  }
  return "Google sign-in could not be completed. Please check your credentials and try again.";
}

/**
 * Triggers Google Sign-In using Google Identity Services.
 * Prioritizes initCodeClient (popup authorization-code flow exchanged with GOOGLE_CLIENT_SECRET on server),
 * with fallbacks to initTokenClient and full-page OAuth redirect.
 */
export async function triggerGoogleSignIn(
  role?: UserRole,
  isRegistration?: boolean,
  postLoginDest?: string
): Promise<GoogleAuthResponse> {
  const clientId = await resolveGoogleClientId();

  try {
    await loadGoogleScript();
  } catch {
    // If the GIS script is blocked by browser extensions, fall back to full-page redirect OAuth
    startGoogleRedirectOAuth({ clientId, role, isRegistration, postLoginDest });
    return new Promise(() => {});
  }

  // Ensure window.google.accounts is ready
  if (!window.google?.accounts?.oauth2) {
    await new Promise<void>((res) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.oauth2 || attempts > 20) {
          clearInterval(interval);
          res();
        }
      }, 50);
    });
  }

  if (!window.google?.accounts?.oauth2) {
    startGoogleRedirectOAuth({ clientId, role, isRegistration, postLoginDest });
    return new Promise(() => {});
  }

  return new Promise((resolve, reject) => {
    const oauth = window.google!.accounts.oauth2;

    // Strategy 1: Authorization Code Client (exchanges code with GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET on backend)
    if (typeof oauth.initCodeClient === "function") {
      try {
        const codeClient = oauth.initCodeClient({
          client_id: clientId,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: async (response) => {
            if (response.error) {
              let message = response.error;
              if (response.error === "popup_closed_by_user") {
                message = "Sign-in popup was closed before completing.";
              } else if (response.error === "access_denied") {
                message =
                  "Google authorization was cancelled or access denied. Ensure your Google account is added as a Test User in Google Cloud Console.";
              } else if (response.error === "origin_mismatch") {
                message = `Google OAuth origin mismatch: Add http://${window.location.host} to 'Authorized JavaScript origins' in Google Cloud Console.`;
              } else if (response.error === "redirect_uri_mismatch") {
                message =
                  "Google OAuth redirect_uri_mismatch: Ensure 'postmessage' and domain are allowed.";
              }
              return reject(new Error(message));
            }

            if (!response.code) {
              return reject(
                new Error("No authorization code received from Google")
              );
            }

            try {
              const res = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: response.code,
                  redirectUri: "postmessage",
                  role: role || "CUSTOMER",
                  isRegistration: Boolean(isRegistration),
                  clientId,
                }),
              });

              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                return reject(
                  new Error(
                    extractServerErrorMessage(
                      data,
                      "Google authentication failed on server"
                    )
                  )
                );
              }

              resolve(data);
            } catch (err: unknown) {
              reject(
                err instanceof Error
                  ? err
                  : new Error(getGoogleErrorMessage(err))
              );
            }
          },
          error_callback: (err: unknown) => {
            const msg = getGoogleErrorMessage(err);
            if (msg.includes("popup_failed_to_open")) {
              startGoogleRedirectOAuth({ clientId, role, isRegistration, postLoginDest });
              return;
            }
            reject(new Error(msg));
          },
        });

        codeClient.requestCode();
        return;
      } catch (codeInitErr) {
        console.warn("[Google Auth] initCodeClient failed, trying initTokenClient:", codeInitErr);
      }
    }

    // Strategy 2: Token Client fallback
    if (typeof oauth.initTokenClient === "function") {
      try {
        const tokenClient = oauth.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              if (tokenResponse.error === "popup_closed_by_user") {
                return reject(new Error("Sign-in popup was closed before completing."));
              }
              if (tokenResponse.error === "access_denied") {
                return reject(
                  new Error(
                    "Google sign-in authorization was cancelled or denied. Ensure your Google account is added as a Test User in Google Cloud Console."
                  )
                );
              }
              if (
                tokenResponse.error === "origin_mismatch" ||
                tokenResponse.error_description?.includes("origin_mismatch")
              ) {
                return reject(
                  new Error(
                    `Google OAuth origin mismatch: Please add http://${window.location.host} to 'Authorized JavaScript origins' in Google Cloud Console.`
                  )
                );
              }
              if (tokenResponse.error === "redirect_uri_mismatch") {
                return reject(
                  new Error(
                    "Google OAuth redirect URI mismatch: Ensure 'postmessage' and domain are allowed."
                  )
                );
              }
              return reject(
                new Error(
                  tokenResponse.error_description || tokenResponse.error
                )
              );
            }

            if (!tokenResponse.access_token) {
              return reject(
                new Error("No access token received from Google.")
              );
            }

            try {
              const res = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  accessToken: tokenResponse.access_token,
                  role: role || "CUSTOMER",
                  isRegistration: Boolean(isRegistration),
                  clientId,
                }),
              });

              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                return reject(
                  new Error(
                    extractServerErrorMessage(
                      data,
                      "Google authentication failed on server"
                    )
                  )
                );
              }

              resolve(data);
            } catch (err: unknown) {
              reject(
                err instanceof Error
                  ? err
                  : new Error(getGoogleErrorMessage(err))
              );
            }
          },
          error_callback: (err: unknown) => {
            const msg = getGoogleErrorMessage(err);
            if (msg.includes("popup_failed_to_open")) {
              // Fall back seamlessly to full-page redirect OAuth when popups are blocked
              startGoogleRedirectOAuth({ clientId, role, isRegistration, postLoginDest });
              return;
            }
            reject(new Error(msg));
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (tokenInitErr) {
        reject(
          new Error(
            `Could not start Google sign-in: ${getGoogleErrorMessage(tokenInitErr)}`
          )
        );
        return;
      }
    }

    reject(new Error("No supported Google Identity Services client available."));
  });
}
