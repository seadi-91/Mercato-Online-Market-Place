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
import { SellerSubscriptions } from "./components/seller-subscriptions";
import { SellerWholesaleSourcing } from "./components/seller-wholesale-sourcing";
import { Boxes, ArrowRight, ShieldCheck } from "lucide-react";

export default function SellerDashboardPage() {
  const { activeTab, setActiveTab } = useSellerUIStore();

  return (
    <div className="w-full transition-all duration-150 space-y-4">
      {/* Merchant Wholesale Cargo Sourcing Quick Banner (Displayed on Overview) */}
      {activeTab === "overview" && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">Need to Restock Your Merchant Inventory?</span>
                <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold">
                  B2B WHOLESALE SOURCING
                </span>
              </div>
              <p className="text-zinc-300 text-xs mt-0.5">
                Buy wholesale cartons, sacks, and container cargo directly from verified suppliers & importers with volume discounts and CBE & Telebirr Escrow protection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("wholesale-sourcing")}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-bold text-white transition-all text-center whitespace-nowrap shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>Buy Wholesale Cargo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {activeTab === "overview" && <SellerStats />}
      {activeTab === "wholesale-sourcing" && <SellerWholesaleSourcing />}
      {activeTab === "products" && <SellerProducts />}
      {activeTab === "add-product" && <SellerAddProduct />}
      {activeTab === "orders" && <SellerOrders />}
      {activeTab === "payouts" && <SellerPayouts />}
      {activeTab === "reviews" && <SellerReviews />}
      {activeTab === "subscriptions" && <SellerSubscriptions />}
      {activeTab === "settings" && <SellerSettings />}
    </div>
  );
}
