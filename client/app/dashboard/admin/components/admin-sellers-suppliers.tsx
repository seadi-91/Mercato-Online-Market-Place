"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  X,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  Send,
  Wallet,
  TrendingUp,
  Percent,
  Copy,
  Store,
  FileText,
  Landmark,
  Package,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/store/language-store";
import { useThemeStore } from "@/store/theme-store";
import { LanguageSelector } from "@/components/common/language-selector";
import { PAYOUT_TRANSLATIONS, type PayoutsTranslationDictionary } from "@/lib/i18n/payout-translations";
import type { SellerSupplierItem } from "@/app/api/admin/sellers-suppliers/route";

interface PayoutSuccessModalData {
  txRef: string;
  amount: number;
  merchant: string;
  sellerName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  previousBalance?: number;
  remainingBalance?: number;
  email?: string;
}

export function AdminSellersSuppliers() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Multi-language translation helper with fallback
  const tr = (key: keyof PayoutsTranslationDictionary, fallback?: string): string => {
    const dict = PAYOUT_TRANSLATIONS[language] || PAYOUT_TRANSLATIONS.en;
    return dict[key] || PAYOUT_TRANSLATIONS.en[key] || fallback || key;
  };

  // Theme styling tokens
  const cardBg = isLight
    ? "bg-white border-slate-200 shadow-sm"
    : isSystem
    ? "bg-[#0c1630] border-blue-500/25 shadow-xl shadow-blue-950/30"
    : "bg-[#0d121f]/90 border-white/10 shadow-xl shadow-black/40";

  const textHeading = isLight ? "text-slate-900" : isSystem ? "text-blue-50" : "text-white";
  const textSub = isLight ? "text-slate-700" : isSystem ? "text-blue-100/90" : "text-zinc-300";
  const textMuted = isLight ? "text-slate-500" : isSystem ? "text-blue-300/70" : "text-zinc-400";
  const borderDivider = isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10";
  const hoverRowBg = isLight ? "hover:bg-slate-50" : isSystem ? "hover:bg-blue-900/25" : "hover:bg-white/[0.03]";

  const inputBg = isLight
    ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
    : isSystem
    ? "bg-[#070e20] border-blue-500/30 text-blue-100 placeholder-blue-300/40 focus:border-indigo-400"
    : "bg-black/40 border-white/10 text-white placeholder-zinc-500 focus:border-indigo-500";

  // Data states
  const [merchants, setMerchants] = useState<SellerSupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "SELLER" | "SUPPLIER" | "PAYOUT_READY">("ALL");

  // Summary counters
  const [summary, setSummary] = useState({
    totalMerchants: 0,
    sellersCount: 0,
    suppliersCount: 0,
    totalGrossSales: 0,
    totalCommission: 0,
    totalAvailablePayout: 0,
  });

  // Action Menu state (3-dots dropdown)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Selected merchant for Payout Modal
  const [payoutMerchant, setPayoutMerchant] = useState<SellerSupplierItem | null>(null);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferNotes, setTransferNotes] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Merchant details modal
  const [detailMerchant, setDetailMerchant] = useState<SellerSupplierItem | null>(null);

  // Verification states for Chapa return
  const [verifyingPayout, setVerifyingPayout] = useState(false);
  const [successModalData, setSuccessModalData] = useState<PayoutSuccessModalData | null>(null);

  const [payoutNotice, setPayoutNotice] = useState<{
    show: boolean;
    txRef?: string;
    amount?: string;
    merchant?: string;
    rem?: string;
  } | null>(null);

  const [cancelNotice, setCancelNotice] = useState<{
    show: boolean;
    txRef?: string;
    merchant?: string;
    message?: string;
  } | null>(null);

  // Fetch sellers and suppliers
  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers-suppliers");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMerchants(json.data);
        if (json.summary) {
          setSummary(json.summary);
        }

        // If backend auto-reconciliation caught a recently verified payout:
        if (json.recentlyVerifiedPayout) {
          const p = json.recentlyVerifiedPayout;
          setSuccessModalData({
            txRef: p.txRef,
            amount: Number(p.amount || 0),
            merchant: p.merchant || "Merchant",
            sellerName: p.sellerName,
            bankName: p.bankName,
            bankAccountNumber: p.bankAccountNumber,
            previousBalance: p.previousBalance ? Number(p.previousBalance) : undefined,
            remainingBalance: p.remainingBalance ? Number(p.remainingBalance) : undefined,
            email: p.email,
          });
          setPayoutNotice({
            show: true,
            txRef: p.txRef,
            amount: String(p.amount),
            merchant: p.merchant,
            rem: String(p.remainingBalance),
          });
          toast.success(
            `Payment Verified: ETB ${Number(p.amount || 0).toLocaleString()} transferred. Remaining balance updated in DB.`
          );
        }
      } else {
        toast.error(json.error || "Failed to load merchants");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load sellers and suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Check URL params & sessionStorage for Chapa return and verify transaction status
  useEffect(() => {
    let rawTxRef =
      searchParams?.get("tx_ref") ||
      searchParams?.get("trx_ref") ||
      searchParams?.get("reference");
    let action = searchParams?.get("payout_action");

    // Also check window.location directly in case Next.js searchParams didn't parse due to double query marks
    if (typeof window !== "undefined") {
      const fullUrl = window.location.href;
      if (!rawTxRef) {
        const match = fullUrl.match(/[?&](?:tx_ref|trx_ref|reference)=([^&?#]+)/i);
        if (match) rawTxRef = decodeURIComponent(match[1]);
      }
      if (!action && (fullUrl.includes("payout_action=verify") || rawTxRef)) {
        action = "verify";
      }

      // Also check sessionStorage for active in-flight transfer
      if (!rawTxRef) {
        const storedTxRef = sessionStorage.getItem("active_payout_tx_ref");
        const storedTime = Number(sessionStorage.getItem("active_payout_time") || 0);
        if (storedTxRef && Date.now() - storedTime < 30 * 60 * 1000) {
          rawTxRef = storedTxRef;
          action = "verify";
        }
      }
    }

    const cleanTxRef = rawTxRef ? rawTxRef.split(/[?&#]/)[0].trim() : null;

    if (cleanTxRef && (action === "verify" || cleanTxRef.startsWith("TX-PAYOUT-"))) {
      setVerifyingPayout(true);
      fetch(`/api/admin/payouts/verify?tx_ref=${encodeURIComponent(cleanTxRef)}`)
        .then((res) => res.json())
        .then((data) => {
          setVerifyingPayout(false);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("active_payout_tx_ref");
            sessionStorage.removeItem("active_payout_time");
          }
          if (data.verified && data.success) {
            // 1. Open the prominent "Payment Successful" confirmation modal
            setSuccessModalData({
              txRef: data.txRef || cleanTxRef,
              amount: Number(data.amount || 0),
              merchant: data.merchant || "Merchant",
              sellerName: data.sellerName,
              bankName: data.bankName,
              bankAccountNumber: data.bankAccountNumber,
              previousBalance: data.previousBalance ? Number(data.previousBalance) : undefined,
              remainingBalance: data.remainingBalance ? Number(data.remainingBalance) : undefined,
              email: data.email,
            });

            // 2. Set the success top banner
            setPayoutNotice({
              show: true,
              txRef: data.txRef || cleanTxRef,
              amount: data.amount ? String(data.amount) : undefined,
              merchant: data.merchant,
              rem: data.remainingBalance ? String(data.remainingBalance) : undefined,
            });

            toast.success(
              `Payment Successful: ETB ${Number(data.amount || 0).toLocaleString()} transferred. Remaining balance updated in DB.`
            );
          } else if (data.pending) {
            // Transaction still processing on Chapa
            toast.info("Payment authorization is processing on Chapa...");
          } else {
            // Payment was NOT completed on Chapa (cancelled, back button pressed, or test failed)
            // DO NOT DEDUCT ANY MONEY! DO NOT SEND ANY EMAIL!
            setCancelNotice({
              show: true,
              txRef: data.txRef || cleanTxRef,
              merchant: data.merchant,
              message:
                data.message ||
                "Payment was not completed or was cancelled on Chapa. No funds were deducted from merchant balance.",
            });
            toast.warning("Chapa payment cancelled or not completed. No funds were deducted.");
          }
          fetchMerchants();
        })
        .catch(() => {
          setVerifyingPayout(false);
          fetchMerchants();
        });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMerchants();
  }, []);

  // Filtered merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      // Role filter
      if (roleFilter === "SELLER" && m.role !== "SELLER") return false;
      if (roleFilter === "SUPPLIER" && m.role !== "SUPPLIER") return false;
      if (roleFilter === "PAYOUT_READY" && m.availableBalance <= 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesShop = m.shopName.toLowerCase().includes(q);
        const matchesName = m.fullName.toLowerCase().includes(q);
        const matchesPhone = m.phoneNumber.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesTin = (m.tinNumber || "").toLowerCase().includes(q);
        const matchesCity = m.city.toLowerCase().includes(q);
        if (!matchesShop && !matchesName && !matchesPhone && !matchesEmail && !matchesTin && !matchesCity) {
          return false;
        }
      }
      return true;
    });
  }, [merchants, roleFilter, searchQuery]);

  // Open payout modal from 3-dots action dropdown
  const handleOpenPayout = (merchant: SellerSupplierItem) => {
    setPayoutMerchant(merchant);
    setTransferAmount(merchant.availableBalance > 0 ? merchant.availableBalance : 0);
    setTransferNotes(`MercatoX payout disbursement for ${merchant.shopName}`);
    setActiveMenuId(null);
  };

  // Dynamic Remaining Balance calculation
  const remainingBalance = payoutMerchant
    ? Math.max(0, Math.round((payoutMerchant.availableBalance - (transferAmount || 0)) * 100) / 100)
    : 0;

  // Dedicated Handler: Return to Sellers & Suppliers Payout page cleanly
  const handleBackToPayouts = () => {
    setSuccessModalData(null);
    setPayoutMerchant(null);
    setPayoutNotice(null);
    setCancelNotice(null);
    fetchMerchants();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("active_payout_tx_ref");
      sessionStorage.removeItem("active_payout_time");
      window.history.replaceState({}, "", "/dashboard/admin?tab=sellers-suppliers");
    }
  };

  // Execute Chapa Payout Transfer: initiates Chapa session without deducting until verified
  const handleExecutePayout = async () => {
    if (!payoutMerchant) return;
    if (transferAmount <= 0) {
      toast.error("Please enter a valid transfer payout amount greater than zero.");
      return;
    }

    if (transferAmount > payoutMerchant.availableBalance && payoutMerchant.availableBalance > 0) {
      const proceed = confirm(
        `The requested transfer amount (ETB ${transferAmount.toLocaleString()}) exceeds the available balance (ETB ${payoutMerchant.availableBalance.toLocaleString()}). Do you still want to proceed with this manual payout?`
      );
      if (!proceed) return;
    }

    setIsTransferring(true);
    try {
      const res = await fetch("/api/admin/payouts/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: payoutMerchant.userId || payoutMerchant.id,
          sellerName: payoutMerchant.fullName,
          shopName: payoutMerchant.shopName,
          phoneNumber: payoutMerchant.phoneNumber,
          email: payoutMerchant.email,
          amount: transferAmount,
          bankName: payoutMerchant.bankName,
          bankAccountNumber: payoutMerchant.bankAccountNumber,
          bankAccountHolderName: payoutMerchant.bankAccountHolderName,
          notes: transferNotes,
          role: payoutMerchant.role,
          grossSales: payoutMerchant.grossSales,
          platformCommission: payoutMerchant.platformCommission,
          previousBalance: payoutMerchant.availableBalance,
          remainingBalance: remainingBalance,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to initialize Chapa transfer");
      }

      if (typeof window !== "undefined" && data.txRef) {
        sessionStorage.setItem("active_payout_tx_ref", data.txRef);
        sessionStorage.setItem("active_payout_time", Date.now().toString());
      }

      toast.success(
        `Redirecting to Chapa Gateway for authorization. (No funds will be deducted until payment is verified successfully.)`
      );

      // Redirect directly to Chapa checkout
      if (data.checkoutUrl) {
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 600);
      } else {
        toast.info("Chapa checkout URL generated.");
        setPayoutMerchant(null);
        fetchMerchants();
      }
    } catch (err: any) {
      toast.error(err.message || "Payout transfer failed");
      setIsTransferring(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Verifying Status Indicator */}
      {verifyingPayout && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 backdrop-blur-xl animate-in fade-in">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-400 shrink-0" />
          <div>
            <p className="font-semibold text-white">{tr("verifyingWithChapa")}</p>
            <p className="text-xs text-indigo-200">{tr("checkingStatus")}</p>
          </div>
        </div>
      )}

      {/* Verified Success Alert Notice (Only when Chapa confirms success) */}
      {payoutNotice?.show && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">
                ✅ {tr("paymentSuccessfulTitle")}
              </p>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                {tr("transferredPayoutAmount")}: <span className="font-mono font-bold text-white">ETB {payoutNotice.amount}</span> | {tr("beneficiaryMerchant")}{" "}
                <span className="font-medium text-white">{payoutNotice.merchant}</span> | {tr("newRemainingBalance")}{" "}
                <span className="font-mono font-bold text-cyan-300">ETB {payoutNotice.rem || "0"}</span> | Ref:{" "}
                <span className="font-mono text-emerald-400">{payoutNotice.txRef}</span>
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                📧 {tr("emailStatementsDispatched")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPayoutNotice(null)}
            className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 text-xs font-medium hover:bg-emerald-500/30 text-emerald-200 cursor-pointer"
          >
            {tr("dismiss")}
          </button>
        </div>
      )}

      {/* Cancelled / Abandoned Notice (When payment was not completed on Chapa) */}
      {cancelNotice?.show && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">
                ⚠️ {tr("payoutCancelledTitle")}
              </p>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {tr("payoutCancelledDesc")}
              </p>
              {cancelNotice.txRef && (
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  Ref: {cancelNotice.txRef} {cancelNotice.merchant ? `· ${cancelNotice.merchant}` : ""}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCancelNotice(null)}
            className="self-end sm:self-center px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/20 text-xs font-medium hover:bg-amber-500/30 text-amber-200 cursor-pointer"
          >
            {tr("dismiss")}
          </button>
        </div>
      )}

      {/* Page Header with Multilingual Language Selector & Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${textHeading} flex items-center gap-2.5`}>
            <Building2 className="h-6 w-6 text-indigo-400" />
            {tr("pageTitle")}
          </h1>
          <p className={`text-xs sm:text-sm ${textMuted} mt-1`}>
            {tr("pageSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dedicated Multilingual Language Switcher */}
          <LanguageSelector variant="compact" showLabel={true} />

          <button
            type="button"
            onClick={fetchMerchants}
            disabled={loading}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            <span>{tr("refresh")}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Merchants */}
        <div className={`p-4 rounded-2xl border ${cardBg} relative overflow-hidden backdrop-blur-xl`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>
              {tr("totalRegisteredVendors")}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${textHeading}`}>
              {summary.totalMerchants}
            </span>
            <span className="text-[11px] text-zinc-400">
              ({summary.sellersCount} {tr("sellersCount")} · {summary.suppliersCount} {tr("suppliersCount")})
            </span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-400">
            {tr("liveMerchantsInDb")}
          </p>
        </div>

        {/* Card 2: Real Product Gross Sales from DB */}
        <div className={`p-4 rounded-2xl border ${cardBg} relative overflow-hidden backdrop-blur-xl`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>
              {tr("grossSalesDb")}
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              ETB {summary.totalGrossSales.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-cyan-300/80">
            {tr("exactSubtotalProducts")}
          </p>
        </div>

        {/* Card 3: Platform Commission (3.5%) */}
        <div className={`p-4 rounded-2xl border ${cardBg} relative overflow-hidden backdrop-blur-xl`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>
              {tr("commissionPaid")}
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-violet-400">
              ETB {summary.totalCommission.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-violet-300/80">
            {tr("takeRateDeducted")}
          </p>
        </div>

        {/* Card 4: Available Payout Vault */}
        <div className={`p-4 rounded-2xl border ${cardBg} relative overflow-hidden backdrop-blur-xl`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${textMuted}`}>
              {tr("netAvailableVault")}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              ETB {summary.totalAvailablePayout.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-300/80">
            {tr("readyToDisburse")}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={`p-4 rounded-2xl border ${cardBg} space-y-3 backdrop-blur-xl`}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={tr("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border outline-none transition-all ${inputBg}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-xl border border-white/10 bg-black/30 p-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tr("allVendors")} ({merchants.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("SELLER")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === "SELLER"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tr("sellers")} ({summary.sellersCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("SUPPLIER")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === "SUPPLIER"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tr("suppliers")} ({summary.suppliersCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("PAYOUT_READY")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === "PAYOUT_READY"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tr("payoutReady")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Merchants Table with Mobile Horizontal Scroll Hint */}
      <div className={`rounded-2xl border ${cardBg} overflow-hidden backdrop-blur-xl shadow-2xl`}>
        {/* Mobile Swipe Guidance Banner */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02] text-[11px] text-zinc-400 sm:hidden">
          <span className="flex items-center gap-1.5">
            <ArrowRight className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            {tr("swipeTableHint")}
          </span>
          <span className="font-mono text-indigo-300 font-semibold">{filteredMerchants.length} vendors</span>
        </div>

        {/* Horizontal Table Container */}
        <div className="overflow-x-auto min-h-[300px] scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse min-w-[1180px]">
            <thead>
              <tr className={`border-b ${borderDivider} bg-black/40 text-zinc-400 font-medium`}>
                <th className="py-3.5 px-4">{tr("colMerchantShop")}</th>
                <th className="py-3.5 px-3">{tr("colRoleVerification")}</th>
                <th className="py-3.5 px-3 text-center">{tr("colListedProducts")}</th>
                <th className="py-3.5 px-3 text-center">{tr("colOrders")}</th>
                <th className="py-3.5 px-4 text-right">{tr("colSoldSales")}</th>
                <th className="py-3.5 px-4 text-right">{tr("colCommission")}</th>
                <th className="py-3.5 px-4 text-right">{tr("colNetBalance")}</th>
                <th className="py-3.5 px-4">{tr("colBankDestination")}</th>
                <th className="py-3.5 px-3 text-center">{tr("colActions")}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${borderDivider}`}>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-3">
                      <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                      <span>{tr("loadingRecords")}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Store className="h-8 w-8 text-zinc-500" />
                      <p className="text-sm font-medium">{tr("noMerchantsFound")}</p>
                      <p className="text-xs text-zinc-500">{tr("tryDifferentSearch")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => {
                  const isReady = merchant.availableBalance > 0;
                  const isSeller = merchant.role === "SELLER";
                  const isMenuOpen = activeMenuId === merchant.id;

                  return (
                    <tr key={merchant.id} className={`transition-colors ${hoverRowBg}`}>
                      {/* Merchant & Store Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold uppercase ${
                              isSeller
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {merchant.shopName.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-semibold ${textHeading} truncate max-w-[200px]`}>
                                {merchant.shopName}
                              </span>
                              {merchant.isVerifiedMerchant && (
                                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                              <span>{merchant.fullName}</span>
                              <span>·</span>
                              <span className="font-mono">{merchant.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Verification */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              isSeller
                                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {merchant.role}
                          </span>
                          <div className="text-[10px] text-zinc-400">
                            TIN: <span className="font-mono text-zinc-300">{merchant.tinNumber || "N/A"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Listed Products from Catalog */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-zinc-300">
                          <Package className="h-3 w-3 text-cyan-400" />
                          {merchant.listedProductsCount}
                        </span>
                      </td>

                      {/* Completed Orders Count */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-zinc-300">
                          {merchant.fulfilledOrdersCount}
                        </span>
                      </td>

                      {/* Sold Products Sales (Real Gross from DB) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-cyan-400">
                          ETB {merchant.grossSales.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-zinc-400">Own Products Sold</div>
                      </td>

                      {/* Commission Paid (3.5% Deducted) */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-semibold text-violet-400">
                          ETB {merchant.platformCommission.toLocaleString()}
                        </span>
                        <div className="text-[10px] text-zinc-400">3.5% Platform Fee</div>
                      </td>

                      {/* Net Available Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isReady ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        >
                          ETB {merchant.availableBalance.toLocaleString()}
                        </span>
                        {isReady ? (
                          <div className="text-[10px] text-emerald-400 font-medium">Ready for Payout</div>
                        ) : (
                          <div className="text-[10px] text-zinc-500">Zero Balance</div>
                        )}
                      </td>

                      {/* Bank Destination */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-200">
                            <Landmark className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate max-w-[170px]">{merchant.bankName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                            <span>{merchant.bankAccountNumber}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(merchant.bankAccountNumber, "Account number")}
                              className="text-zinc-500 hover:text-zinc-300"
                              title="Copy account number"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[170px]">
                            {merchant.bankAccountHolderName}
                          </div>
                        </div>
                      </td>

                      {/* 3-Dots Action Dropdown */}
                      <td className="py-3.5 px-3 text-center relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : merchant.id)}
                          className="p-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all shadow-xs"
                          title="Actions menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div
                              className="absolute right-2 mt-2 w-60 rounded-2xl border border-white/15 bg-[#121829] p-2 shadow-2xl shadow-black/90 z-50 text-left text-xs text-zinc-200 animate-in fade-in zoom-in-95"
                            >
                              {/* Option 1: Transfer Payout via Chapa (Primary Action) */}
                              <button
                                type="button"
                                onClick={() => handleOpenPayout(merchant)}
                                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
                                  isReady
                                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 shadow-md shadow-emerald-500/20"
                                    : "text-zinc-300 hover:bg-white/5"
                                }`}
                              >
                                <Send className="h-4 w-4 text-emerald-400 shrink-0" />
                                <div className="text-left">
                                  <div className="text-emerald-300 font-bold">
                                    {tr("transferPayout")}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 font-mono">
                                    ETB {merchant.availableBalance.toLocaleString()} {tr("availablePayout")}
                                  </div>
                                </div>
                              </button>

                              <div className="my-1 border-t border-white/10" />

                              {/* Option 2: Copy Bank Details */}
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    `${merchant.bankName} - ${merchant.bankAccountNumber} (${merchant.bankAccountHolderName})`,
                                    tr("copyBank")
                                  )
                                }
                                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                <span>{tr("copyBank")}</span>
                              </button>

                              {/* Option 3: Inspect Merchant Profile */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailMerchant(merchant);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                <span>{tr("viewProfile")}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Prominent "Payment Successful!" Celebration Modal ── */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0f1f1a] to-[#0a1220] shadow-[0_20px_60px_rgba(16,185,129,0.25)] text-zinc-100 p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95">
            {/* Top Navigation Bar with Back Button */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={handleBackToPayouts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-zinc-200 hover:text-white transition-all cursor-pointer font-medium"
              >
                <ArrowLeft className="h-4 w-4 text-emerald-400" />
                <span>{tr("backToPayouts")}</span>
              </button>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                MercatoX Settlement
              </span>
            </div>

            {/* Pulsing Glowing Checkmark Badge */}
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10 animate-in zoom-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-white">
                {tr("paymentSuccessfulTitle")}
              </h2>
              <p className="text-xs text-zinc-400">
                {tr("paymentSuccessfulSubtitle")}
              </p>
            </div>

            {/* Big Amount Transferred Display */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
                {tr("transferredPayoutAmount")}
              </span>
              <span className="font-mono text-3xl font-extrabold text-white">
                ETB {successModalData.amount.toLocaleString()}
              </span>
            </div>

            {/* Balance & Destination Breakdown */}
            <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-400">{tr("beneficiaryMerchant")}</span>
                <span className="font-semibold text-white">{successModalData.merchant}</span>
              </div>
              {successModalData.bankName && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">{tr("destinationAccount")}</span>
                  <span className="font-mono text-zinc-200">{successModalData.bankName} · {successModalData.bankAccountNumber}</span>
                </div>
              )}
              {successModalData.previousBalance !== undefined && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-zinc-400">{tr("previousAvailableBalance")}</span>
                  <span className="font-mono text-zinc-300">ETB {successModalData.previousBalance.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-zinc-400">{tr("deductedFromAccount")}</span>
                <span className="font-mono font-bold text-emerald-400">-ETB {successModalData.amount.toLocaleString()}</span>
              </div>
              {successModalData.remainingBalance !== undefined && (
                <div className="flex justify-between items-center py-2 bg-emerald-500/15 border border-emerald-500/30 px-3 rounded-xl">
                  <span className="text-emerald-300 font-bold">{tr("newRemainingBalance")}</span>
                  <span className="font-mono font-extrabold text-cyan-300 text-sm">ETB {successModalData.remainingBalance.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Prominent Payment ID / Transaction Reference Box with Quick Copy */}
            <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/50 flex items-center justify-between text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                  {tr("officialPaymentId")}
                </span>
                <span className="font-mono text-xs font-bold text-white select-all">
                  {successModalData.txRef}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(successModalData.txRef);
                    toast.success(tr("idCopied"));
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-500/30 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{tr("copyId")}</span>
              </button>
            </div>

            {/* Email Dispatch Notice */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-left space-y-1.5">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                {tr("emailStatementsDispatched")}
              </span>
              <p className="text-[11px] text-zinc-300">
                1. <strong>{tr("emailToMerchant")}:</strong> {successModalData.email || "Registered email"}
              </p>
              <p className="text-[11px] text-zinc-300">
                2. <strong>{tr("emailToAdmin")}:</strong> muradsada8@gmail.com
              </p>
            </div>

            {/* Action Buttons: Back to Sellers/Suppliers & View Updated Balances */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBackToPayouts}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{tr("backToPayouts")}</span>
              </button>
              <button
                type="button"
                onClick={handleBackToPayouts}
                className="w-full sm:flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{tr("viewUpdatedBalances")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Transfer Payout Modal (Fully Scrollable on any device) ── */}
      {payoutMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-white/15 bg-[#0f172a] shadow-2xl text-zinc-100 my-auto animate-in zoom-in-95 overflow-hidden">
            {/* Pinned Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between bg-[#131b31] shrink-0">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {payoutMerchant.role} PAYOUT DISBURSEMENT
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {tr("modalTransferTitle")}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {tr("beneficiaryMerchant")} <span className="font-semibold text-white">{payoutMerchant.shopName}</span> (
                  {payoutMerchant.fullName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayoutMerchant(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin">
              {/* Bank Destination Card */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-indigo-400" />
                    {tr("payoutDestination")}
                  </span>
                  <span className="text-[11px] text-zinc-300 font-mono">
                    {tr("phoneNumber")}: {payoutMerchant.phoneNumber}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {payoutMerchant.bankName}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
                  <span className="font-mono">Account: {payoutMerchant.bankAccountNumber}</span>
                  <span>Holder: {payoutMerchant.bankAccountHolderName}</span>
                </div>
              </div>

              {/* Comprehensive Sales & Commission Statement Card */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-300 block">
                  {tr("modalTransferSubtitle")}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl border border-white/10 bg-black/40">
                    <span className="text-zinc-400 block text-[11px]">{tr("grossSalesDb")}</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      ETB {payoutMerchant.grossSales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">{tr("exactSubtotalProducts")}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-white/10 bg-black/40">
                    <span className="text-zinc-400 block text-[11px]">{tr("commissionPaid")}</span>
                    <span className="font-mono font-bold text-violet-400 text-sm">
                      -ETB {payoutMerchant.platformCommission.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">{tr("takeRateDeducted")}</span>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                    <span className="text-emerald-300 block text-[11px]">{tr("availableBalanceInDb")}</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ETB {payoutMerchant.availableBalance.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 block">{tr("readyToDisburse")}</span>
                  </div>
                </div>
              </div>

              {/* Transfer Amount Input Box */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-200">
                  {tr("enterPayoutAmount")}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-400">
                    ETB
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={transferAmount || ""}
                    onChange={(e) => setTransferAmount(Number(e.target.value) || 0)}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-white/20 bg-black/60 text-white font-mono text-base font-bold outline-none focus:border-emerald-500 shadow-inner"
                    placeholder="0.00"
                  />
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTransferAmount(payoutMerchant.availableBalance)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    {tr("shortcut100")} (ETB {payoutMerchant.availableBalance.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTransferAmount(Math.round((payoutMerchant.availableBalance / 2) * 100) / 100)
                    }
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono font-medium text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {tr("shortcut50")}
                  </button>
                </div>
              </div>

              {/* Dynamic Remaining Balance Preview Box */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-cyan-200 font-semibold block">
                    {tr("remainingBalanceAfter")}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    (Available ETB {payoutMerchant.availableBalance.toLocaleString()} - Transfer ETB {transferAmount.toLocaleString()})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-cyan-300">
                    ETB {remainingBalance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">{tr("willRemainInDb")}</span>
                </div>
              </div>

              {/* Transfer Notes */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  {tr("disbursementMemo")}
                </label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-xs text-white outline-none focus:border-indigo-500"
                  placeholder={tr("memoPlaceholder")}
                />
              </div>

              {/* Security & Verification Assurance Badge */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2.5 text-xs text-zinc-200">
                <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white block">
                    {tr("securityNoticeTitle")}
                  </span>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                    {tr("securityNoticeDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Pinned Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3 bg-[#0d1424] shrink-0">
              <button
                type="button"
                onClick={() => setPayoutMerchant(null)}
                disabled={isTransferring}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {tr("cancel")}
              </button>
              <button
                type="button"
                onClick={handleExecutePayout}
                disabled={isTransferring || transferAmount <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isTransferring ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{tr("connectingToChapa")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      {tr("authorizeOnChapa")} (ETB {transferAmount.toLocaleString()})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Merchant Full Profile Inspector Modal ── */}
      {detailMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] shadow-2xl p-6 text-zinc-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {detailMerchant.role} PROFILE
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{detailMerchant.shopName}</h3>
                <p className="text-xs text-zinc-400">{detailMerchant.businessType}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailMerchant(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("contactPerson")}</span>
                <span className="font-semibold text-white">{detailMerchant.fullName}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("phoneNumber")}</span>
                <span className="font-mono font-semibold text-white">{detailMerchant.phoneNumber}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("emailAddress")}</span>
                <span className="font-mono text-zinc-200 truncate block">{detailMerchant.email || "N/A"}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("tinNumber")}</span>
                <span className="font-mono font-semibold text-indigo-400">{detailMerchant.tinNumber || "N/A"}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("location")}</span>
                <span className="text-white">{detailMerchant.city}, {detailMerchant.subCity || "Mercato"}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-zinc-400 block text-[11px]">{tr("kycStatus")}</span>
                <span className="font-semibold text-emerald-400">{detailMerchant.merchantKycStatus}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2 text-xs">
              <span className="font-semibold text-indigo-300 block">{tr("payoutDestination")}</span>
              <div className="text-white font-medium">{detailMerchant.bankName}</div>
              <div className="font-mono text-zinc-300">Account: {detailMerchant.bankAccountNumber}</div>
              <div className="text-zinc-400">Account Holder: {detailMerchant.bankAccountHolderName}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border border-white/10 bg-black/40 text-xs text-center">
              <div>
                <span className="text-zinc-400 block text-[10px]">{tr("listedProducts")}</span>
                <strong className="text-white font-mono">{detailMerchant.listedProductsCount}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">{tr("soldSalesDb")}</span>
                <strong className="text-cyan-400 font-mono">ETB {detailMerchant.grossSales.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">{tr("availablePayout")}</span>
                <strong className="text-emerald-400 font-mono">ETB {detailMerchant.availableBalance.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailMerchant(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-zinc-300 hover:bg-white/10 cursor-pointer"
              >
                {tr("close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = detailMerchant;
                  setDetailMerchant(null);
                  handleOpenPayout(m);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{tr("initiatePayout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
