"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Printer,
  Sparkles,
  KeyRound,
  Zap,
  Phone,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { SourcingOrder } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplier-store";
import { toast } from "sonner";

interface Props {
  order: SourcingOrder | null;
  onClose: () => void;
  onPaymentSuccess?: (order: SourcingOrder) => void;
}

type ChapaChannel = "telebirr" | "cbe_birr" | "awash_birr" | "card";

export function SupplierSourcingPaymentModal({ order, onClose, onPaymentSuccess }: Props) {
  const { paySourcingOrder, profile, setActiveTab } = useSupplierStore();
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  const [chapaChannel, setChapaChannel] = useState<ChapaChannel>("telebirr");
  const [buyerEmail, setBuyerEmail] = useState(profile.email || "procurement@mercatox.et");
  const [buyerPhone, setBuyerPhone] = useState(profile.phone || "+251 91 144 2200");
  const [chapaTxnRef, setChapaTxnRef] = useState(
    `CHAPA-TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!order) return null;

  const handleAuthorizePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyerPhone.trim()) {
      toast.error("Please enter a valid Ethiopian mobile phone number.");
      return;
    }

    setIsProcessing(true);

    // Simulate Chapa gateway authorization & escrow lock
    setTimeout(() => {
      paySourcingOrder(
        order.id,
        "chapa",
        chapaTxnRef
      );

      setIsProcessing(false);
      setIsSuccess(true);
      toast.success("Payment authorized via Chapa! Escrow vault locked.");

      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...order,
          status: "escrow_locked",
          escrowStatus: "funds_locked",
          paymentMethod: "chapa",
          paymentReference: chapaTxnRef,
          chapaTransactionId: chapaTxnRef,
        });
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090d16] border border-emerald-500/40 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden my-auto text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Chapa Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-[#0a1818] to-zinc-900 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg">
              chapa
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-100">
                  {isSuccess ? "Payment Confirmed & Secured" : "Chapa Payment Gateway"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Escrow Vault
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Order #{order.orderNumber} • Merchant: <strong className="text-zinc-200">MercatoX B2B</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleAuthorizePayment} className="space-y-5">
              {/* Order Amount Hero Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-semibold">
                    Amount to Authorize
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    ETB {order.totalETB.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <div>Commodity: <strong className="text-zinc-200">{order.productName}</strong></div>
                  <div className="font-mono text-zinc-500">{order.quantity} {order.unit}</div>
                </div>
              </div>

              {/* Chapa Channel Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setChapaChannel("telebirr")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      chapaChannel === "telebirr"
                        ? "bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-500/30 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Zap className="w-5 h-5 text-sky-400" />
                    <span className="text-xs">Telebirr</span>
                    <span className="text-[10px] text-zinc-500">SuperApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChapaChannel("cbe_birr")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      chapaChannel === "cbe_birr"
                        ? "bg-purple-500/20 border-purple-400 text-purple-300 ring-2 ring-purple-500/30 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <span className="text-xs">CBE Birr</span>
                    <span className="text-[10px] text-zinc-500">Direct API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChapaChannel("awash_birr")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      chapaChannel === "awash_birr"
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Awash Birr</span>
                    <span className="text-[10px] text-zinc-500">Mobile API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChapaChannel("card")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      chapaChannel === "card"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 font-bold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">Debit/Card</span>
                    <span className="text-[10px] text-zinc-500">Visa / EthSwitch</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" /> Buyer Email Address
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    required
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" /> Mobile Number (+251)
                  </label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Channel specifics info */}
              {chapaChannel === "telebirr" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-sky-500/30 space-y-1 text-xs">
                  <span className="text-sky-400 font-bold block">Telebirr Push Payment</span>
                  <p className="text-[11px] text-zinc-400">
                    A secure push authorization prompt will be transmitted to <strong>{buyerPhone}</strong>.
                  </p>
                </div>
              )}

              {chapaChannel === "cbe_birr" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-purple-500/30 space-y-1 text-xs">
                  <span className="text-purple-400 font-bold block">Commercial Bank of Ethiopia Direct API</span>
                  <p className="text-[11px] text-zinc-400">
                    Instant bank debit backed by National Bank of Ethiopia certified gateway.
                  </p>
                </div>
              )}

              {chapaChannel === "awash_birr" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-1 text-xs">
                  <span className="text-amber-400 font-bold block">Awash Birr / Amole Mobile Gateway</span>
                  <p className="text-[11px] text-zinc-400">
                    Direct mobile debit authorization for <strong>ETB {order.totalETB.toLocaleString()}</strong>.
                  </p>
                </div>
              )}

              {chapaChannel === "card" && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-2 text-xs">
                  <span className="text-emerald-400 font-bold block">EthSwitch / Visa / Mastercard</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Card Number"
                      defaultValue="9802 4410 8820 1948"
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 font-mono outline-none"
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/28"
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-100 font-mono outline-none text-center"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="882"
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-1.5 text-xs text-zinc-100 font-mono outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Escrow Guarantee Footer Note */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  National Bank of Ethiopia & Cyber Security Authority Compliant 256-Bit Escrow Vault.
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authorizing Chapa Switch...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ETB {order.totalETB.toLocaleString()} with Chapa
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* PAYMENT SUCCESS STATE & ESCROW RECEIPT */
            <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="w-11 h-11" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-100">
                  Payment Secured & Escrow Locked!
                </h3>
                <p className="text-xs text-zinc-400">
                  Your purchase order <strong className="text-zinc-200 font-mono">#{order.orderNumber}</strong> has been transmitted to {order.supplierName}.
                </p>
              </div>

              {/* Handover OTP Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-950 border border-indigo-500/40 max-w-md mx-auto space-y-2 shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400">
                  <KeyRound className="w-4 h-4" />
                  Your 4-Digit Warehouse Handover OTP
                </div>
                <div className="text-4xl font-black font-mono tracking-widest text-emerald-400 py-1">
                  {order.handoverOtp || "8492"}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Keep this OTP secure. Only share it with the delivery driver after inspecting and accepting goods at your warehouse.
                </p>
              </div>

              {/* Transaction & Order Number Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
                    <span>Transaction Number</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(chapaTxnRef);
                        setCopiedTxn(true);
                        toast.success("Transaction Reference copied!");
                        setTimeout(() => setCopiedTxn(false), 2000);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-indigo-200 select-all break-all">
                    {chapaTxnRef}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                    <span>Order Number</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(order.orderNumber);
                        setCopiedOrder(true);
                        toast.success("Order Number copied!");
                        setTimeout(() => setCopiedOrder(false), 2000);
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                    >
                      {copiedOrder ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-emerald-300 select-all break-all">
                    {order.orderNumber}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2 text-xs max-w-lg mx-auto shadow-md">
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Amount Paid:</span>
                  <span className="font-mono font-bold text-zinc-100">
                    ETB {order.totalETB.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-400">Destination Hub:</span>
                  <span className="text-zinc-200">{order.destinationWarehouseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Estimated Delivery:</span>
                  <span className="text-emerald-400 font-bold">~{order.deliveryEstimateDays} business days</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Receipt printed / downloaded!");
                    onClose();
                  }}
                  className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab("my-orders");
                  }}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02] flex items-center gap-2"
                >
                  <span>OK (Go to My Orders)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
