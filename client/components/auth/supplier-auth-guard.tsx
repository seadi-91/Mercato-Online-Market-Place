"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";
import {
  Lock,
  Building2,
  LogIn,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";

interface SupplierAuthGuardProps {
  children: React.ReactNode;
}

export function SupplierAuthGuard({ children }: SupplierAuthGuardProps) {
  const router = useRouter();
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Allow explicit preview mode
  if (previewMode) {
    return <>{children}</>;
  }

  const hasValidSession = isAuthenticated && Boolean(token);

  const isSupplierRole =
    user?.role === "SUPPLIER" ||
    (user as any)?.role === "supplier" ||
    user?.role === "ADMIN" ||
    Boolean((user as any)?.isSupplier);

  // Quick connect function for easy testing
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
        login(userData, data.accessToken);
        toast.success("Supplier session authenticated successfully!", { id: toastId });
        return;
      }
    } catch {
      // Fallback to local session
    } finally {
      setIsConnecting(false);
    }

    // Local fallback supplier session
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

  // ✅ Authenticated as Supplier or Seller or Admin — show full layout
  if (hasValidSession && isSupplierRole) {
    return <>{children}</>;
  }

  // ⚠️ Logged in with different role (e.g. Customer)
  if (hasValidSession && !isSupplierRole) {
    const roleRedirectMap: Record<string, string> = {
      SELLER: "/dashboard/seller",
      CUSTOMER: "/marketplace",
      DELIVERY: "/dashboard/driver",
      DRIVER: "/dashboard/driver",
      ADMIN: "/dashboard/admin",
    };
    const redirectTo = user?.role ? roleRedirectMap[user.role] ?? "/marketplace" : "/marketplace";

    return (
      <div className="flex min-h-[85vh] w-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-[#0d121f] p-6 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">B2B Supplier Portal</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Currently logged in as <span className="font-semibold text-indigo-300">{user?.role}</span> ({user?.name}).
            You can switch to Supplier mode or explore the complete dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => setPreviewMode(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>Explore Supplier Dashboard (Preview Mode)</span>
            </button>
            <button
              onClick={handleQuickConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Switch to Verified Supplier Account</span>
            </button>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Return to My Dashboard</span>
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
              onClick={() => setPreviewMode(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-indigo-400" />
              <span>Explore Dashboard (Demo Mode)</span>
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
