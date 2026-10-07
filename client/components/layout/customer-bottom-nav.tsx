"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Package,
  User,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/store";

export function CustomerBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Explore",
      href: "/marketplace",
      icon: LayoutGrid,
      isActive: pathname === "/marketplace",
    },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      isActive: pathname === "/cart",
      badge: mounted && cartCount > 0 ? cartCount : undefined,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: Package,
      isActive: pathname === "/orders",
    },
    {
      label: isAuthenticated ? (user?.role === "ADMIN" ? "Admin" : "Profile") : "Login",
      href: isAuthenticated
        ? user?.role === "ADMIN"
          ? "/dashboard/admin"
          : "/profile"
        : "/login",
      icon: User,
      isActive:
        pathname === "/profile" ||
        pathname === "/login" ||
        pathname.startsWith("/dashboard"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#090d18]/92 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-2 py-1.5 transition-all"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                active
                  ? "text-cyan-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    active ? "scale-110 stroke-[2.5]" : "scale-100"
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-1 text-[9px] font-black text-white shadow-md shadow-rose-500/40">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
