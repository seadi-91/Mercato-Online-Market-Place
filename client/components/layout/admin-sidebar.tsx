"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Users,
  Package,
  Receipt,
  Bike,
  Scale,
  ShieldAlert,
  Settings,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  X,
} from "lucide-react";
import { useAdminUIStore, AdminTab } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { toast } from "sonner";

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    pendingSlipsCount,
    pendingKycCount,
    pendingDisputesCount,
    pendingProductsCount,
  } = useAdminUIStore();

  const handleLogout = () => {
    logout();
    toast.success("Logged out from admin console");
    router.push("/login");
  };

  const navGroups: NavGroup[] = [
    {
      title: "Core Monitoring",
      items: [
        {
          id: "overview",
          label: "Overview & Analytics",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Commerce & Catalog",
      items: [
        {
          id: "catalog",
          label: "Products",
          icon: Tag,
          badge: pendingProductsCount,
          badgeColor: "bg-cyan-500/25 text-cyan-300 border-cyan-500/40",
        },
        {
          id: "categories",
          label: "Categories",
          icon: FolderTree,
        },
        {
          id: "users",
          label: "Users",
          icon: Users,
          badge: pendingKycCount,
          badgeColor: "bg-indigo-500/25 text-indigo-300 border-indigo-500/40",
        },
        {
          id: "orders",
          label: "Orders & Escrow",
          icon: Package,
        },
        {
          id: "slips",
          label: "Bank Slips Review",
          icon: Receipt,
          badge: pendingSlipsCount,
          badgeColor: "bg-amber-500/25 text-amber-300 border-amber-500/40",
        },
      ],
    },
    {
      title: "Logistics & Care",
      items: [
        {
          id: "delivery",
          label: "Delivery & Riders",
          icon: Bike,
        },
        {
          id: "disputes",
          label: "Disputes & Refunds",
          icon: Scale,
          badge: pendingDisputesCount,
          badgeColor: "bg-rose-500/25 text-rose-300 border-rose-500/40",
        },
      ],
    },
    {
      title: "Governance & System",
      items: [
        {
          id: "audit",
          label: "Security Audit Logs",
          icon: ShieldAlert,
        },
        {
          id: "settings",
          label: "Platform Settings",
          icon: Settings,
        },
      ],
    },
  ];

  const sidebarWidth = isSidebarCollapsed ? "w-16" : "w-64";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 app-sidebar flex h-screen shrink-0 flex-col border-r border-white/[0.08] bg-[#090d16] transition-all duration-200 select-none ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } ${sidebarWidth}`}
      >
        {/* Top Header / Branding */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-3.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#090d16] border border-white/10 shadow-md shadow-indigo-500/20 overflow-hidden">
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
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
            </div>

            {!isSidebarCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold tracking-tight text-white uppercase truncate">
                    {platformSettings.platformName}
                  </span>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate leading-none mt-1">
                  {platformSettings.platformTagline}
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
            className="md:hidden flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isSidebarCollapsed && (
                <p className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase font-mono">
                  {group.title}
                </p>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (pathname !== "/dashboard/admin") {
                        router.push("/dashboard/admin");
                      }
                    }}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent"
                      } ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                    />

                    {!isSidebarCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold border ${isActive
                              ? "bg-white/20 text-white border-white/30"
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
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-[#090d16]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Status & Profile */}
        <div className="border-t border-white/[0.08] p-3 space-y-2.5">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-3 py-2 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-300 font-medium">Cluster: Active</span>
              </div>
              <span className="font-mono text-indigo-400 font-semibold">ETB</span>
            </div>
          ) : (
            <div className="flex justify-center py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="Cluster Active" />
            </div>
          )}

          <div
            className={`flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 p-2 ${isSidebarCollapsed ? "justify-center p-1.5" : ""
              }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-[11px] font-bold text-white shadow">
                A
              </div>
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <p className="text-xs font-semibold text-white leading-tight truncate">
                    {user?.email === "admin@gmail.com" ? "System Admin" : user?.name || "Admin"}
                  </p>
                  <p className="text-[10px] font-mono text-indigo-400 leading-none mt-0.5">
                    SUPER_ADMIN
                  </p>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
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
