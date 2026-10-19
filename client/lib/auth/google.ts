"use client";

import { API_CONFIG } from "@/config/api.config";
import type { UserRole } from "@/store/auth-store";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
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
    if (window.google?.accounts?.oauth2) return resolve();

    const loadError = () =>
      new Error(
        "Could not load Google Identity Services. Check your internet connection, browser extensions, and Content Security Policy settings."
      );
    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
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
    script.onload = () => resolve();
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
  };
}

function getGoogleErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const details = error as { message?: unknown; error?: unknown; type?: unknown };
    for (const value of [details.message, details.error, details.type]) {
      if (typeof value === "string" && value) return value;
    }
  }
  return "Google sign-in could not be initialized. Check the OAuth client configuration and try again.";
}

/**
 * Triggers the Google Identity Services popup and exchanges its authorization
 * code via the MercatoX backend.
 */
export async function triggerGoogleSignIn(role?: UserRole): Promise<GoogleAuthResponse> {
  await loadGoogleScript();

  const clientId = API_CONFIG.googleClientId;
  if (!clientId) {
    throw new Error(
      "Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in client/.env"
    );
  }
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          "Google Identity Services did not load. Check your network connection and OAuth client configuration."
        )
      );
      return;
    }

    try {
      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response) => {
          if (response.error) {
            let message = response.error;
            if (response.error === "redirect_uri_mismatch") {
              message =
                "Google OAuth redirect_uri_mismatch: Ensure 'postmessage' and your domain are allowed in Google Cloud Console.";
            } else if (response.error === "origin_mismatch") {
              message =
                "Google OAuth origin_mismatch: Add 'http://localhost:3000' to 'Authorized JavaScript origins' in Google Cloud Console.";
            } else if (response.error === "access_denied") {
              message = "Google authorization was cancelled or access denied.";
            } else if (response.error === "popup_closed_by_user") {
              message = "Sign-in popup was closed before completing.";
            } else if (response.error === "popup_failed_to_open") {
              message = "Popup blocked by browser. Please allow popups for localhost:3000.";
            }
            return reject(new Error(message));
          }
          if (!response.code) {
            return reject(new Error("No authorization code received from Google"));
          }

          try {
            // Exchange code via Backend API Gateway
            const res = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: response.code,
                redirectUri: "postmessage",
                role: role || "CUSTOMER",
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              return reject(
                new Error(data?.message || "Google authentication failed on server")
              );
            }

            resolve(data);
          } catch (error: unknown) {
            reject(
              error instanceof Error
                ? error
                : new Error(getGoogleErrorMessage(error))
            );
          }
        },
        error_callback: (error: unknown) =>
          reject(new Error(getGoogleErrorMessage(error))),
      });

      codeClient.requestCode();
    } catch (error) {
      reject(
        new Error(
          `Could not start Google sign-in: ${getGoogleErrorMessage(error)}`
        )
      );
    }
  });
}
