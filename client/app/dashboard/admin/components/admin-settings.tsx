"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Sliders,
  ShieldCheck,
  Save,
  AlertTriangle,
  RotateCcw,
  Percent,
  Clock,
  Power,
  CreditCard,
  Building,
  Key,
  Lock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Share2,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Check,
  Shield,
  Layers,
  UploadCloud,
  ExternalLink,
  ChevronRight,
  Info,
  Server,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, usePlatformStore } from "@/store";
import { api } from "@/services/api/client";

// Preset Logos for Instant Customization
const LOGO_PRESETS = [
  {
    id: "gradient-m",
    name: "Modern Gradient",
    bg: "from-indigo-600 via-indigo-500 to-cyan-400",
    letter: "M",
  },
  {
    id: "cyan-shield",
    name: "Escrow Shield",
    bg: "from-cyan-500 to-blue-600",
    letter: "X",
  },
  {
    id: "emerald-trade",
    name: "Birr Green",
    bg: "from-emerald-500 to-teal-700",
    letter: "M",
  },
  {
    id: "dark-monochrome",
    name: "Onyx Minimal",
    bg: "from-zinc-800 to-black",
    letter: "M",
  },
];

type SettingsSidebarTab =
  | "all"
  | "brand"
  | "contact"
  | "admin-security"
  | "escrow"
  | "gateways"
  | "kyc";

const SIDEBAR_ITEMS = [
  {
    id: "all" as SettingsSidebarTab,
    label: "Compact Grid",
    sub: "All settings overview",
    icon: Layers,
    color: "text-indigo-400",
    badge: "ALL",
  },
  {
    id: "brand" as SettingsSidebarTab,
    label: "Brand & Identity",
    sub: "Name, logo & meta",
    icon: Sparkles,
    color: "text-cyan-400",
    badge: "CORE",
  },
  {
    id: "contact" as SettingsSidebarTab,
    label: "Footer & Contact",
    sub: "Email, phone & address",
    icon: Phone,
    color: "text-emerald-400",
    badge: "PUBLIC",
  },
  {
    id: "admin-security" as SettingsSidebarTab,
    label: "Admin Credentials",
    sub: "Login email & password",
    icon: Key,
    color: "text-amber-400",
    badge: "AUTH",
  },
  {
    id: "escrow" as SettingsSidebarTab,
    label: "Escrow & Finance",
    sub: "Commission & release windows",
    icon: Percent,
    color: "text-indigo-400",
    badge: "RULES",
  },
  {
    id: "gateways" as SettingsSidebarTab,
    label: "Gateways",
    sub: "Telebirr, CBE & Chapa",
    icon: CreditCard,
    color: "text-emerald-400",
    badge: "PAYMENTS",
  },
  {
    id: "kyc" as SettingsSidebarTab,
    label: "Merchant KYC",
    sub: "TIN, license & couriers",
    icon: Building,
    color: "text-cyan-400",
    badge: "GOVERNANCE",
  },
];

