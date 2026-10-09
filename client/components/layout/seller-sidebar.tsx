"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Star,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  BadgeCheck,
  PlusCircle,
} from "lucide-react";
import { useSellerUIStore, SellerTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { toast } from "sonner";

interface NavItem {
  id: SellerTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function SellerSidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { settings } = usePlatformStore();
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    unreadOrdersCount,
    lowStockCount,
    availablePayout,
  } = useSellerUIStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out from merchant console");
    router.push("/login");
  };

  const navGroups: NavGroup[] = [
    {
      title: "Store Performance",
      items: [
        {
          id: "overview",
          label: "Dashboard & Sales",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Catalog & Stock",
      items: [
        {
          id: "products",
          label: "My Products",
          icon: Package,
          badge: lowStockCount,
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        },
        {
          id: "add-product",
          label: "Add New Item",
          icon: PlusCircle,
        },
      ],
    },
    {
      title: "Orders & Fulfillment",
      items: [
        {
          id: "orders",
          label: "Orders & Dispatch",
          icon: ShoppingCart,
          badge: unreadOrdersCount,
          badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        },
        {
          id: "payouts",
          label: "Escrow & Payouts",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Reputation & Profile",
      items: [
        {
          id: "reviews",
          label: "Buyer Reviews",
          icon: Star,
        },
        {
          id: "settings",
          label: "Store Settings",
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarWidth = isSidebarCollapsed ? "w-72 md:w-16" : "w-72 md:w-64";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 app-sidebar flex h-screen shrink-0 flex-col border-r border-white/[0.08] bg-[#090d16] transition-all duration-200 select-none ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
          } ${sidebarWidth}`}
      >
        {/* Top Header / Store Branding */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-3.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#090d16] border border-white/10 shadow-md shadow-indigo-500/20 overflow-hidden">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt={settings.platformName}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                  {settings.platformName?.charAt(0) || "M"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
            </div>

            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold tracking-tight text-white uppercase truncate">
                    {settings.platformName}
                  </span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                    SELLER
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate leading-none mt-1 flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>Verified Merchant</span>
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
            title="Close sidebar"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
          {/* Direct Link to B2B Supplier Portal */}
          {!isSidebarCollapsed || isMobileSidebarOpen ? (
            <a
              href="/dashboard/supplier"
              className="flex items-center justify-between rounded-xl bg-indigo-500/15 border border-indigo-500/30 px-3 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/25 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white text-[10px]">
                  B2B
                </span>
                <span className="truncate">B2B Supplier Portal</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            </a>
          ) : (
            <a
              href="/dashboard/supplier"
              title="MercatoX B2B Supplier Portal"
              className="flex justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 p-2 text-indigo-300 hover:bg-indigo-500/25 transition-all cursor-pointer"
            >
              <span className="font-bold text-xs">B2B</span>
            </a>
          )}

          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
                  {group.title}
                </p>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const showExpanded = !isSidebarCollapsed || isMobileSidebarOpen;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    title={!showExpanded ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${isActive
                        ? "bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-xs"
                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent"
                      } ${!showExpanded ? "md:justify-center md:px-0 md:py-2.5" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                    />

                    {showExpanded && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold border ${isActive
                                ? "bg-indigo-500/30 text-indigo-200 border-indigo-500/40"
                                : item.badgeColor
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Collapsed Badge Dot */}
                    {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-[#090d16]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Escrow Quick Pill & Profile */}
        <div className="border-t border-white/[0.08] p-3 space-y-2.5">
          {!isSidebarCollapsed || isMobileSidebarOpen ? (
            <div
              onClick={() => {
                setActiveTab("payouts");
                setMobileSidebarOpen(false);
              }}
              className="flex items-center justify-between rounded-xl bg-indigo-500/[0.08] border border-indigo-500/25 px-3 py-2.5 text-[11px] hover:bg-indigo-500/[0.14] transition-colors cursor-pointer"
            >
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                  Available Payout
                </span>
                <p className="font-bold font-mono text-cyan-300 text-xs">
                  ETB {availablePayout.toLocaleString()}
                </p>
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400 text-[10px]">
                Ready
              </span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab("payouts")}
              title={`Available: ETB ${availablePayout.toLocaleString()}`}
              className="flex w-full justify-center rounded-xl p-2.5 text-indigo-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
            </button>
          )}

          {/* User Profile Mini */}
          <div
            className={`flex items-center gap-2.5 rounded-xl bg-white/[0.02] p-2 border border-white/[0.06] ${isSidebarCollapsed && !isMobileSidebarOpen ? "justify-center" : "justify-between"
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-500 text-[11px] font-bold text-white shadow">
                {(user?.name?.[0] || "M").toUpperCase()}
              </div>
              {(!isSidebarCollapsed || isMobileSidebarOpen) && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-zinc-200 truncate">
                    {user?.name || "Merchant Store"}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate">
                    {user?.email || user?.phoneNumber || "merchant@mercatox.com"}
                  </p>
                </div>
              )}
            </div>

            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <button
                onClick={handleLogout}
                title="Log out"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
