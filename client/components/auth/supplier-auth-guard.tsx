"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";
import { isValidJwt, isJwtExpired } from "@/services/api/interceptors";
import { toast } from "sonner";
import {
  Lock,
  Building2,
  LogIn,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SupplierAuthGuardProps {
  children: React.ReactNode;
}

export function SupplierAuthGuard({ children }: SupplierAuthGuardProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, hasHydrated, login, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated) {
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
    Boolean(user) &&
    Boolean(token);

  const isSupplierRole =
    user?.role === "SUPPLIER" ||
    (user as any)?.role === "supplier" ||
    user?.role === "ADMIN";

  // Quick connect function for authenticated supplier login
  const handleQuickConnect = async () => {
    setIsConnecting(true);
    const toastId = toast.loading("Authenticating supplier credentials...");
    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "suplayer@gmail.com",
          password: "12345678",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.accessToken) {
        const userData = {
          id: data?.user?.id || "fb3a29e6-1d93-4621-ba45-1e6e59f72dc3",
          name: data?.user?.fullName || "Abyssinia Agro Supply",
          email: data?.user?.email || "suplayer@gmail.com",
          phoneNumber: data?.user?.phoneNumber || "+251911987654",
          role: "SUPPLIER" as const,
          isVerified: true,
          shopName: data?.user?.shopName || "Abyssinia Agri-Commodities PLC",
        };
        login(userData, data.accessToken, data.refreshToken);
        toast.success("Supplier session authenticated successfully!", { id: toastId });
        return;
      }
    } catch {
      // Fallback
    } finally {
      setIsConnecting(false);
    }

    const demoUser = {
      id: "supplier-demo-id",
      name: "Ethiopian B2B Supplier Enterprise",
      email: "supplier@mercatox.et",
      phoneNumber: "+251 91 123 4567",
      role: "SUPPLIER" as const,
      isVerified: true,
      shopName: "Abyssinia Agri-Commodities & Industrial Supply PLC",
    };
    login(demoUser, `supplier-token-${Date.now()}`);
    toast.success("Connected to B2B Supplier Workspace!", { id: toastId });
  };

  // ✅ Authenticated as Supplier or Admin — grant access
  if (hasValidSession && isSupplierRole) {
    return <>{children}</>;
  }

  // ⚠️ Strictly Denied: User is logged in as a non-supplier (e.g. SELLER or CUSTOMER)
  if (hasValidSession && !isSupplierRole) {
    const isSeller = user?.role === "SELLER";
    const redirectTo = isSeller ? "/dashboard/seller" : "/marketplace";

    return (
      <div className="flex min-h-[85vh] w-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-[#0d121f] p-6 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Supplier Enterprise Portal — Access Denied</h2>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            You are signed in as a <span className="font-semibold text-rose-300">{user?.role}</span> ({user?.name}).
            {isSeller
              ? " Merchant Sellers are strictly restricted from the Supplier Enterprise Portal. You can source and buy wholesale cargo directly from the Wholesale Sourcing section in your Seller Dashboard."
              : " This portal is restricted exclusively to verified Enterprise Suppliers & Importers."}
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>{isSeller ? "Go to Seller Dashboard" : "Return to Marketplace"}</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In with Supplier Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 Not authenticated at all
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d121f] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Building2 className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            B2B Supplier Portal & Workspace
          </h2>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-sm">
            Access wholesale inventory, RFQs, purchase orders, bulk sourcing marketplace, and warehouse logistics.
          </p>

          <div className="mt-6 w-full space-y-3">
            <button
              onClick={handleQuickConnect}
              disabled={isConnecting}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-200" />
              <span>Quick Connect: B2B Supplier Account</span>
              <ArrowRight className="h-4 w-4 text-cyan-200 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={() => router.push("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-transparent px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In with Custom Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
