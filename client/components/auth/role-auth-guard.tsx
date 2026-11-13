"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lock, RefreshCw, ArrowRight, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, UserRole } from "@/store/auth-store";
import { isJwtExpired } from "@/services/api/interceptors";
import { getRoleHomeRoute, normalizeUserRole } from "@/lib/auth/role-routing";

interface RoleAuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  loginRedirectPath: string;
  portalName: string;
  loadingMessage?: string;
}

/**
 * Enforces strict authentication and role authorization before rendering any dashboard UI.
 * Unauthenticated or unauthorized users (e.g., CUSTOMER on Seller Dashboard) are immediately
 * blocked from viewing protected chrome/children and redirected to their permitted portal.
 */
export function RoleAuthGuard({
  children,
  allowedRoles,
  loginRedirectPath,
  portalName,
  loadingMessage = "Verifying portal security clearance...",
}: RoleAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tokenExpired = Boolean(token) && isJwtExpired(token);
  const hasValidSession = Boolean(isAuthenticated && user && token && !tokenExpired);
  const userRole = normalizeUserRole(user?.role);
  const normalizedAllowed = allowedRoles.map((r) => normalizeUserRole(r));
  const isAuthorized = hasValidSession && normalizedAllowed.includes(userRole);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;

    if (tokenExpired) {
      logout();
    }

    if (!hasValidSession) {
      const target = pathname || loginRedirectPath;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
      return;
    }

    if (!isAuthorized) {
      const redirectTo = getRoleHomeRoute(userRole);
      toast.error(`Access denied: ${portalName}`, {
        id: "role-access-denied",
        description: `Accounts with role ${userRole || "GUEST"} cannot access ${portalName}. Redirecting...`,
      });
      router.replace(redirectTo);
    }
  }, [
    mounted,
    hasHydrated,
    tokenExpired,
    hasValidSession,
    isAuthorized,
    userRole,
    portalName,
    pathname,
    loginRedirectPath,
    logout,
    router,
  ]);

  if (!mounted || !hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#070a10]">
        <div className="flex items-center gap-3 text-zinc-300">
          <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
          <span className="text-sm font-medium">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (hasValidSession && isAuthorized) {
    return <>{children}</>;
  }

  if (hasValidSession && !isAuthorized) {
    const redirectTo = getRoleHomeRoute(userRole);
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#070a10] p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/25 bg-[#0d121f] p-6 shadow-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">{portalName} — Access Denied</h2>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            You are signed in as <span className="font-semibold text-rose-300">{userRole}</span>
            {user?.name ? ` (${user.name})` : ""}. Only authorized{" "}
            <span className="font-semibold text-white">{normalizedAllowed.join(" / ")}</span> accounts may enter this portal. Redirecting you back...
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => router.replace(redirectTo)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Return to My Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace(`/login?redirect=${encodeURIComponent(loginRedirectPath)}`);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In with Different Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#070a10] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121f] p-6 shadow-2xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-200 border border-white/10">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-white">{portalName} — Sign In Required</h2>
        <p className="text-xs text-zinc-400">
          Redirecting to sign in with an authorized account...
        </p>
        <button
          type="button"
          onClick={() => router.replace(`/login?redirect=${encodeURIComponent(loginRedirectPath)}`)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </button>
      </div>
    </div>
  );
}

