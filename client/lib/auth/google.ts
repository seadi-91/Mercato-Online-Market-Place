"use client";

import { API_CONFIG } from "@/config/api.config";

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
            error_callback?: (error: any) => void;
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

    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
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
    role: string;
  };
}

/**
 * Triggers Google Sign-In popup with automatic code exchange via MercatoX backend
 */
export async function triggerGoogleSignIn(): Promise<GoogleAuthResponse> {
  await loadGoogleScript();

  const clientId = API_CONFIG.googleClientId;
  if (!clientId) {
    throw new Error("Google Client ID is not configured");
  }

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      // Fallback: Redirect to Google OAuth authorization endpoint
      const callback = `${window.location.origin}/auth/callback/google`;
      const scope = encodeURIComponent("openid email profile");
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        callback
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      return;
    }

    try {
      const codeClient = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: async (response) => {
          if (response.error) {
            return reject(new Error(response.error));
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
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              return reject(
                new Error(data?.message || "Google authentication failed on server")
              );
            }

            resolve(data);
          } catch (err: any) {
            reject(err);
          }
        },
        error_callback: (err: any) => {
          const message =
            typeof err === "string"
              ? err
              : err?.message || err?.error || err?.type || "Google sign-in popup was blocked or closed";
          reject(new Error(message));
        },
      });

      codeClient.requestCode();
    } catch {
      // Fallback to full page redirect if popup fails or is blocked
      const callback = `${window.location.origin}/auth/callback/google`;
      const scope = encodeURIComponent("openid email profile");
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        callback
      )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    }
  });
}
