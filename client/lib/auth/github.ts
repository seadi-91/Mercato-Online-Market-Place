"use client";

import { API_CONFIG } from "@/config/api.config";
import type { UserRole } from "@/store/auth-store";

export interface GitHubAuthResponse {
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
    authProvider: string;
    isVerified?: boolean;
  };
}

export interface GitHubOAuthOptions {
  role?: UserRole;
  isRegistration?: boolean;
  postLoginDest?: string;
}

export interface GitHubOAuthIntent extends GitHubOAuthOptions {
  state: string;
  callbackUrl?: string;
  timestamp: number;
}

const GITHUB_INTENT_KEY = "mercatox_github_oauth_intent";

/**
 * Retrieve GitHub Client ID from client env or dynamic API Gateway configuration
 */
export async function getGitHubClientId(): Promise<string> {
  let clientId = API_CONFIG.githubClientId || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";
  if (!clientId && typeof window !== "undefined") {
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/oauth-config`);
      if (res.ok) {
        const data = await res.json();
        if (data?.githubClientId) {
          clientId = data.githubClientId;
        }
      }
    } catch {
      // ignore
    }
  }
  return clientId || "Ov23liTNWyMsHJuhwQ6i";
}

/**
 * Compute the registered GitHub OAuth callback URL matching .env GITHUB_CALLBACK_URL
 */
export function getGitHubCallbackUrl(): string {
  if (API_CONFIG.githubCallbackUrl) {
    return API_CONFIG.githubCallbackUrl;
  }
  if (process.env.NEXT_PUBLIC_GITHUB_CALLBACK_URL) {
    return process.env.NEXT_PUBLIC_GITHUB_CALLBACK_URL;
  }
  return "http://localhost:8000/api/auth/github/callback";
}

/**
 * Initiates standard GitHub OAuth 2.0 redirection flow
 */
export async function startGitHubOAuth(options: GitHubOAuthOptions = {}): Promise<void> {
  if (typeof window === "undefined") return;

  const clientId = await getGitHubClientId();
  if (!clientId) {
    throw new Error("GitHub Client ID is missing. Please check your .env configuration.");
  }

  const callbackUrl = getGitHubCallbackUrl();
  const state = Math.random().toString(36).substring(2, 15) + "_" + Date.now().toString(36);

  const intent: GitHubOAuthIntent = {
    role: options.role || "CUSTOMER",
    isRegistration: Boolean(options.isRegistration),
    postLoginDest: options.postLoginDest || "/",
    callbackUrl,
    state,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(GITHUB_INTENT_KEY, JSON.stringify(intent));
  } catch (err) {
    console.warn("[GitHub OAuth] Could not store intent in sessionStorage:", err);
  }

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", callbackUrl);
  authUrl.searchParams.set("scope", "read:user user:email");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("allow_signup", "true");

  window.location.href = authUrl.toString();
}

/**
 * Retrieves the stored intent from before redirect
 */
export function getStoredGitHubIntent(): GitHubOAuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GITHUB_INTENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GitHubOAuthIntent;
  } catch {
    return null;
  }
}

/**
 * Clears stored OAuth intent
 */
export function clearStoredGitHubIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(GITHUB_INTENT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Exchanges the temporary GitHub authorization code for JWT session tokens via backend API
 */
export async function exchangeGitHubCode(
  code: string,
  options: {
    redirectUri?: string;
    role?: UserRole;
    isRegistration?: boolean;
  } = {}
): Promise<GitHubAuthResponse> {
  const effectiveRedirectUri = options.redirectUri || getGitHubCallbackUrl();

  const response = await fetch(`${API_CONFIG.baseURL}/auth/github`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      redirectUri: effectiveRedirectUri,
      role: options.role || "CUSTOMER",
      isRegistration: Boolean(options.isRegistration),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      "GitHub authentication failed. Please check your credentials and try again.";
    throw new Error(errorMsg);
  }

  return data as GitHubAuthResponse;
}
