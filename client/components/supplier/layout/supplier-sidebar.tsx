"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  DollarSign,
  FileQuestion,
  FileText,
  MessagesSquare,
  ShoppingCart,
  Users,
  Warehouse,
  Truck,
  Receipt,
  CreditCard,
  Tag,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Bell,
  LogOut,
  X,
  PlusCircle,
  ExternalLink,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { SupplierTab } from "@/types/supplier";

interface NavItem {
  id: SupplierTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export function SupplierSidebar() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    activeTab,
    setActiveTab,
    subView,
    setSubView,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileDrawerOpen,
    setMobileDrawerOpen,
    setNotificationsOpen,
    openModal,
    profile,
    rfqs,
    orders,
    notifications,
    disputes,
    staffList,
    currentStaffUser,
    sourcingNegotiations,
    sourcingOrders,
  } = useSupplierStore();

  const { user } = useAuthStore();

  const unreadRFQs = rfqs.filter((r) => r.status === "new").length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
  const activeDisputes = disputes.filter((d) => d.status === "under_review" || d.status === "open").length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const counterOfferBargains = (sourcingNegotiations || []).filter((n) => n.status === "counter_offered").length;
  const activePurchases = (sourcingOrders || []).filter(
    (o) =>
      o.status === "in_transit" ||
      o.status === "delivered_to_hub" ||
      o.status === "escrow_locked"
  ).length;

  const navGroups: NavGroup[] = [
    {
      groupTitle: "Core Operations",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Package },
        { id: "inventory", label: "Inventory", icon: Boxes },
        { id: "pricing", label: "Wholesale Pricing", icon: DollarSign },
      ],
    },
    {
      groupTitle: "B2B Trade & Sourcing",
      items: [
        {
          id: "sourcing",
          label: "Sourcing Marketplace",
          icon: ShoppingBag,
          badge: counterOfferBargains || undefined,
          badgeColor: "bg-indigo-500/20 text-indigo-300",
        },
        {
          id: "my-orders",
          label: "My Orders (Purchases)",
          icon: PackageCheck,
          badge: activePurchases || undefined,
          badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
        },
        {
          id: "rfqs",
          label: "RFQs",
          icon: FileQuestion,
          badge: unreadRFQs,
          badgeColor: "bg-emerald-100 text-emerald-800",
        },
        { id: "quotations", label: "Quotations", icon: FileText },
        { id: "negotiations", label: "Negotiations", icon: MessagesSquare },
        {
          id: "orders",
          label: "Orders",
          icon: ShoppingCart,
          badge: pendingOrders,
          badgeColor: "bg-amber-100 text-amber-800",
        },
        { id: "customers", label: "Customers (CRM)", icon: Users },
      ],
    },
    {
      groupTitle: "Logistics & Fulfillment",
      items: [
        { id: "warehouse", label: "Warehouse", icon: Warehouse },
        { id: "shipments", label: "Shipments", icon: Truck },
      ],
    },
    {
      groupTitle: "Finance & Sales",
      items: [
        { id: "invoices", label: "Invoices", icon: Receipt },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "promotions", label: "Promotions", icon: Tag },
      ],
    },
    {
      groupTitle: "Support & Mediation",
      items: [
        {
          id: "disputes",
          label: "Disputes",
          icon: AlertTriangle,
          badge: activeDisputes,
          badgeColor: "bg-rose-100 text-rose-800",
        },
        { id: "messages", label: "Messages", icon: MessageCircle },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          badge: unreadNotifications,
          badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
        },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      groupTitle: "Business Management",
      items: [
        { id: "team", label: "Staff & Fleet (Drivers)", icon: Users, badge: staffList.length },
        { id: "profile", label: "Business Profile", icon: Building2 },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const handleSelectTab = (tabId: SupplierTab) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  const isCollapsed = isSidebarCollapsed;
  const showFull = !isCollapsed || isMobileDrawerOpen;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#090d16] transition-all duration-300 md:static ${
          isMobileDrawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } w-72 max-w-[85vw] ${isCollapsed ? "md:w-18" : "md:w-64"}`}
      >
        {/* Brand & Organization Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-sm shadow-xs shadow-indigo-500/25">
              MX
            </div>
            {showFull && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">MercatoX</span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                    B2B
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium truncate">Supplier Portal</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile Drawer Close */}
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Supplier Business Quick Card (expanded mode or mobile drawer) */}
        {showFull && (
          <div className="mx-3 mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-8 w-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 border ${
                  user?.staffRole === "branch_manager"
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                }`}
              >
                {user?.staffRole === "branch_manager" ? user.name.slice(0, 2).toUpperCase() : "AP"}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-bold text-white truncate" suppressHydrationWarning>
                  {user?.staffRole === "branch_manager"
                    ? user.name
                    : mounted
                    ? profile.businessName
                    : "Abyssinia Agri-Commodities & Industrial Supply PLC"}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono" suppressHydrationWarning>
                  {user?.staffRole === "branch_manager" ? (
                    <span className="text-blue-400 font-bold truncate">
                      Manager • {user.branchName?.split(" ")[0] || "Branch Hub"}
                    </span>
                  ) : (
                    <>
                      <span suppressHydrationWarning>TIN: {mounted ? profile.tinNumber : "0019283419"}</span>
                      <span className="text-indigo-400 font-bold">• Gold</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 space-y-4">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {showFull && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  {group.groupTitle}
                </p>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={!showFull ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    } ${!showFull ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                      }`}
                    />

                    {showFull && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {mounted && item.badge !== undefined && item.badge > 0 && (
                          <span
                            suppressHydrationWarning
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                              isActive ? "bg-white/20 text-white" : item.badgeColor
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {/* Dot indicator when collapsed on desktop */}
                    {mounted && !showFull && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Utility Area */}
        <div className="border-t border-white/10 p-2.5 space-y-1 bg-[#090d16]">
          {/* Help & Support Button */}
          <button
            onClick={() => openModal("help-support")}
            title={isCollapsed ? "Help & B2B Support" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <HelpCircle className="h-4 w-4 text-zinc-400 shrink-0" />
            {!isCollapsed && <span>Help & Support</span>}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => handleSelectTab("notifications")}
            title={isCollapsed ? "Notifications" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "notifications"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <div className="relative">
              <Bell className="h-4 w-4 text-zinc-400 shrink-0" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </div>
            {!isCollapsed && (
              <span className="flex-1 text-left flex items-center justify-between">
                <span>Notifications</span>
                {mounted && unreadNotifications > 0 && (
                  <span suppressHydrationWarning className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </span>
            )}
          </button>

          {/* Supplier Account Menu */}
          <div
            className={`mt-1 flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                AK
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">Ato Kassahun T.</p>
                  <p className="text-[10px] text-zinc-400 truncate">Commercial Lead</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setActiveTab("settings")}
                title="Account Settings"
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
