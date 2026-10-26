"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";
import { isValidJwt, isJwtExpired } from "@/services/api/interceptors";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  Sparkles,
  LogIn,
  RefreshCw,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, hasHydrated, login, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050811]">
        <div className="flex items-center gap-3 text-indigo-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium text-zinc-300">
            Initializing administrator security clearance...
          </span>
        </div>
      </div>
    );
  }

  const hasValidSession =
    isAuthenticated &&
    Boolean(user) &&
    Boolean(token);

  const isAdminRole = user?.role === "ADMIN";

  // ✅ Authenticated as Admin with a valid JWT session -> render children
  if (hasValidSession && isAdminRole) {
    return <>{children}</>;
  }

  // ⚠️ Authenticated with non-admin role (e.g. SELLER, SUPPLIER, CUSTOMER, DRIVER)
  if (hasValidSession && !isAdminRole) {
    const roleRedirectMap: Record<string, string> = {
      SELLER: "/dashboard/seller",
      SUPPLIER: "/dashboard/supplier",
      CUSTOMER: "/marketplace",
      DELIVERY: "/dashboard/driver",
      DRIVER: "/dashboard/driver",
    };
    const redirectTo = user?.role ? roleRedirectMap[user.role] ?? "/marketplace" : "/marketplace";

    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050811] p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/25 bg-[#0a0f1d] p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Administrator Clearance Required
          </h2>
          <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
            You are currently authenticated as a{" "}
            <span className="font-semibold text-amber-300">{user?.role}</span> (
            <span className="text-zinc-300">{user?.name || user?.email}</span>).
            Access to platform-wide governance, escrow arbitration, and merchant KYC verification is strictly limited to Administrators.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                logout();
                router.push("/login?redirect=/dashboard/admin");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Administrator Account</span>
            </button>

            <button
              onClick={() => router.push(redirectTo)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Return to My Portal ({user?.role})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 Unauthenticated or Expired Session Screen
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050811] p-4">
      {/* Ambient glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-indigo-600/15 blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-cyan-600/15 blur-[128px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#090e1c]/95 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-xl shadow-indigo-500/30 mb-5">
            <Shield className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            MercatoX Governance Console
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-md">
            Enterprise administration portal for platform oversight, supplier KYC verification, escrow settlements, and security audit logs.
          </p>

          <div className="mt-7 w-full space-y-3">
            {/* Standard Login */}
            <button
              onClick={() => router.push("/login?redirect=/dashboard/admin")}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Governance Console</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              PostgreSQL Verified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
              Role: ADMIN Guarded
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              JWT 256-bit Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
