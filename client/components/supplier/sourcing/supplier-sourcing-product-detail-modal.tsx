"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Truck,
  Building2,
  CheckCircle2,
  Layers,
  Calculator,
  Handshake,
  ShoppingCart,
} from "lucide-react";
import { SourcingProduct } from "@/types/supplier";

interface Props {
  product: SourcingProduct | null;
  onClose: () => void;
  onOpenNegotiate: (product: SourcingProduct) => void;
  onOpenCheckout: (product: SourcingProduct, selectedQty: number, selectedUnitPrice: number) => void;
  onOpenRFQ?: (product: SourcingProduct) => void;
}

export function SupplierSourcingProductDetailModal({
  product,
  onClose,
  onOpenNegotiate,
  onOpenCheckout,
}: Props) {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [calcQty, setCalcQty] = useState(product.moq || 10);

  // Compute tier price for calcQty
  const calculateUnitPrice = (qty: number): number => {
    if (!product.tierPricing || product.tierPricing.length === 0) {
      return product.baseWholesalePrice;
    }
    const matchingTier = [...product.tierPricing]
      .sort((a, b) => b.minQty - a.minQty)
      .find((t) => qty >= t.minQty);

    return matchingTier ? matchingTier.unitPrice : product.baseWholesalePrice;
  };

  const currentUnitPrice = calculateUnitPrice(calcQty);
  const regularTotal = (product.retailPrice || product.baseWholesalePrice * 1.1) * calcQty;
  const wholesaleTotal = currentUnitPrice * calcQty;
  const totalSavings = Math.max(0, regularTotal - wholesaleTotal);
  const savingsPct = regularTotal > 0 ? ((totalSavings / regularTotal) * 100).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/80 dark:bg-zinc-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              {product.category}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">SKU: {product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Gallery & Supplier Card */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Image */}
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {product.isEscrowGuaranteed && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    MercatoX Escrow Protected
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-xs text-zinc-200 font-mono">
                  Stock: {product.stockQuantity.toLocaleString()} {product.unit}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIdx === idx
                          ? "border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20"
                          : "border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Supplier Profile Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-base">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        <span>{product.supplierName}</span>
                        {product.supplierVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                          {product.supplierRating.toFixed(1)} ({product.supplierRatingCount} ratings)
                        </span>
                        <span>•</span>
                        <span>{product.supplierResponseTime} response</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">{product.supplierMarketZone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Lead Time: ~{product.leadTimeDays} days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing, Specs & Actions */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{product.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    {product.grade}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.origin}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
                    MOQ: {product.moq} {product.unit}
                  </span>
                </div>
              </div>

              {/* Wholesale Tiered Pricing Table */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-4 h-4" />
                    Tiered Bulk Pricing
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal">Currency: ETB</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {product.tierPricing.map((tier, idx) => {
                    const isCurrentTier =
                      calcQty >= tier.minQty && (tier.maxQty === null || calcQty <= tier.maxQty);
                    return (
                      <div
                        key={tier.id || idx}
                        onClick={() => setCalcQty(tier.minQty)}
                        className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                          isCurrentTier
                            ? "bg-indigo-50 dark:bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                            : "bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        <div className="text-[11px] font-medium">
                          {tier.minQty}
                          {tier.maxQty ? ` - ${tier.maxQty}` : "+"} {product.unit}
                        </div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                          ETB {tier.unitPrice.toLocaleString()}
                        </div>
                        {tier.discountPercentage ? (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            Save {tier.discountPercentage}%
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Base MOQ</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Bulk Quantity & Savings Calculator */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-gradient-to-br dark:from-indigo-950/30 dark:to-zinc-900/80 border border-indigo-200 dark:border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    Bulk Order Calculator
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    Saving ~{savingsPct}% vs Retail
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                        Purchase Quantity ({product.unit})
                      </label>
                      <div className="flex items-center rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 px-3 py-1.5 focus-within:border-indigo-500 shadow-inner">
                        <input
                          type="number"
                          min={1}
                          value={calcQty}
                          onChange={(e) => setCalcQty(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                        />
                        <span className="text-xs text-zinc-400 font-medium">{product.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Calculated Unit Price</div>
                      <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        ETB {currentUnitPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Bulk Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Quick Qty:</span>
                    {Array.from(
                      new Set([product.moq || 1, 25, 50, 100, 250, 500, 1000, 5000].filter((v): v is number => typeof v === "number" && v > 0))
                    )
                      .sort((a, b) => a - b)
                      .map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCalcQty(preset)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            calcQty === preset
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {preset === product.moq ? `MOQ (${product.moq})` : preset.toLocaleString()}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Estimated Cost:</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    ETB {wholesaleTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Product Overview
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{product.description}</p>
              </div>

              {/* Technical Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                    Specifications & Standards
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/60">
                        <span className="text-zinc-500 block text-[10px]">{key}</span>
                        <span className="text-zinc-800 dark:text-zinc-200 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.certifications.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[11px] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Wholesale MOQ:</span>
            <span>
              {product.moq} {product.unit} (Min ~ETB {(product.moq * product.baseWholesalePrice).toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Negotiate Price Button */}
            <button
              onClick={() => onOpenNegotiate(product)}
              className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-zinc-700 text-amber-700 dark:text-amber-300 font-semibold text-xs sm:text-sm border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Negotiate Price
            </button>

            {/* Direct Order Button */}
            <button
              onClick={() => onOpenCheckout(product, calcQty, currentUnitPrice)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
