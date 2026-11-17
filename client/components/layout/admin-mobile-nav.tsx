"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  Tag,
  Receipt,
  Grid,
  FolderTree,
  Users,
  Building2,
  Bike,
  Scale,
  Sparkles,
  ShieldAlert,
  Settings,
  X,
  LogOut,
  Search,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAdminUIStore, AdminTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/store/language-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminMobileNav() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    pendingSlipsCount,
    pendingKycCount,
    pendingDisputesCount,
    pendingProductsCount,
  } = useAdminUIStore();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    toast.success(t("admin.nav.signOut", "Signed out successfully"));
    router.push("/login");
  };

  // Determine whether tab 4 should display Payouts or Bank Slips
  const isPayoutActive = activeTab === "sellers-suppliers";
  const isSlipsActive = activeTab === "slips";

  const fourthTab: { id: AdminTab; label: string; icon: React.ElementType; badge?: number } = isSlipsActive
    ? {
        id: "slips",
        label: t("admin.nav.mobileSlips", "Slips"),
        icon: Receipt,
        badge: pendingSlipsCount,
      }
    : {
        id: "sellers-suppliers",
        label: t("admin.nav.mobilePayouts", "Payouts"),
        icon: Building2,
        badge: undefined,
      };

  const primaryTabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: "overview",
      label: t("admin.nav.mobileOverview", "Overview"),
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: t("admin.nav.mobileOrders", "Orders"),
      icon: Package,
    },
    {
      id: "catalog",
      label: t("admin.nav.mobileCatalog", "Products"),
      icon: Tag,
      badge: pendingProductsCount,
    },
    fourthTab,
  ];

  const allSections: {
    group: string;
    items: { id: AdminTab; label: string; icon: React.ElementType; badge?: number; color: string; desc: string }[];
  }[] = [
    {
      group: t("admin.nav.coreMonitoring", "Core Monitoring"),
      items: [
        {
          id: "overview",
          label: t("admin.nav.overview", "Overview & Analytics"),
          icon: LayoutDashboard,
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
          desc: "Real-time revenue, escrow volume, and conversion",
        },
      ],
    },
    {
      group: t("admin.nav.financePayouts", "Finance & Payouts"),
      items: [
        {
          id: "sellers-suppliers",
          label: t("admin.nav.sellersSuppliers", "Sellers & Suppliers Payouts"),
          icon: Building2,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          desc: "Merchant ledger, 3.5% commission, and Chapa transfers",
        },
        {
          id: "slips",
          label: t("admin.nav.slips", "Bank Slips Audit"),
          icon: Receipt,
          badge: pendingSlipsCount,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          desc: "Offline CBE, Telebirr, and manual slip validation",
        },
      ],
    },
    {
      group: t("admin.nav.commerceCatalog", "Commerce & Merchants"),
      items: [
        {
          id: "catalog",
          label: t("admin.nav.catalog", "Products Moderation"),
          icon: Tag,
          badge: pendingProductsCount,
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
          desc: "Review merchant catalog listings & pricing",
        },
        {
          id: "categories",
          label: t("admin.nav.categories", "Categories"),
          icon: FolderTree,
          color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
          desc: "Taxonomy, commission rate, and attribute schemes",
        },
        {
          id: "users",
          label: t("admin.nav.users", "Merchants & KYC"),
          icon: Users,
          badge: pendingKycCount,
          color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
          desc: "TIN, trade license verification & bans",
        },
        {
          id: "suppliers",
          label: t("admin.nav.suppliers", "Suppliers & Fleet"),
          icon: Building2,
          color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
          desc: "Wholesale suppliers, MOQ, and warehouse profiles",
        },
        {
          id: "subscriptions",
          label: t("admin.nav.subscriptions", "Subscriptions & Plans"),
          icon: Sparkles,
          color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
          desc: "Merchant tiers, monthly dues, and feature caps",
        },
      ],
    },
    {
      group: t("admin.nav.logisticsCare", "Logistics & Arbitration"),
      items: [
        {
          id: "orders",
          label: t("admin.nav.orders", "Orders & Escrow"),
          icon: Package,
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          desc: "Escrow release queue, tracking, and fulfillment",
        },
        {
          id: "delivery",
          label: t("admin.nav.delivery", "Delivery & Riders"),
          icon: Bike,
          color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
          desc: "Fleet drivers, delivery zones, and rate cards",
        },
        {
          id: "disputes",
          label: t("admin.nav.disputes", "Disputes & Refunds"),
          icon: Scale,
          badge: pendingDisputesCount,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
          desc: "Buyer claims, evidence arbitration, and refund approvals",
        },
      ],
    },
    {
      group: t("admin.nav.governanceSystem", "Governance & System"),
      items: [
        {
          id: "audit",
          label: t("admin.nav.audit", "Security Audit Logs"),
          icon: ShieldAlert,
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          desc: "Immutable logs of staff actions and payouts",
        },
        {
          id: "settings",
          label: t("admin.nav.settings", "Platform Controls"),
          icon: Settings,
          color: "text-zinc-400 bg-white/5 border-white/10",
          desc: "Maintenance mode, platform fees, and API keys",
        },
      ],
    },
  ];

  const totalMoreBadges =
    (pendingKycCount || 0) +
    (pendingDisputesCount || 0) +
    (isSlipsActive ? 0 : pendingSlipsCount || 0);

  const isPrimaryActive = primaryTabs.some((tab) => tab.id === activeTab);
  const isMoreActive = isMoreSheetOpen || !isPrimaryActive;

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return allSections;
    const q = searchQuery.toLowerCase().trim();
    return allSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [allSections, searchQuery]);

  return (
    <>
      {/* Sleek Ultra-Modern Floating Mobile Bottom Dock */}
      <nav
        aria-label="Admin Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#070b14]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_35px_rgba(0,0,0,0.6)] select-none"
        style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom, 8px))" }}
      >
        <div className="grid grid-cols-5 h-[58px] items-center px-1 max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMoreSheetOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center h-full px-1 rounded-xl transition-all select-none cursor-pointer ${
                  isActive
                    ? "text-indigo-400 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {/* Active Indicator Top Glow Bar */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_#6366f1]" />
                )}

                <div className="relative mt-1">
                  <Icon
                    className={`h-[18px] w-[18px] transition-transform duration-200 ${
                      isActive ? "scale-110 text-cyan-300" : "text-zinc-400"
                    }`}
                  />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8.5px] font-bold text-white shadow-sm ring-1 ring-[#070b14]">
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Single line, non-breaking label with ellipsis guarantee */}
                <span className="text-[10px] sm:text-[11px] font-medium tracking-tight truncate whitespace-nowrap overflow-hidden block w-full max-w-[62px] text-center leading-tight mt-1">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "More / Menu" Hub Button */}
          <button
            type="button"
            onClick={() => setIsMoreSheetOpen(true)}
            className={`relative flex flex-col items-center justify-center h-full px-1 rounded-xl transition-all select-none cursor-pointer ${
              isMoreActive
                ? "text-cyan-300 font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isMoreActive && (
              <span className="absolute top-0 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            )}
            <div className="relative mt-1">
              <Grid className="h-[18px] w-[18px]" />
              {totalMoreBadges > 0 && (
                <span className="absolute -top-1 -right-2.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-500 px-1 text-[8.5px] font-bold text-white shadow-sm ring-1 ring-[#070b14]">
                  {totalMoreBadges}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-tight truncate whitespace-nowrap overflow-hidden block w-full max-w-[62px] text-center leading-tight mt-1">
              {t("admin.nav.mobileMore", "More")}
            </span>
          </button>
        </div>
      </nav>

      {/* Modern Slide-Up Action Sheet for "More" Sections */}
      {isMoreSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMoreSheetOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-[#090e1a] p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 overscroll-contain flex flex-col">
            {/* Grab Handle */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20 mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-md">
                  M
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t("admin.nav.adminConsole", "Admin Portal Hub")}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {user?.name || "System Admin"} · {t("admin.nav.superAdmin", "SUPER_ADMIN")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMoreSheetOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.nav.searchModules", "Search admin modules (Payouts, KYC, Disputes...)")}
                className="w-full h-8.5 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Sections Grid */}
            <div className="py-3 space-y-4 flex-1 overflow-y-auto">
              {filteredSections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase font-bold tracking-wider text-zinc-400 px-1">
                    {sec.group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMoreSheetOpen(false);
                            setSearchQuery("");
                          }}
                          className={`relative flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all active:scale-95 cursor-pointer ${
                            isActive
                              ? "border-indigo-400/50 bg-indigo-600/20 text-white shadow-md shadow-indigo-600/20"
                              : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300"
                          }`}
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate leading-tight">
                              {item.label}
                            </p>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {item.badge} pending
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredSections.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No modules match &quot;{searchQuery}&quot;
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-2 text-[10.5px] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t("admin.nav.clusterActive", "Cluster: Active")} · ETB</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("admin.nav.signOut", "Sign Out")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
