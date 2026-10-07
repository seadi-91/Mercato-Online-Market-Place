"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  Menu,
} from "lucide-react";
import { useSellerUIStore, SellerTab } from "@/store/ui-store";

export function SellerBottomNav() {
  const {
    activeTab,
    setActiveTab,
    unreadOrdersCount,
    lowStockCount,
    isMobileSidebarOpen,
    toggleMobileSidebar,
  } = useSellerUIStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectTab = (tab: SellerTab) => {
    setActiveTab(tab);
  };

  if (!mounted) return null;

  const isMenuTabActive =
    isMobileSidebarOpen ||
    activeTab === "payouts" ||
    activeTab === "reviews" ||
    activeTab === "settings";

  return (
    <nav
      aria-label="Merchant Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#080c16]/95 backdrop-blur-2xl shadow-[0_-10px_35px_rgba(0,0,0,0.7)] px-2 py-1 transition-all"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around relative">
        {/* 1. Dashboard / Overview Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("overview")}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "overview"
              ? "text-indigo-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <LayoutDashboard
            className={`h-5 w-5 transition-transform duration-150 ${
              activeTab === "overview" ? "scale-110 stroke-[2.5]" : "scale-100"
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Overview</span>
          {activeTab === "overview" && (
            <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
          )}
        </button>

        {/* 2. Products Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("products")}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "products"
              ? "text-indigo-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div className="relative">
            <Package
              className={`h-5 w-5 transition-transform duration-150 ${
                activeTab === "products" ? "scale-110 stroke-[2.5]" : "scale-100"
              }`}
            />
            {lowStockCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {lowStockCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Products</span>
          {activeTab === "products" && (
            <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
          )}
        </button>

        {/* 3. Center Elevated Add Action */}
        <div className="relative -top-3">
          <button
            type="button"
            onClick={() => handleSelectTab("add-product")}
            title="Add New Commercial Listing"
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-[#080c16] ${
              activeTab === "add-product"
                ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#080c16]"
                : ""
            }`}
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
          <span className="block text-center text-[9px] font-bold text-zinc-300 mt-0.5 tracking-tight">
            Post Item
          </span>
        </div>

        {/* 4. Orders Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("orders")}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            activeTab === "orders"
              ? "text-indigo-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <div className="relative">
            <ShoppingCart
              className={`h-5 w-5 transition-transform duration-150 ${
                activeTab === "orders" ? "scale-110 stroke-[2.5]" : "scale-100"
              }`}
            />
            {unreadOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {unreadOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Orders</span>
          {activeTab === "orders" && (
            <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
          )}
        </button>

        {/* 5. 3-Line Hamburger Menu -> Opens Left Sidebar */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          title="Open merchant navigation drawer"
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 cursor-pointer ${
            isMenuTabActive
              ? "text-indigo-400 font-bold"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Menu
            className={`h-5 w-5 transition-transform duration-150 ${
              isMenuTabActive ? "scale-110 stroke-[2.5]" : "scale-100"
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
          {isMenuTabActive && (
            <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
          )}
        </button>
      </div>
    </nav>
  );
}
