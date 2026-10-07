"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAdminUIStore, AdminTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";

export function AdminTopbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const {
    activeTab,
    setActiveTab,
    toggleMobileSidebar,
    pendingSlipsCount,
    pendingKycCount,
  } = useAdminUIStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalAlerts = pendingSlipsCount + pendingKycCount;

  const tabLabels: Record<AdminTab, string> = {
    overview: "Overview & Analytics",
    catalog: "Products Moderation",
    categories: "Categories Management",
    users: "Merchants & KYC Verification",
    orders: "Orders & Escrow Operations",
    slips: "Bank Slip Verification Queue",
    delivery: "Delivery Fleet & Logistics",
    disputes: "Disputes & Escrow Arbitration",
    audit: "Security Audit Logs",
    settings: "Platform Governance & Settings",
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Metrics & data refreshed");
    }, 500);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 app-topbar flex h-13 w-full items-center justify-between border-b border-white/[0.08] bg-[#090d16]/90 px-3 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={toggleMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-zinc-400">
            {platformSettings.platformName}
          </span>
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-white">
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
            placeholder="Quick search merchants, orders, slips... (Ctrl+K)"
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
            <div className="app-dropdown-panel absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0d121f] p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-white">Action Required</span>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                  {totalAlerts} Pending
                </span>
              </div>
              <div className="divide-y divide-white/5 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("slips");
                    setShowNotifications(false);
                  }}
                  className="flex w-full items-start gap-2 p-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Receipt className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {pendingSlipsCount} Pending Bank Slips
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      CBE & Awash manual deposits awaiting review.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("users");
                    setShowNotifications(false);
                  }}
                  className="flex w-full items-start gap-2 p-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Users className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {pendingKycCount} Merchant KYC Requests
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Trade licenses waiting for document audit.
                    </p>
                  </div>
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
              {user?.email === "admin@gmail.com" ? "System Admin" : user?.name || "Admin"}
            </span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {showUserMenu && (
            <div className="app-dropdown-panel absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#0d121f] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
              <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                <p className="text-xs font-semibold text-white">System Admin</p>
                <p className="text-[10px] font-mono text-zinc-400 truncate">
                  {user?.email || "admin@gmail.com"}
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
                <span>Platform Controls</span>
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
                <span>Audit Trail</span>
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
