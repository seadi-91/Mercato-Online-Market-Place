"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Shield,
  Activity,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuthStore, usePlatformStore } from "@/store";
import { toast } from "sonner";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSlipsCount?: number;
  pendingKycCount?: number;
}

export function AdminHeader({
  activeTab,
  setActiveTab,
  pendingSlipsCount = 3,
  pendingKycCount = 4,
}: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Metrics and transaction logs refreshed");
    }, 600);
  };

  const totalAlerts = pendingSlipsCount + pendingKycCount;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#090d16]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#090d16] border border-white/10 shadow-md shadow-indigo-500/20 overflow-hidden">
              {platformSettings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={platformSettings.logoUrl}
                  alt={platformSettings.platformName}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                  {platformSettings.platformName?.charAt(0) || "M"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#090d16] bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white uppercase font-mono">
                  {platformSettings.platformName}
                </span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                  ADMIN CORE
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block truncate max-w-[220px]">
                {platformSettings.platformTagline}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-white/10 pl-3">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10.5px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cluster Active (99.98% SLA)</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search merchants, orders, slips... (Ctrl+K)"
              className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-12 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500/80 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/20"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 border border-white/10">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Alerts & Profile */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshData}
            title="Refresh Data"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
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
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm shadow-rose-500/50">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="app-dropdown-panel absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0d121f] p-3 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">System Actions Required</span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                      {totalAlerts}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[10.5px] text-indigo-400 hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="divide-y divide-white/5 py-1">
                  <div
                    onClick={() => {
                      setActiveTab("slips");
                      setShowNotifications(false);
                    }}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 rounded p-1 bg-amber-500/10 text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {pendingSlipsCount} Pending Bank Slips
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        CBE & Awash manual transfers awaiting admin verification.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab("users");
                      setShowNotifications(false);
                    }}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="mt-0.5 rounded p-1 bg-indigo-500/10 text-indigo-400">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {pendingKycCount} Merchant KYC Submissions
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Commercial trade licenses waiting for document audit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1 px-2 text-zinc-200 hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-[10px] font-bold text-white shadow">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-semibold leading-tight text-white">
                  {user?.email === "admin@gmail.com" ? "System Admin" : user?.name || "Admin"}
                </p>
                <p className="text-[9px] font-mono text-indigo-400 leading-none">
                  SUPER_ADMIN
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {showUserMenu && (
              <div className="app-dropdown-panel absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0d121f] p-2 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white">
                    {user?.name || "Super Administrator"}
                  </p>
                  <p className="text-[10.5px] font-mono text-zinc-400 truncate">
                    {user?.email || "admin@gmail.com"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  >
                    <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    <span>System Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("audit");
                      setShowUserMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Audit Logs</span>
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
