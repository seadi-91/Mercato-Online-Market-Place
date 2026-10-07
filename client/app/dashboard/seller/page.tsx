"use client";

import React from "react";
import { useSellerUIStore } from "@/store/ui-store";
import { SellerStats } from "./components/seller-stats";
import { SellerProducts } from "./components/seller-products";
import { SellerAddProduct } from "./components/seller-add-product";
import { SellerOrders } from "./components/seller-orders";
import { SellerPayouts } from "./components/seller-payouts";
import { SellerReviews } from "./components/seller-reviews";
import { SellerSettings } from "./components/seller-settings";

export default function SellerDashboardPage() {
  const { activeTab } = useSellerUIStore();

  return (
    <div className="w-full transition-all duration-150">
      {/* Enterprise B2B Supplier Portal Quick Switch Banner */}
      <div className="mb-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-indigo-900/30 to-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
            MX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">MercatoX Enterprise B2B Supplier Portal</span>
              <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
                ENTERPRISE WORKSPACE
              </span>
            </div>
            <p className="text-zinc-300 text-xs mt-0.5">
              Manage wholesale tier pricing, RFQs, commercial quotations, negotiations, multi-depot warehouse stock, and Escrow treasury.
            </p>
          </div>
        </div>
        <a
          href="/dashboard/supplier"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-bold text-white transition-colors text-center whitespace-nowrap shadow-xs cursor-pointer"
        >
          Open B2B Supplier Dashboard →
        </a>
      </div>

      {activeTab === "overview" && <SellerStats />}
      {activeTab === "products" && <SellerProducts />}
      {activeTab === "add-product" && <SellerAddProduct />}
      {activeTab === "orders" && <SellerOrders />}
      {activeTab === "payouts" && <SellerPayouts />}
      {activeTab === "reviews" && <SellerReviews />}
      {activeTab === "settings" && <SellerSettings />}
    </div>
  );
}
