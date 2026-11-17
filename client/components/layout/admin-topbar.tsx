"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  LogOut,
  ChevronDown,
  Shield,
  Activity,
  Receipt,
  Users,
  LayoutDashboard,
  Tag,
  FolderTree,
  Building2,
  Package,
  Bike,
  Scale,
  ShieldAlert,
  Settings,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { useAdminUIStore, AdminTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSelector } from "@/components/common/language-selector";
import { useTranslation } from "@/store/language-store";
import {
  adminNotificationService,
  adminSupplierService,
  type AdminNotification,
} from "@/features/admin/services/admin.service";
import { toast } from "sonner";

export function AdminTopbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    toggleMobileSidebar,
    pendingSlipsCount,
    pendingKycCount,
    setSelectedSupplierId,
    setPendingCounts,
  } = useAdminUIStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic real-time notifications from database
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [processingSupplierId, setProcessingSupplierId] = useState<string | null>(null);

  const fetchNotifications = async (showToastOnNew = false) => {
    try {
      const res = await adminNotificationService.getNotifications();
      const newNotifs = res.notifications || [];

      // If a new supplier registered while admin is on the page, toast notification immediately!
      if (showToastOnNew && newNotifs.length > notifications.length) {
        const latest = newNotifs[0];
        toast.info(`New Supplier Registered: ${latest.shopName || latest.fullName}`, {
          description: "Submitted official documents for KYC review.",
          action: {
            label: "Review Application",
            onClick: () => {
              setActiveTab("suppliers");
              setSelectedSupplierId(latest.supplierId);
            },
          },
        });
      }

      setNotifications(newNotifs);
      setPendingCounts({
        kyc: res.pendingKycCount,
        slips: res.pendingSlipsCount,
      });
    } catch (err) {
      console.warn("Failed to fetch admin notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const totalAlerts = notifications.length + pendingSlipsCount;

  const tabLabels: Record<AdminTab, string> = {
    overview: t("admin.nav.overview", "Overview & Analytics"),
    catalog: t("admin.nav.catalog", "Products Moderation"),
    categories: t("admin.nav.categories", "Categories Management"),
    users: t("admin.nav.users", "Merchants & KYC Verification"),
    "sellers-suppliers": t("admin.nav.sellersSuppliers", "Sellers & Suppliers Payouts"),
    suppliers: t("admin.nav.suppliers", "Suppliers & Fleet Control"),
    orders: t("admin.nav.orders", "Orders & Escrow Operations"),
    slips: t("admin.nav.slips", "Bank Slip Verification Queue"),
    delivery: t("admin.nav.delivery", "Delivery Fleet & Logistics"),
    disputes: t("admin.nav.disputes", "Disputes & Escrow Arbitration"),
    audit: t("admin.nav.audit", "Security Audit Logs"),
    subscriptions: t("admin.nav.subscriptions", "Subscriptions & Plans"),
    settings: t("admin.nav.settings", "Platform Governance & Settings"),
  };

  const quickTabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: t("admin.nav.overview", "Overview"), icon: LayoutDashboard },
    { id: "catalog", label: t("admin.nav.catalog", "Products"), icon: Tag },
    { id: "categories", label: t("admin.nav.categories", "Categories"), icon: FolderTree },
    { id: "users", label: t("admin.nav.users", "Users & KYC"), icon: Users },
    { id: "sellers-suppliers", label: t("admin.nav.sellersSuppliers", "Sellers & Suppliers"), icon: Building2 },
    { id: "suppliers", label: t("admin.nav.suppliers", "Suppliers"), icon: Building2 },
    { id: "orders", label: t("admin.nav.orders", "Orders"), icon: Package },
    { id: "slips", label: t("admin.nav.slips", "Bank Slips"), icon: Receipt },
    { id: "delivery", label: t("admin.nav.delivery", "Delivery"), icon: Bike },
    { id: "disputes", label: t("admin.nav.disputes", "Disputes"), icon: Scale },
    { id: "subscriptions", label: t("admin.nav.subscriptions", "Subscriptions"), icon: Sparkles },
    { id: "audit", label: t("admin.nav.audit", "Audit"), icon: ShieldAlert },
    { id: "settings", label: t("admin.nav.settings", "Settings"), icon: Settings },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications(false);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Metrics & data refreshed");
    }, 500);
  };

  const handleQuickApprove = async (e: React.MouseEvent, n: AdminNotification) => {
    e.stopPropagation();
    setProcessingSupplierId(n.supplierId);
    try {
      await adminSupplierService.verifyMerchant(n.supplierId, true);
      toast.success(`Verified & Activated supplier: ${n.shopName || n.fullName}`);
      await fetchNotifications(false);
    } catch {
      toast.error("Failed to approve supplier");
    } finally {
      setProcessingSupplierId(null);
    }
  };

  const handleQuickReject = async (e: React.MouseEvent, n: AdminNotification) => {
    e.stopPropagation();
    setProcessingSupplierId(n.supplierId);
    try {
      await adminSupplierService.verifyMerchant(
        n.supplierId,
        false,
        "Documentation rejected by admin"
      );
      toast.success(`Rejected application: ${n.shopName || n.fullName}. Converted to Customer.`);
      await fetchNotifications(false);
    } catch {
      toast.error("Failed to reject supplier");
    } finally {
      setProcessingSupplierId(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 app-topbar flex flex-col w-full border-b border-white/[0.08] bg-[#090d16]/95 backdrop-blur-xl">
      {/* Main Topbar Row */}
      <div className="flex h-13 w-full items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobileSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors md:hidden active:scale-95"
            title="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="font-semibold text-zinc-400 hidden xs:inline">
              {platformSettings.platformName}
            </span>
            <span className="text-zinc-600 hidden xs:inline">/</span>
            <span className="font-semibold text-white truncate max-w-[170px] sm:max-w-none">
              {tabLabels[activeTab] || "Admin Console"}
            </span>
          </div>
        </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder={t("admin.nav.searchPlaceholder", "Quick search merchants, orders, slips... (Ctrl+K)")}
            className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-12 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500/80 focus:bg-white/[0.06]"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 border border-white/10">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right: Currency Pill, Alerts, Refresh, Profile */}
      <div className="flex items-center gap-2">
        {/* Currency badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1 text-[10.5px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-zinc-300">ETB</span>
        </div>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Appearance / Theme Toggle */}
        <ThemeToggle />

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          title="Refresh Data"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`}
          />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm shadow-rose-500/40">
                {totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="app-dropdown-panel fixed inset-x-2.5 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-md sm:max-w-none rounded-2xl border border-white/15 bg-[#0c101d]/98 p-3.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {t("admin.nav.complianceApprovals", "Compliance & Approvals")}
                  </span>
                  {notifications.length > 0 && (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      {notifications.length} {t("admin.nav.pendingBadge", "Pending")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fetchNotifications(false)}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{t("admin.nav.refresh", "Refresh")}</span>
                </button>
              </div>

              <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 py-1.5 space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-white">{t("admin.nav.allCaughtUp", "All Caught Up")}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {t("admin.nav.noSupplierAlerts", "No new supplier applications awaiting verification.")}
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-2.5 hover:bg-amber-500/[0.08] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate max-w-[170px]">
                                {n.shopName || n.fullName}
                              </span>
                              <span className="text-[9px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                New Supplier
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 truncate">
                              Rep: {n.fullName} {n.phone ? `• ${n.phone}` : ""}
                            </p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              TL: {n.tradeLicense || "Submitted"} • TIN: {n.tin || "Submitted"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("suppliers");
                            setSelectedSupplierId(n.supplierId);
                            setShowNotifications(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review Account</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={processingSupplierId === n.supplierId}
                            onClick={(e) => handleQuickApprove(e, n)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={processingSupplierId === n.supplierId}
                            onClick={(e) => handleQuickReject(e, n)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {pendingSlipsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("slips");
                      setShowNotifications(false);
                    }}
                    className="flex w-full items-start gap-2 p-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors cursor-pointer border border-white/5"
                  >
                    <Receipt className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {pendingSlipsCount} Pending Bank Deposits
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        CBE & Awash manual deposits awaiting review.
                      </p>
                    </div>
                  </button>
                )}
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("suppliers");
                    setShowNotifications(false);
                  }}
                  className="text-[11px] font-medium text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Go to Suppliers Queue</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1 px-2 text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white shadow">
              A
            </div>
            <span className="text-[11px] font-medium hidden sm:inline text-zinc-200">
              {user?.name || "System Admin"}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {showUserMenu && (
            <div className="app-dropdown-panel absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d121f] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
              <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">{t("admin.nav.masterSuperAdmin", "System Admin")}</p>
                <p className="text-[10px] font-mono text-zinc-400 truncate">
                  {user?.email || "admin@mercatox.et"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("settings");
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t("admin.nav.settings", "Platform Controls")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("audit");
                  setShowUserMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t("admin.nav.audit", "Audit Trail")}</span>
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("admin.nav.signOut", "Sign Out")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
}
