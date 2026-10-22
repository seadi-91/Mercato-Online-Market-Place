"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";

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

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleCallback() {
      // 1. Direct tokens in query parameters (from API Gateway redirect)
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const userId = searchParams.get("id");
      const email = searchParams.get("email");
      const fullName = searchParams.get("name");
      const roleParam = searchParams.get("role");
      const role: UserRole = isUserRole(roleParam) ? roleParam : "CUSTOMER";

      if (accessToken && userId) {
        login(
          {
            id: userId,
            email: email || "",
            name: fullName || email || "Google User",
            role,
            isVerified: true,
          },
          accessToken
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
        const targetUrl =
          (stateDest && stateDest.startsWith("/") ? stateDest : null) ||
          (storedDest && storedDest.startsWith("/") ? storedDest : null) ||
          (role === "ADMIN"
            ? "/dashboard/admin"
            : role === "SUPPLIER"
            ? "/dashboard/supplier"
            : role === "SELLER"
            ? "/dashboard/seller"
            : role === "DRIVER" || (role as string) === "DELIVERY"
            ? "/dashboard/driver"
            : "/");

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mercatox_auth_redirect");
        }

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
        setTimeout(() => router.push("/login"), 4500);
        return;
      }

      if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received from Google");
        setTimeout(() => router.push("/login"), 3000);
        return;
      }

      try {
        const callbackUrl = `${window.location.origin}/auth/callback/google`;
        const res = await fetch(`${API_CONFIG.baseURL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirectUri: callbackUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to authenticate with Google");
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
            avatar: data.user.avatarUrl,
            isVerified: true,
          },
          data.accessToken
        );

        setStatus("success");
        toast.success(`Welcome back, ${data.user.fullName}!`, {
          description: "Signed in with Google successfully",
        });

        const storedDest =
          typeof window !== "undefined"
            ? sessionStorage.getItem("mercatox_auth_redirect")
            : null;
        const stateDest = searchParams.get("state");
        const targetUrl =
          (stateDest && stateDest.startsWith("/") ? stateDest : null) ||
          (storedDest && storedDest.startsWith("/") ? storedDest : null) ||
          (userRole === "ADMIN"
            ? "/dashboard/admin"
            : userRole === "SUPPLIER"
            ? "/dashboard/supplier"
            : userRole === "SELLER"
            ? "/dashboard/seller"
            : userRole === "DRIVER" || (userRole as string) === "DELIVERY"
            ? "/dashboard/driver"
            : "/");

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("mercatox_auth_redirect");
        }

        setTimeout(() => {
          router.push(targetUrl);
        }, 1000);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Authentication failed";
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
