"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ArrowRight,
  Printer,
  KeyRound,
  Package,
  Building2,
  Sparkles,
  ExternalLink,
  Receipt,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getAccurateProductImage } from "@/lib/utils/product-image";

export interface SourcingPaymentSuccessData {
  orderNumber: string;
  transactionNumber: string;
  totalAmount: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  paymentMethod?: string;
  handoverOtp?: string;
  destinationWarehouseName?: string;
  deliveryAddress?: string;
  trackingNumber?: string;
  supplierName?: string;
  deliveryEstimateDays?: number;
  createdAt?: string;
}

interface Props {
  isOpen: boolean;
  data: SourcingPaymentSuccessData | null;
  onClose?: () => void;
  onOk: () => void;
}

export function SupplierPaymentSuccessModal({ isOpen, data, onClose, onOk }: Props) {
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string, type: "txn" | "order" | "otp") => {
    navigator.clipboard.writeText(text);
    if (type === "txn") {
      setCopiedTxn(true);
      toast.success("Transaction Reference copied to clipboard!");
      setTimeout(() => setCopiedTxn(false), 2000);
    } else if (type === "order") {
      setCopiedOrder(true);
      toast.success("Purchase Order Number copied to clipboard!");
      setTimeout(() => setCopiedOrder(false), 2000);
    } else {
      setCopiedOtp(true);
      toast.success("Warehouse Handover OTP copied!");
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const handlePrint = () => {
    toast.success("Official Purchase Order & Escrow Certificate downloaded!");
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-emerald-500/40 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden my-auto text-zinc-100 max-h-[94vh] flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-[#0a1818] to-zinc-900 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Payment Successful & Secured!
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Escrow Locked
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                ክፍያው በተሳካ ሁኔታ ተጠናቋል • Funds locked safely in Escrow via Chapa
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          {/* Hero Highlight Box: Transaction Number & Order Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Transaction Number Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-zinc-950 border border-indigo-500/30 space-y-1.5 relative group shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                  Transaction Number
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.transactionNumber, "txn")}
                  className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  title="Copy Transaction Number"
                >
                  {copiedTxn ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono font-black text-sm sm:text-base text-indigo-200 break-all select-all">
                {data.transactionNumber}
              </div>
              <div className="text-[10px] text-zinc-400">
                Chapa Payment Reference (የግብይት መለያ ቁጥር)
              </div>
            </div>

            {/* Order Number Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-zinc-950 border border-emerald-500/30 space-y-1.5 relative group shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  Order Number
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(data.orderNumber, "order")}
                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  title="Copy Order Number"
                >
                  {copiedOrder ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono font-black text-sm sm:text-base text-emerald-300 break-all select-all">
                {data.orderNumber}
              </div>
              <div className="text-[10px] text-zinc-400">
                Official Purchase Order (የትዕዛዝ ቁጥር)
              </div>
            </div>
          </div>

          {/* Purchased Commodity Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 shadow-md">
            <div className="flex items-start gap-3.5">
              <img
                src={getAccurateProductImage(data.productName, data.unit, data.productImage)}
                alt={data.productName}
                className="w-16 h-16 rounded-xl object-cover border border-zinc-700/80 shrink-0 shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(data.productName, data.unit);
                }}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs text-zinc-400 font-medium">Purchased Sourcing Item</div>
                <h4 className="font-extrabold text-sm sm:text-base text-zinc-100 truncate">
                  {data.productName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Quantity: <strong className="text-zinc-200">{data.quantity.toLocaleString()} {data.unit}</strong></span>
                  {data.unitPrice && (
                    <>
                      <span>•</span>
                      <span>Rate: ETB {data.unitPrice.toLocaleString()}/{data.unit}</span>
                    </>
                  )}
                  {data.supplierName && (
                    <>
                      <span>•</span>
                      <span>Supplier: <strong className="text-zinc-200">{data.supplierName}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[11px] text-zinc-400">Total Escrow Paid</div>
                <div className="text-base sm:text-xl font-black text-emerald-400 font-mono">
                  ETB {data.totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Digit Warehouse Handover OTP Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-zinc-900 to-zinc-950 border border-indigo-500/40 text-center space-y-2 shadow-xl relative">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Your 4-Digit Warehouse Handover OTP (የማረጋገጫ ኮድ)
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-emerald-400 py-1 select-all">
                {data.handoverOtp || "8492"}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(data.handoverOtp || "8492", "otp")}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                title="Copy Handover OTP"
              >
                {copiedOtp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
              Keep this OTP private. Only provide it to the freight driver after you inspect the goods at your warehouse.
            </p>
          </div>

          {/* Delivery & Routing Details */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-2">
            {data.destinationWarehouseName && (
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Destination Warehouse:</span>
                <span className="font-semibold text-zinc-200">{data.destinationWarehouseName}</span>
              </div>
            )}
            {data.trackingNumber && (
              <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                <span className="text-zinc-400">Assigned Freight Waybill:</span>
                <span className="font-mono font-bold text-indigo-400">{data.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">Estimated Delivery:</span>
              <span className="text-emerald-400 font-bold">
                Within ~{data.deliveryEstimateDays || 2} business days
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 bg-zinc-950 border-t border-zinc-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print PO Invoice
          </button>

          {/* Primary OK Button to navigate directly to My Orders */}
          <button
            type="button"
            onClick={onOk}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer"
          >
            <span>OK (Go to My Orders)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
