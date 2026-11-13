"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";
import {
  clearStoredGoogleOAuthIntent,
  getStoredGoogleOAuthIntent,
} from "@/lib/auth/google";
import { resolvePostLoginRoute } from "@/lib/auth/role-routing";

function isUserRole(role: string | null): role is UserRole {
  return (
    role === "ADMIN" ||
    role === "SELLER" ||
    role === "SUPPLIER" ||
    role === "DELIVERY" ||
    role === "DRIVER" ||
    role === "CUSTOMER"
  );
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const [status, setStatus] = useState<"loading" | "success" | "error" | "unregistered">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    async function handleCallback() {
      const intent = getStoredGoogleOAuthIntent();

      // 1. Direct tokens in query parameters (from API Gateway redirect)
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const userId = searchParams.get("id");
      const email = searchParams.get("email");
      const fullName = searchParams.get("name");
      const roleParam = searchParams.get("role");
      const role: UserRole = isUserRole(roleParam)
        ? roleParam
        : intent?.role && isUserRole(intent.role)
        ? intent.role
        : "CUSTOMER";

      if (accessToken && userId) {
        login(
          {
            id: userId,
            email: email || "",
            name: fullName || email || "Google User",
            role,
            isVerified: true,
          },
          accessToken,
          refreshToken || undefined
        );

        setStatus("success");
        toast.success(`Welcome back, ${fullName || "User"}!`, {
          description: "Signed in with Google successfully",
        });

        const storedDest =
          typeof window !== "undefined"
            ? sessionStorage.getItem("mercatox_auth_redirect")
            : null;
        const stateDest = searchParams.get("state");
        const candidateDest =
          (stateDest && stateDest.startsWith("/") ? stateDest : null) ||
          (intent?.postLoginDest && intent.postLoginDest.startsWith("/")
            ? intent.postLoginDest
            : null) ||
          (storedDest && storedDest.startsWith("/") ? storedDest : null);
        const targetUrl = resolvePostLoginRoute(candidateDest, role);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mercatox_auth_redirect");
        }
        clearStoredGoogleOAuthIntent();

        setTimeout(() => {
          router.push(targetUrl);
        }, 1000);
        return;
      }

      // 2. Authorization code from Google
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        let friendlyMsg = error;
        if (error === "access_denied") {
          friendlyMsg =
            "Access blocked: Your Google account is not added as a Test User in Google Cloud Console.";
        } else if (error === "redirect_uri_mismatch") {
          friendlyMsg = `Google rejected this callback URL: ${window.location.origin}/auth/callback/google. Add that exact URL to Authorized redirect URIs for the configured OAuth client in Google Cloud Console.`;
        }
        setErrorMessage(friendlyMsg);
        toast.error(friendlyMsg, { duration: 6000 });
        clearStoredGoogleOAuthIntent();
        setTimeout(() => router.push("/login"), 4500);
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from Google");
        clearStoredGoogleOAuthIntent();
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        const callbackUrl =
          intent?.redirectUri || `${window.location.origin}/auth/callback/google`;
        const isRegistration = Boolean(intent?.isRegistration);
        const res = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: callbackUrl,
            role: intent?.role || "CUSTOMER",
            isRegistration,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = Array.isArray(data?.message)
            ? data.message[0]
            : data?.message || data?.error || "Failed to authenticate with Google";
          throw new Error(msg);
        }

        const userRole: UserRole = isUserRole(data?.user?.role)
          ? data.user.role
          : "CUSTOMER";
        login(
          {
            id: data.user.id,
            name: data.user.fullName || data.user.email,
            email: data.user.email,
            role: userRole,
            phoneNumber: data.user.phoneNumber,
            avatar: data.user.avatar || data.user.avatarUrl,
            isVerified: true,
          },
          data.accessToken,
          data.refreshToken
        );

        setStatus("success");
        toast.success(
          isRegistration
            ? "Google Account Registered Successfully!"
            : `Welcome back, ${data.user.fullName || "Customer"}!`,
          {
            description: isRegistration
              ? "Your Google account is now registered with MercatoX."
              : "Signed in with Google successfully",
          }
        );

        const storedDest =
          typeof window !== "undefined"
            ? sessionStorage.getItem("mercatox_auth_redirect")
            : null;
        const stateDest = searchParams.get("state");
        const candidateDest =
          (stateDest && stateDest.startsWith("/") ? stateDest : null) ||
          (intent?.postLoginDest && intent.postLoginDest.startsWith("/")
            ? intent.postLoginDest
            : null) ||
          (storedDest && storedDest.startsWith("/") ? storedDest : null);
        const targetUrl = resolvePostLoginRoute(candidateDest, userRole);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mercatox_auth_redirect");
        }
        clearStoredGoogleOAuthIntent();

        setTimeout(() => {
          router.push(targetUrl);
        }, 1000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Authentication failed";
        clearStoredGoogleOAuthIntent();

        if (
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("not registered") ||
          message.toLowerCase().includes("register an account first")
        ) {
          setStatus("unregistered");
          setErrorMessage(message);
          toast.error("Google account not registered", { description: message });
          return;
        }

        setStatus("error");
        setErrorMessage(message);
        toast.error(message);
        setTimeout(() => router.push("/login"), 3000);
      }
    }

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] px-4 text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0d121f]/95 p-8 shadow-2xl text-center backdrop-blur-xl">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            <h2 className="text-lg font-bold">Connecting with Google...</h2>
            <p className="text-xs text-zinc-400">
              Verifying your credentials and signing you in. Please wait.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-300">
              Authentication Successful!
            </h2>
            <p className="text-xs text-zinc-400">
              Redirecting you to your account...
            </p>
          </div>
        )}

        {status === "unregistered" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <h2 className="text-lg font-bold text-amber-300">
              Google Account Not Registered
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">{errorMessage}</p>
            <div className="flex w-full flex-col gap-2 pt-2">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 px-4 text-xs font-semibold text-white hover:opacity-95 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register with Google Account</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2 px-4 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-all"
              >
                <LogIn className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <h2 className="text-lg font-bold text-rose-400">Sign In Failed</h2>
            <p className="text-xs text-zinc-400">{errorMessage}</p>
            <p className="text-[11px] text-zinc-500">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
