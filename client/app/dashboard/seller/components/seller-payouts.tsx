"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Smartphone,
  CreditCard,
  Search,
  X,
  Lock,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Receipt,
  Hash,
  ExternalLink,
  Check,
  DollarSign,
  Ban,
  RotateCcw,
} from "lucide-react";
import { useSellerUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { sellerService } from "@/services/seller/seller.service";

interface PaymentItemDetail {
  id?: string;
  productId?: string;
  title: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitOfMeasure?: string;
}

interface LinkedPayoutInfo {
  id: string;
  amount: number;
  platformFee: number;
  netPayoutAmount: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolderName?: string;
  status?: string;
  processedAt?: string;
}

interface CustomerPaymentRecord {
  id: string;
  transactionReference: string;
  providerReference?: string | null;
  orderId?: string | null;
  orderNumber: string;
  orderStatus?: string | null;
  orderPaymentStatus?: string | null;
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  orderNotes?: string;
  items: PaymentItemDetail[];
  itemsSummary: string;
  itemsCount: number;
  amount: number;
  subtotalAmount?: number | null;
  deliveryFee?: number | null;
  currency: string;
  provider: string;
  status: string;
  escrowStatus: string;
  paymentReceiptUrl?: string | null;
  bankName?: string | null;
  depositorName?: string | null;
  bankTransactionRef?: string | null;
  maskedCardNumber?: string | null;
  chapaReward?: {
    credited?: boolean;
    rewardPercent?: number;
    rewardAmount?: number;
    cardNumber?: string;
  } | null;
  payoutInfo?: LinkedPayoutInfo | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

interface PayoutTransaction {
  id: string;
  fullId?: string;
  paymentId?: string;
  orderId?: string;
  date: string;
  destination: string;
  accountNumber: string;
  accountHolderName?: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "Completed" | "Processing" | "Failed" | "Escrow Hold";
  refNumber: string;
  notes: string;
}

function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatProviderLabel(provider?: string | null, metadata?: Record<string, any>): string {
  const raw = (provider || "").toUpperCase();
  if (raw.includes("MERCATOX_CARD") || metadata?.cardNumber) return "MercatoX Card";
  if (raw.includes("TELEBIRR")) return "Telebirr";
  if (raw.includes("BANK") || raw.includes("CBE")) return "Bank Transfer (CBE)";
  if (raw.includes("CHAPA")) return "Chapa Gateway";
  return provider || "Online Payment";
}

function getProviderBadgeStyle(provider?: string | null, metadata?: Record<string, any>) {
  const raw = (provider || "").toUpperCase();
  if (raw.includes("MERCATOX_CARD") || metadata?.cardNumber) {
    return {
      bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      Icon: CreditCard,
    };
  }
  if (raw.includes("TELEBIRR")) {
    return {
      bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      Icon: Smartphone,
    };
  }
  if (raw.includes("BANK") || raw.includes("CBE")) {
    return {
      bg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      Icon: Building2,
    };
  }
  return {
    bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    Icon: CreditCard,
  };
}

function getPaymentStatusBadge(status?: string) {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "COMPLETED":
      return {
        label: "Paid",
        cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        Icon: CheckCircle2,
      };
    case "RELEASED":
      return {
        label: "Released",
        cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
        Icon: CheckCircle2,
      };
    case "PENDING":
      return {
        label: "Pending Review",
        cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        Icon: Clock,
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        cls: "bg-violet-500/15 text-violet-300 border-violet-500/30",
        Icon: RotateCcw,
      };
    case "FAILED":
      return {
        label: "Failed",
        cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        Icon: Ban,
      };
    default:
      return {
        label: s || "Initiated",
        cls: "bg-white/10 text-zinc-300 border-white/15",
        Icon: Clock,
      };
  }
}

function getEscrowBadge(escrowStatus?: string) {
  const e = (escrowStatus || "").toUpperCase();
  if (e === "RELEASED") {
    return {
      label: "Escrow Released",
      cls: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
    };
  }
  if (e === "REFUNDED") {
    return {
      label: "Refunded",
      cls: "bg-rose-500/10 text-rose-300 border-rose-500/25",
    };
  }
  return {
    label: "Held in Escrow",
    cls: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  };
}

export function SellerPayouts() {
  const { availablePayout, pendingEscrow, setStats } = useSellerUIStore();
  const user = useAuthStore((state) => state.user);

  const [ledgerView, setLedgerView] = useState<"payments" | "payouts">("payments");
  const [customerPayments, setCustomerPayments] = useState<CustomerPaymentRecord[]>([]);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);

  const [paymentFilter, setPaymentFilter] = useState<string>("all_active");
  const [payoutFilter, setPayoutFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPayment, setSelectedPayment] = useState<CustomerPaymentRecord | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"Telebirr" | "CBE" | "Dashen">("Telebirr");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const targetSellerId = (user as any)?.sellerId || user?.id;

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    toast.success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedText(null), 1800);
  };

  const mapRawPayout = useCallback(
    (p: any): PayoutTransaction => {
      const bankOrMethod = String(p.bankName || p.paymentMethod || "Telebirr");
      let dest = bankOrMethod;
      if (bankOrMethod.toLowerCase().includes("cbe")) dest = "CBE";
      else if (bankOrMethod.toLowerCase().includes("dashen")) dest = "Dashen";
      else if (bankOrMethod.toLowerCase().includes("telebirr")) dest = "Telebirr";

      const rawStatus = String(p.status || "").toUpperCase();
      let stat: PayoutTransaction["status"] = "Completed";
      if (rawStatus === "PENDING" || rawStatus === "PROCESSING") stat = "Processing";
      else if (rawStatus === "FAILED") stat = "Failed";

      const gross = Number(p.amount || 0);
      const fee = Number(p.platformFee || 0);
      const net = Number(p.netPayoutAmount ?? Math.max(0, gross - fee));

      return {
        id: `TX-${String(p.id || "").slice(0, 6).toUpperCase()}`,
        fullId: p.id,
        paymentId: p.paymentId,
        orderId: p.orderId,
        date: formatDateTime(p.processedAt || p.createdAt),
        destination: dest,
        accountNumber:
          p.bankAccountNumber || p.destinationAccount || p.accountNumber || user?.phoneNumber || "Merchant Account",
        accountHolderName: p.bankAccountHolderName || user?.name || undefined,
        amount: gross,
        fee,
        netAmount: net,
        status: stat,
        refNumber:
          p.transactionReference ||
          p.referenceNumber ||
          `REF-${String(p.id || "").slice(0, 8).toUpperCase()}`,
        notes: p.notes || "Escrow Merchant Settlement",
      };
    },
    [user]
  );

  const loadPayouts = useCallback(async () => {
    if (!targetSellerId) return;
    setIsLoading(true);

    let connected = false;
    let dbPayments: CustomerPaymentRecord[] = [];
    const mergedPayouts: PayoutTransaction[] = [];

    try {
      const [localPaymentsRes, gatewayPayoutsRes, overviewRes] = await Promise.allSettled([
        fetch(`/api/payments?sellerId=${encodeURIComponent(targetSellerId)}`).then((r) => r.json()),
        sellerService.getPayouts(1, 50),
        sellerService.getOverview(),
      ]);

      // 1. Direct DB payments + payouts for this seller
      if (localPaymentsRes.status === "fulfilled" && localPaymentsRes.value?.success) {
        connected = true;
        if (Array.isArray(localPaymentsRes.value.payments)) {
          dbPayments = localPaymentsRes.value.payments.map((p: any) => ({
            id: String(p.id || ""),
            transactionReference: String(p.transactionReference || ""),
            providerReference: p.providerReference || null,
            orderId: p.orderId || null,
            orderNumber: String(p.orderNumber || "MX-ORDER"),
            orderStatus: p.orderStatus || null,
            orderPaymentStatus: p.orderPaymentStatus || null,
            customerId: p.customerId || null,
            customerName: String(p.customerName || "Customer"),
            customerPhone: String(p.customerPhone || "—"),
            customerEmail: String(p.customerEmail || ""),
            deliveryAddress: String(p.deliveryAddress || "Addis Ababa"),
            orderNotes: p.orderNotes || "",
            items: Array.isArray(p.items) ? p.items : [],
            itemsSummary: String(p.itemsSummary || "Catalog Order"),
            itemsCount: Number(p.itemsCount || (Array.isArray(p.items) ? p.items.length : 1)),
            amount: Number(p.amount || 0),
            subtotalAmount: p.subtotalAmount != null ? Number(p.subtotalAmount) : null,
            deliveryFee: p.deliveryFee != null ? Number(p.deliveryFee) : null,
            currency: String(p.currency || "ETB"),
            provider: String(p.provider || "CHAPA"),
            status: String(p.status || "COMPLETED").toUpperCase(),
            escrowStatus: String(p.escrowStatus || "HELD").toUpperCase(),
            paymentReceiptUrl: p.paymentReceiptUrl || null,
            bankName: p.bankName || null,
            depositorName: p.depositorName || null,
            bankTransactionRef: p.bankTransactionRef || null,
            maskedCardNumber: p.maskedCardNumber || null,
            chapaReward: p.chapaReward || null,
            payoutInfo: p.payoutInfo || null,
            verifiedAt: p.verifiedAt || null,
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt,
            metadata: p.metadata || {},
          }));
        }

        if (Array.isArray(localPaymentsRes.value.payouts)) {
          for (const pr of localPaymentsRes.value.payouts) {
            mergedPayouts.push(mapRawPayout(pr));
          }
        }
      }

      // 2. Microservice payouts merge
      if (gatewayPayoutsRes.status === "fulfilled" && Array.isArray(gatewayPayoutsRes.value?.data)) {
        connected = true;
        for (const gp of gatewayPayoutsRes.value.data) {
          const alreadyExists = mergedPayouts.some(
            (existing) => existing.fullId && gp.id && existing.fullId === gp.id
          );
          if (!alreadyExists) {
            mergedPayouts.push(mapRawPayout(gp));
          }
        }
      }

      setCustomerPayments(dbPayments);
      setTransactions(mergedPayouts);

      // 3. Sync overview balance metrics
      const paidRecords = dbPayments.filter(
        (p) => p.status === "COMPLETED" || p.status === "RELEASED"
      );
      const grossFromPayments = paidRecords.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      const heldFromPayments = paidRecords
        .filter((p) => p.status === "COMPLETED" && p.escrowStatus === "HELD")
        .reduce((acc, p) => acc + Number(p.amount || 0), 0);
      const clearedFromPayments = Math.max(0, grossFromPayments - heldFromPayments);

      if (overviewRes.status === "fulfilled" && overviewRes.value?.finances) {
        const f = overviewRes.value.finances;
        const gross = Math.max(Number(f.grossSales || 0), grossFromPayments);
        const pending = Math.max(Number(f.pendingEscrowBalance || 0), heldFromPayments);
        const payoutsDone = Number(f.totalPayoutsReceived || 0);
        const avail = Math.max(0, gross - pending - payoutsDone);
        setStats({
          availablePayout: avail,
          pendingEscrow: pending,
        });
      } else {
        setStats({
          availablePayout: clearedFromPayments,
          pendingEscrow: heldFromPayments,
        });
      }

      setIsLiveConnected(connected);
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [targetSellerId, mapRawPayout, setStats]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  // Derived financial metrics from actual payment records
  const paymentMetrics = useMemo(() => {
    const confirmed = customerPayments.filter(
      (p) => p.status === "COMPLETED" || p.status === "RELEASED"
    );
    const escrowHeld = confirmed.filter(
      (p) => p.status === "COMPLETED" && p.escrowStatus === "HELD"
    );
    const released = customerPayments.filter(
      (p) => p.status === "RELEASED" || p.escrowStatus === "RELEASED"
    );
    const pendingReview = customerPayments.filter((p) => p.status === "PENDING");
    const initiatedOnly = customerPayments.filter((p) => p.status === "INITIATED");

    const grossTotal = confirmed.reduce((s, p) => s + p.amount, 0);
    const heldTotal = escrowHeld.reduce((s, p) => s + p.amount, 0);
    const pendingTotal = pendingReview.reduce((s, p) => s + p.amount, 0);
    const releasedGross = released.reduce((s, p) => s + p.amount, 0);
    const netDisbursed = transactions
      .filter((t) => t.status === "Completed")
      .reduce((s, t) => s + t.netAmount, 0);
    const feesPaid = transactions.reduce((s, t) => s + t.fee, 0);

    // Channel breakdown for paid records
    const channels = {
      chapa: { count: 0, amount: 0 },
      telebirr: { count: 0, amount: 0 },
      bank: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
    };

    for (const p of confirmed) {
      const label = formatProviderLabel(p.provider, p.metadata);
      if (label === "MercatoX Card") {
        channels.card.count += 1;
        channels.card.amount += p.amount;
      } else if (label === "Telebirr") {
        channels.telebirr.count += 1;
        channels.telebirr.amount += p.amount;
      } else if (label.includes("Bank")) {
        channels.bank.count += 1;
        channels.bank.amount += p.amount;
      } else {
        channels.chapa.count += 1;
        channels.chapa.amount += p.amount;
      }
    }

    return {
      confirmedCount: confirmed.length,
      escrowHeldCount: escrowHeld.length,
      pendingCount: pendingReview.length,
      initiatedCount: initiatedOnly.length,
      grossTotal,
      heldTotal,
      pendingTotal,
      releasedGross,
      netDisbursed,
      feesPaid,
      channels,
    };
  }, [customerPayments, transactions]);

  const effectiveAvailable = Math.max(
    availablePayout,
    Math.max(0, paymentMetrics.grossTotal - paymentMetrics.heldTotal - paymentMetrics.netDisbursed)
  );
  const effectivePendingEscrow = Math.max(pendingEscrow, paymentMetrics.heldTotal);

  const handlePreset = (pct: number) => {
    const val = Math.floor(effectiveAvailable * pct);
    setWithdrawAmount(val.toString());
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (amountNum > effectiveAvailable) {
      toast.error(`Amount exceeds available balance of ETB ${effectiveAvailable.toLocaleString()}`);
      return;
    }

    if (amountNum < 500) {
      toast.error("Minimum payout withdrawal is ETB 500");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const refNum = `TB-ET-${Math.floor(100000 + Math.random() * 900000)}`;

      const newTx: PayoutTransaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Just now",
        destination: selectedMethod,
        accountNumber: user?.phoneNumber || "Merchant Wallet",
        accountHolderName: user?.name || "Merchant",
        amount: amountNum,
        fee: 0,
        netAmount: amountNum,
        status: "Processing",
        refNumber: refNum,
        notes: "Instant merchant withdrawal",
      };

      setTransactions((prev) => [newTx, ...prev]);
      setStats({
        availablePayout: Math.max(0, effectiveAvailable - amountNum),
      });

      setIsProcessing(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      setLedgerView("payouts");

      toast.success(`Withdrawal request of ETB ${amountNum.toLocaleString()} submitted!`, {
        description: `Reference: ${refNum}. Dispatched to your ${selectedMethod} destination.`,
      });
    }, 900);
  };

  const q = searchQuery.trim().toLowerCase();

  const filteredPayments = useMemo(() => {
    return customerPayments.filter((p) => {
      const statusUpper = p.status.toUpperCase();
      const escrowUpper = p.escrowStatus.toUpperCase();

      const matchesFilter =
        (paymentFilter === "all_active" && statusUpper !== "INITIATED") ||
        (paymentFilter === "completed" && statusUpper === "COMPLETED") ||
        (paymentFilter === "escrow" && escrowUpper === "HELD" && statusUpper === "COMPLETED") ||
        (paymentFilter === "released" && (statusUpper === "RELEASED" || escrowUpper === "RELEASED")) ||
        (paymentFilter === "pending" && statusUpper === "PENDING") ||
        (paymentFilter === "refunded_failed" && (statusUpper === "REFUNDED" || statusUpper === "FAILED")) ||
        (paymentFilter === "initiated" && statusUpper === "INITIATED");

      if (!matchesFilter) return false;
      if (!q) return true;

      return (
        p.id.toLowerCase().includes(q) ||
        p.transactionReference.toLowerCase().includes(q) ||
        (p.providerReference || "").toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        (p.orderId || "").toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerPhone.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q) ||
        p.itemsSummary.toLowerCase().includes(q) ||
        formatProviderLabel(p.provider, p.metadata).toLowerCase().includes(q) ||
        (p.bankName || "").toLowerCase().includes(q)
      );
    });
  }, [customerPayments, paymentFilter, q]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        payoutFilter === "all" ||
        (payoutFilter === "completed" && tx.status === "Completed") ||
        (payoutFilter === "processing" && tx.status === "Processing");

      if (!matchesStatus) return false;
      if (!q) return true;

      return (
        tx.id.toLowerCase().includes(q) ||
        (tx.fullId || "").toLowerCase().includes(q) ||
        (tx.paymentId || "").toLowerCase().includes(q) ||
        (tx.orderId || "").toLowerCase().includes(q) ||
        tx.refNumber.toLowerCase().includes(q) ||
        tx.destination.toLowerCase().includes(q) ||
        tx.accountNumber.toLowerCase().includes(q) ||
        tx.notes.toLowerCase().includes(q)
      );
    });
  }, [transactions, payoutFilter, q]);

  const activePaymentsCount = customerPayments.filter((p) => p.status !== "INITIATED").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-400" />
              Merchant Payouts & Payment Ledger
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                isLiveConnected
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              {isLiveConnected ? (
                <>
                  <Wifi className="h-2.5 w-2.5" /> Live Database
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" /> Connecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Complete customer payment records, payer details, order items, payment IDs, escrow status & disbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPayouts()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0d121f] px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Balance & Payment Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Customer Payments Received */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Total Customer Payments</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              ETB {paymentMetrics.grossTotal.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-indigo-300">
              <span>{paymentMetrics.confirmedCount} paid transactions</span>
              {paymentMetrics.pendingCount > 0 && (
                <span className="text-amber-300">+{paymentMetrics.pendingCount} pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Locked in Escrow Card */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Locked in Delivery Escrow</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              ETB {effectivePendingEscrow.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-300">
              <Clock className="h-3 w-3" />
              <span>{paymentMetrics.escrowHeldCount} payments held in escrow</span>
            </div>
          </div>
        </div>

        {/* Available / Cleared Payouts Card */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Cleared / Available Payout</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              ETB {effectiveAvailable.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-300">
              <span>Disbursed: ETB {paymentMetrics.netDisbursed.toLocaleString()}</span>
              {paymentMetrics.feesPaid > 0 && (
                <span className="text-white/50">Fees: ETB {paymentMetrics.feesPaid.toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Gateway Breakdown Card */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Payment Channels</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10.5px]">
            <div className="rounded-md bg-white/[0.04] px-2 py-1 flex items-center justify-between">
              <span className="text-cyan-300 font-medium">Chapa</span>
              <span className="font-mono text-white font-semibold">{paymentMetrics.channels.chapa.count}</span>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1 flex items-center justify-between">
              <span className="text-emerald-300 font-medium">Telebirr</span>
              <span className="font-mono text-white font-semibold">{paymentMetrics.channels.telebirr.count}</span>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1 flex items-center justify-between">
              <span className="text-purple-300 font-medium">CBE/Bank</span>
              <span className="font-mono text-white font-semibold">{paymentMetrics.channels.bank.count}</span>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1 flex items-center justify-between">
              <span className="text-indigo-300 font-medium">MX Card</span>
              <span className="font-mono text-white font-semibold">{paymentMetrics.channels.card.count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
        {/* View Switcher + Toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/[0.08] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Switch between Customer Payments and Disbursed Payouts */}
            <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setLedgerView("payments")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  ledgerView === "payments"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Receipt className="h-3.5 w-3.5" />
                <span>Customer Payments</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-white">
                  {activePaymentsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerView("payouts")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  ledgerView === "payouts"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Payout Settlements</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-white">
                  {transactions.length}
                </span>
              </button>
            </div>

            <div className="text-xs text-white/40">
              {ledgerView === "payments" ? (
                <>
                  Showing <span className="font-semibold text-white">{filteredPayments.length}</span> payments
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-white">{filteredTransactions.length}</span> settlements
                </>
              )}
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  ledgerView === "payments"
                    ? "Search Payment ID, Tx Ref, Order #, Customer, Product, Phone..."
                    : "Search Payout ID, Reference, Order ID, or Channel..."
                }
                className="h-8 w-full rounded-lg border border-white/[0.08] bg-[#090d16] pl-8 pr-3 text-xs text-white placeholder-white/30 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {ledgerView === "payments" ? (
              <div className="flex flex-wrap items-center gap-1 bg-[#090d16] p-0.5 rounded-lg border border-white/[0.08]">
                {[
                  { key: "all_active", label: "All Payments" },
                  { key: "completed", label: "Paid" },
                  { key: "escrow", label: "Escrow Held" },
                  { key: "released", label: "Released" },
                  { key: "pending", label: "Pending" },
                  { key: "refunded_failed", label: "Refunded / Failed" },
                  ...(paymentMetrics.initiatedCount > 0
                    ? [{ key: "initiated", label: `Initiated (${paymentMetrics.initiatedCount})` }]
                    : []),
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPaymentFilter(item.key)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      paymentFilter === item.key
                        ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-[#090d16] p-0.5 rounded-lg border border-white/[0.08]">
                {(["all", "completed", "processing"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPayoutFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors cursor-pointer ${
                      payoutFilter === st
                        ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VIEW 1: CUSTOMER PAYMENTS LEDGER */}
        {ledgerView === "payments" ? (
          filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-xs text-zinc-400">
              <Receipt className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <p className="font-medium text-white">No Customer Payment Records Found</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                All payments made by customers for your orders (Chapa, Telebirr, CBE, MercatoX Card) will display here with full payer and order details.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Customer Payments Cards (md:hidden) */}
              <div className="md:hidden divide-y divide-white/[0.06]">
                {filteredPayments.map((p) => {
                  const statusInfo = getPaymentStatusBadge(p.status);
                  const escrowInfo = getEscrowBadge(p.escrowStatus);
                  const provStyle = getProviderBadgeStyle(p.provider, p.metadata);
                  const StatusIcon = statusInfo.Icon;
                  const ProvIcon = provStyle.Icon;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPayment(p)}
                      className="p-3.5 space-y-2.5 hover:bg-white/[0.02] cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-white text-xs truncate">
                              ID: {p.id.slice(0, 12)}...
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, p.id, "Payment ID")}
                              className="text-white/40 hover:text-white p-0.5"
                              title="Copy Payment ID"
                            >
                              {copiedText === p.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10.5px] font-mono text-cyan-300/80 truncate">
                            Tx: {p.transactionReference}
                          </div>
                          <div className="text-[10px] text-white/45 mt-0.5">
                            {formatDateTime(p.createdAt)}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-extrabold text-cyan-300 text-sm">
                            {p.currency} {p.amount.toLocaleString()}
                          </div>
                          <span
                            className={`mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${statusInfo.cls}`}
                          >
                            <StatusIcon className="h-2.5 w-2.5" />
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Payer & Order Info */}
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white flex items-center gap-1.5 truncate">
                            <User className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            {p.customerName}
                          </span>
                          <span className="text-[10.5px] font-mono text-white/60 shrink-0">
                            {p.customerPhone}
                          </span>
                        </div>

                        <div className="text-[11px] text-white/75 flex items-start gap-1.5">
                          <Package className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            <strong className="text-white font-mono">{p.orderNumber}:</strong>{" "}
                            {p.itemsSummary}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${provStyle.bg}`}
                          >
                            <ProvIcon className="h-2.5 w-2.5" />
                            {formatProviderLabel(p.provider, p.metadata)}
                          </span>

                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${escrowInfo.cls}`}
                          >
                            {escrowInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(p);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 hover:text-indigo-200"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Full Payment Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Customer Payments Table (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.015] text-[11px] font-semibold text-white/55">
                      <th className="py-2.5 px-3">Payment ID & Tx Ref</th>
                      <th className="py-2.5 px-3">Customer (Who Paid)</th>
                      <th className="py-2.5 px-3">Order & Products Paid For</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3 text-right">Amount Paid</th>
                      <th className="py-2.5 px-3">Status & Escrow</th>
                      <th className="py-2.5 px-3 text-right">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredPayments.map((p) => {
                      const statusInfo = getPaymentStatusBadge(p.status);
                      const escrowInfo = getEscrowBadge(p.escrowStatus);
                      const provStyle = getProviderBadgeStyle(p.provider, p.metadata);
                      const StatusIcon = statusInfo.Icon;
                      const ProvIcon = provStyle.Icon;

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPayment(p)}
                          className="hover:bg-white/[0.03] transition-colors cursor-pointer align-top"
                        >
                          {/* Column 1: Payment ID & Ref & Date */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-mono font-bold text-white text-[11.5px]"
                                title={p.id}
                              >
                                {p.id.length > 14 ? `${p.id.slice(0, 8)}...${p.id.slice(-4)}` : p.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(e, p.id, "Payment ID")}
                                className="rounded p-0.5 text-white/35 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Copy full Payment ID"
                              >
                                {copiedText === p.id ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 font-mono text-[10.5px] text-cyan-300/85">
                              <span className="truncate max-w-[165px]" title={p.transactionReference}>
                                {p.transactionReference}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopy(e, p.transactionReference, "Tx Ref")}
                                className="text-white/30 hover:text-white cursor-pointer"
                                title="Copy Transaction Reference"
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/45">
                              {formatDateTime(p.createdAt)}
                            </div>
                          </td>

                          {/* Column 2: Customer (Who Paid) */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{p.customerName}</div>
                            <div className="mt-0.5 text-[11px] font-mono text-white/65">
                              {p.customerPhone}
                            </div>
                            {p.customerEmail && (
                              <div
                                className="mt-0.5 text-[10.5px] text-white/45 truncate max-w-[180px]"
                                title={p.customerEmail}
                              >
                                {p.customerEmail}
                              </div>
                            )}
                          </td>

                          {/* Column 3: Order & Products */}
                          <td className="py-3 px-3 max-w-[260px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-indigo-300 text-[11px]">
                                {p.orderNumber}
                              </span>
                              {p.orderStatus && (
                                <span className="rounded bg-white/[0.06] px-1.5 py-0.2 text-[9.5px] font-medium text-white/70 border border-white/10">
                                  {p.orderStatus}
                                </span>
                              )}
                            </div>
                            <div
                              className="mt-1 text-[11px] text-white/80 line-clamp-2"
                              title={p.itemsSummary}
                            >
                              {p.itemsSummary}
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/40 truncate">
                              {p.deliveryAddress}
                            </div>
                          </td>

                          {/* Column 4: Payment Method */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border ${provStyle.bg}`}
                            >
                              <ProvIcon className="h-3 w-3" />
                              {formatProviderLabel(p.provider, p.metadata)}
                            </span>
                            {(p.bankName || p.maskedCardNumber || p.providerReference) && (
                              <div className="mt-1 text-[10px] font-mono text-white/45 truncate max-w-[150px]">
                                {p.maskedCardNumber ||
                                  p.bankName ||
                                  (p.providerReference && p.providerReference !== p.transactionReference
                                    ? `Ref: ${p.providerReference}`
                                    : "")}
                              </div>
                            )}
                          </td>

                          {/* Column 5: Amount Paid */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="font-mono font-extrabold text-cyan-300 text-sm">
                              {p.currency} {p.amount.toLocaleString()}
                            </div>
                            {p.payoutInfo ? (
                              <div className="mt-0.5 text-[10px] font-mono text-emerald-300/80">
                                Net: {p.currency} {Number(p.payoutInfo.netPayoutAmount).toLocaleString()}
                              </div>
                            ) : p.subtotalAmount != null ? (
                              <div className="mt-0.5 text-[10px] font-mono text-white/40">
                                Sub: {p.subtotalAmount.toLocaleString()} + Fee:{" "}
                                {(p.deliveryFee ?? 0).toLocaleString()}
                              </div>
                            ) : null}
                          </td>

                          {/* Column 6: Status & Escrow */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                              <span
                                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-semibold border ${statusInfo.cls}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
                              <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium border ${escrowInfo.cls}`}
                              >
                                {escrowInfo.label}
                              </span>
                            </div>
                          </td>

                          {/* Column 7: Action */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPayment(p);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/85 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-white transition-colors cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )
        ) : /* VIEW 2: DISBURSED PAYOUT SETTLEMENTS */
        filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-xs text-zinc-400">
            <Wallet className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="font-medium text-white">No Disbursed Payout Records Found</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Completed escrow settlements released to your bank or Telebirr account will appear here. Check the Customer Payments tab for all incoming payments.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Payouts Card List (md:hidden) */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <div key={tx.fullId || tx.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{tx.id}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">Ref: {tx.refNumber}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{tx.date}</span>
                    </div>

                    {tx.status === "Completed" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-bold text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Disbursed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10.5px] font-bold text-amber-400 border border-amber-500/30">
                        <Clock className="h-3 w-3" /> Processing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-medium text-white">{tx.destination}</span>
                      <span className="text-[10px] font-mono text-zinc-500">({tx.accountNumber})</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        ETB {tx.netAmount.toLocaleString()}
                      </span>
                      {tx.fee > 0 && (
                        <div className="text-[10px] font-mono text-white/40">
                          Fee: ETB {tx.fee.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Payouts Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[11px] font-semibold text-white/50">
                    <th className="py-2.5 px-3">Payout ID</th>
                    <th className="py-2.5 px-3">Linked Payment / Order</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Destination Channel</th>
                    <th className="py-2.5 px-3 text-right">Gross / Fee</th>
                    <th className="py-2.5 px-3 text-right">Net Disbursed</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.fullId || tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-white/90" title={tx.fullId}>
                        {tx.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10.5px] text-white/60">
                        {tx.paymentId ? (
                          <div title={tx.paymentId}>Pay: {tx.paymentId.slice(0, 8)}...</div>
                        ) : (
                          <div>—</div>
                        )}
                        {tx.orderId && (
                          <div className="text-white/40" title={tx.orderId}>
                            Ord: {tx.orderId.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-white/60">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                          <div>
                            <div className="font-medium text-white">{tx.destination}</div>
                            <div className="text-[10px] text-white/45 font-mono">
                              {tx.accountNumber}
                              {tx.accountHolderName ? ` • ${tx.accountHolderName}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px] text-white/60">
                        <div>ETB {tx.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-amber-300/80">
                          Fee: ETB {tx.fee.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-300 font-mono">
                        ETB {tx.netAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-white/70">
                        {tx.refNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        {tx.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Disbursed
                          </span>
                        ) : tx.status === "Failed" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-rose-400 border border-rose-500/20">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Processing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Comprehensive Payment Information Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            className="app-modal-window w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-indigo-400" />
                    Complete Payment Information
                  </h3>
                  {(() => {
                    const b = getPaymentStatusBadge(selectedPayment.status);
                    const Ico = b.Icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-semibold border ${b.cls}`}
                      >
                        <Ico className="h-3 w-3" />
                        {b.label}
                      </span>
                    );
                  })()}
                  {(() => {
                    const eb = getEscrowBadge(selectedPayment.escrowStatus);
                    return (
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-[10.5px] font-semibold border ${eb.cls}`}
                      >
                        {eb.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-[11px] text-white/50 mt-1">
                  Recorded on {formatDateTime(selectedPayment.createdAt)}
                  {selectedPayment.verifiedAt ? ` • Verified ${formatDateTime(selectedPayment.verifiedAt)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Payment IDs & References Grid */}
            <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-3.5 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-indigo-400" />
                Payment & Order Identifiers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                  <div className="text-[10px] text-white/45">Payment ID</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-white text-[11px] break-all">{selectedPayment.id}</span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, selectedPayment.id, "Payment ID")}
                      className="text-white/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                  <div className="text-[10px] text-white/45">Transaction Reference</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-cyan-300 text-[11px] break-all">
                      {selectedPayment.transactionReference}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, selectedPayment.transactionReference, "Transaction Reference")}
                      className="text-white/40 hover:text-white shrink-0 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                  <div className="text-[10px] text-white/45">Order Number & Order ID</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-indigo-300 text-xs">
                        {selectedPayment.orderNumber}
                      </div>
                      {selectedPayment.orderId && (
                        <div className="font-mono text-[10px] text-white/45 break-all">
                          {selectedPayment.orderId}
                        </div>
                      )}
                    </div>
                    {selectedPayment.orderId && (
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, selectedPayment.orderId!, "Order ID")}
                        className="text-white/40 hover:text-white shrink-0 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                  <div className="text-[10px] text-white/45">Gateway / Provider Reference</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-white/85 text-[11px] break-all">
                      {selectedPayment.providerReference || "—"}
                    </span>
                    {selectedPayment.providerReference && (
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, selectedPayment.providerReference!, "Provider Ref")}
                        className="text-white/40 hover:text-white shrink-0 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Who Paid (Customer Details) & How Paid (Channel Details) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-3.5 space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  Payer Information (Who Paid)
                </div>
                <div className="space-y-1.5">
                  <div className="font-semibold text-white text-sm">{selectedPayment.customerName}</div>
                  <div className="flex items-center gap-1.5 text-white/70 font-mono text-[11px]">
                    <Phone className="h-3 w-3 text-white/40 shrink-0" />
                    <span>{selectedPayment.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-[11px] break-all">
                    <Mail className="h-3 w-3 text-white/40 shrink-0" />
                    <span>{selectedPayment.customerEmail || "Not provided"}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-white/65 text-[11px]">
                    <MapPin className="h-3 w-3 text-white/40 shrink-0 mt-0.5" />
                    <span>{selectedPayment.deliveryAddress}</span>
                  </div>
                  {selectedPayment.customerId && (
                    <div className="text-[10px] font-mono text-white/40 pt-1 border-t border-white/[0.05]">
                      Customer ID: {selectedPayment.customerId}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-3.5 space-y-2 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
                  Amount & Payment Channel
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-white/60">Total Paid:</span>
                    <span className="font-mono text-lg font-black text-cyan-300">
                      {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                    </span>
                  </div>
                  {selectedPayment.subtotalAmount != null && (
                    <div className="flex justify-between text-[11px] text-white/65">
                      <span>Order Subtotal:</span>
                      <span className="font-mono">
                        {selectedPayment.currency} {selectedPayment.subtotalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedPayment.deliveryFee != null && (
                    <div className="flex justify-between text-[11px] text-white/65">
                      <span>Delivery Fee:</span>
                      <span className="font-mono">
                        {selectedPayment.currency} {selectedPayment.deliveryFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] pt-1 border-t border-white/[0.05]">
                    <span className="text-white/60">Gateway / Method:</span>
                    <span className="font-semibold text-white">
                      {formatProviderLabel(selectedPayment.provider, selectedPayment.metadata)}
                    </span>
                  </div>
                  {selectedPayment.bankName && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">Bank:</span>
                      <span className="text-white">{selectedPayment.bankName}</span>
                    </div>
                  )}
                  {selectedPayment.depositorName && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">Depositor:</span>
                      <span className="text-white">{selectedPayment.depositorName}</span>
                    </div>
                  )}
                  {selectedPayment.bankTransactionRef && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">Bank Slip Ref:</span>
                      <span className="font-mono text-white">{selectedPayment.bankTransactionRef}</span>
                    </div>
                  )}
                  {selectedPayment.maskedCardNumber && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">MercatoX Card:</span>
                      <span className="font-mono text-indigo-300">{selectedPayment.maskedCardNumber}</span>
                    </div>
                  )}
                  {selectedPayment.orderStatus && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/60">Order Fulfillment:</span>
                      <span className="font-semibold text-white">{selectedPayment.orderStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* What They Paid For (Order Items Breakdown) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-amber-400" />
                  Items Paid For ({selectedPayment.items.length || selectedPayment.itemsCount})
                </div>
                {selectedPayment.orderNotes && (
                  <span className="text-[10.5px] text-white/50 italic truncate max-w-[260px]">
                    Note: {selectedPayment.orderNotes}
                  </span>
                )}
              </div>

              {selectedPayment.items.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06] text-[10.5px] text-white/50">
                        <th className="py-2 px-2.5">Product</th>
                        <th className="py-2 px-2.5 text-center">Qty</th>
                        <th className="py-2 px-2.5 text-right">Unit Price</th>
                        <th className="py-2 px-2.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {selectedPayment.items.map((item, idx) => (
                        <tr key={`${item.id || item.productId || idx}`}>
                          <td className="py-2 px-2.5">
                            <div className="font-medium text-white">{item.title || item.name}</div>
                            {(item.productId || item.id) && (
                              <div className="text-[10px] font-mono text-white/40">
                                ID: {item.productId || item.id}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono text-white/80">
                            {item.quantity} {item.unitOfMeasure ? item.unitOfMeasure.toLowerCase() : ""}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono text-white/70">
                            {selectedPayment.currency} {Number(item.unitPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-semibold text-cyan-300">
                            {selectedPayment.currency} {Number(item.totalPrice || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-xs text-white/70">{selectedPayment.itemsSummary}</div>
              )}
            </div>

            {/* Linked Payout Settlement or Receipt Info */}
            {(selectedPayment.payoutInfo || selectedPayment.paymentReceiptUrl) && (
              <div className="rounded-xl border border-white/[0.08] bg-[#090d16] p-3.5 space-y-2 text-xs">
                {selectedPayment.payoutInfo && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Payout Settlement Record
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-white/45 block">Payout ID</span>
                        <span className="font-mono text-white">{selectedPayment.payoutInfo.id.slice(0, 12)}...</span>
                      </div>
                      <div>
                        <span className="text-white/45 block">Platform Fee</span>
                        <span className="font-mono text-amber-300">
                          ETB {Number(selectedPayment.payoutInfo.platformFee || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/45 block">Net Payout</span>
                        <span className="font-mono font-bold text-emerald-300">
                          ETB {Number(selectedPayment.payoutInfo.netPayoutAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      {selectedPayment.payoutInfo.bankName && (
                        <div>
                          <span className="text-white/45 block">Bank & Account</span>
                          <span className="text-white">
                            {selectedPayment.payoutInfo.bankName} ({selectedPayment.payoutInfo.bankAccountNumber})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPayment.paymentReceiptUrl && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-white/60 text-[11px]">Receipt / Gateway Reference URL:</span>
                    <a
                      href={selectedPayment.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-semibold text-[11px]"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
          <div className="app-modal-window w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d121f] p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  Initiate Merchant Payout
                </h3>
                <p className="text-[11px] text-white/50">Disburse funds from cleared escrow balance</p>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="rounded-lg p-1 text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70 font-medium">Available to Withdraw</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ETB {effectiveAvailable.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount in ETB..."
                    min="500"
                    max={effectiveAvailable}
                    className="w-full h-10 rounded-xl border border-white/[0.12] bg-[#090d16] px-3 text-sm font-mono font-semibold text-white placeholder-white/30 focus:border-indigo-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 font-bold">
                    ETB
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5">
                  {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePreset(pct)}
                      className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.02] py-1 text-[10.5px] font-mono font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
                    >
                      {pct === 1.0 ? "MAX" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Destination Payout Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Telebirr", "CBE", "Dashen"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMethod(m)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedMethod === m
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-white/[0.08] bg-[#090d16] text-white/60 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-bold">{m}</div>
                      <div className="text-[10px] text-white/40">Verified</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || effectiveAvailable <= 0}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-xs text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isProcessing ? "Processing Transfer..." : "Confirm & Transfer Funds"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
