"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileQuestion,
  Menu,
  PlusCircle,
} from "lucide-react";
import { useSupplierStore } from "@/store/supplier-store";
import { useTranslation } from "@/store/language-store";
import {
  SUPPLIER_TRANSLATIONS,
  type SupplierTranslationDictionary,
} from "@/lib/i18n/supplier-translations";
import { SupplierTab } from "@/types/supplier";

export function SupplierMobileBottomNav() {
  const { language } = useTranslation();
  const tr = (key: keyof SupplierTranslationDictionary): string => {
    const dict = SUPPLIER_TRANSLATIONS[language] || SUPPLIER_TRANSLATIONS.en;
    return dict[key] || SUPPLIER_TRANSLATIONS.en[key] || key;
  };

  const {
    activeTab,
    setActiveTab,
    subView,
    setSubView,
    setMobileDrawerOpen,
    orders,
    rfqs,
  } = useSupplierStore();

  const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length;
  const unreadRFQs = rfqs.filter((r) => r.status === "new").length;

  const navItems: {
    id: SupplierTab | "menu" | "add";
    label: string;
    icon: React.ElementType;
    badge?: number;
    onClick: () => void;
  }[] = [
    {
      id: "dashboard",
      label: tr("navDashboard"),
      icon: LayoutDashboard,
      onClick: () => {
        setActiveTab("dashboard");
        setSubView("default");
      },
    },
    {
      id: "products",
      label: tr("navProducts"),
      icon: Package,
      onClick: () => {
        setActiveTab("products");
        setSubView("default");
      },
    },
    {
      id: "add",
      label: tr("bottomNavAddItem"),
      icon: PlusCircle,
      onClick: () => {
        setActiveTab("products");
        setSubView("create-product");
      },
    },
    {
      id: "orders",
      label: tr("navOrders"),
      icon: ShoppingCart,
      badge: pendingOrders,
      onClick: () => {
        setActiveTab("orders");
        setSubView("default");
      },
    },
    {
      id: "rfqs",
      label: tr("navRFQs"),
      icon: FileQuestion,
      badge: unreadRFQs,
      onClick: () => {
        setActiveTab("rfqs");
        setSubView("default");
      },
    },
    {
      id: "menu",
      label: tr("bottomNavMenu"),
      icon: Menu,
      onClick: () => {
        setMobileDrawerOpen(true);
      },
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#090d16]/95 backdrop-blur-lg px-2 py-1.5 shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-6 items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAdd = item.id === "add";
          const isActive =
            !isAdd &&
            item.id !== "menu" &&
            activeTab === item.id &&
            subView !== "create-product";
          const isAddActive = isAdd && subView === "create-product";

          if (isAdd) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-hidden"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
                    isAddActive
                      ? "bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-indigo-500/40 ring-2 ring-indigo-400"
                      : "bg-indigo-600 text-white shadow-indigo-600/30 group-hover:bg-indigo-500"
                  }`}
                >
                  <PlusCircle className="h-6 w-6" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-0.5 tracking-tight ${
                    isAddActive ? "text-indigo-400" : "text-zinc-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer focus:outline-hidden ${
                isActive ? "text-indigo-400" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 text-indigo-400" : ""
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium mt-1 truncate max-w-full ${
                  isActive ? "text-indigo-400 font-bold" : "text-zinc-400"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
