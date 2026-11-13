"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  exchangeGitHubCode,
  getStoredGitHubIntent,
  clearStoredGitHubIntent,
  getGitHubCallbackUrl,
  type GitHubAuthResponse,
} from "@/lib/auth/github";
import { useAuthStore, type UserRole } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  LogIn,
} from "lucide-react";

function GithubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [status, setStatus] = useState<"loading" | "success" | "error" | "unregistered">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      setStatus("error");
      const desc =
        error === "access_denied"
          ? "GitHub authorization was cancelled or denied."
          : errorDescription || error;
      setErrorMessage(desc);
      toast.error("GitHub Sign-In Cancelled", { description: desc });
      clearStoredGitHubIntent();
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from GitHub. Please try again.");
      toast.error("Missing GitHub authorization code");
      clearStoredGitHubIntent();
      return;
    }

    const authCode = code;

    const intent = getStoredGitHubIntent();
    const role = intent?.role || "CUSTOMER";
    const isRegistration = Boolean(intent?.isRegistration);
    const postLoginDest = intent?.postLoginDest || "/";
    const callbackUrl = intent?.callbackUrl || getGitHubCallbackUrl();

    async function handleExchange() {
      try {
        const authData: GitHubAuthResponse = await exchangeGitHubCode(authCode, {
          role,
          isRegistration,
          redirectUri: callbackUrl,
        });

        if (authData && authData.accessToken) {
          const user = authData.user;
          const userRole = (user.role || role) as UserRole;

          login(
            {
              id: user.id,
              name: user.fullName || user.email,
              email: user.email,
              role: userRole,
              phoneNumber: user.phoneNumber,
              avatar: user.avatar || user.avatarUrl,
              isVerified: true,
            },
            authData.accessToken,
            authData.refreshToken
          );

          setUserName(user.fullName || "User");
          setStatus("success");
          clearStoredGitHubIntent();

          toast.success(
            isRegistration
              ? "GitHub Account Registered Successfully!"
              : `Welcome back, ${user.fullName || "Customer"}!`,
            {
              id: "github-oauth",
              description: "Signed in with GitHub successfully.",
            }
          );

          // Route to appropriate dashboard
          const finalDest =
            userRole === "ADMIN"
              ? "/dashboard/admin"
              : userRole === "SUPPLIER"
              ? "/dashboard/supplier"
              : userRole === "SELLER"
              ? "/dashboard/seller"
              : userRole === "DRIVER" || (userRole as string) === "DELIVERY"
              ? "/dashboard/driver"
              : postLoginDest;

          setTimeout(() => {
            router.push(finalDest);
          }, 1200);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "GitHub authentication could not be completed.";

        // Detect if user is not yet registered in MercatoX
        if (
          message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("not registered") ||
          message.toLowerCase().includes("register an account first")
        ) {
          setStatus("unregistered");
          setErrorMessage(message);
          return;
        }

        setStatus("error");
        setErrorMessage(message);
        toast.error("GitHub Authentication Failed", {
          id: "github-oauth",
          description: message,
        });
        clearStoredGitHubIntent();
      }
    }

    handleExchange();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-8 shadow-2xl text-center">
        {/* GitHub Brand Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700/80 flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-9 h-9 fill-current text-white" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Authenticating with GitHub...</span>
            </div>
            <p className="text-sm text-gray-400">
              Verifying your credentials and establishing your secure MercatoX session.
            </p>
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OAuth 2.0 Secure Token Handshake</span>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Authenticated!</h3>
            <p className="text-sm text-gray-300">
              Welcome, <span className="text-amber-400 font-semibold">{userName}</span>! Redirecting you to your MercatoX dashboard...
            </p>
            <div className="pt-2">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
            </div>
          </div>
        )}

        {/* UNREGISTERED STATE */}
        {status === "unregistered" && (
          <div className="space-y-5 text-left">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">GitHub Account Not Registered</h3>
              <p className="text-xs text-amber-300/90 bg-amber-950/40 border border-amber-800/40 rounded-xl p-3">
                {errorMessage}
              </p>
            </div>

            <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 text-xs text-gray-300 space-y-2">
              <p>
                To sign in with GitHub, you must first register your account on the Registration page and select your account type (Customer, Seller, or Supplier).
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <Link
                href="/register"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Register with GitHub Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="block text-center text-xs text-gray-400 hover:text-white pt-2 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Authentication Failed</h3>
            <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-left break-words">
              {errorMessage}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
              <Link
                href="/register"
                className="text-xs text-gray-400 hover:text-white transition-colors py-1"
              >
                Need an account? Sign up here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      }
    >
      <GithubCallbackContent />
    </Suspense>
  );
}