export function AdminSettings() {
  const { user, setUser } = useAuthStore();
  const {
    settings: globalSettings,
    setSettings: setGlobalSettings,
    saveSettingsToBackend,
    fetchSettings,
    isLoading: isStoreLoading,
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<SettingsSidebarTab>("all");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Local copy for editing
  const [settings, setLocalSettings] = useState(globalSettings);
  const [selectedPresetLogo, setSelectedPresetLogo] = useState("gradient-m");

  // Keep local copy in sync with global store changes
  useEffect(() => {
    setLocalSettings(globalSettings);
  }, [globalSettings]);

  // Admin Email Change State
  const [currentAdminEmail, setCurrentAdminEmail] = useState(
    user?.email || "admin@mercatox.et"
  );
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [confirmAdminEmail, setConfirmAdminEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Admin Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync user email when auth store updates
  useEffect(() => {
    if (user?.email) {
      setCurrentAdminEmail(user.email);
    }
  }, [user?.email]);

  const updateSetting = (key: keyof typeof globalSettings, value: any) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
    setGlobalSettings({ [key]: value });
    setHasUnsavedChanges(true);
  };

  // Upload Logo directly from computer
  const handleLogoFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image file is too large", {
        description: "Please choose an image under 6MB.",
      });
      return;
    }

    setIsUploadingLogo(true);
    const toastId = toast.loading("Uploading platform logo...");

    // Try backend upload first
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url: string }>("/upload/image", formData);
      if (res?.url) {
        updateSetting("logoUrl", res.url);
        await saveSettingsToBackend({ logoUrl: res.url });
        toast.dismiss(toastId);
        toast.success("Platform Logo Uploaded & Broadcasted!", {
          description:
            "New logo is now active across all headers, sidebar, and customer footer.",
        });
        setIsUploadingLogo(false);
        return;
      }
    } catch {
      // Graceful local base64 fallback if server upload offline/no cloudinary key
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateSetting("logoUrl", dataUrl);
        await saveSettingsToBackend({ logoUrl: dataUrl });
        toast.dismiss(toastId);
        toast.success("Logo Uploaded & Broadcasted!", {
          description:
            "New logo is now active across all headers, sidebar, and customer footer.",
        });
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      toast.dismiss(toastId);
      toast.error("Failed to read image file");
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  // Calculate Password Strength Score (0 to 4)
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 1:
        return { text: "Weak", color: "text-rose-400", bg: "bg-rose-500" };
      case 2:
        return { text: "Fair", color: "text-amber-400", bg: "bg-amber-500" };
      case 3:
        return { text: "Good", color: "text-cyan-400", bg: "bg-cyan-500" };
      case 4:
        return { text: "Strong & Secure", color: "text-emerald-400", bg: "bg-emerald-500" };
      default:
        return { text: "Too Short", color: "text-zinc-500", bg: "bg-zinc-700" };
    }
  }, [passwordStrength]);

  // Save All Settings to Backend
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const saved = await saveSettingsToBackend(settings);
      setLocalSettings(saved);
      setHasUnsavedChanges(false);
      toast.success("Platform Settings Saved to Backend", {
        description: `All headers, footers, and customer views are now updated with '${saved.platformName}'.`,
      });
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    if (confirm("Reset all platform settings to default values?")) {
      const reset = await saveSettingsToBackend({
        platformName: "MercatoX",
        logoUrl: "",
        platformTagline: "Unified Commerce & Escrow Control Center",
        footerEmail: "support@mercatox.et",
        contactPhone: "+251 911 234 567",
      });
      setLocalSettings(reset);
      setHasUnsavedChanges(false);
      toast.info("Settings restored to factory defaults");
    }
  };

  // Change Admin Login Email (Backend integrated: PATCH /users/me)
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      toast.error("Please enter a new email address");
      return;
    }
    if (!newAdminEmail.includes("@") || !newAdminEmail.includes(".")) {
      toast.error("Please provide a valid email format");
      return;
    }
    if (newAdminEmail !== confirmAdminEmail) {
      toast.error("New emails do not match");
      return;
    }
    if (newAdminEmail.toLowerCase() === currentAdminEmail.toLowerCase()) {
      toast.warning("New email is identical to the current email");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      await api.patch("/users/me", { email: newAdminEmail });

      if (user) {
        setUser({ ...user, email: newAdminEmail });
      }
      setCurrentAdminEmail(newAdminEmail);
      setNewAdminEmail("");
      setConfirmAdminEmail("");

      toast.success("Admin Email Updated on Backend", {
        description: `Primary login email changed to ${newAdminEmail}. Use this on your next sign-in.`,
      });
    } catch {
      if (user) {
        setUser({ ...user, email: newAdminEmail });
      }
      setCurrentAdminEmail(newAdminEmail);
      setNewAdminEmail("");
      setConfirmAdminEmail("");
      toast.success("Admin Email Updated Locally", {
        description: `Primary login email set to ${newAdminEmail}.`,
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // Change Admin Password (Backend integrated: POST /auth/change-password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current administrator password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        userId: user?.id,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password Changed Successfully", {
        description: "Your administrator security credentials have been updated securely.",
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not update password. Verify current password.";
      toast.error("Password Change Failed", {
        description: errorMsg,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const currentTabItem = SIDEBAR_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="admin-platform-settings space-y-4 max-w-6xl mx-auto pb-12">
      {/* Hidden Native File Input for Logo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleLogoFileUpload}
        className="hidden"
      />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Platform & Security Settings
              </h1>
              {isStoreLoading && (
                <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-indigo-400" />
                  Syncing...
                </span>
              )}
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Customize marketplace name, upload platform logo, configure contacts, and sync everywhere.
            </p>
          </div>
        </div>

        {/* Global Save & Reset Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
            title="Reset to factory defaults"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save to Backend"}</span>
          </button>
        </div>
      </div>

      {/* Emergency Maintenance Mode Banner (if active) */}
      {settings.maintenanceMode && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-300">
                Cluster Maintenance Mode is Currently Active
              </p>
              <p className="text-[10px] text-rose-300/80">
                Storefront checkout is paused. Escrow balances and administrative functions remain intact.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSetting("maintenanceMode", false)}
            className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-500 transition-colors cursor-pointer shrink-0"
          >
            Disable
          </button>
        </div>
      )}

      {/* MAIN LAYOUT: Left Sidebar + Single Narrow/Compact Card on Right */}
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* ============================================================ */}
        {/* LEFT: Sleek Settings Sidebar Navigation                      */}
        {/* ============================================================ */}
        <aside className="admin-settings-surface w-full lg:w-60 shrink-0 space-y-1 bg-[#0c101c]/80 border border-white/[0.08] p-2 rounded-xl backdrop-blur-xl shadow-lg">
          <div className="px-2.5 py-1.5 mb-1 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Settings Navigation
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
              7 Sections
            </span>
          </div>

          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer group ${
                  isActive
                    ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/[0.04] " + item.color
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold tracking-tight truncate">
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? "text-indigo-200" : "text-zinc-400"
                      }`}
                    >
                      {item.sub}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ml-1.5 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/[0.04] text-zinc-400"
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}

          {/* Cluster Status Footer in Sidebar */}
          <div className="mt-3 pt-2.5 border-t border-white/5 px-2.5 flex items-center justify-between text-[10px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Universal Sync</span>
            </span>
            <span className="font-mono text-emerald-400 text-[9px]">LIVE</span>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT: Single Narrow/Compact Card Container                  */}
        {/* ============================================================ */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="admin-settings-surface rounded-xl border border-white/[0.08] bg-[#0c101c]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4">
            {/* Single Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 ${
                    currentTabItem?.color || "text-indigo-400"
                  }`}
                >
                  {currentTabItem ? (
                    <currentTabItem.icon className="h-4 w-4" />
                  ) : (
                    <Sliders className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {currentTabItem?.label || "Platform Settings"}
                  </h2>
                  <p className="text-[10px] text-zinc-400">
                    {currentTabItem?.sub || "Configure system parameters"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[9px] font-mono font-medium text-indigo-300 border border-indigo-500/20">
                  {currentTabItem?.badge || "ACTIVE"}
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-md bg-indigo-600/80 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Rendered cleanly inside this single compact card */}

            {/* SECTION 1: Brand & Identity */}
            {(activeTab === "all" || activeTab === "brand") && (
              <div className="space-y-3.5 pt-1">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Brand & Identity</span>
                  </div>
                )}

                {/* Platform Name (Universal Update) */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Platform Brand Name
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) =>
                        updateSetting("platformName", e.target.value)
                      }
                      placeholder="e.g. MercatoX"
                      className="w-full rounded-lg border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs font-semibold text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-cyan-400 font-medium">
                    ⚡ Modifying this name immediately updates all headers, footers, sidebars, and customer pages!
                  </p>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.platformTagline}
                    onChange={(e) =>
                      updateSetting("platformTagline", e.target.value)
                    }
                    placeholder="e.g. Unified Commerce & Escrow Control Center"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Hero Section Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.heroSectionDescription ?? settings.platformDescription}
                    onChange={(e) => {
                      updateSetting("heroSectionDescription", e.target.value);
                      updateSetting("platformDescription", e.target.value);
                    }}
                    placeholder="Overview of platform for hero banner, SEO and customer showcase..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 p-2 text-xs text-zinc-200 outline-none focus:border-cyan-500 resize-none leading-relaxed"
                  />
                </div>

                {/* LOGO UPLOAD & EMBLEM SECTION */}
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
                        Platform Logo Image Upload
                      </span>
                      <p className="text-[10px] text-zinc-400">
                        Upload your official logo to be displayed across all headers & footers
                      </p>
                    </div>
                    {settings.logoUrl && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Custom Logo Active
                      </span>
                    )}
                  </div>

                  {/* Upload Controls & Live Previews */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 py-2 border-y border-white/5">
                    {/* Dark Preview */}
                    <div className="flex items-center gap-2">
                      <div className="admin-settings-dark-preview flex h-12 w-12 items-center justify-center rounded-xl bg-[#090d16] border border-white/15 p-1 shadow-inner overflow-hidden">
                        {settings.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={settings.logoUrl}
                            alt="Logo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${
                              LOGO_PRESETS.find(
                                (p) => p.id === selectedPresetLogo
                              )?.bg || "from-indigo-600 to-cyan-400"
                            } flex items-center justify-center font-bold text-white shadow text-sm`}
                          >
                            {settings.platformName.charAt(0) || "M"}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Dark Header
                      </span>
                    </div>

                    {/* Light Preview */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-300 p-1 shadow-sm overflow-hidden">
                        {settings.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={settings.logoUrl}
                            alt="Logo"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${
                              LOGO_PRESETS.find(
                                (p) => p.id === selectedPresetLogo
                              )?.bg || "from-indigo-600 to-cyan-400"
                            } flex items-center justify-center font-bold text-white shadow text-sm`}
                          >
                            {settings.platformName.charAt(0) || "M"}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Light Mode
                      </span>
                    </div>

                    {/* Action Upload Buttons */}
                    <div className="flex-1 flex flex-wrap items-center gap-2 justify-end w-full">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>
                          {isUploadingLogo
                            ? "Uploading..."
                            : "Upload Image Logo"}
                        </span>
                      </button>

                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            updateSetting("logoUrl", "");
                            saveSettingsToBackend({ logoUrl: "" });
                            toast.info("Custom logo removed. Using monogram.");
                          }}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-medium text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Or Custom URL */}
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                      Or Paste Direct Image URL (PNG/SVG/WebP)
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => updateSetting("logoUrl", e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full rounded-lg border border-white/10 bg-black/60 py-1.5 px-2.5 text-xs font-mono text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Monogram Color Presets (If no custom image) */}
                  {!settings.logoUrl && (
                    <div>
                      <span className="text-[10px] text-zinc-400 mb-1 block">
                        Fallback Monogram Color Schemes:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {LOGO_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedPresetLogo(preset.id)}
                            className={`flex items-center gap-1.5 p-1 rounded-md border text-left cursor-pointer transition-all ${
                              selectedPresetLogo === preset.id
                                ? "border-cyan-500 bg-cyan-500/10 text-white"
                                : "border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
                            }`}
                          >
                            <div
                              className={`h-4 w-4 rounded bg-gradient-to-tr ${preset.bg} flex items-center justify-center font-bold text-[9px] text-white shrink-0`}
                            >
                              {preset.letter}
                            </div>
                            <span className="text-[9px] font-medium truncate">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Base Currency & Timezone */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400">
                      Base Currency
                    </label>
                    <input
                      type="text"
                      value={settings.currency}
                      onChange={(e) =>
                        updateSetting("currency", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono font-bold text-emerald-400 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400">
                      Regional Timezone
                    </label>
                    <input
                      type="text"
                      value={settings.timezone}
                      disabled
                      className="mt-1 w-full rounded-lg border border-white/5 bg-black/20 py-1 px-2 text-xs font-mono text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: Footer & Contact */}
            {(activeTab === "all" || activeTab === "contact") && (
              <div className="space-y-3.5 pt-2 border-t border-white/5">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-emerald-300">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Footer & Public Contact Info</span>
                  </div>
                )}

                {/* Footer Email */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Customer Support Email (Footer)
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="email"
                      value={settings.footerEmail}
                      onChange={(e) =>
                        updateSetting("footerEmail", e.target.value)
                      }
                      placeholder="support@mercatox.et"
                      className="w-full rounded-lg border border-white/10 bg-black/40 py-1.5 pl-8 pr-2.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    Synchronized with the customer website footer in real time.
                  </p>
                </div>

                {/* Contact Phone & Secondary Hotline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300">
                      Primary Contact Phone
                    </label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                      <input
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) =>
                          updateSetting("contactPhone", e.target.value)
                        }
                        placeholder="+251 911 234 567"
                        className="w-full rounded-lg border border-white/10 bg-black/40 py-1.5 pl-8 pr-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300">
                      Emergency Hotline
                    </label>
                    <input
                      type="text"
                      value={settings.secondaryPhone}
                      onChange={(e) =>
                        updateSetting("secondaryPhone", e.target.value)
                      }
                      placeholder="+251 115 500 000"
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1.5 px-2.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Headquarters Address */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Physical Headquarters Address
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
                    <textarea
                      rows={2}
                      value={settings.headquartersAddress}
                      onChange={(e) =>
                        updateSetting("headquartersAddress", e.target.value)
                      }
                      placeholder="Bole Medhanialem Commercial Plaza, Addis Ababa"
                      className="w-full rounded-lg border border-white/10 bg-black/40 py-1.5 pl-8 pr-2.5 text-xs text-white outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Copyright */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300">
                    Footer Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={settings.copyrightText}
                    onChange={(e) =>
                      updateSetting("copyrightText", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1.5 px-2.5 text-[11px] text-zinc-300 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Social Handles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400">
                      Telegram Channel
                    </label>
                    <input
                      type="text"
                      value={settings.telegramChannel}
                      onChange={(e) =>
                        updateSetting("telegramChannel", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400">
                      LinkedIn Page
                    </label>
                    <input
                      type="text"
                      value={settings.linkedinHandle}
                      onChange={(e) =>
                        updateSetting("linkedinHandle", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono text-zinc-300 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Admin Credentials (Email & Password) */}
            {(activeTab === "all" || activeTab === "admin-security") && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-amber-300">
                    <Key className="h-3.5 w-3.5" />
                    <span>Administrator Credentials & Security</span>
                  </div>
                )}

                {/* Sub-Card A: Change Admin Login Email */}
                <div className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-amber-400" />
                      Change Login Administrator Email
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ACTIVE: {currentAdminEmail}
                    </span>
                  </div>

                  <form onSubmit={handleChangeEmail} className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-300">
                          New Admin Email
                        </label>
                        <input
                          type="email"
                          required
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="new.admin@mercatox.et"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-300">
                          Confirm New Email
                        </label>
                        <input
                          type="email"
                          required
                          value={confirmAdminEmail}
                          onChange={(e) => setConfirmAdminEmail(e.target.value)}
                          placeholder="Repeat new email"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isUpdatingEmail || !newAdminEmail}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Save className="h-3 w-3" />
                        <span>
                          {isUpdatingEmail
                            ? "Updating Email..."
                            : "Update Login Email"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sub-Card B: Change Administrator Password */}
                <div className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-purple-400" />
                      Change Administrator Password
                    </span>
                    {newPassword && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${passwordStrengthLabel.color}`}
                      >
                        {passwordStrengthLabel.text}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-zinc-300">
                        Current Password
                      </label>
                      <div className="relative mt-1">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-lg border border-white/10 bg-black/40 py-1 pl-2 pr-8 text-xs font-mono text-white outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-300">
                          New Password (Min 8 chars)
                        </label>
                        <div className="relative mt-1">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full rounded-lg border border-white/10 bg-black/40 py-1 pl-2 pr-8 text-xs font-mono text-white outline-none focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-300">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 py-1 px-2 text-xs font-mono text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Password Strength Progress Bar */}
                    {newPassword && (
                      <div className="grid grid-cols-4 gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`rounded-full transition-all ${
                              step <= passwordStrength
                                ? passwordStrengthLabel.bg
                                : "bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={
                          isUpdatingPassword || !newPassword || !currentPassword
                        }
                        className="flex items-center gap-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <Lock className="h-3 w-3" />
                        <span>
                          {isUpdatingPassword
                            ? "Updating Password..."
                            : "Update Password"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sub-Card C: 2FA, Session & Account Lockout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div>
                      <p className="text-[11px] font-medium text-white">
                        Enforce 2FA
                      </p>
                      <p className="text-[9px] text-zinc-400">
                        Disbursement protection
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.require2FA}
                      onChange={(e) =>
                        updateSetting("require2FA", e.target.checked)
                      }
                      className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-white">
                        Auto-Lock
                      </p>
                      <p className="text-[9px] text-zinc-400">
                        Session timeout
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={settings.sessionTimeoutMinutes}
                        onChange={(e) =>
                          updateSetting("sessionTimeoutMinutes", e.target.value)
                        }
                        className="w-14 rounded border border-white/10 bg-black/40 py-0.5 px-1.5 text-xs font-mono text-center text-white"
                      />
                      <span className="text-[10px] text-zinc-400">m</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-rose-500/[0.03] border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-medium text-rose-300">
                        Max Login Attempts
                      </p>
                      <p className="text-[9px] text-zinc-400">
                        Lockout threshold
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.maxLoginAttempts || "5"}
                        onChange={(e) =>
                          updateSetting("maxLoginAttempts", e.target.value)
                        }
                        className="w-14 rounded border border-rose-500/30 bg-black/40 py-0.5 px-1.5 text-xs font-mono text-center text-white outline-none focus:border-rose-500"
                      />
                      <span className="text-[10px] text-zinc-400">tries</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400">
                  * When consecutive failed login attempts reach this limit, the account will be automatically blocked.
                </p>
              </div>
            )}

            {/* SECTION 4: Escrow & Finance */}
            {(activeTab === "all" || activeTab === "escrow") && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-indigo-300">
                    <Percent className="h-3.5 w-3.5" />
                    <span>Escrow & Commission Parameters</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Seller Commission Rate / Platform Deduction */}
                  <div className="p-3 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-indigo-300">
                        Seller Sales Commission Rate (%)
                      </label>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        COMMISSION
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Platform commission percentage deducted from seller revenue upon successful product sale.
                    </p>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={settings.commissionRate}
                        onChange={(e) =>
                          updateSetting("commissionRate", e.target.value)
                        }
                        className="w-full rounded-lg border border-white/15 bg-black/60 py-1.5 pl-3 pr-8 text-xs font-mono font-bold text-white outline-none focus:border-indigo-400"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Escrow Auto-Release Window */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-zinc-300">
                        Escrow Auto-Release Window
                      </label>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        HOLD DURATION
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Duration the payment remains held in escrow after delivery before releasing to merchant.
                    </p>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        min="1"
                        value={settings.escrowHoldHours}
                        onChange={(e) =>
                          updateSetting("escrowHoldHours", e.target.value)
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 py-1.5 pl-3 pr-11 text-xs font-mono text-white outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500">
                        HRS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: Gateways & Webhooks */}
            {(activeTab === "all" || activeTab === "gateways") && (
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-emerald-300">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>National Payment Gateways</span>
                  </div>
                )}

                {/* Telebirr */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      Ethio Telecom Telebirr SuperApp
                    </p>
                    <p className="text-[9px] text-zinc-400 font-mono">
                      Shortcode: {settings.telebirrShortCode} · IPN Hook Active
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting("telebirrWebhook", !settings.telebirrWebhook)
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors ${
                      settings.telebirrWebhook
                        ? "bg-emerald-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition m-0.5 ${
                        settings.telebirrWebhook
                          ? "translate-x-3.5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* CBE Birr */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      Commercial Bank of Ethiopia (CBE Birr API)
                    </p>
                    <p className="text-[9px] text-zinc-400 font-mono">
                      Direct Core Banking IPN
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting("cbeBirrWebhook", !settings.cbeBirrWebhook)
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors ${
                      settings.cbeBirrWebhook
                        ? "bg-emerald-600"
                        : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition m-0.5 ${
                        settings.cbeBirrWebhook
                          ? "translate-x-3.5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Chapa Gateway */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      Chapa Card Gateway (Visa / Master)
                    </p>
                    <p className="text-[9px] text-zinc-400 font-mono">
                      Live Production Key Configured
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting("chapaLiveMode", !settings.chapaLiveMode)
                    }
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full transition-colors ${
                      settings.chapaLiveMode ? "bg-emerald-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition m-0.5 ${
                        settings.chapaLiveMode
                          ? "translate-x-3.5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 6: Merchant KYC */}
            {(activeTab === "all" || activeTab === "kyc") && (
              <div className="space-y-2.5 pt-2 border-t border-white/5">
                {activeTab === "all" && (
                  <div className="flex items-center gap-1.5 pb-1 border-b border-white/5 text-[11px] font-semibold text-cyan-300">
                    <Building className="h-3.5 w-3.5" />
                    <span>Merchant KYC & Compliance Rules</span>
                  </div>
                )}

                {/* TIN Verification */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-medium text-white">
                      Mandatory Tax ID (TIN) Verification
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Validated with Ministry of Revenues registry
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireTin}
                    onChange={(e) =>
                      updateSetting("requireTin", e.target.checked)
                    }
                    className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Trade License */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-medium text-white">
                      Commercial Trade License Prerequisite
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Merchants cannot publish products until verified
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireTradeLicense}
                    onChange={(e) =>
                      updateSetting("requireTradeLicense", e.target.checked)
                    }
                    className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Rider OCR */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-medium text-white">
                      Automated Rider License OCR
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Motorcycle and courier license validation
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.instantVerifyRiders}
                    onChange={(e) =>
                      updateSetting("instantVerifyRiders", e.target.checked)
                    }
                    className="h-4 w-4 rounded accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Maintenance Mode Emergency Switch */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between p-2 rounded-lg bg-rose-500/[0.04] border-rose-500/20">
                  <div>
                    <p className="text-xs font-semibold text-rose-300">
                      Cluster Maintenance Mode
                    </p>
                    <p className="text-[9px] text-zinc-400">
                      Halts public checkout while securing escrow
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !settings.maintenanceMode;
                      updateSetting("maintenanceMode", next);
                      if (next) {
                        toast.warning("Marketplace Set to Maintenance Mode");
                      } else {
                        toast.success("Marketplace Restored Online");
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      settings.maintenanceMode
                        ? "bg-rose-600 text-white shadow"
                        : "bg-white/10 text-zinc-300 hover:bg-white/15"
                    }`}
                  >
                    {settings.maintenanceMode ? "ENABLED" : "Disable"}
                  </button>
                </div>
              </div>
            )}

            {/* Single Card Bottom Action Bar */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                <Server className="h-3 w-3 text-indigo-400" />
                Universal realtime update enabled
              </span>
              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Save Configuration"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
