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
      if (typeof value === "string" && value) return value;
    }
  }
  return "Google sign-in could not be completed. Please check your credentials and try again.";
}

/**
 * Triggers Google Sign-In using modern Google Identity Services.
 * Uses initTokenClient as primary strategy for direct user profile exchange,
 * and seamlessly falls back to initCodeClient if required.
 */
export async function triggerGoogleSignIn(
  role?: UserRole,
  isRegistration?: boolean
): Promise<GoogleAuthResponse> {
  await loadGoogleScript();

  const clientId =
    API_CONFIG.googleClientId ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "";

  if (!clientId) {
    throw new Error(
      "Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID."
    );
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

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          "Google Identity Services did not load. Check your network connection and retry."
        )
      );
      return;
    }

    const oauth = window.google.accounts.oauth2;

    // Strategy 1: Modern Token Client (Most reliable for Next.js Single Page Apps)
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

              const data = await res.json();
              if (!res.ok) {
                return reject(
                  new Error(
                    data?.message || "Google authentication failed on server"
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
            if (msg.includes("popup_failed_to_open") || msg.includes("popup")) {
              reject(
                new Error(
                  "Popup was blocked by your browser. Please allow popups for localhost:3000 and try again."
                )
              );
            } else {
              reject(new Error(msg));
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (tokenInitErr) {
        console.warn("[Google Auth] initTokenClient failed, trying initCodeClient:", tokenInitErr);
      }
    }

    // Strategy 2: Code Client fallback
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

              const data = await res.json();
              if (!res.ok) {
                return reject(
                  new Error(
                    data?.message || "Google authentication failed on server"
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
            if (msg.includes("popup_failed_to_open") || msg.includes("popup")) {
              reject(
                new Error(
                  "Popup was blocked by your browser. Please allow popups for localhost:3000 and try again."
                )
              );
            } else {
              reject(new Error(msg));
            }
          },
        });

        codeClient.requestCode();
        return;
      } catch (codeInitErr) {
        reject(
          new Error(
            `Could not start Google sign-in: ${getGoogleErrorMessage(codeInitErr)}`
          )
        );
        return;
      }
    }

    reject(new Error("No supported Google Identity Services client available."));
  });
}
