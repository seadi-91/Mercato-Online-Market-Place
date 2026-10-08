"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Percent,
  Building,
  Users,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  Package,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

export function SupplierPricingView() {
  const { products, isLoadingProducts, fetchProducts, customers, setActiveTab } = useSupplierStore();

  const [activeTabSub, setActiveTabSub] = useState<"tiers" | "buyer_specific" | "regional">("tiers");
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    if (products.length > 0 && (!selectedProductId || !products.some((p) => p.id === selectedProductId))) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Buyer Specific Rates State
  const [buyerRates, setBuyerRates] = useState([
    {
      id: "br-1",
      buyerName: "Midroc Construction Ethiopia PLC",
      productName: "Deformed High-Tensile Steel Rebar 16mm (Fe 500)",
      customRate: 111500,
      baseRate: 115000,
      unit: "Tons",
      moq: 20,
      contractType: "Annual Preferred Framework (L/C Guaranteed)",
      validUntil: "2026-12-31",
    },
    {
      id: "br-2",
      buyerName: "Ethiopian Airlines Inflight Catering",
      productName: "Magna White Teff Super Premium Grain",
      customRate: 95,
      baseRate: 110,
      unit: "KG",
      moq: 5000,
      contractType: "Quarterly Standing Purchase Agreement",
      validUntil: "2026-11-30",
    },
    {
      id: "br-3",
      buyerName: "Addis Continental Hotels Group",
      productName: "Yirgacheffe Grade 1 Speciality Washed Coffee",
      customRate: 440,
      baseRate: 480,
      unit: "KG",
      moq: 2000,
      contractType: "Biannual Hospitality Supply Contract",
      validUntil: "2026-12-15",
    },
  ]);

  // Regional Wholesale Differential
  const [regionalPricing, setRegionalPricing] = useState([
    {
      region: "Addis Ababa Logistics Hub (Kality)",
      deliveryAdjustment: "Baseline (0% Adjustment)",
      leadTime: "1-2 Business Days",
      status: "Primary Hub",
    },
    {
      region: "Hawassa Agro-Processing Corridor",
      deliveryAdjustment: "+2.5% Regional Freight Differential",
      leadTime: "2-3 Business Days",
      status: "Active Route",
    },
    {
      region: "Dire Dawa Free Trade Logistics Depot",
      deliveryAdjustment: "-1.5% Direct-From-Rail Discount",
      leadTime: "1-2 Business Days",
      status: "Active Route",
    },
    {
      region: "Bahir Dar & Gondar Northern Depot",
      deliveryAdjustment: "+4.0% Long-Haul Logistics",
      leadTime: "3-4 Business Days",
      status: "Active Route",
    },
    {
      region: "Mekelle & Tigray Regional Center",
      deliveryAdjustment: "+5.5% Dedicated Freight Escort",
      leadTime: "4-5 Business Days",
      status: "Active Route",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale Pricing Matrix & Contracts"
        subtitle="Configure progressive volume tier discounts, minimum & maximum order quantities, corporate client contracts, and regional freight indexation"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Wholesale Pricing" }]}
        actions={
          <button
            onClick={() => toast.success("All wholesale price schedules published to MercatoX catalog!")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Pricing Changes</span>
          </button>
        }
      />

      {/* Pricing Navigation Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTabSub("tiers")}
          className={`rounded-lg px-3.5 py-1.5 font-bold cursor-pointer transition-colors ${
            activeTabSub === "tiers"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Volume Tier Matrix
        </button>
        <button
          onClick={() => setActiveTabSub("buyer_specific")}
          className={`rounded-lg px-3.5 py-1.5 font-bold cursor-pointer transition-colors ${
            activeTabSub === "buyer_specific"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Buyer-Specific Contracts ({buyerRates.length})
        </button>
        <button
          onClick={() => setActiveTabSub("regional")}
          className={`rounded-lg px-3.5 py-1.5 font-bold cursor-pointer transition-colors ${
            activeTabSub === "regional"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Regional Freight Differentials
        </button>
      </div>

      {activeTabSub === "tiers" && (
        <div className="space-y-6">
          {isLoadingProducts && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading catalog commodities...</p>
            </div>
          ) : !selectedProduct || products.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Package}
                title="No Catalog Commodities Found"
                description="Add commodities to your product catalog first to configure wholesale volume quantity tiers and contract rates."
                actionLabel="Go to Product Catalog"
                onAction={() => setActiveTab("products")}
              />
            </div>
          ) : (
            <>
              {/* Product Selector Bar */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex-1 max-w-md">
                  <label className="block font-semibold text-slate-700 mb-1">Select Catalog Commodity</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold focus:border-indigo-600"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
                  <div>
                    <span className="text-slate-500">Base Wholesale:</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      ETB {(selectedProduct.basePrice || 0).toLocaleString()} / {selectedProduct.unit || "Unit"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">MOQ:</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      {(selectedProduct.moq || 1).toLocaleString()} {selectedProduct.unit || "Unit"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier Table Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Volume Quantity Tiers for {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Progressive volume pricing tiers applied automatically at checkout
                    </p>
                  </div>

                  <span className="rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {selectedProduct.tierPricing?.length || 0} Configured Ranges
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Tier Range ({selectedProduct.unit || "Unit"})</th>
                        <th className="py-3 px-4">Unit Wholesale Rate</th>
                        <th className="py-3 px-4">Discount from Base</th>
                        <th className="py-3 px-4">Sample Lot Value</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!selectedProduct.tierPricing || selectedProduct.tierPricing.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No tiered pricing ranges configured yet for this commodity. Standard base wholesale rate applies.
                          </td>
                        </tr>
                      ) : (
                        selectedProduct.tierPricing.map((tier) => {
                          const sampleQty = tier.maxQty || tier.minQty * 2;
                          const sampleTotal = sampleQty * tier.unitPrice;
                          return (
                            <tr key={tier.id} className="hover:bg-slate-50/75 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {tier.minQty.toLocaleString()} – {tier.maxQty ? `${tier.maxQty.toLocaleString()} ${selectedProduct.unit}` : `${selectedProduct.unit} or more`}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                ETB {tier.unitPrice.toLocaleString()} / {selectedProduct.unit}
                              </td>
                              <td className="py-3 px-4 font-semibold text-emerald-700">
                                {tier.discountPercentage ? `${tier.discountPercentage.toFixed(1)}% Volume Rebate` : "Base Baseline Rate"}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-600">
                                {sampleQty.toLocaleString()} {selectedProduct.unit} = ETB {sampleTotal.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                  Active
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOQ and Max Order Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Minimum Order Quantity (MOQ)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={selectedProduct.moq || 1}
                        className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold font-mono focus:border-indigo-600"
                      />
                      <span className="font-semibold text-slate-600">{selectedProduct.unit || "Unit"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Maximum Single Order Ceiling</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={50000}
                        className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-bold font-mono focus:border-indigo-600"
                      />
                      <span className="font-semibold text-slate-600">{selectedProduct.unit || "Unit"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Contract Price Lock Period</label>
                    <select className="w-full rounded-lg border border-slate-200 p-2 text-slate-900 font-medium focus:border-indigo-600">
                      <option value="30">30 Calendar Days</option>
                      <option value="60">60 Calendar Days</option>
                      <option value="90">90 Calendar Days (Quarterly)</option>
                      <option value="180">180 Calendar Days (Semiannual)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTabSub === "buyer_specific" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Custom Corporate Buyer Contract Pricing</h3>
                <p className="text-xs text-slate-500">Agreed bespoke rates applied automatically when authenticated VIP buyers checkout</p>
              </div>

              <button
                onClick={() => toast.success("New client contract dialog opened")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Buyer Contract</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Corporate Buyer</th>
                    <th className="py-3 px-3">Contract Commodity</th>
                    <th className="py-3 px-3">Contract Rate</th>
                    <th className="py-3 px-3">Catalog Base Rate</th>
                    <th className="py-3 px-3">MOQ Commitment</th>
                    <th className="py-3 px-3">Contract Type</th>
                    <th className="py-3 px-4 text-right">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buyerRates.map((br) => (
                    <tr key={br.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {br.buyerName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {br.productName}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ETB {br.customRate.toLocaleString()} / {br.unit}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400 line-through">
                        ETB {br.baseRate.toLocaleString()} / {br.unit}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-800">
                        {br.moq.toLocaleString()} {br.unit}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                          {br.contractType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {br.validUntil}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTabSub === "regional" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Regional Delivery Pricing Indices</h3>
              <p className="text-xs text-slate-500">Automated logistics surcharge or depot discount applied based on buyer destination warehouse</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalPricing.map((rp, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{rp.region}</span>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {rp.status}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pricing Adjustment:</span>
                      <span className="font-bold text-slate-900">{rp.deliveryAdjustment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transit Guarantee:</span>
                      <span className="font-mono text-slate-700">{rp.leadTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
