"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  UploadCloud,
  Loader2,
  ShieldCheck,
  Sparkles,
  QrCode,
  ArrowRight,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  SubscriptionPlan,
  SubscriptionPaymentMethod,
} from "@/types/subscription";
import { useSubscriptionStore } from "@/store/subscription-store";
import { useAuthStore } from "@/store/auth-store";
import { initializeChapaCheckout } from "@/lib/api/payment";
import { toast } from "sonner";

interface SubscriptionPaymentModalProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubscriptionPaymentModal({
  plan,
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionPaymentModalProps) {
  const { user } = useAuthStore();
  const { subscribe } = useSubscriptionStore();

  const [paymentMethod, setPaymentMethod] =
    useState<SubscriptionPaymentMethod>("CHAPA");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber || (user as any)?.phone || "+251911234567"
  );
  const [email, setEmail] = useState(user?.email || "merchant@mercatox.et");
  const [transactionRef, setTransactionRef] = useState("");
  const [bankName, setBankName] = useState("Commercial Bank of Ethiopia (CBE)");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isFree = plan.price === 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Chapa Hosted Payment Gateway: redirect merchant to Chapa
      if (paymentMethod === "CHAPA" && !isFree) {
        toast.loading("Connecting to Chapa Hosted Payment Gateway...", {
          id: "chapa-sub-toast",
        });

        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "";
        const isSeller = currentPath.includes("seller");
        const returnBase = isSeller ? "/dashboard/seller" : "/dashboard/supplier";
        const returnUrl = `${window.location.origin}${returnBase}?tab=subscriptions&payment_status=success&sub_plan=${plan.id}`;

        const pendingSub = {
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          billingPeriod: plan.billingPeriod,
          paymentMethod: "CHAPA",
          paymentPhone: phoneNumber,
          userName: user?.name || (user as any)?.fullName || "Merchant",
        };
        localStorage.setItem(
          "mercatox_pending_subscription",
          JSON.stringify(pendingSub)
        );

        const chapaRes = await initializeChapaCheckout({
          amount: plan.price,
          fullName: user?.name || (user as any)?.fullName || "Merchant",
          phoneNumber: phoneNumber || "0911223344",
          email: email || user?.email || "merchant@mercatox.et",
          subcity: "Addis Ababa",
          specificAddress: "MercatoX Subscription Payment",
          deliveryNotes: `MercatoX Subscription: ${plan.name} (${plan.billingPeriod})`,
          returnUrl: returnUrl,
          items: [
            {
              id: plan.id,
              name: `Subscription: ${plan.name}`,
              price: plan.price,
              quantity: 1,
            },
          ],
        });

        if (chapaRes.success && chapaRes.checkoutUrl) {
          toast.success("Redirecting to Chapa Payment Gateway...", {
            id: "chapa-sub-toast",
          });
          // Redirect browser directly to official Chapa checkout page
          window.location.href = chapaRes.checkoutUrl;
          return;
        } else {
          toast.error(
            chapaRes.error ||
              "Failed to initialize Chapa payment. Please try again.",
            { id: "chapa-sub-toast" }
          );
          setIsProcessing(false);
          return;
        }
      }

      // 2. Direct methods (Telebirr, CBE Birr, Bank Slip, or Free plan)
      const result = await subscribe({
        planId: plan.id,
        paymentMethod,
        transactionReference:
          transactionRef.trim() ||
          `TXN-SUB-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        paymentPhone: phoneNumber,
        bankName: paymentMethod === "BANK_TRANSFER" ? bankName : undefined,
        paymentSlipUrl: slipPreview || undefined,
        userName: user?.name || (user as any)?.fullName || "Merchant",
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsProcessing(false);
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setIsProcessing(false);
      }
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0c1220] p-5 sm:p-6 shadow-2xl text-left overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Subscription Activated!
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                You are now subscribed to{" "}
                <span className="text-indigo-300 font-semibold">{plan.name}</span>.
                Your enhanced store privileges and volume discounts are now live.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-xs text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmPayment} className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 font-mono uppercase">
                  {plan.targetRole} PLAN
                </span>
                {plan.badge && (
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    {plan.badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Subscribe to {plan.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{plan.description}</p>
            </div>

            {/* Plan Price Summary Box */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400 font-medium">Billing Period</p>
                <p className="text-xs font-semibold text-zinc-200 capitalize">
                  {plan.billingPeriod} Cycle (Auto-Renewable)
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-zinc-400 font-medium">Amount Due</p>
                <p className="text-base font-extrabold text-white font-mono">
                  {isFree ? "FREE" : `${plan.price.toLocaleString()} ETB`}
                </p>
              </div>
            </div>

            {!isFree ? (
              <>
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Telebirr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("TELEBIRR")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        paymentMethod === "TELEBIRR"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-950/40"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Smartphone className="h-5 w-5 mb-1 text-emerald-400" />
                      <span className="text-[11px] font-bold">Telebirr</span>
                      <span className="text-[9px] opacity-75">Instant</span>
                    </button>

                    {/* CBE Birr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CBE_BIRR")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        paymentMethod === "CBE_BIRR"
                          ? "border-purple-500 bg-purple-500/15 text-purple-300 shadow-md shadow-purple-950/40"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Building2 className="h-5 w-5 mb-1 text-purple-400" />
                      <span className="text-[11px] font-bold">CBE Birr</span>
                      <span className="text-[9px] opacity-75">Mobile App</span>
                    </button>

                    {/* Chapa Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CHAPA")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        paymentMethod === "CHAPA"
                          ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-950/40"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-1 text-cyan-400" />
                      <span className="text-[11px] font-bold">Chapa</span>
                      <span className="text-[9px] opacity-75">Card / Bank</span>
                    </button>

                    {/* Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("BANK_TRANSFER")}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                        paymentMethod === "BANK_TRANSFER"
                          ? "border-amber-500 bg-amber-500/15 text-amber-300 shadow-md shadow-amber-950/40"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <UploadCloud className="h-5 w-5 mb-1 text-amber-400" />
                      <span className="text-[11px] font-bold">Bank Slip</span>
                      <span className="text-[9px] opacity-75">CBE / Awash</span>
                    </button>
                  </div>
                </div>

                {/* Method-Specific Input Fields */}
                {paymentMethod === "TELEBIRR" && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5" />
                        Telebirr Direct Checkout
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Merchant: 892100
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Telebirr Registered Phone Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+251 9XX XXX XXX"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                      <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        You will receive an instant payment authorization prompt on your Telebirr app.
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === "CBE_BIRR" && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.03] p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        CBE Birr Mobile Gateway
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Till: CBE-88210
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        CBE Account or Mobile Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="1000XXXXXXXX or +251 9..."
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "CHAPA" && (
                  <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-[#0c1626] p-4 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-cyan-400" />
                        Chapa Hosted Checkout Gateway
                      </span>
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                        Official Escrow
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      You will be securely redirected to the official Chapa payment checkout to complete your transaction using Telebirr, CBE Birr, Awash, or debit/credit cards (Visa & Mastercard).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                          Merchant Phone Number
                        </label>
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="0911223344"
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                          Billing Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="merchant@mercatox.et"
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-2.5 flex items-center gap-2 text-[11px] text-cyan-200">
                      <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span>
                        Automatic activation upon completion of Chapa payment.
                      </span>
                    </div>
                  </div>
                )}

                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Official Corporate Bank Accounts
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Transfer the fee to any of our registered Ethiopian corporate accounts:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-amber-400 font-bold block">CBE (Commercial Bank)</span>
                        <span className="text-white">1000192837465</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-amber-400 font-bold block">Awash Bank</span>
                        <span className="text-white">01320876543200</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Bank Transaction Reference / Deposit Slip No.
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. FT2628819234"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                        Attach Deposit Slip / Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-center space-y-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">No Payment Required</p>
                <p className="text-[11px] text-zinc-400">
                  This starter tier is complimentary. Click below to activate your free quota immediately.
                </p>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Processing Payment...</span>
                  </>
                ) : isFree ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Activate Free Plan</span>
                  </>
                ) : paymentMethod === "CHAPA" ? (
                  <>
                    <ExternalLink className="h-4 w-4 text-cyan-200" />
                    <span>Pay {plan.price.toLocaleString()} ETB via Chapa</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Pay {plan.price.toLocaleString()} ETB & Subscribe</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
