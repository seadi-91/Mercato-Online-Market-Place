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
  Store,
  Wallet,
  Package,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { useSellerUIStore, SellerTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { toast } from "sonner";

export function SellerTopbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { settings } = usePlatformStore();
  const {
    activeTab,
    setActiveTab,
    toggleMobileSidebar,
    unreadOrdersCount,
    lowStockCount,
    availablePayout,
  } = useSellerUIStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalAlerts = unreadOrdersCount + lowStockCount;

  const tabLabels: Record<SellerTab, string> = {
    overview: "Store Dashboard & Sales",
    products: "Catalog & Inventory",
    "add-product": "Add New Catalog Product",
    orders: "Orders & Courier Dispatch",
    payouts: "Escrow & Payout Center",
    reviews: "Buyer Reviews & Ratings",
    settings: "Store Profile & Settings",
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Merchant metrics & orders synchronized");
    }, 450);
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out from merchant console");
    router.push("/login");
  };

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 app-topbar flex flex-col w-full border-b border-white/[0.08] bg-[#090d16]/95 backdrop-blur-xl">
      <div className="flex h-13 w-full items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobileSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 md:hidden cursor-pointer"
            title="Open merchant navigation drawer"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
            <span className="font-semibold text-zinc-400 hidden xs:inline">{settings.platformName}</span>
            <span className="text-zinc-600 hidden xs:inline">/</span>
            <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-none">
              {tabLabels[activeTab] || "Storefront"}
            </span>
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products, orders, customers... (Ctrl+K)"
              className="h-8 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-12 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500/80 focus:bg-white/[0.06]"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 border border-white/10">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Right: Balance, Alerts, User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Live Escrow Available Badge (Responsive on all screens) */}
          <div
            onClick={() => setActiveTab("payouts")}
            title="Available Cleared Escrow"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/[0.08] px-2 sm:px-2.5 py-1 text-[10px] sm:text-[10.5px] hover:bg-indigo-500/[0.14] transition-colors cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono text-zinc-400 hidden sm:inline">Available:</span>
            <span className="font-mono font-bold text-cyan-300">
              <span className="sm:hidden">ETB {availablePayout >= 10000 ? `${(availablePayout / 1000).toFixed(0)}k` : availablePayout.toLocaleString()}</span>
              <span className="hidden sm:inline">ETB {availablePayout.toLocaleString()}</span>
            </span>
          </div>

          {/* Appearance / Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            title="Refresh Data"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`}
            />
          </button>

          {/* Notifications Bell */}
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
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white shadow-sm shadow-indigo-500/40">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="app-dropdown-panel absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border border-white/10 bg-[#0d121f] p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-semibold text-white">Merchant Alerts</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-300">
                    {totalAlerts} Actionable
                  </span>
                </div>
                <div className="divide-y divide-white/5 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("orders");
                      setShowNotifications(false);
                    }}
                    className="flex w-full items-start gap-2 p-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {unreadOrdersCount} Orders Awaiting Pickup
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Pack items and hand over to assigned courier.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("products");
                      setShowNotifications(false);
                    }}
                    className="flex w-full items-start gap-2 p-2 rounded-lg text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <Package className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {lowStockCount} Low Stock Alerts
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        Inventory depleted below threshold in warehouse.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] py-1 px-1.5 sm:px-2 text-zinc-200 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 text-[10px] font-bold text-white shadow shrink-0">
                {(user?.name?.[0] || "M").toUpperCase()}
              </div>
              <span className="text-[11px] font-medium hidden sm:inline text-zinc-200 truncate max-w-[100px]">
                {user?.name || "Merchant"}
              </span>
              <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
            </button>

            {showUserMenu && (
              <div className="app-dropdown-panel absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-xl border border-white/10 bg-[#0d121f] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || "Merchant Store"}</p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    {user?.email || user?.phoneNumber || "merchant@mercatox.com"}
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
                  <Store className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Store Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("payouts");
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Payout Accounts</span>
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
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-2.5 pt-0.5 border-t border-white/5 animate-in slide-in-from-top-2 duration-150">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search products, orders, customers..."
              className="h-8.5 w-full rounded-lg border border-indigo-500/40 bg-white/[0.06] pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}
