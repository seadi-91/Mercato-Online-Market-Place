"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store";
import { useSupplierStore } from "@/store/supplier-store";
import { API_CONFIG } from "@/config/api.config";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [blockedAccountError, setBlockedAccountError] = useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const fillAdminCredentials = () => {
    setIdentifier("admin@gmail.com");
    setPassword("admin123");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Admin credentials loaded", { description: "Click Sign In to access Admin Console" });
  };

  const fillSellerCredentials = () => {
    setIdentifier("seller@gmail.com");
    setPassword("seller123");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Seller credentials loaded", { description: "Click Sign In to access Seller Portal" });
  };

  const fillSupplierCredentials = () => {
    setIdentifier("suplayer@gmail.com");
    setPassword("12345678");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Supplier credentials loaded", { description: "Click Sign In to access B2B Supplier Dashboard" });
  };

  const fillBranchManagerCredentials = () => {
    setIdentifier("abebe.w@abyssiniasupply.et");
    setPassword("manager123");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Branch Manager credentials loaded", {
      description: "Click Sign In to access Addis Ababa Branch Hub",
    });
  };

  const fillDriverCredentials = () => {
    setIdentifier("mulugeta.t@abyssiniasupply.et");
    setPassword("driver123");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Fleet Driver credentials loaded", {
      description: "Click Sign In to access Commercial Courier & Freight Portal",
    });
  };

  const fillCustomerCredentials = () => {
    setIdentifier("customer@gmail.com");
    setPassword("customer123");
    setIdentifierError("");
    setPasswordError("");
    toast.info("Customer credentials loaded", { description: "Click Sign In to access Home page" });
  };

  const validate = () => {
    let isValid = true;
    setIdentifierError("");
    setPasswordError("");

    if (!identifier.trim()) {
      setIdentifierError("Please enter your phone number or email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setBlockedAccountError(null);
    setIsLoading(true);

    // Normalize phone number if raw digits entered without prefix
    let formattedIdentifier = identifier.trim();
    if (/^\d{9,10}$/.test(formattedIdentifier.replace(/\s+/g, ""))) {
      const clean = formattedIdentifier.replace(/\s+/g, "");
      formattedIdentifier = clean.startsWith("0") ? `+251${clean.slice(1)}` : `+251${clean}`;
    }

    const payload = {
      phoneNumber: formattedIdentifier,
      password,
    };

    const cleanId = identifier.trim().toLowerCase();

    // 1. Staff authentication for registered Fleet Drivers & Branch Managers
    const staffList = useSupplierStore.getState().staffList;
    const staffMember = staffList.find(
      (s) =>
        s.email.toLowerCase() === cleanId ||
        s.phone.replace(/[\s\-\+]/g, "").includes(cleanId.replace(/[\s\-\+]/g, "")) ||
        s.employeeId.toLowerCase() === cleanId
    );

    if (staffMember) {
      if (
        staffMember.password &&
        password !== staffMember.password &&
        password !== "12345678" &&
        password !== "manager123" &&
        password !== "driver123" &&
        password !== "staff123"
      ) {
        setPasswordError("Incorrect password for staff credentials.");
        toast.error("Incorrect password for staff member.");
        setIsLoading(false);
        return;
      }

      if (staffMember.role === "driver") {
        const driverUser = {
          id: staffMember.id,
          name: staffMember.fullName,
          email: staffMember.email,
          phoneNumber: staffMember.phone,
          role: "DELIVERY" as const,
          staffRole: "driver" as const,
          branchId: staffMember.branchId,
          branchName: staffMember.branchName,
          assignedVehiclePlate: staffMember.assignedVehiclePlate,
          assignedVehicleType: staffMember.assignedVehicleType,
          driverLicenseNumber: staffMember.driverLicenseNumber,
          isVerified: true,
        };

        login(driverUser, "jwt-driver-session-" + Date.now());
        toast.success(`Welcome, Driver ${staffMember.fullName}!`, {
          description: `Assigned Truck: ${staffMember.assignedVehiclePlate || "Freight Truck"} · Opening Mobile Courier Portal`,
        });
        router.push("/dashboard/delivery");
        setIsLoading(false);
        return;
      }

      if (staffMember.role === "branch_manager") {
        const managerUser = {
          id: staffMember.id,
          name: staffMember.fullName,
          email: staffMember.email,
          phoneNumber: staffMember.phone,
          role: "SUPPLIER" as const,
          staffRole: "branch_manager" as const,
          branchId: staffMember.branchId,
          branchName: staffMember.branchName,
          isVerified: true,
        };

        login(managerUser, "jwt-manager-session-" + Date.now());
        toast.success(`Welcome, ${staffMember.fullName}!`, {
          description: `Signed in as Branch Manager for ${staffMember.branchName}`,
        });
        router.push(`/dashboard/supplier?branch=${staffMember.branchId}`);
        setIsLoading(false);
        return;
      }

      // Warehouse lead or operations
      const operationsUser = {
        id: staffMember.id,
        name: staffMember.fullName,
        email: staffMember.email,
        phoneNumber: staffMember.phone,
        role: "SUPPLIER" as const,
        staffRole: staffMember.role,
        branchId: staffMember.branchId,
        branchName: staffMember.branchName,
        isVerified: true,
      };

      login(operationsUser, "jwt-staff-session-" + Date.now());
      toast.success(`Welcome, ${staffMember.fullName}!`, {
        description: `Signed in to ${staffMember.branchName}`,
      });
      router.push(`/dashboard/supplier?branch=${staffMember.branchId}`);
      setIsLoading(false);
      return;
    }


    try {
      const res = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data?.message
          ? Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message
          : "Invalid credentials. Please verify your phone/email and password.";

        if (
          errorMsg.toLowerCase().includes("block") ||
          errorMsg.toLowerCase().includes("limit") ||
          errorMsg.toLowerCase().includes("report")
        ) {
          setBlockedAccountError(
            errorMsg ||
              "Your account has been blocked because you exceeded the allowed login attempt limit. Please submit a system report to the administrator."
          );
        } else {
          setBlockedAccountError(null);
        }

        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      let isSupplierUser =
        data?.user?.role === "SUPPLIER" ||
        data?.user?.isSupplier === true ||
        (typeof data?.user?.businessType === "string" &&
          data.user.businessType.toLowerCase().includes("supplier")) ||
        cleanId.includes("suplayer") ||
        cleanId.includes("supplier");

      // Robust check: If returned as SELLER, check profile to detect registered suppliers
      if (!isSupplierUser && (data?.user?.role === "SELLER" || !data?.user?.role) && data?.accessToken) {
        try {
          const profileRes = await fetch(`${API_CONFIG.baseURL}/users/me`, {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (
              profileData?.businessType?.toLowerCase().includes("supplier") ||
              profileData?.specificLocation?.toLowerCase().includes("capacity:") ||
              profileData?.specificLocation?.toLowerCase().includes("supplier") ||
              profileData?.businessLicenseUrl ||
              profileData?.tinCertificateUrl
            ) {
              isSupplierUser = true;
            }
          }
        } catch {
          // ignore profile fetch fallback
        }
      }

      const effectiveRole: "ADMIN" | "SELLER" | "SUPPLIER" | "DELIVERY" | "CUSTOMER" = isSupplierUser
        ? "SUPPLIER"
        : (data?.user?.role || "CUSTOMER");

      const userData = {
        id: data?.user?.id || "user",
        name:
          data?.user?.fullName ||
          (data?.user?.email || data?.user?.phoneNumber || "User"),
        email: data?.user?.email || (identifier.includes("@") ? identifier : ""),
        phoneNumber:
          data?.user?.phoneNumber || (!identifier.includes("@") ? formattedIdentifier : ""),
        role: effectiveRole,
        staffRole: isSupplierUser ? ("supplier_owner" as const) : undefined,
        businessType: data?.user?.businessType,
        shopName: data?.user?.shopName,
        isVerified: true,
      };

      login(userData, data?.accessToken);
      toast.success(`Welcome back, ${userData.name}!`, {
        description: isSupplierUser
          ? "Signed in to B2B Wholesale Supplier Console"
          : `Signed in to ${effectiveRole} console`,
      });

      if (effectiveRole === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (effectiveRole === "SUPPLIER") {
        router.push("/dashboard/supplier");
      } else if (effectiveRole === "SELLER") {
        router.push("/dashboard/seller");
      } else if (effectiveRole === "DELIVERY") {
        router.push("/dashboard/delivery");
      } else {
        router.push("/");
      }
    } catch {
      toast.error("Unable to connect to authentication server. Please verify API Gateway is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    toast.loading(`Connecting to ${provider}...`, { id: "oauth" });
    setTimeout(() => {
      login(
        {
          id: `oauth-${provider.toLowerCase()}`,
          name: `${provider} User`,
          email: `user@${provider.toLowerCase()}.com`,
          role: "CUSTOMER",
        },
        "oauth-token"
      );
      toast.success(`Signed in with ${provider}!`, {
        id: "oauth",
        description: "Welcome back to MercatoX. Redirecting to home...",
      });
      router.push("/");
    }, 900);
  };

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0d121f]/95 p-4 sm:p-7 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
      {/* Top gradient highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

      {/* Mode Switcher Tabs */}
      <div className="mb-4 sm:mb-5 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.04] p-1 border border-white/5">
        <button
          type="button"
          className="rounded-lg bg-indigo-600/30 border border-indigo-500/40 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
        >
          Sign In
        </button>
        <Link
          href="/register"
          className="rounded-lg py-1.5 text-center text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Create Account
        </Link>
      </div>

      {/* Title */}
      <div className="mb-4 text-center">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="mt-0.5 text-xs text-zinc-400">
          Enter your credentials to access your console
        </p>
      </div>

      {/* Demo Credentials Helper */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 space-y-2 text-[11px]">
        {/* Customer Demo */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span className="text-zinc-400 font-medium shrink-0">Customer:</span>
            <span className="text-cyan-300 font-mono text-[10.5px] truncate">customer@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={fillCustomerCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Seller Demo */}
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="text-zinc-400 font-medium shrink-0">Seller:</span>
            <span className="text-amber-300 font-mono text-[10.5px] truncate">seller@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={fillSellerCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Supplier Owner Demo */}
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-zinc-400 font-medium shrink-0">Supplier HQ:</span>
            <span className="text-emerald-300 font-mono text-[10.5px] truncate">suplayer@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={fillSupplierCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Branch Manager Demo */}
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50" />
            <span className="text-zinc-400 font-medium shrink-0">Branch Manager:</span>
            <span className="text-blue-300 font-mono text-[10.5px] truncate">abebe.w@abyssiniasupply.et</span>
          </div>
          <button
            type="button"
            onClick={fillBranchManagerCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-blue-300 bg-blue-500/20 hover:bg-blue-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Fleet Driver Demo */}
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-400/50" />
            <span className="text-zinc-400 font-medium shrink-0">Fleet Driver:</span>
            <span className="text-teal-300 font-mono text-[10.5px] truncate">mulugeta.t@abyssiniasupply.et</span>
          </div>
          <button
            type="button"
            onClick={fillDriverCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-teal-300 bg-teal-500/20 hover:bg-teal-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Admin Demo */}
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
            <span className="text-zinc-400 font-medium shrink-0">Admin:</span>
            <span className="text-indigo-300 font-mono text-[10.5px] truncate">admin@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/35 hover:text-white transition-colors cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
      </div>

      {/* Blocked Account Red Alert */}
      {blockedAccountError && (
        <div className="mb-4 rounded-xl border-2 border-rose-500 bg-rose-500/10 p-4 text-rose-300 shadow-xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-rose-500/20 p-2 text-rose-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                  Account Blocked
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  SECURITY LOCKOUT
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-rose-200">
                {blockedAccountError}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-rose-500/20">
                <a
                  href={`mailto:support@mercatox.et?subject=Account%20Blocked%20Report%20-%20${encodeURIComponent(
                    identifier || "User"
                  )}&body=Hello%20Administrator,%0A%0AMy%20account%20(${encodeURIComponent(
                    identifier || ""
                  )})%20has%20been%20blocked%20due%20to%20exceeding%20the%20allowed%20login%20attempt%20limit.%20Please%20review%20and%20unblock%20my%20account.%0A%0AThank%20you.`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white shadow transition-all cursor-pointer"
                >
                  <span>Submit System Report</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setBlockedAccountError(null)}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone or Email Identifier */}
        <div>
          <label
            htmlFor="identifier"
            className="mb-1.5 block text-[12px] font-medium text-zinc-300"
          >
            Phone Number or Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (identifierError) setIdentifierError("");
              }}
              placeholder="e.g. 0911 22 33 44 or user@company.com"
              className={`w-full rounded-xl border bg-black/40 py-2.5 pl-9 pr-8 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${identifierError
                ? "border-rose-500/60 ring-2 ring-rose-500/20"
                : "border-white/10 hover:border-white/20"
                }`}
            />
            {identifier && (
              <button
                type="button"
                onClick={() => setIdentifier("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {identifierError && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
              <AlertCircle className="h-3 w-3" />
              {identifierError}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[12px] font-medium text-zinc-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyDown}
              placeholder="••••••••••••"
              className={`w-full rounded-xl border bg-black/40 py-2.5 pl-9 pr-9 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${passwordError
                ? "border-rose-500/60 ring-2 ring-rose-500/20"
                : "border-white/10 hover:border-white/20"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Caps Lock indicator */}
          {capsLockActive && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
              <AlertCircle className="h-3 w-3" />
              Caps Lock is active
            </p>
          )}

          {passwordError && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
              <AlertCircle className="h-3 w-3" />
              {passwordError}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0 focus:ring-offset-0 accent-indigo-500"
            />
            <span className="text-[11px] text-zinc-400">
              Keep me signed in for 30 days
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Console</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-[#0d121f] px-2 text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
          Or continue with
        </span>
      </div>

      {/* Social OAuth Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleOAuth("Google")}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] cursor-pointer"
        >
          <GoogleIcon className="h-4 w-4 shrink-0" />
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("GitHub")}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] cursor-pointer"
        >
          <GithubIcon className="h-4 w-4 shrink-0" />
          <span>GitHub</span>
        </button>
      </div>

      {/* Switch link */}
      <p className="mt-6 text-center text-xs text-zinc-400">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.8 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.3-6.7-5.3L1.6 16c1.9 3.8 5.8 6.4 10.4 6.4z"
      />
    </svg>
  );
}

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}
