"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  MessageCircle,
  Plus,
  ShieldCheck,
  ChevronDown,
  Building,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Check,
  Users,
  Truck,
  User,
  Settings,
  LogOut,
  MapPin,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";

export function SupplierHeader() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  const {
    activeTab,
    setMobileDrawerOpen,
    notifications,
    chatThreads,
    setActiveTab,
    setSubView,
    openModal,
    profile,
    currentStaffUser,
  } = useSupplierStore();

  const { user, logout } = useAuthStore();

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadMessages = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  const isBranchManager =
    user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const displayName = mounted
    ? user?.name || currentStaffUser?.fullName || profile?.businessName || "Abyssinia Supply PLC"
    : "Abyssinia Supply PLC";
  const displayEmail = mounted
    ? user?.email || currentStaffUser?.email || profile?.email || "hq@abyssiniasupply.et"
    : "hq@abyssiniasupply.et";
  const userBranchName =
    user?.branchName || currentStaffUser?.branchName;

  const avatarInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const handleQuickAction = (action: string) => {
    setIsQuickActionsOpen(false);
    switch (action) {
      case "add-product":
        setActiveTab("products");
        setSubView("create-product");
        break;
      case "create-quotation":
        openModal("create-quotation");
        break;
      case "transfer-stock":
        openModal("transfer-stock");
        break;
      case "adjust-stock":
        openModal("adjust-stock");
        break;
      case "view-rfqs":
        setActiveTab("rfqs");
        break;
      case "view-orders":
        setActiveTab("orders");
        break;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#090d16]/95 px-3 sm:px-6 backdrop-blur-md transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar (Desktop & Tablet) */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search orders, RFQs, products, SKU (e.g. ETH-COF, Midroc)..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:bg-white/[0.08] focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Expandable Mobile Search Bar (Overlay) */}
        {isMobileSearchVisible && (
          <div className="sm:hidden absolute top-16 left-0 right-0 p-3 bg-[#0d121f] border-b border-white/10 shadow-xl z-50 animate-in slide-in-from-top-2 duration-150 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders, RFQs, SKU, products..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.06] pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchVisible(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-white px-2 py-1"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* Right: Quick Actions, Theme Toggle, Messages, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsQuickActionsOpen(!isQuickActionsOpen);
              if (isProfileOpen) setIsProfileOpen(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Action</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>

          {isQuickActionsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickActionsOpen(false)}
              />
              <div className="app-dropdown-panel absolute right-0 mt-2 z-50 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-[#0d121f] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Create / Manage
                </div>
                <button
                  onClick={() => handleQuickAction("add-product")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4 text-indigo-400" />
                  <span>Add New Product</span>
                </button>
                <button
                  onClick={() => handleQuickAction("create-quotation")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-blue-400 font-mono">QT</span>
                  <span>Create Quotation</span>
                </button>
                <button
                  onClick={() => handleQuickAction("transfer-stock")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
                >
                  <Building className="h-4 w-4 text-amber-400" />
                  <span>Transfer Warehouse Stock</span>
                </button>
                <button
                  onClick={() => handleQuickAction("adjust-stock")}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-purple-400 font-mono">+/-</span>
                  <span>Adjust Inventory Stock</span>
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={() => handleQuickAction("view-rfqs")}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white cursor-pointer transition-colors"
                >
                  <span>View Pending RFQs</span>
                  <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                    Live
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <div className="shrink-0">
          <ThemeToggle />
        </div>

        {/* Messaging Shortcut */}
        <button
          onClick={() => setActiveTab("messages")}
          title="B2B Messages"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          {mounted && unreadMessages > 0 && (
            <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
              {unreadMessages}
            </span>
          )}
        </button>

        {/* Notifications Trigger */}
        <button
          onClick={() => setActiveTab("notifications")}
          title="Notifications Center & Live Alerts"
          className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-colors cursor-pointer ${
            activeTab === "notifications"
              ? "bg-indigo-600 border-indigo-500 text-white shadow-xs shadow-indigo-600/30"
              : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Bell className="h-4 w-4" />
          {mounted && unreadNotifications > 0 && (
            <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Profile Avatar & Interactive Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              if (isQuickActionsOpen) setIsQuickActionsOpen(false);
            }}
            className={`flex items-center gap-2 rounded-xl p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 border transition-all cursor-pointer ${
              isProfileOpen
                ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30"
                : isLight
                ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                : "border-white/10 bg-white/[0.04] hover:bg-white/10 text-white"
            }`}
            title="Account profile and options"
          >
            {/* User Avatar with status dot */}
            <div className="relative shrink-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {avatarInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#090d16]" />
            </div>

            {/* Name & Branch Label (Desktop & Tablet) */}
            <div className="hidden sm:flex flex-col text-left leading-tight min-w-0 max-w-[130px] lg:max-w-[170px]" suppressHydrationWarning>
              <span className="font-bold text-xs truncate text-white" suppressHydrationWarning>
                {displayName}
              </span>
              <span className="text-[10px] text-zinc-400 truncate" suppressHydrationWarning>
                {isBranchManager ? userBranchName || "Branch Manager" : "Super Supplier HQ"}
              </span>
            </div>

            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                isProfileOpen ? "rotate-180 text-indigo-400" : ""
              }`}
            />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div
                className={`app-dropdown-panel absolute right-0 mt-2 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-[#0d121f] border-white/15 text-white"
                }`}
              >
                {/* Profile Identity Card */}
                <div
                  className={`p-3 rounded-xl border mb-1.5 ${
                    isLight
                      ? "bg-slate-50 border-slate-200"
                      : "bg-white/[0.03] border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                      {avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs truncate text-white">{displayName}</p>
                        <span title="Gold Verified B2B Supplier">
                          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{displayEmail}</p>
                    </div>
                  </div>

                  {/* Scoped Role Badge Strip */}
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Role Authority:</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                        isBranchManager
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                          : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      <Building className="h-3 w-3" />
                      <span>{isBranchManager ? "Branch Manager" : "Super Supplier HQ"}</span>
                    </span>
                  </div>

                  {userBranchName && (
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Branch Depot:</span>
                      <span className="font-medium text-zinc-300 text-[10px] truncate max-w-[160px]">
                        {userBranchName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Actions List */}
                <div className="space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab("profile");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "hover:bg-slate-100 text-slate-700"
                        : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                    }`}
                  >
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>Business Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab("team");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "hover:bg-slate-100 text-slate-700"
                        : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Truck className="h-4 w-4 text-cyan-400" />
                      <span>{isBranchManager ? "My Branch Drivers" : "Team & Fleet Drivers"}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Manage</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab("warehouse");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "hover:bg-slate-100 text-slate-700"
                        : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Building className="h-4 w-4 text-amber-400" />
                    <span>Depots & Warehouses</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setActiveTab("settings");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "hover:bg-slate-100 text-slate-700"
                        : "hover:bg-white/[0.06] text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Settings className="h-4 w-4 text-emerald-400" />
                    <span>Portal Settings</span>
                  </button>
                </div>

                <div className={`my-1.5 border-t ${isLight ? "border-slate-200" : "border-white/10"}`} />

                {/* Sign Out Action */}
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
