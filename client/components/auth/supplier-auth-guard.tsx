"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Lock,
  Building2,
  LogIn,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface SupplierAuthGuardProps {
  children: React.ReactNode;
}

export function SupplierAuthGuard({ children }: SupplierAuthGuardProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
            Verifying supplier credentials...
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

  const isSupplierRole = user?.role === "SUPPLIER" || user?.role === "ADMIN";

  // ✅ Correct role — show the page
  if (hasValidSession && isSupplierRole) {
    return <>{children}</>;
  }

  // ⚠️ Logged in but wrong role
  if (hasValidSession && !isSupplierRole) {
    // Redirect helpers based on actual role
    const roleRedirectMap: Record<string, string> = {
      SELLER: "/dashboard/seller",
      CUSTOMER: "/marketplace",
      DELIVERY: "/dashboard/delivery",
      ADMIN: "/dashboard/admin",
    };
    const redirectTo = user?.role ? roleRedirectMap[user.role] ?? "/marketplace" : "/marketplace";

    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0d121f] p-6 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Supplier Portal — Access Denied</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            You are signed in as a{" "}
            <span className="font-semibold text-amber-300">{user?.role}</span>. This portal is
            exclusively for verified B2B Suppliers and Administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Go to My Dashboard</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-indigo-400" />
              <span>Sign In with Supplier Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 Not authenticated at all
  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Building2 className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            B2B Supplier Authentication Required
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-sm">
            The B2B Supplier Portal is exclusively for verified Ethiopian suppliers,
            commodity aggregators, and manufacturers. Please sign in with your supplier account.
          </p>

          <div className="mt-6 w-full space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] cursor-pointer"
            >
              <Lock className="h-4 w-4 text-cyan-200" />
              <span>Sign In to Supplier Portal</span>
              <ArrowRight className="h-4 w-4 text-cyan-200 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => router.push("/marketplace")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <span>Browse Marketplace Instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
