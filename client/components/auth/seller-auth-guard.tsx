"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";
import {
  Lock,
  Store,
  ArrowRight,
  Sparkles,
  LogIn,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface SellerAuthGuardProps {
  children: React.ReactNode;
}

export function SellerAuthGuard({ children }: SellerAuthGuardProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Purge outdated mock tokens from previous dev versions
    if (token === "mock-jwt-token" || token === "oauth-token") {
      logout();
    }
  }, [token, logout]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#070a10]">
        <div className="flex items-center gap-3 text-indigo-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium text-zinc-300">
            Initializing merchant security context...
          </span>
        </div>
      </div>
    );
  }

  const hasValidSession =
    isAuthenticated &&
    Boolean(token) &&
    token !== "mock-jwt-token" &&
    token !== "oauth-token";

  const isSellerRole =
    user?.role === "SELLER" || user?.role === "ADMIN";

  // Quick connect function to sign in as the default seeded merchant
  const handleQuickConnect = async () => {
    setIsConnecting(true);
    const toastId = toast.loading("Authenticating merchant credentials with backend...");
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "seller@gmail.com",
          password: "seller123",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to authenticate seller credentials");
      }

      const userData = {
        id: data?.user?.id || "seller-id",
        name: data?.user?.fullName || "Bole Electronics Hub",
        email: data?.user?.email || "seller@gmail.com",
        phoneNumber: data?.user?.phoneNumber || "+251900000002",
        role: (data?.user?.role || "SELLER") as "SELLER",
        isVerified: true,
      };

      login(userData, data.accessToken);
      toast.success("Merchant session authenticated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to authentication gateway", { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  };

  // If user has a valid seller or admin session, render children
  if (hasValidSession && isSellerRole) {
    return <>{children}</>;
  }

  // If user is authenticated with a non-merchant role (e.g. CUSTOMER)
  if (hasValidSession && !isSellerRole) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0d121f] p-6 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Merchant Access Restricted</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            You are currently signed in as a <span className="font-semibold text-amber-300">{user?.role}</span>.
            The Seller Portal requires an authenticated merchant account to manage inventory and view payouts.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Merchant Account</span>
            </button>
            <button
              onClick={() => router.push("/marketplace")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated screen with Quick Connect button
  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Store className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Merchant Authentication Required
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-sm">
            To view live inventory, process courier pickup OTPs, and settle escrow balances, you must be signed in with an active merchant security token.
          </p>

          <div className="mt-6 w-full space-y-3">
            {/* Quick Connect Button */}
            <button
              onClick={handleQuickConnect}
              disabled={isConnecting}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Authenticating Merchant Session...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Quick Connect as Merchant (seller@gmail.com)</span>
                  <ArrowRight className="h-4 w-4 text-cyan-200 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* Standard Login Navigation */}
            <button
              onClick={() => router.push("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-indigo-400" />
              <span>Go to Sign In Page</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              PostgreSQL DB Verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              NestJS JWT Guarded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
