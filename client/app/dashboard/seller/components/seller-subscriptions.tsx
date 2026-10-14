"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Zap,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  AlertCircle,
  FileText,
  BadgeCheck,
  Award,
  Layers,
  Crown,
  Check,
  Calendar,
  RefreshCw,
  PackageCheck,
} from "lucide-react";
import { SubscriptionPlan, UserSubscriptionRecord } from "@/types/subscription";
import { useSubscriptionStore } from "@/store/subscription-store";
import { useAuthStore } from "@/store/auth-store";
import { SubscriptionPaymentModal } from "@/components/subscription/subscription-payment-modal";
import { sellerService } from "@/services/seller/seller.service";
import { toast } from "sonner";

export function SellerSubscriptions() {
  const { user } = useAuthStore();
  const {
    plans,
    mySubscription,
    fetchPlans,
    fetchMySubscription,
    subscribe,
    isLoading,
  } = useSubscriptionStore();

  const [selectedPlanForPayment, setSelectedPlanForPayment] =
    useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [listedProductsCount, setListedProductsCount] = useState<number>(0);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  useEffect(() => {
    fetchPlans("SELLER");
    fetchMySubscription();

    // Fetch seller's active product count
    sellerService
      .getProducts({ limit: 1 })
      .then((res) => {
        const total =
          res?.total ?? (Array.isArray(res?.data) ? res.data.length : 0);
        setListedProductsCount(total);
      })
      .catch(() => {
        setListedProductsCount(0);
      })
      .finally(() => setLoadingProducts(false));

    // Handle return from Chapa checkout with payment_status=success
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const paymentStatus =
        searchParams.get("payment_status") || searchParams.get("status");
      const txRef =
        searchParams.get("tx_ref") || `CHAPA-SUB-${Date.now()}`;
      const urlSubPlan = searchParams.get("sub_plan");

      if (paymentStatus === "success") {
        const rawPending = localStorage.getItem(
          "mercatox_pending_subscription"
        );
        let planIdToActivate = urlSubPlan;
        let paymentPhone: string | undefined = undefined;

        if (rawPending) {
          try {
            const parsed = JSON.parse(rawPending);
            if (parsed.planId) planIdToActivate = parsed.planId;
            paymentPhone = parsed.paymentPhone;
          } catch {}
        }

        if (planIdToActivate) {
          subscribe({
            planId: planIdToActivate,
            paymentMethod: "CHAPA",
            transactionReference: txRef,
            paymentPhone,
          }).then(() => {
            fetchMySubscription();
            localStorage.removeItem("mercatox_pending_subscription");
            toast.success(
              "Chapa payment verified! Your store subscription has been activated.",
              { duration: 5000 }
            );
            const cleanUrl =
              window.location.pathname + "?tab=subscriptions";
            window.history.replaceState({}, document.title, cleanUrl);
          });
        }
      }
    }
  }, [fetchPlans, fetchMySubscription, subscribe]);

  // Filter plans for sellers
  const sellerPlans = plans.filter(
    (p) => p.targetRole === "SELLER" || p.targetRole === "ALL"
  );

  // Plan tier hierarchy
  const getTierRank = (planId: string) => {
    if (planId.includes("enterprise")) return 3;
    if (planId.includes("pro")) return 2;
    return 1;
  };

  // Active plan verification
  const isPaidActive = mySubscription?.paymentStatus === "PAID";
  const activePlanId = isPaidActive ? (mySubscription?.planId || "seller-starter") : "seller-starter";
  const currentPlan = sellerPlans.find((p) => p.id === activePlanId) || sellerPlans[0];
  const activeTierRank = getTierRank(activePlanId);

  // Quota & remaining product calculations
  const rawMax = currentPlan?.maxProducts ?? 15;
  const isUnlimited = typeof rawMax === "number" ? rawMax >= 999999 : rawMax === "unlimited";
  const maxAllowedProducts = isUnlimited ? Infinity : Number(rawMax);
  const remainingProducts = isUnlimited
    ? "Unlimited"
    : Math.max(0, maxAllowedProducts - listedProductsCount);
  const quotaPercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((listedProductsCount / maxAllowedProducts) * 100));

  // When subscribed ("meche subscribe endaderegew")
  const subDateRaw = mySubscription?.startDate || mySubscription?.createdAt;
  const formattedSubDate = subDateRaw
    ? new Date(subDateRaw).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  // Unblock re-subscribing: users have the right to re-subscribe, renew, or switch anytime
  const handleOpenPayment = (plan: SubscriptionPlan) => {
    setSelectedPlanForPayment(plan);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-950/60 via-slate-900 to-[#0c1222] p-6 lg:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              MercatoX Merchant Growth Subscriptions
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Store Subscriptions & Merchant Tiers
            </h1>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Unlock lower escrow platform commissions, verified store badges, priority search placement, and inventory listing limits. Re-subscribe or renew at any time.
            </p>
          </div>

          {/* Active Membership & Subscription Status Pill */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400 uppercase tracking-wider">
              <span>Current Active Tier</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  mySubscription?.paymentStatus === "PENDING"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {mySubscription?.paymentStatus === "PENDING"
                  ? "Pending Review"
                  : "Active Member"}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="text-lg font-bold text-white">
                {currentPlan ? currentPlan.name : "Starter Merchant"}
              </span>
            </div>

            {/* When Subscribed ("meche subscribe endaderegew") */}
            <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-indigo-400" />
                  <span>Subscribed On:</span>
                </span>
                <span className="font-mono text-zinc-200 font-medium">
                  {formattedSubDate || "Default Standard Tier"}
                </span>
              </div>
              {mySubscription?.endDate && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    <span>Renews On:</span>
                  </span>
                  <span className="font-mono text-zinc-300">
                    {new Date(mySubscription.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits & Inventory Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Remaining Product Listings Card ("snt product list endekerew") */}
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-[#0c1222]/90 to-slate-900/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                  Product Listings Quota
                </div>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {isUnlimited ? (
                    <span className="text-emerald-400">Unlimited Capacity</span>
                  ) : (
                    <span>{remainingProducts} Remaining</span>
                  )}
                </div>
              </div>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300 font-semibold">
              {isUnlimited ? "Unlimited" : `${listedProductsCount}/${maxAllowedProducts} Used`}
            </span>
          </div>

          {!isUnlimited ? (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    Number(remainingProducts) === 0
                      ? "bg-rose-500"
                      : Number(remainingProducts) <= 3
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-cyan-400 to-emerald-400"
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-zinc-400">
                {Number(remainingProducts) === 0
                  ? "Listing limit reached (0 remaining). Re-subscribe or upgrade tier to post more!"
                  : `You have ${remainingProducts} more product listing slots available.`}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-zinc-400">
              {listedProductsCount} items currently active in store • Unlimited inventory slots.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/20 p-2.5 text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Escrow Commission</div>
              <div className="text-lg font-bold text-white">
                {currentPlan?.commissionRateDiscount
                  ? `Reduced by ${currentPlan.commissionRateDiscount}%`
                  : "Standard 3.5%"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2.5 text-emerald-400">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Store Trust Badge</div>
              <div className="text-lg font-bold text-white">
                {currentPlan?.price && currentPlan.price > 0
                  ? "Verified Seller"
                  : "Standard"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1222]/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Payout Processing</div>
              <div className="text-lg font-bold text-white">
                {currentPlan?.price && currentPlan.price >= 1800
                  ? "Instant (Same-day)"
                  : currentPlan?.price && currentPlan.price > 0
                  ? "Priority (24h)"
                  : "Standard (48h)"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold text-white">Available Plans for Sellers</h2>
          <p className="text-xs text-zinc-400">
            Choose the plan that suits your sales volume. Re-subscribe, renew, or upgrade anytime.
          </p>
        </div>

        <div className="inline-flex items-center rounded-xl border border-white/10 bg-[#090d16] p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
              billingCycle === "annual"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Annual Billing
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellerPlans.map((plan) => {
          const planRank = getTierRank(plan.id);
          const isCurrent = isPaidActive && plan.id === activePlanId;
          const isHigherTier = planRank > activeTierRank;

          const displayPrice =
            billingCycle === "annual" && plan.price > 0
              ? Math.round(plan.price * 12 * 0.8)
              : plan.price;
          const periodLabel = billingCycle === "annual" && plan.price > 0 ? "year" : "month";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isCurrent
                  ? "border-emerald-500/70 bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-[#0b1414] shadow-xl shadow-emerald-950/40 ring-2 ring-emerald-500/40"
                  : plan.isPopular
                  ? "border-indigo-500/50 bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-[#0b0f1a] shadow-xl shadow-indigo-950/50 ring-1 ring-indigo-500/40"
                  : "border-white/[0.08] bg-[#0c1222]/80 hover:border-white/20"
              }`}
            >
              {/* Active Plan Pill */}
              {isCurrent && (
                <div className="absolute -top-3 right-4 rounded-full bg-emerald-500 text-black px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 z-10">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Current Active Plan</span>
                </div>
              )}

              {/* Popular / Recommended Pill */}
              {plan.isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-0.5 text-[11px] font-bold text-white shadow-md uppercase tracking-wider">
                  {plan.badge || "Most Popular"}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {plan.name}
                    {isCurrent && <Crown className="h-4 w-4 text-emerald-400" />}
                  </h3>
                  {plan.badge && !plan.isPopular && !isCurrent && (
                    <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-zinc-400 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">
                    {displayPrice === 0 ? "Free" : `${displayPrice.toLocaleString()} ETB`}
                  </span>
                  {displayPrice > 0 && (
                    <span className="text-xs text-zinc-400 font-medium">
                      /{periodLabel}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-6 space-y-3 pt-6 border-t border-white/[0.08]">
                  <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Included Benefits:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: NEVER disabled - users have the right to re-subscribe/renew anytime */}
              <div className="mt-8 pt-4">
                {isCurrent ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(plan)}
                    className="w-full rounded-xl border border-emerald-500/70 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 px-4 py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 shadow-emerald-950/40"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Re-subscribe / Renew {plan.name}</span>
                  </button>
                ) : isHigherTier ? (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(plan)}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shadow-indigo-900/30"
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(plan)}
                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      plan.isPopular
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Switch to {plan.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Supported Payment Channels */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#090d16] p-6 shadow-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Supported Ethiopian Payment Methods
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          All subscription payments are securely processed and activated instantly upon confirmation or slip upload.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222] p-3 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">Telebirr</div>
              <div className="text-[10px] text-zinc-400">Merchant: 892100</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222] p-3 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white">CBE Birr</div>
              <div className="text-[10px] text-zinc-400">Account / USSD</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222] p-3 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-indigo-400" />
            <div>
              <div className="text-xs font-bold text-white">Chapa Gateway</div>
              <div className="text-[10px] text-zinc-400">Cards & Mobile</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1222] p-3 flex items-center gap-3">
            <FileText className="h-5 w-5 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-white">Bank Transfer</div>
              <div className="text-[10px] text-zinc-400">CBE / Awash Slips</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Payment Modal */}
      {selectedPlanForPayment && (
        <SubscriptionPaymentModal
          plan={selectedPlanForPayment}
          isOpen={!!selectedPlanForPayment}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={() => {
            setSelectedPlanForPayment(null);
            fetchMySubscription();
          }}
        />
      )}
    </div>
  );
}
