"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock, Bell, Sun, Moon, Monitor, Eye, EyeOff, Loader2,
  ShieldCheck, ChevronRight, User, Package, LogOut,
  CheckCircle2, AlertCircle, Palette, Info, Smartphone,
  Globe,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useAuthStore } from "@/store";
import { useThemeStore, ThemeMode } from "@/store/theme-store";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "sonner";

/* ─── Backend API ─── */
async function changePasswordApi(token: string, userId: string, currentPassword: string, newPassword: string) {
  try {
    const res = await fetch(`${API_CONFIG.baseURL}/auth/change-password`, {
      method: "POST",
      headers: { ...API_CONFIG.headers, Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    });
    if (res.ok) return { success: true };
    const body = await res.json().catch(() => null);
    return { success: false, error: body?.message || `Error ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

/* ─── Custom Toggle ─── */
function Toggle({
  checked,
  onChange,
  id,
  theme,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  theme: ThemeMode;
}) {
  const offBg =
    theme === "light"
      ? "bg-slate-200 border border-slate-300"
      : theme === "system"
      ? "bg-blue-950 border border-blue-700/50"
      : "bg-zinc-800 border border-zinc-700";

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-all duration-300 ${
        checked
          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/40"
          : offBg
      }`}
    >
      <span
        className={`absolute top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ─── Password Strength Meter ─── */
function PasswordStrength({ password, theme }: { password: string; theme: ThemeMode }) {
  if (!password) return null;
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  const meta = [
    { label: "Too short", color: "from-red-600 to-red-500" },
    { label: "Weak",      color: "from-orange-600 to-orange-500" },
    { label: "Fair",      color: "from-yellow-600 to-yellow-500" },
    { label: "Good",      color: "from-blue-600 to-blue-500" },
    { label: "Strong",    color: "from-indigo-600 to-cyan-500" },
  ];
  const m = meta[score];

  const trackBg =
    theme === "light"
      ? "bg-slate-200"
      : theme === "system"
      ? "bg-blue-900/40"
      : "bg-zinc-800";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full overflow-hidden ${trackBg}`}>
            {i < score && <div className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`} />}
          </div>
        ))}
      </div>
      <p className={`text-[10px] font-semibold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
        {m.label}
      </p>
    </div>
  );
}

/* ─── Floating Label Input ─── */
function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  rightSlot,
  theme,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rightSlot?: React.ReactNode;
  theme: ThemeMode;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  // Themed styles
  const containerStyle =
    theme === "light"
      ? focused
        ? "border-indigo-500/70 shadow-md shadow-indigo-500/10 bg-indigo-50/40"
        : "border-slate-200 bg-slate-50 hover:border-slate-300"
      : theme === "system"
      ? focused
        ? "border-cyan-400/80 shadow-md shadow-cyan-500/20 bg-blue-950/60"
        : "border-blue-500/30 bg-[#08122c] hover:border-blue-500/50"
      : focused
      ? "border-indigo-500/70 shadow-md shadow-indigo-500/20 bg-indigo-500/10"
      : "border-zinc-800 bg-[#080b11] hover:border-zinc-700";

  const labelColor = active
    ? theme === "light"
      ? "text-indigo-600"
      : theme === "system"
      ? "text-cyan-400"
      : "text-indigo-400"
    : theme === "light"
    ? "text-slate-400"
    : theme === "system"
    ? "text-blue-300/60"
    : "text-zinc-500";

  const textColor =
    theme === "light"
      ? "text-slate-900"
      : theme === "system"
      ? "text-sky-50"
      : "text-zinc-100";

  return (
    <div className="relative">
      <div className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${containerStyle}`}>
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium ${
            active
              ? `top-2 text-[9px] uppercase tracking-wider font-bold ${labelColor}`
              : `top-4 text-xs ${labelColor}`
          }`}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          className={`w-full bg-transparent outline-none text-sm font-mono px-4 pb-3 ${
            active ? "pt-6" : "pt-4"
          } ${textColor}`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function Card({
  children,
  theme,
  glow,
}: {
  children: React.ReactNode;
  theme: ThemeMode;
  glow?: "indigo" | "cyan" | "amber";
}) {
  let themeStyles = "";

  if (theme === "light") {
    // LIGHT THEME: Pure crisp white card, soft gray border, slate text
    themeStyles =
      "bg-white border-slate-200/90 shadow-xl shadow-slate-200/60 text-slate-900";
  } else if (theme === "system") {
    // SYSTEM THEME: Vivid sapphire dark navy card, rich blue border, ice text
    themeStyles =
      "bg-[#0d1b3e] border-blue-500/30 shadow-2xl shadow-blue-950/80 text-sky-50";
  } else {
    // DARK THEME: Charcoal obsidian black card, dark border, white text
    themeStyles =
      "bg-[#0e121a] border-zinc-800 shadow-2xl shadow-black/80 text-zinc-100";
  }

  const glowStyles =
    glow === "indigo"
      ? theme === "light"
        ? "ring-1 ring-indigo-500/10"
        : theme === "system"
        ? "ring-1 ring-blue-500/20"
        : "ring-1 ring-indigo-500/20"
      : glow === "cyan"
      ? theme === "light"
        ? "ring-1 ring-cyan-500/10"
        : theme === "system"
        ? "ring-1 ring-cyan-400/20"
        : "ring-1 ring-cyan-500/20"
      : glow === "amber"
      ? theme === "light"
        ? "ring-1 ring-amber-500/10"
        : theme === "system"
        ? "ring-1 ring-amber-400/20"
        : "ring-1 ring-amber-400/20"
      : "";

  return (
    <div
      className={`rounded-3xl border transition-colors duration-300 backdrop-blur-xl overflow-hidden ${themeStyles} ${glowStyles}`}
    >
      {children}
    </div>
  );
}

/* ─── Tab definitions ─── */
const TABS = [
  { key: "security",      label: "Security",      icon: Lock     },
  { key: "notifications", label: "Alerts",        icon: Bell     },
  { key: "appearance",    label: "Appearance",    icon: Palette  },
  { key: "about",         label: "About",         icon: Info     },
] as const;
type TabKey = typeof TABS[number]["key"];

function SettingsContent() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<TabKey>("security");

  /* Password state */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  /* Notifications state */
  const [smsOtp, setSmsOtp] = useState(true);
  const [emailInvoice, setEmailInvoice] = useState(true);
  const [marketPromos, setMarketPromos] = useState(false);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess(false);
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be 8+ characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords don't match");
      return;
    }
    if (!token || !user?.id) {
      toast.error("Not authenticated");
      return;
    }

    setPwLoading(true);
    const result = await changePasswordApi(token, user.id, currentPw, newPw);
    setPwLoading(false);

    if (result.success) {
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast.success("Password updated!", {
        description: "Your account is now more secure.",
      });
    } else {
      toast.error("Failed", { description: result.error });
    }
  };

  const mismatch = confirmPw.length > 0 && confirmPw !== newPw;

  /* Theme-specific page styling */
  const pageBg =
    theme === "light"
      ? "bg-slate-100 text-slate-900"
      : theme === "system"
      ? "bg-[#050b1d] text-sky-50"
      : "bg-[#000000] text-zinc-100";

  /* Tab bar themed style */
  const tabBarBg =
    theme === "light"
      ? "bg-white border-slate-200/90 shadow-sm"
      : theme === "system"
      ? "bg-[#09132d] border-blue-500/30 shadow-lg shadow-blue-950/50"
      : "bg-[#0e121a] border-zinc-800 shadow-xl shadow-black/80";

  const tabInactiveColor =
    theme === "light"
      ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      : theme === "system"
      ? "text-blue-300 hover:text-white hover:bg-blue-600/20"
      : "text-zinc-400 hover:text-white hover:bg-white/5";

  /* Card Header styling */
  const cardHeaderBorder =
    theme === "light"
      ? "border-b border-slate-100"
      : theme === "system"
      ? "border-b border-blue-900/40"
      : "border-b border-zinc-800/80";

  const cardHeaderTitle =
    theme === "light"
      ? "text-slate-900 font-bold"
      : theme === "system"
      ? "text-white font-bold"
      : "text-white font-bold";

  const cardHeaderSub =
    theme === "light"
      ? "text-slate-500"
      : theme === "system"
      ? "text-blue-200/70"
      : "text-zinc-400";

  const listDivider =
    theme === "light"
      ? "divide-slate-100"
      : theme === "system"
      ? "divide-blue-900/40"
      : "divide-zinc-800/80";

  const iconBg =
    theme === "light"
      ? "bg-slate-100 border-slate-200 text-slate-600"
      : theme === "system"
      ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
      : "bg-white/5 border-white/10 text-zinc-300";

  const rowHover =
    theme === "light"
      ? "hover:bg-slate-50"
      : theme === "system"
      ? "hover:bg-blue-600/10"
      : "hover:bg-white/[0.04]";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${pageBg}`}>
      {/* Ambient background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {theme === "light" ? (
          <>
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-indigo-100/80 blur-[90px] transition-all duration-500" />
            <div className="absolute top-1/2 -left-20 w-72 h-72 rounded-full bg-cyan-100/70 blur-[90px] transition-all duration-500" />
          </>
        ) : theme === "system" ? (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-[120px] transition-all duration-500" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-[100px] transition-all duration-500" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] transition-all duration-500" />
            <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-cyan-600/8 blur-[100px] transition-all duration-500" />
          </>
        )}
      </div>

      <CustomerHeader />

      <main className="relative flex-1 px-3 sm:px-4 py-6 sm:py-8 pb-24 sm:pb-12 flex flex-col items-center">
        <div className="w-full max-w-lg space-y-5">

          {/* ─── Hero Header ─── */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Themed Hero Background */}
            <div
              className={`absolute inset-0 transition-colors duration-300 ${
                theme === "light"
                  ? "bg-gradient-to-br from-indigo-700 via-indigo-800 to-cyan-800"
                  : theme === "system"
                  ? "bg-gradient-to-br from-[#0c1f4e] via-[#0e2764] to-[#083b63]"
                  : "bg-gradient-to-br from-indigo-950 via-zinc-950 to-slate-900 border border-zinc-800"
              }`}
            />
            {/* Mesh dots */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="relative px-6 py-7 flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-400 to-cyan-300 flex items-center justify-center text-xl font-black text-white shadow-2xl shadow-indigo-500/40 select-none">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 border-2 border-indigo-900 flex items-center justify-center">
                  <ShieldCheck className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-black text-white truncate">
                    {user?.name || "Customer"}
                  </h1>
                  <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-cyan-200 border border-cyan-300/30">
                    {user?.role || "CUSTOMER"}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/90 mt-0.5 font-mono truncate">
                  {user?.phoneNumber || user?.email || "MercatoX Account"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-white/50">Account Settings</p>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/70 font-mono capitalize">
                    {theme} Mode
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Tab Bar ─── */}
          <div
            className={`flex gap-1 rounded-2xl border p-1.5 transition-colors duration-300 ${tabBarBg}`}
          >
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === key
                    ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30"
                    : tabInactiveColor
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    activeTab === key ? "text-cyan-300" : ""
                  }`}
                />
                {label}
              </button>
            ))}
          </div>

          {/* ─── SECURITY TAB ─── */}
          {activeTab === "security" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <Card theme={theme} glow="indigo">
                {/* Header */}
                <div className={`px-5 pt-5 pb-4 flex items-center gap-3 ${cardHeaderBorder}`}>
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      theme === "light"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                        : theme === "system"
                        ? "bg-blue-500/20 border border-blue-400/30 text-cyan-300"
                        : "bg-indigo-500/15 border border-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${cardHeaderTitle}`}>Password & Security</p>
                    <p className={`text-[10px] ${cardHeaderSub}`}>Update your account credentials</p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="p-5 space-y-3">
                  <FloatingInput
                    id="current-pw"
                    label="Current Password"
                    value={currentPw}
                    onChange={setCurrentPw}
                    theme={theme}
                    type={showPw ? "text" : "password"}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className={`cursor-pointer ${
                          theme === "light"
                            ? "text-slate-400 hover:text-slate-700"
                            : theme === "system"
                            ? "text-blue-300 hover:text-white"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <div>
                    <FloatingInput
                      id="new-pw"
                      label="New Password"
                      value={newPw}
                      onChange={setNewPw}
                      theme={theme}
                      type={showPw ? "text" : "password"}
                    />
                    <PasswordStrength password={newPw} theme={theme} />
                  </div>

                  {/* Confirm password field */}
                  <div
                    className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                      mismatch
                        ? theme === "light"
                          ? "border-red-400 bg-red-50"
                          : "border-red-500/50 bg-red-950/20"
                        : theme === "light"
                        ? "border-slate-200 bg-slate-50"
                        : theme === "system"
                        ? "border-blue-500/30 bg-[#08122c]"
                        : "border-zinc-800 bg-[#080b11]"
                    }`}
                  >
                    <div className="relative">
                      {confirmPw.length > 0 && (
                        <span
                          className={`absolute top-2 left-4 text-[9px] uppercase tracking-wider font-bold ${
                            mismatch
                              ? "text-red-500"
                              : theme === "light"
                              ? "text-indigo-600"
                              : theme === "system"
                              ? "text-cyan-400"
                              : "text-indigo-400"
                          }`}
                        >
                          Confirm Password
                        </span>
                      )}
                      <div className="flex items-center pr-3">
                        <input
                          id="confirm-pw"
                          type={showPw ? "text" : "password"}
                          value={confirmPw}
                          onChange={(e) => setConfirmPw(e.target.value)}
                          placeholder={confirmPw.length === 0 ? "Confirm new password" : ""}
                          autoComplete="off"
                          className={`flex-1 bg-transparent outline-none text-sm font-mono px-4 pb-3 ${
                            confirmPw.length > 0 ? "pt-6" : "pt-4"
                          } ${
                            theme === "light"
                              ? "text-slate-900 placeholder:text-slate-400"
                              : theme === "system"
                              ? "text-sky-50 placeholder:text-blue-300/50"
                              : "text-zinc-100 placeholder:text-zinc-600"
                          }`}
                        />
                        {mismatch && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                        {!mismatch && confirmPw.length > 0 && (
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              theme === "light"
                                ? "text-indigo-600"
                                : theme === "system"
                                ? "text-cyan-400"
                                : "text-indigo-400"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {pwLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : pwSuccess ? (
                      "Password Updated!"
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              </Card>

              {/* Quick Links Card */}
              <Card theme={theme}>
                <div className={`divide-y ${listDivider}`}>
                  {[
                    {
                      href: "/profile",
                      icon: (
                        <User
                          className={`h-4 w-4 ${
                            theme === "light"
                              ? "text-indigo-600"
                              : theme === "system"
                              ? "text-cyan-400"
                              : "text-indigo-400"
                          }`}
                        />
                      ),
                      label: "Edit Profile",
                      sub: "Name, email, shipping address",
                    },
                    {
                      href: "/orders",
                      icon: (
                        <Package
                          className={`h-4 w-4 ${
                            theme === "light"
                              ? "text-cyan-600"
                              : theme === "system"
                              ? "text-blue-400"
                              : "text-cyan-400"
                          }`}
                        />
                      ),
                      label: "My Orders",
                      sub: "Track & manage your orders",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-5 py-4 transition-colors group ${rowHover}`}
                    >
                      <div
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold transition-colors ${
                            theme === "light"
                              ? "text-slate-800 group-hover:text-slate-950"
                              : theme === "system"
                              ? "text-sky-100 group-hover:text-white"
                              : "text-zinc-200 group-hover:text-white"
                          }`}
                        >
                          {item.label}
                        </p>
                        <p
                          className={`text-[11px] ${
                            theme === "light"
                              ? "text-slate-500"
                              : theme === "system"
                              ? "text-blue-300/70"
                              : "text-zinc-500"
                          }`}
                        >
                          {item.sub}
                        </p>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          theme === "light"
                            ? "text-slate-300 group-hover:text-slate-600"
                            : theme === "system"
                            ? "text-blue-400/60 group-hover:text-blue-200"
                            : "text-zinc-600 group-hover:text-zinc-400"
                        }`}
                      />
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.success("Signed out");
                  router.push("/login");
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl border transition-all group cursor-pointer ${
                  theme === "light"
                    ? "border-rose-200 bg-rose-50/80 hover:bg-rose-100/90 text-rose-700 shadow-sm"
                    : theme === "system"
                    ? "border-rose-500/30 bg-rose-950/25 hover:bg-rose-950/45 text-rose-300"
                    : "border-rose-500/20 bg-rose-500/[0.08] hover:bg-rose-500/[0.14] text-rose-400"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    theme === "light"
                      ? "bg-rose-100 border-rose-200 text-rose-600"
                      : theme === "system"
                      ? "bg-rose-900/30 border-rose-500/30 text-rose-400"
                      : "bg-rose-500/15 border-rose-500/20 text-rose-400"
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold">Sign Out</p>
                  <p
                    className={`text-[11px] ${
                      theme === "light"
                        ? "text-rose-500"
                        : theme === "system"
                        ? "text-rose-300/70"
                        : "text-rose-400/70"
                    }`}
                  >
                    Log out of MercatoX
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeTab === "notifications" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <Card theme={theme} glow="cyan">
                <div className={`px-5 pt-5 pb-4 flex items-center gap-3 ${cardHeaderBorder}`}>
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      theme === "light"
                        ? "bg-cyan-50 border border-cyan-200 text-cyan-600"
                        : theme === "system"
                        ? "bg-cyan-500/20 border border-cyan-400/30 text-cyan-300"
                        : "bg-cyan-500/15 border border-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${cardHeaderTitle}`}>Notification Preferences</p>
                    <p className={`text-[10px] ${cardHeaderSub}`}>Manage alerts & communications</p>
                  </div>
                </div>

                <div className={`divide-y ${listDivider}`}>
                  {[
                    {
                      id: "sms-otp",
                      icon: (
                        <Smartphone
                          className={`h-4 w-4 ${
                            theme === "light"
                              ? "text-indigo-600"
                              : theme === "system"
                              ? "text-cyan-400"
                              : "text-indigo-400"
                          }`}
                        />
                      ),
                      label: "SMS Handover OTP",
                      sub: "4-digit OTP alert sent when courier arrives at your door",
                      checked: smsOtp,
                      set: setSmsOtp,
                      badge: "Required",
                    },
                    {
                      id: "email-invoice",
                      icon: (
                        <Globe
                          className={`h-4 w-4 ${
                            theme === "light"
                              ? "text-cyan-600"
                              : theme === "system"
                              ? "text-blue-400"
                              : "text-cyan-400"
                          }`}
                        />
                      ),
                      label: "Order & Invoice Emails",
                      sub: "Escrow settlements & official receipts sent to your email",
                      checked: emailInvoice,
                      set: setEmailInvoice,
                      badge: null,
                    },
                    {
                      id: "market-promos",
                      icon: (
                        <Package
                          className={`h-4 w-4 ${
                            theme === "light"
                              ? "text-amber-600"
                              : theme === "system"
                              ? "text-amber-400"
                              : "text-amber-400"
                          }`}
                        />
                      ),
                      label: "Marketplace Deals",
                      sub: "Highlights from Bole, Mercato & verified local sellers",
                      checked: marketPromos,
                      set: setMarketPromos,
                      badge: null,
                    },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                      <div
                        className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-semibold ${
                              theme === "light"
                                ? "text-slate-800"
                                : theme === "system"
                                ? "text-sky-100"
                                : "text-zinc-200"
                            }`}
                          >
                            {item.label}
                          </p>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                theme === "light"
                                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                  : theme === "system"
                                  ? "bg-blue-500/25 text-sky-200 border border-blue-400/40"
                                  : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 leading-relaxed ${
                            theme === "light"
                              ? "text-slate-500"
                              : theme === "system"
                              ? "text-blue-300/70"
                              : "text-zinc-500"
                          }`}
                        >
                          {item.sub}
                        </p>
                      </div>
                      <Toggle
                        id={item.id}
                        checked={item.checked}
                        onChange={item.set}
                        theme={theme}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Escrow Protection Info Banner */}
              <div
                className={`rounded-3xl border p-5 transition-colors duration-300 ${
                  theme === "light"
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 shadow-sm"
                    : theme === "system"
                    ? "border-blue-500/30 bg-gradient-to-br from-[#0b1c47] to-[#0d2a5e]"
                    : "border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-cyan-950/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    className={`h-5 w-5 mt-0.5 shrink-0 ${
                      theme === "light"
                        ? "text-indigo-600"
                        : theme === "system"
                        ? "text-cyan-400"
                        : "text-indigo-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        theme === "light"
                          ? "text-indigo-950"
                          : theme === "system"
                          ? "text-sky-200"
                          : "text-indigo-300"
                      }`}
                    >
                      Escrow OTP Protection
                    </p>
                    <p
                      className={`text-[11px] mt-1 leading-relaxed ${
                        theme === "light"
                          ? "text-indigo-900/80"
                          : theme === "system"
                          ? "text-sky-300/70"
                          : "text-zinc-400"
                      }`}
                    >
                      Your SMS OTP is the final step in MercatoX's doorstep handover protocol.
                      The courier cannot mark the order delivered without your verbal confirmation code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── APPEARANCE TAB ─── */}
          {activeTab === "appearance" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <Card theme={theme} glow="amber">
                <div className={`px-5 pt-5 pb-4 flex items-center gap-3 ${cardHeaderBorder}`}>
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      theme === "light"
                        ? "bg-amber-50 border border-amber-200 text-amber-600"
                        : theme === "system"
                        ? "bg-amber-500/20 border border-amber-400/30 text-amber-300"
                        : "bg-amber-500/15 border border-amber-500/20 text-amber-400"
                    }`}
                  >
                    <Palette className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${cardHeaderTitle}`}>Interface Theme</p>
                    <p className={`text-[10px] ${cardHeaderSub}`}>Choose your preferred card and canvas color scheme</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: "light" as ThemeMode,
                        icon: <Sun className="h-6 w-6 text-amber-500" />,
                        label: "Light",
                        sub: "Pure White Cards",
                        preview: "bg-gradient-to-br from-white to-slate-200 border border-slate-300",
                        activeBorder: "border-amber-500",
                        activeRing: "ring-2 ring-amber-400/30",
                        activeBg:
                          theme === "light"
                            ? "bg-amber-50/60"
                            : theme === "system"
                            ? "bg-blue-900/30"
                            : "bg-white/5",
                      },
                      {
                        key: "dark" as ThemeMode,
                        icon: <Moon className="h-6 w-6 text-zinc-300" />,
                        label: "Dark",
                        sub: "Charcoal Black Cards",
                        preview: "bg-gradient-to-br from-zinc-900 to-black border border-zinc-700",
                        activeBorder: "border-zinc-400",
                        activeRing: "ring-2 ring-zinc-400/30",
                        activeBg:
                          theme === "light"
                            ? "bg-slate-100"
                            : theme === "system"
                            ? "bg-blue-900/30"
                            : "bg-zinc-800/40",
                      },
                      {
                        key: "system" as ThemeMode,
                        icon: <Monitor className="h-6 w-6 text-cyan-400" />,
                        label: "System",
                        sub: "Sapphire Blue Cards",
                        preview: "bg-gradient-to-br from-[#0c1f4e] to-[#073b64] border border-blue-400/40",
                        activeBorder: "border-cyan-400",
                        activeRing: "ring-2 ring-cyan-400/40",
                        activeBg:
                          theme === "light"
                            ? "bg-indigo-50/70"
                            : theme === "system"
                            ? "bg-blue-600/20"
                            : "bg-blue-950/40",
                      },
                    ].map((t) => {
                      const active = theme === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => {
                            setTheme(t.key);
                            toast.success(`${t.label} theme activated`, {
                              description: `Cards now displaying in ${t.sub}.`,
                            });
                          }}
                          className={`relative flex flex-col items-center gap-2.5 rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                            active
                              ? `${t.activeBorder} ${t.activeBg} ${t.activeRing} shadow-md`
                              : theme === "light"
                              ? "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                              : theme === "system"
                              ? "border-blue-500/25 bg-[#08122c] hover:bg-blue-900/30"
                              : "border-zinc-800 bg-[#080b11] hover:bg-white/5"
                          }`}
                        >
                          <div
                            className={`w-full h-11 rounded-xl ${t.preview} flex items-center justify-center shadow-md`}
                          >
                            {t.icon}
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-xs font-bold ${
                                active
                                  ? theme === "light"
                                    ? "text-slate-900"
                                    : "text-white"
                                  : theme === "light"
                                  ? "text-slate-600"
                                  : theme === "system"
                                  ? "text-blue-200/80"
                                  : "text-zinc-400"
                              }`}
                            >
                              {t.label}
                            </p>
                            <p
                              className={`text-[9px] mt-0.5 leading-tight ${
                                theme === "light"
                                  ? "text-slate-400"
                                  : theme === "system"
                                  ? "text-blue-300/60"
                                  : "text-zinc-500"
                              }`}
                            >
                              {t.sub}
                            </p>
                          </div>
                          {active && (
                            <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-sm">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ─── ABOUT TAB ─── */}
          {activeTab === "about" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Platform Info Card */}
              <Card theme={theme}>
                <div className={`px-5 pt-5 pb-4 flex items-center gap-3 ${cardHeaderBorder}`}>
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      theme === "light"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                        : theme === "system"
                        ? "bg-blue-500/20 border border-blue-400/30 text-cyan-300"
                        : "bg-indigo-500/15 border border-indigo-500/20 text-indigo-400"
                    }`}
                  >
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${cardHeaderTitle}`}>Platform Information</p>
                    <p className={`text-[10px] ${cardHeaderSub}`}>MercatoX marketplace system details</p>
                  </div>
                </div>

                <div className={`divide-y ${listDivider}`}>
                  {[
                    { label: "Platform",        value: "MercatoX v1.0",              icon: "🏪" },
                    { label: "Currency",         value: "Ethiopian Birr (ETB)",       icon: "💵" },
                    { label: "Delivery Region",  value: "Addis Ababa — 11 Subcities", icon: "📍" },
                    { label: "Escrow System",    value: "OTP Doorstep Handover",      icon: "🔐" },
                    { label: "Payment Gateway",  value: "Chapa · Telebirr · CBE",     icon: "💳" },
                    {
                      label: "Your Account ID",
                      value: user?.id ? `${user.id.slice(0, 8).toUpperCase()}…` : "—",
                      icon: "🆔",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-5 py-3.5 gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base select-none">{item.icon}</span>
                        <span
                          className={`text-[11px] ${
                            theme === "light"
                              ? "text-slate-500"
                              : theme === "system"
                              ? "text-blue-200/70"
                              : "text-zinc-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold font-mono text-right ${
                          theme === "light"
                            ? "text-slate-800"
                            : theme === "system"
                            ? "text-sky-100"
                            : "text-zinc-200"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Escrow Trust Card */}
              <div
                className={`relative rounded-3xl overflow-hidden border p-6 transition-colors duration-300 ${
                  theme === "light"
                    ? "border-indigo-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-blue-50 shadow-sm"
                    : theme === "system"
                    ? "border-blue-500/30 bg-gradient-to-br from-[#0c1f4e] via-[#0e2764] to-[#083b63]"
                    : "border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-cyan-950/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck
                    className={`h-6 w-6 ${
                      theme === "light"
                        ? "text-indigo-600"
                        : theme === "system"
                        ? "text-cyan-300"
                        : "text-cyan-400"
                    }`}
                  />
                  <p
                    className={`text-base font-black ${
                      theme === "light"
                        ? "text-slate-900"
                        : "text-white"
                    }`}
                  >
                    Escrow Protected
                  </p>
                </div>
                <p
                  className={`text-[12px] leading-relaxed ${
                    theme === "light"
                      ? "text-slate-600"
                      : theme === "system"
                      ? "text-sky-200/80"
                      : "text-zinc-400"
                  }`}
                >
                  All transactions on MercatoX are protected by our escrow system. Funds are held
                  securely and released to sellers only after you confirm receipt via a unique doorstep OTP code.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Secure", icon: "🔒" },
                    { label: "OTP Verified", icon: "📱" },
                    { label: "Escrow", icon: "🏛️" },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className={`rounded-xl py-2.5 px-2 border transition-colors ${
                        theme === "light"
                          ? "bg-white/90 border-slate-200 shadow-sm text-slate-800"
                          : theme === "system"
                          ? "bg-blue-500/15 border-blue-400/25 text-sky-100"
                          : "bg-white/5 border-white/10 text-zinc-300"
                      }`}
                    >
                      <div className="text-lg select-none">{b.icon}</div>
                      <p className="text-[10px] mt-0.5 font-semibold">{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}

export default function CustomerSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#070a12]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
