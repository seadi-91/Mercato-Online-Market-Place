"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Receipt,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Truck,
  Package,
  Calendar,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  Lock,
  RotateCcw,
  Clock,
  ChevronRight,
  CreditCard,
  X,
  QrCode,
  FileCheck,
  Award,
  Sparkles,
  ExternalLink,
  Gift,
  HeartHandshake,
  Tag,
  Headphones,
  FileText,
  BadgePercent,
  CheckCircle,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { SourcingOrder, SourcingOrderStatus } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

interface Props {
  order: SourcingOrder;
  onBack: () => void;
  onReorder?: (order: SourcingOrder) => void;
}

export function SupplierOrderDetailView({ order, onBack, onReorder }: Props) {
  const { confirmSourcingDelivery, deleteSourcingOrder, profile } = useSupplierStore();

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState(order.handoverOtp || "");

  const promoCode = "MERCATOX-GROW26";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      toast.error("Please enter the 4-digit Handover OTP.");
      return;
    }
    confirmSourcingDelivery(order.id, enteredOtp);
    setIsOtpModalOpen(false);
    toast.success("Delivery verified! Escrow funds released to supplier.");
  };

  const isDelivered = order.status === "delivered_to_hub";
  const isCompleted = order.status === "inspected_completed";

  const getStatusBadge = (status: SourcingOrderStatus) => {
    switch (status) {
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 shadow-2xs">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            In Transit
          </span>
        );
      case "dispatched":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-2xs">
            <Package className="w-3.5 h-3.5" />
            Dispatched
          </span>
        );
      case "delivered_to_hub":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 animate-pulse shadow-2xs">
            <KeyRound className="w-3.5 h-3.5" />
            At Hub (Awaiting Handover OTP)
          </span>
        );
      case "inspected_completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Settled & Completed
          </span>
        );
      case "escrow_locked":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-2xs">
            <Lock className="w-3.5 h-3.5" />
            Escrow Protected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5" />
            Pending Payment
          </span>
        );
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200 pb-16">
      {/* 1. Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Orders</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">{order.orderNumber}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Print Official Receipt Button */}
          <button
            onClick={() => setIsReceiptModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tax Receipt / Invoice (PDF)</span>
          </button>

          {/* Confirm OTP Action (if at hub) */}
          {isDelivered && (
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-bounce"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Release Escrow</span>
            </button>
          )}

          {/* Re-order Button */}
          <button
            onClick={() => {
              if (onReorder) onReorder(order);
              else toast.success(`Reorder initiated for ${order.productName}`);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Buy Again</span>
          </button>

          {/* Delete / Remove Order */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Delete Order (ጊዜያዊ ሰርዝ / Remove order from list)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Hero Card: Order Identity & Fulfillment Stepper */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {order.orderNumber}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {order.poReference && <span>• Ref: {order.poReference}</span>}
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Escrow Protected
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-zinc-50 dark:bg-zinc-950/60 p-2.5 sm:p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800/70">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Purchase Value</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              ETB {order.totalETB.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 4-Stage Interactive Stepper */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>1. Escrow Funded</span>
              </div>
              <div className="text-[10px] opacity-80 pl-5">100% Chapa Vault</div>
            </div>

            <div
              className={`p-2 rounded-xl border space-y-0.5 ${
                order.status !== "pending_payment"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {order.status !== "pending_payment" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>2. Dispatched</span>
              </div>
              <div className="text-[10px] opacity-80 pl-5">Seller Logistics</div>
            </div>

            <div
              className={`p-2 rounded-xl border space-y-0.5 ${
                isDelivered || isCompleted || order.status === "in_transit"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {isDelivered || isCompleted || order.status === "in_transit" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>3. In Transit</span>
              </div>
              <div className="text-[10px] opacity-80 pl-5">Addis Main Line</div>
            </div>

            <div
              className={`p-2 rounded-xl border space-y-0.5 ${
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                  : isDelivered
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 animate-pulse font-bold"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>4. OTP Release</span>
              </div>
              <div className="text-[10px] opacity-80 pl-5">
                {isCompleted ? "Escrow Settled" : isDelivered ? "Ready for OTP" : "Warehouse Gate"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT PURCHASED PRODUCT SHOWCASE CARD (EXTENSIVE SPECIFICATIONS) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Purchased Commodity Details & Specifications</span>
          </h3>
          <span className="text-[11px] font-mono text-zinc-400">SKU: {order.productSku}</span>
        </div>

        {/* Large Prominent Product Layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          {/* Prominent High-Definition Product Image Box */}
          <div className="relative group shrink-0 w-full sm:w-36 md:w-44 aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-indigo-100 dark:border-indigo-950/80 shadow-md">
            <img
              src={getAccurateProductImage(order.productName, order.unit, order.productImage)}
              alt={order.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(order.productName, order.unit);
              }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Grade 1 Export</span>
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-indigo-600/90 backdrop-blur-md text-[10px] font-mono font-bold text-white shadow-xs">
              {order.quantity} {order.unit}
            </div>
          </div>

          {/* Product Information Breakdown */}
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  Bulk Wholesale Lot
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  ECX & QA Certified
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  Lot: LOT-2026-ETH-9941
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {order.productName}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Supplied by <strong className="text-zinc-800 dark:text-zinc-200">{order.supplierName}</strong> • Origin: Central Aggregation Hub
              </p>
            </div>

            {/* Pricing & Volume Matrix */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs">
              <div>
                <div className="text-[10px] text-zinc-400 font-medium">Order Quantity</div>
                <div className="font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                  {order.quantity.toLocaleString()} {order.unit}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400 font-medium">Unit Base Price</div>
                <div className="font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                  ETB {order.unitPrice.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-400 font-medium">Commodity Subtotal</div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  ETB {order.subtotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Technical Commodity Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-zinc-600 dark:text-zinc-300">
              <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400 font-bold uppercase">Packaging</div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">50kg GrainPro PP Bags</div>
              </div>

              <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400 font-bold uppercase">Gross Weight</div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {(order.quantity * 50).toLocaleString()} KG
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400 font-bold uppercase">QA Standard</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">100% Inspected</div>
              </div>

              <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800">
                <div className="text-[9px] text-zinc-400 font-bold uppercase">Lead Window</div>
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                  {order.deliveryEstimateDays || 2} Days Express
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Comprehensive Grid: Detailed Seller & Buyer Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card A: Detailed Seller / Supplier Information */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Seller / Supplier Information</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Gold Verified
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{order.supplierName}</div>
              <div className="text-[11px] text-zinc-500">Commercial License: MoT/FDRE/AA/2024/991208</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">TIN Number:</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{order.supplierTin || "0078129402"}</p>
              </div>

              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">VAT Reg No:</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">88401923-01</p>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5 text-[11px] text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Origin Hub:</span>
                <strong className="text-zinc-800 dark:text-zinc-200">Dukem Agro Industrial Hub</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Fulfillment Score:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">99.8% On-Time</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Direct Contact:</span>
                <strong className="text-zinc-800 dark:text-zinc-200">+251 911 882 194</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Detailed Buyer / Consignee Information */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Buyer / Consignee Information</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Verified Enterprise
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {profile?.businessName || profile?.legalEntity || "My Procurement Enterprise PLC"}
              </div>
              <div className="text-[11px] text-zinc-500">Authorized Procurement Account</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Buyer TIN:</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">0099482103</p>
              </div>

              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Buyer VAT:</span>
                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200">99281048-02</p>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5 text-[11px] text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Procurement Officer:</span>
                <strong className="text-zinc-800 dark:text-zinc-200">Head of Sourcing</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Account Email:</span>
                <strong className="text-zinc-800 dark:text-zinc-200">procurement@mercatox.et</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Protection:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">100% Escrow Held</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Two-Column Grid: Delivery Location Specifics & Payment Escrow Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card A: Detailed Delivery Location & Receiving Logistics */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Delivery Location & Warehouse Details</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                Destination Warehouse
              </div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{order.destinationWarehouseName}</div>
              <div className="text-[11px] text-zinc-500 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                <span>{order.deliveryAddress}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Subcity / Zone:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">Akaki Kality Zone</p>
              </div>

              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Receiving Bay:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">Gate 4 / Bay B</p>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5 text-[11px] text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Shipping Terms:</span>
                <strong className="text-zinc-800 dark:text-zinc-200">DAP (Delivered at Place)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Inspection Window:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">24-Hour QA Acceptance</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Escrow Payment & Tax Calculation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-zinc-100 dark:border-zinc-800">
            <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Escrow & Tax Calculation</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Commodity Subtotal:</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                ETB {order.subtotal.toLocaleString()}
              </span>
            </div>

            {order.bulkDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Bulk Volume Discount:</span>
                <span className="font-mono font-semibold">-ETB {order.bulkDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-500">
              <span>15% Value Added Tax (VAT):</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                ETB {order.vatTax.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-zinc-500">
              <span>Freight / Logistics:</span>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                {order.freightCost > 0 ? `ETB ${order.freightCost.toLocaleString()}` : "ETB 0.00 (Self Pickup)"}
              </span>
            </div>

            <div className="flex justify-between text-zinc-500">
              <span>Escrow Security & QA Fee:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">0.00 (Free)</span>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              <span>Total Paid:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                ETB {order.totalETB.toLocaleString()}
              </span>
            </div>

            <div className="pt-1 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
              <span>Chapa Ref:</span>
              <span className="truncate max-w-[170px]">
                {order.paymentReference || "CHAPA-TXN-2026-9920194"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Logistics, Driver & 4-Digit Handover OTP Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-xs w-full sm:w-auto">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Logistics Waybill: {order.trackingNumber || "WAYBILL-ETH-2026-8819"}</span>
          </div>
          {order.driverName ? (
            <div className="text-[11px] text-zinc-500">
              Assigned Driver: <strong className="text-zinc-800 dark:text-zinc-200">{order.driverName}</strong> (Plate:{" "}
              {order.vehiclePlate}) • Tel: {order.driverPhone}
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500">Self Pickup & Handover at Hub Gate</div>
          )}
        </div>

        {/* Handover OTP Highlight Box */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-xs shadow-2xs">
            <div className="text-right">
              <div className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">Handover OTP</div>
              <div className="font-mono text-base font-black text-amber-900 dark:text-amber-200 tracking-wider">
                {order.handoverOtp || "8492"}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(order.handoverOtp || "8492", "Handover OTP")}
              className="p-1 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
              title="Copy OTP"
            >
              {copiedText === (order.handoverOtp || "8492") ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {isDelivered && (
            <button
              onClick={() => setIsOtpModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Release</span>
            </button>
          )}
        </div>
      </div>

      {/* 7. MERCATOX SYSTEM APPRECIATION & PROMOTIONAL REWARDS CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 dark:from-indigo-950/40 dark:via-zinc-900/80 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs space-y-3.5">
        {/* Appreciation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-indigo-100 dark:border-indigo-900/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Thank You for Trading on MercatoX!</span>
                <span className="text-amber-500">✨</span>
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                You are empowering Ethiopian B2B commerce with digital transparency & secure escrow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2.5 py-1 rounded-full shrink-0">
            <Gift className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>+750 Loyalty Points Earned</span>
          </div>
        </div>

        {/* Promo Code & Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Promo Code Voucher Box */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-indigo-200/70 dark:border-indigo-800/70 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5" />
                Next Order Voucher
              </span>
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                Save 2.5% Off
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/60 border border-dashed border-indigo-300 dark:border-indigo-700">
              <span className="font-mono font-black text-xs text-indigo-900 dark:text-indigo-200 tracking-wider">
                {promoCode}
              </span>
              <button
                onClick={() => copyToClipboard(promoCode, "Promo Voucher")}
                className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                {copiedText === promoCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Valid on your next bulk procurement order above ETB 50,000.
            </p>
          </div>

          {/* Concierge Support Desk */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <Headphones className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Dedicated B2B Trade Concierge</span>
            </div>
            <div className="text-[11px] space-y-0.5">
              <p>Direct Phone: <strong className="text-zinc-800 dark:text-zinc-200">+251 900 00 22 44</strong></p>
              <p>Escrow Inquiries: <strong className="text-zinc-800 dark:text-zinc-200">escrow-desk@mercatox.et</strong></p>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>24/7 Dispute & Inspection Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: OFFICIAL COMMERCIAL TAX INVOICE & CASH RECEIPT (PRINT-READY A4)  */}
      {/* ========================================================================= */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-zinc-900 dark:text-zinc-100 max-h-[92vh] flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full print:m-0 print:p-0 print:rounded-none">
            {/* Top Toolbar (Hidden on print) */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs sm:text-sm font-bold">Official Commercial Tax Receipt & Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper Body */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-4 text-xs bg-white dark:bg-[#0d121d] print:p-6 print:text-black print:bg-white">
              {/* Header: MercatoX & Tax Document Title */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 border-b-2 border-zinc-900 dark:border-zinc-200 pb-4 print:border-black">
                <div className="space-y-0.5">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 print:text-black tracking-tight">
                    MercatoX
                  </div>
                  <p className="font-extrabold text-zinc-900 dark:text-zinc-100 print:text-black text-xs">
                    Federal Democratic Republic of Ethiopia
                  </p>
                  <p className="text-[11px] text-zinc-500 print:text-zinc-700">
                    B2B Wholesale Procurement & Digital Escrow Network
                  </p>
                  <p className="text-[10px] text-zinc-400 print:text-zinc-600">
                    Addis Ababa • VAT Reg No: 88401923 • MoR Compliant
                  </p>
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 print:border print:border-black print:bg-transparent print:text-black">
                    OFFICIAL TAX INVOICE
                  </span>
                  <div className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-100 print:text-black">
                    {order.orderNumber}
                  </div>
                  <div className="text-[11px] text-zinc-500 print:text-zinc-700">
                    Date: <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>

              {/* Issuer (Seller), Consignee (Buyer) & Delivery Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 print:bg-transparent print:border-zinc-300 text-[11px]">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-zinc-400 print:text-zinc-600">
                    SUPPLIER / ISSUER:
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">{order.supplierName}</p>
                  <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                    TIN: <strong>{order.supplierTin || "0078129402"}</strong> • VAT: 88401923-01
                  </p>
                  <p className="text-zinc-500 print:text-zinc-600">License: MoT/AA/2024/99120 • Origin: Dukem Hub</p>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-zinc-400 print:text-zinc-600">
                    BUYER & DELIVERY DESTINATION:
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                    {profile?.businessName || profile?.legalEntity || "My Procurement Enterprise PLC"}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 print:text-zinc-700">
                    TIN: <strong>0099482103</strong> • Destination: {order.destinationWarehouseName}
                  </p>
                  <p className="text-zinc-500 print:text-zinc-600 truncate">{order.deliveryAddress}</p>
                </div>
              </div>

              {/* Itemized Line Items Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden print:border-black">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-bold uppercase text-[10px] print:bg-zinc-200 print:text-black">
                    <tr>
                      <th className="p-2.5">Item Description & Lot</th>
                      <th className="p-2.5 text-center">Quantity</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Amount (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 print:divide-black">
                    <tr>
                      <td className="p-2.5">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 print:text-black">
                          {order.productName}
                        </div>
                        <div className="text-[10px] text-zinc-500 print:text-zinc-600 font-mono">
                          SKU: {order.productSku} | Lot: LOT-2026-ETH-9941
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {order.quantity} {order.unit}
                      </td>
                      <td className="p-2.5 text-right font-mono">ETB {order.unitPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono font-bold">ETB {order.subtotal.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 print:border-black print:bg-transparent text-xs">
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>Commodity Subtotal:</span>
                    <span className="font-mono font-semibold">ETB {order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.bulkDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
                      <span>Volume Discount:</span>
                      <span className="font-mono font-semibold">-ETB {order.bulkDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>15% VAT Tax:</span>
                    <span className="font-mono font-semibold">ETB {order.vatTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 print:text-black">
                    <span>Freight Logistics:</span>
                    <span className="font-mono font-semibold">
                      {order.freightCost > 0 ? `ETB ${order.freightCost.toLocaleString()}` : "ETB 0.00 (Self Pickup)"}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t-2 border-zinc-900 dark:border-zinc-100 print:border-black flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-100 print:text-black">
                    <span>Total (Escrow):</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 print:text-black">
                      ETB {order.totalETB.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Appreciation & Promotion Footer on Receipt */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-zinc-700 dark:text-zinc-300 print:border-black print:bg-transparent print:text-black space-y-1">
                <div className="font-bold flex items-center gap-1 text-indigo-700 dark:text-indigo-400 print:text-black">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Thank you for choosing MercatoX Digital B2B Trade Network!</span>
                </div>
                <div className="text-[10px] text-zinc-500 print:text-zinc-700 flex flex-wrap items-center justify-between gap-1">
                  <span>Use promo code <strong>{promoCode}</strong> on your next order for 2.5% Escrow Rebate.</span>
                  <span>24/7 Concierge: +251 900 00 22 44</span>
                </div>
              </div>

              {/* Official Seal, QR Verification & Signature */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-500 print:text-black">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-1 border border-zinc-200 dark:border-zinc-700 print:border-black">
                    <QrCode className="w-8 h-8 text-zinc-800 dark:text-zinc-200 print:text-black" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1 text-emerald-600 print:text-black">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>MercatoX Digital Escrow Sealed</span>
                    </div>
                    <div className="font-mono">
                      Ref: {order.paymentReference || "CHAPA-TXN-2026-9920194"}
                    </div>
                  </div>
                </div>

                <div className="text-center sm:text-right space-y-0.5">
                  <div className="font-serif italic text-xs font-bold text-zinc-700 dark:text-zinc-300 print:text-black">
                    MercatoX Certified Cashier
                  </div>
                  <div className="text-[9px] text-zinc-400 print:text-zinc-600">Electronic Stamp & Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HANDOVER OTP VERIFICATION & ESCROW RELEASE DIALOG                */}
      {/* ========================================================================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0d121d] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 text-zinc-900 dark:text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold">Confirm Warehouse Handover</h3>
              </div>
              <button
                onClick={() => setIsOtpModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
              <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{order.productName}</div>
              <div className="text-[11px] text-zinc-500">
                Quantity: <strong>{order.quantity} {order.unit}</strong> | Total:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                  ETB {order.totalETB.toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Enter 4-Digit Handover OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 8492"
                  className="w-full text-center text-2xl font-mono font-black tracking-widest py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Release Escrow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Are You Sure?) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Are you sure you want to delete this order?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                ይህን ትዕዛዝ በእርግጥ መሰረዝ ይፈልጋሉ? This will temporarily remove the purchase order from your active list.
              </p>
            </div>

            {/* Target Order Summary Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center gap-3">
              <img
                src={getAccurateProductImage(order.productName, order.unit, order.productImage)}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(order.productName, order.unit);
                }}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {order.orderNumber}
                </div>
                <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {order.productName}
                </h4>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {order.quantity} {order.unit} • ETB {order.totalETB.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Cancel (ተው)
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSourcingOrder(order.id);
                  setIsDeleteModalOpen(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Order (አዎ ሰርዝ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
