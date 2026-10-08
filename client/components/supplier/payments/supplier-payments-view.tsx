"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ShieldCheck,
  Building2,
  Download,
  AlertCircle,
  Copy,
  Check,
  Search,
  Filter,
  RotateCcw,
  FileText,
  Printer,
  BadgeCheck,
  TrendingUp,
  Smartphone,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Lock,
  Unlock,
  Eye,
  Info,
  CheckCircle2,
  Landmark,
  X,
  CreditCard,
  Plus,
  SlidersHorizontal,
  Grid,
  List,
  Calendar,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  Zap,
  Globe,
  HelpCircle,
  AlertTriangle,
  Percent,
  Trash2,
  Star,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore, getBankShortCode, getBankAccentColor } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { PaymentTransaction, SettlementAccount } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierPaymentsView() {
  const {
    transactions,
    setActiveTab,
    requestWithdrawal,
    releaseEscrow,
    settlementAccounts,
    addSettlementAccount,
    deleteSettlementAccount,
    setDefaultSettlementAccount,
    profile,
  } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  // Primary navigation & view states
  const [activeViewMode, setActiveViewMode] = useState<"table" | "grid">("table");
  const [currencyMode, setCurrencyMode] = useState<"ETB" | "USD">("ETB");
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"date" | "amount" | "company">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAccountsStrip, setShowAccountsStrip] = useState(true);
  const [showAnalyticsStrip, setShowAnalyticsStrip] = useState(true);

  // Modals state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<PaymentTransaction | null>(null);
  const [selectedEscrowTx, setSelectedEscrowTx] = useState<PaymentTransaction | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawDestination, setWithdrawDestination] = useState<string>("");
  const [withdrawNote, setWithdrawNote] = useState("");

  // New Account form state
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountHolder, setNewAccountHolder] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newAccountType, setNewAccountType] = useState<string>("Primary Escrow");
  const [isDefaultAccount, setIsDefaultAccount] = useState(false);

  // Keep destination auto-selected if empty
  useEffect(() => {
    if (!withdrawDestination && settlementAccounts.length > 0) {
      const def = settlementAccounts.find((a) => a.isDefault) || settlementAccounts[0];
      setWithdrawDestination(`${def.bankName} (${def.shortCode} - ${def.accountNumber})`);
    }
  }, [settlementAccounts, withdrawDestination]);

  // Pre-fill holder name with business name when opening modal if empty
  useEffect(() => {
    if (isAddAccountModalOpen && !newAccountHolder) {
      setNewAccountHolder(profile?.businessName || "");
    }
  }, [isAddAccountModalOpen, newAccountHolder, profile?.businessName]);

  const pageSize = 8;
  const usdRate = 132.5; // Indicative NBE official commercial rate

  // Financial calculations
  const totalVolume = useMemo(() => {
    return transactions.reduce((acc, tx) => acc + (tx.status !== "failed" ? tx.amount : 0), 0);
  }, [transactions]);

  const escrowBalance = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === "escrow_held")
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const completedVolume = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === "completed")
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const pendingVolume = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === "pending")
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  const refundedVolume = useMemo(() => {
    return transactions
      .filter((tx) => tx.status === "refunded")
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions]);

  // Available balance
  const availableBalance = useMemo(() => {
    const baseSettled = completedVolume;
    const pendingWithdrawals = transactions
      .filter((tx) => tx.status === "pending" && tx.buyerCompany.includes("Treasury Payout"))
      .reduce((acc, tx) => acc + tx.amount, 0);
    return Math.max(0, baseSettled - pendingWithdrawals);
  }, [transactions, completedVolume]);

  // Escrow Milestones breakdown
  const escrowStageStats = useMemo(() => {
    const held = transactions.filter((t) => t.status === "escrow_held");
    const depositCount = held.filter((t) => !t.escrowMilestone || t.escrowMilestone === "deposit_confirmed").length;
    const depositAmt = held
      .filter((t) => !t.escrowMilestone || t.escrowMilestone === "deposit_confirmed")
      .reduce((s, t) => s + t.amount, 0);

    const transitCount = held.filter((t) => t.escrowMilestone === "goods_in_transit").length;
    const transitAmt = held
      .filter((t) => t.escrowMilestone === "goods_in_transit")
      .reduce((s, t) => s + t.amount, 0);

    const inspectionCount = held.filter((t) => t.escrowMilestone === "inspection_pending").length;
    const inspectionAmt = held
      .filter((t) => t.escrowMilestone === "inspection_pending")
      .reduce((s, t) => s + t.amount, 0);

    const releasedCount = transactions.filter((t) => t.escrowMilestone === "funds_released").length;
    const releasedAmt = transactions
      .filter((t) => t.escrowMilestone === "funds_released")
      .reduce((s, t) => s + t.amount, 0);

    return {
      deposit: { count: depositCount, amount: depositAmt },
      transit: { count: transitCount, amount: transitAmt },
      inspection: { count: inspectionCount, amount: inspectionAmt },
      released: { count: releasedCount, amount: releasedAmt },
    };
  }, [transactions]);

  // Chart Datasets for Cashflow velocity
  const chartDatasets = {
    "7D": [
      { label: "Mon", inflow: 420000, escrow: 950000, fee: 6300 },
      { label: "Tue", inflow: 680000, escrow: 1200000, fee: 10200 },
      { label: "Wed", inflow: 1150000, escrow: 1750000, fee: 17250 },
      { label: "Thu", inflow: 1420000, escrow: 2100000, fee: 21300 },
      { label: "Fri", inflow: 980000, escrow: 1400000, fee: 14700 },
      { label: "Sat", inflow: 510000, escrow: 800000, fee: 7650 },
      { label: "Sun", inflow: 790000, escrow: 950000, fee: 11850 },
    ],
    "30D": [
      { label: "Week 1", inflow: 2850000, escrow: 3900000, fee: 42750 },
      { label: "Week 2", inflow: 3450000, escrow: 4800000, fee: 51750 },
      { label: "Week 3", inflow: 3120000, escrow: 4100000, fee: 46800 },
      { label: "Week 4", inflow: 4580000, escrow: 5900000, fee: 68700 },
    ],
    "90D": [
      { label: "Aug", inflow: 8900000, escrow: 11400000, fee: 133500 },
      { label: "Sep", inflow: 10400000, escrow: 13800000, fee: 156000 },
      { label: "Oct", inflow: 13200000, escrow: 17100000, fee: 198000 },
    ],
  };

  const activeChartData = chartDatasets[timeframe];
  const maxChartVal = Math.max(...activeChartData.map((d) => d.escrow));

  // Channel Distribution Breakdown
  // Dynamic Channel Distribution Breakdown
  const channelDistribution = useMemo(() => {
    if (transactions.length === 0) return [];
    const total = transactions.reduce((acc, tx) => acc + tx.amount, 0) || 1;
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      const key = tx.paymentMethod || "Other";
      map[key] = (map[key] || 0) + tx.amount;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      pct: Math.round((amount / total) * 100),
      color: getBankAccentColor(name),
    }));
  }, [transactions]);

  // Format currency helper
  const formatMoney = (amountETB: number) => {
    if (currencyMode === "USD") {
      const inUSD = amountETB / usdRate;
      return `$${inUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `ETB ${amountETB.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatShortMoney = (amountETB: number) => {
    if (currencyMode === "USD") {
      const inUSD = amountETB / usdRate;
      return `$${(inUSD / 1000).toFixed(1)}k`;
    }
    return `ETB ${(amountETB / 1000000).toFixed(2)}M`;
  };

  // Dynamically extract all available payment methods for filtering
  const availableFilterMethods = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.paymentMethod) set.add(tx.paymentMethod);
    });
    settlementAccounts.forEach((acc) => {
      if (acc.bankName) set.add(acc.bankName);
    });
    return Array.from(set);
  }, [transactions, settlementAccounts]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          tx.transactionNumber.toLowerCase().includes(q) ||
          tx.buyerCompany.toLowerCase().includes(q) ||
          tx.orderNumber.toLowerCase().includes(q) ||
          tx.referenceNumber.toLowerCase().includes(q) ||
          (tx.buyerTIN && tx.buyerTIN.toLowerCase().includes(q));

        const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
        const matchesMethod = methodFilter === "all" || tx.paymentMethod === methodFilter;

        let matchesMilestone = true;
        if (milestoneFilter) {
          if (milestoneFilter === "deposit_confirmed") {
            matchesMilestone =
              tx.status === "escrow_held" &&
              (!tx.escrowMilestone || tx.escrowMilestone === "deposit_confirmed");
          } else if (milestoneFilter === "goods_in_transit") {
            matchesMilestone =
              tx.status === "escrow_held" && tx.escrowMilestone === "goods_in_transit";
          } else if (milestoneFilter === "inspection_pending") {
            matchesMilestone =
              tx.status === "escrow_held" && tx.escrowMilestone === "inspection_pending";
          } else if (milestoneFilter === "funds_released") {
            matchesMilestone =
              tx.status === "completed" || tx.escrowMilestone === "funds_released";
          }
        }

        return matchesSearch && matchesStatus && matchesMethod && matchesMilestone;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "date") {
          diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortField === "amount") {
          diff = b.amount - a.amount;
        } else if (sortField === "company") {
          diff = a.buyerCompany.localeCompare(b.buyerCompany);
        }
        return sortOrder === "desc" ? diff : -diff;
      });
  }, [transactions, searchQuery, statusFilter, methodFilter, milestoneFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(id);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Withdrawal Submit
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawDestination.trim()) {
      toast.error("Please link and select a settlement destination account first.");
      return;
    }
    if (withdrawAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    if (withdrawAmount > availableBalance) {
      toast.error("Withdrawal amount cannot exceed available treasury balance.");
      return;
    }
    requestWithdrawal(withdrawAmount, withdrawDestination, withdrawNote);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount(Math.min(50000, availableBalance));
    setWithdrawNote("");
  };

  // Quick preset calculation for withdrawal
  const handleQuickPreset = (percent: number) => {
    const calculated = Math.floor((availableBalance * percent) / 100);
    setWithdrawAmount(calculated);
  };

  // Add new account submit
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      toast.error("Please enter a financial institution / bank name.");
      return;
    }
    if (!newAccountNumber.trim()) {
      toast.error("Please specify a valid account number or merchant ID.");
      return;
    }

    const short = getBankShortCode(newBankName.trim());
    const accent = getBankAccentColor(newBankName.trim());

    addSettlementAccount({
      bankName: newBankName.trim(),
      shortCode: short,
      accountNumber: newAccountNumber.trim(),
      accountName: newAccountHolder.trim() || profile?.businessName || "Authorized Corporate Account",
      branch: newBranch.trim() || "Main / Electronic Rail",
      type: (newAccountType as any) || "Primary Escrow",
      clearingTime: newBankName.toLowerCase().includes("telebirr")
        ? "Instant Real-Time (<60s)"
        : "RTGS (1-3 hrs)",
      dailyLimit: "ETB 25,000,000",
      isDefault: settlementAccounts.length === 0 || isDefaultAccount,
      accentColor: accent,
    });

    setIsAddAccountModalOpen(false);
    setNewBankName("");
    setNewAccountNumber("");
    setNewAccountHolder("");
    setNewBranch("");
    setIsDefaultAccount(false);
    toast.success(`Verified settlement account for ${newBankName} added successfully.`);
  };

  // Payment method badge styling helper tailored for Light, Dark, and System
  const getMethodBadge = (method: string) => {
    if (method.includes("Escrow")) {
      return {
        bg: isLight
          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
          : isSystem
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 font-semibold"
          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold",
        icon: ShieldCheck,
        short: "Escrow",
      };
    }
    if (method.includes("Telebirr")) {
      return {
        bg: isLight
          ? "bg-blue-50 text-blue-800 border-blue-300 font-semibold"
          : isSystem
          ? "bg-cyan-500/15 text-cyan-300 border-cyan-400/30 font-semibold"
          : "bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold",
        icon: Smartphone,
        short: "Telebirr",
      };
    }
    if (method.includes("Commercial Bank") || method.includes("CBE")) {
      return {
        bg: isLight
          ? "bg-purple-50 text-purple-800 border-purple-300 font-semibold"
          : isSystem
          ? "bg-purple-500/20 text-purple-300 border-purple-400/30 font-semibold"
          : "bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold",
        icon: Landmark,
        short: "CBE RTGS",
      };
    }
    if (method.includes("Awash")) {
      return {
        bg: isLight
          ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
          : isSystem
          ? "bg-amber-500/20 text-amber-300 border-amber-400/30 font-semibold"
          : "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
        icon: Building2,
        short: "Awash LC",
      };
    }
    return {
      bg: isLight
        ? "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
        : isSystem
        ? "bg-blue-900/30 text-blue-200 border-blue-500/25 font-semibold"
        : "bg-slate-500/15 text-slate-400 border-slate-500/30 font-semibold",
      icon: CreditCard,
      short: "Wire",
    };
  };

  // Enterprise avatar monogram generator
  const getAvatarInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  // Active Button Style Helpers for Light / System / Dark
  const getTabActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      if (isSystem) return "text-blue-200/70 hover:bg-blue-900/40 hover:text-white";
      return "text-zinc-400 hover:bg-white/5 hover:text-white";
    }
    // Active state
    if (isLight) return "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600 font-bold";
    if (isSystem) return "bg-blue-600 text-white shadow-md ring-1 ring-blue-400 font-bold";
    return "bg-white text-slate-950 shadow-md font-bold";
  };

  const getTabBadgeActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "bg-slate-100 text-slate-600";
      if (isSystem) return "bg-blue-900/40 text-blue-200";
      return "bg-white/10 text-zinc-300";
    }
    if (isLight) return "bg-white/25 text-white";
    if (isSystem) return "bg-white/20 text-white";
    return "bg-slate-950/20 text-slate-950";
  };

  const getCurrencyBtnStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:text-slate-900";
      if (isSystem) return "text-blue-200/70 hover:text-white";
      return "text-zinc-400 hover:text-white";
    }
    if (isLight) return "bg-emerald-600 text-white shadow-xs font-bold";
    if (isSystem) return "bg-blue-600 text-white shadow-xs font-bold";
    return "bg-emerald-400 text-slate-950 shadow-xs font-bold";
  };

  const getViewBtnStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:text-slate-900";
      if (isSystem) return "text-blue-200/70 hover:text-white";
      return "text-zinc-400 hover:text-white";
    }
    if (isLight) return "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold";
    if (isSystem) return "bg-blue-600 text-white shadow-xs font-bold";
    return "bg-white text-slate-950 shadow-xs font-bold";
  };

  const getTimeframeBtnStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:text-slate-900";
      if (isSystem) return "text-blue-200/70 hover:text-white";
      return "text-zinc-400 hover:text-white";
    }
    if (isLight) return "bg-emerald-600 text-white shadow-xs font-bold";
    if (isSystem) return "bg-blue-600 text-white shadow-xs font-bold";
    return "bg-white text-slate-950 shadow-xs font-bold";
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Live Rail Telemetry */}
      <PageHeader
        title="Treasury Settlements & Escrow Engine"
        subtitle="National Bank of Ethiopia (NBE) RTGS Integrated • CBE Corporate Tripartite Escrow • Telebirr SuperApp Rails"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Treasury & Payments" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Currency Mode Switcher with Active Buttons for Light, Dark & System */}
            <div
              className={`flex items-center rounded-xl border p-0.5 shadow-xs ${
                isLight
                  ? "bg-slate-100 border-slate-200"
                  : isSystem
                  ? "bg-[#0c1630] border-blue-500/25"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <button
                onClick={() => setCurrencyMode("ETB")}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getCurrencyBtnStyle(
                  currencyMode === "ETB"
                )}`}
              >
                ETB (Br)
              </button>
              <button
                onClick={() => setCurrencyMode("USD")}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getCurrencyBtnStyle(
                  currencyMode === "USD"
                )}`}
                title="Indicative USD view using official NBE interbank rate (1 USD ≈ 132.5 ETB)"
              >
                USD ($)
              </button>
            </div>

            {/* Export Statement */}
            <button
              onClick={() => {
                toast.success("Downloading formal B2B Treasury & VAT Statement (CSV/PDF)...");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-blue-100 hover:bg-[#122045]"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            {/* Toggle Accounts Strip */}
            <button
              onClick={() => setShowAccountsStrip(!showAccountsStrip)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                showAccountsStrip
                  ? isLight
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : isSystem
                    ? "border-blue-400 bg-blue-600/20 text-blue-200"
                    : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-blue-200 hover:bg-[#122045]"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>{showAccountsStrip ? "Hide Banks" : "Bank Rails"}</span>
            </button>

            {/* Primary Withdraw Action */}
            <button
              onClick={() => {
                setWithdrawAmount(Math.min(1000000, availableBalance));
                setIsWithdrawModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40"
                  : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>Withdraw to Bank</span>
            </button>
          </div>
        }
      />

      {/* Real-time Gateway System Telemetry Ribbon */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2 text-[11px] shadow-xs ${
          isLight
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
            : isSystem
            ? "border-blue-500/30 bg-[#0c1630] text-blue-200"
            : "border-emerald-500/20 bg-emerald-950/20 text-emerald-300"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <strong>NBE RTGS Clearing Engine:</strong> Operational (Latency &lt;140ms)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-80">
            <ShieldCheck className="h-3.5 w-3.5" />
            CBE Tripartite Escrow Vault: Synchronized
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
            <Smartphone className="h-3.5 w-3.5" />
            Telebirr B2B Direct Gateway: 99.98% SLA
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] opacity-75">
          <span>Exchange Rate: 1 USD ≈ 132.50 ETB</span>
          <span>•</span>
          <button
            onClick={() => toast.success("Gateway ping refreshed. All banking rails operational.")}
            className="hover:opacity-100 transition-opacity cursor-pointer"
            title="Refresh network latency"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 2. Hero Glassmorphic Treasury Balance Dashboard (Tailored for Light, Dark & System) */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 lg:p-7 text-white shadow-2xl border transition-all ${
          isLight
            ? "border-emerald-600/30 bg-gradient-to-br from-[#0c4a2f] via-[#063320] to-[#042014] shadow-emerald-950/15"
            : isSystem
            ? "border-blue-500/35 bg-gradient-to-br from-[#091a32] via-[#0b2142] to-[#051124] shadow-blue-950/40"
            : "border-emerald-500/30 bg-gradient-to-br from-[#071911] via-[#0a2318] to-[#04120c] shadow-black/60"
        }`}
      >
        {/* Luminous Ambient Background Glows */}
        <div
          className={`pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-30 ${
            isSystem ? "bg-blue-500" : "bg-emerald-500"
          }`}
        />
        <div
          className={`pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full blur-3xl opacity-20 ${
            isSystem ? "bg-cyan-500" : "bg-teal-500"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="relative z-10 grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Primary Available Balance & Quick Actions */}
          <div className="space-y-4 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold backdrop-blur-xs ${
                  isSystem
                    ? "border-blue-400/40 bg-blue-500/20 text-blue-200"
                    : "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    isSystem ? "bg-blue-400" : "bg-emerald-400"
                  }`}
                />
                Live Treasury Balance
              </span>
              <span className="text-xs text-white/70 font-mono">
                Tax ID: 0019283419 • Corporate Tier A
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                Available for Immediate Payout & RTGS Sweep
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono text-white drop-shadow-xs">
                  {formatMoney(availableBalance)}
                </span>
                {currencyMode === "ETB" && (
                  <span className="text-xs font-mono font-medium text-white/70">
                    ≈ ${(availableBalance / usdRate).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs text-white/80 max-w-xl leading-relaxed">
                Settled net revenues cleared via National Bank of Ethiopia interbank switch. Ready for instant Telebirr sweep or automated corporate wire.
              </p>
            </div>

            {/* Primary Action Buttons inside Hero */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => {
                  setWithdrawAmount(Math.min(1000000, availableBalance));
                  setIsWithdrawModalOpen(true);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-98 ${
                  isLight
                    ? "bg-white text-emerald-950 hover:bg-slate-100 shadow-emerald-950/20"
                    : isSystem
                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-950/40"
                    : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                <span>Withdraw to Bank Account</span>
              </button>

              <button
                onClick={() => {
                  setMilestoneFilter("deposit_confirmed");
                  toast.success("Filtered table to active Escrow transactions.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer backdrop-blur-xs"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>View Locked Escrow</span>
              </button>

              <button
                onClick={() => setShowAnalyticsStrip(!showAnalyticsStrip)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2.5 text-xs font-medium text-white/90 transition-all cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{showAnalyticsStrip ? "Hide Trends" : "Cashflow Trends"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: 4 Frosted High-Impact Micro Metric Tiles */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-6">
            {/* 1. Secured in Escrow */}
            <div
              onClick={() => {
                setStatusFilter("escrow_held");
                setMilestoneFilter(null);
              }}
              className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-emerald-400/40 hover:bg-white/10 cursor-pointer"
            >
              <div className="flex items-center justify-between text-emerald-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80 group-hover:text-white">
                  Secured in Escrow
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-xl font-bold font-mono text-white">
                {formatShortMoney(escrowBalance)}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/80">
                <span>{transactions.filter((t) => t.status === "escrow_held").length} Orders</span>
                <span className="text-white/40">•</span>
                <span className="text-[10px] text-emerald-300 font-medium">100% Guaranteed</span>
              </div>
            </div>

            {/* 2. 30-Day Gross Volume */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-blue-400/40 hover:bg-white/10">
              <div className="flex items-center justify-between text-blue-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  30-Day Gross Volume
                </span>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <p className="mt-2 text-xl font-bold font-mono text-white">
                {formatShortMoney(totalVolume)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300">
                <span className="font-semibold">+18.4%</span>
                <span className="text-white/60 text-[10px]">vs previous cycle</span>
              </div>
            </div>

            {/* 3. Clearing Speed & SLA */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-amber-400/40 hover:bg-white/10">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Settlement SLA
                </span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-xl font-bold font-mono text-white">Instant – 2.4 hrs</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span className="text-emerald-400 font-medium">99.8%</span>
                <span className="text-white/60 text-[10px]">RTGS on-time speed</span>
              </div>
            </div>

            {/* 4. Total Disbursed / Settled */}
            <div
              onClick={() => {
                setStatusFilter("completed");
                setMilestoneFilter(null);
              }}
              className="group rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-purple-400/40 hover:bg-white/10 cursor-pointer"
            >
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80 group-hover:text-white">
                  Paid Out & Settled
                </span>
                <BadgeCheck className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-2 text-xl font-bold font-mono text-white">
                {formatShortMoney(completedVolume)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span className="text-white/60 text-[10px]">
                  {transactions.filter((t) => t.status === "completed").length} Disbursed Vouchers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Cashflow Velocity & Payment Rail Distribution Analytics */}
      {showAnalyticsStrip && (
        <div
          className={`rounded-2xl border p-5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
              : "border-white/10 bg-[#0f1420] text-white"
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
              isLight ? "border-slate-100" : isSystem ? "border-blue-500/20" : "border-white/5"
            }`}
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <TrendingUp
                  className={`h-4 w-4 ${isSystem ? "text-blue-400" : "text-emerald-500"}`}
                />
                <span>Treasury Inflow & Escrow Velocity</span>
              </h3>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                Daily settled disbursements vs active escrow reserves across Ethiopian banking rails
              </p>
            </div>

            {/* Timeframe switcher with active state per theme */}
            <div
              className={`flex items-center gap-1 rounded-xl border p-0.5 text-xs font-semibold ${
                isLight
                  ? "bg-slate-100 border-slate-200"
                  : isSystem
                  ? "bg-[#0c1630] border-blue-500/25"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {(["7D", "30D", "90D"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`rounded-lg px-2.5 py-1 transition-all cursor-pointer ${getTimeframeBtnStyle(
                    timeframe === t
                  )}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* Left: Interactive SVG Cashflow Bar Trend */}
            <div className="lg:col-span-8 space-y-2">
              <div
                className={`flex items-center justify-between text-xs pb-1 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                <span className="font-medium">Settlement Inflow vs Escrow Hold (ETB)</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    <span>Disbursed Inflow</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    <span>Escrow Reserve</span>
                  </span>
                </div>
              </div>

              {/* Bar visualization */}
              <div
                className={`h-44 w-full flex items-end gap-2 sm:gap-4 pt-4 border-b ${
                  isLight ? "border-slate-100" : isSystem ? "border-blue-500/20" : "border-white/5"
                }`}
              >
                {activeChartData.map((item, idx) => {
                  const inflowHeight = Math.max(12, Math.round((item.inflow / maxChartVal) * 120));
                  const escrowHeight = Math.max(16, Math.round((item.escrow / maxChartVal) * 120));

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full gap-1 group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="pointer-events-none absolute -top-14 z-20 hidden group-hover:flex flex-col items-center rounded-lg bg-slate-900 text-white px-2.5 py-1.5 text-[10px] shadow-lg whitespace-nowrap">
                        <span className="font-bold">{item.label}</span>
                        <span>Inflow: ETB {(item.inflow / 1000).toFixed(0)}k</span>
                        <span>Escrow: ETB {(item.escrow / 1000).toFixed(0)}k</span>
                      </div>

                      {/* Twin Bar group */}
                      <div className="w-full flex items-end justify-center gap-1">
                        <div
                          style={{ height: `${inflowHeight}px` }}
                          className="w-1/2 max-w-[18px] rounded-t-sm bg-emerald-500/80 group-hover:bg-emerald-400 transition-all"
                        />
                        <div
                          style={{ height: `${escrowHeight}px` }}
                          className="w-1/2 max-w-[18px] rounded-t-sm bg-blue-500/80 group-hover:bg-blue-400 transition-all"
                        />
                      </div>

                      <span
                        className={`text-[10px] font-mono mt-1 ${
                          isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                className={`flex items-center justify-between text-[11px] pt-1 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                <span>Platform Escrow Tech Fee: Fixed 1.5%</span>
                <span
                  className={`font-semibold ${
                    isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  Settlement Success Rate: 100%
                </span>
              </div>
            </div>

            {/* Right: Payment Rails Volume Distribution */}
            <div
              className={`lg:col-span-4 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 space-y-3.5 ${
                isLight ? "border-slate-100" : isSystem ? "border-blue-500/20" : "border-white/5"
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Settlement Channel Share
              </h4>

              <div className="space-y-3">
                {channelDistribution.length === 0 ? (
                  <div className="py-5 text-center">
                    <p className={`text-xs ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                      No settlement volume recorded yet across banking rails.
                    </p>
                  </div>
                ) : (
                  channelDistribution.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-1.5 truncate max-w-[200px]">
                          <Landmark className="h-3 w-3 shrink-0" style={{ color: item.color }} />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span className="font-mono font-bold shrink-0">{item.pct}%</span>
                      </div>
                      <div
                        className={`h-2 w-full rounded-full overflow-hidden ${
                          isLight ? "bg-slate-100" : isSystem ? "bg-blue-900/40" : "bg-white/10"
                        }`}
                      >
                        <div
                          style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                className={`rounded-xl p-2.5 text-[11px] ${
                  isLight
                    ? "bg-slate-50 text-slate-600"
                    : isSystem
                    ? "bg-[#0c1630] text-blue-200"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                <span className="font-semibold">Daily RTGS Sweep:</span> Automated batch processing occurs every hour between 08:00 and 17:00 EAT.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Verified Settlement Accounts & Banking Rails Shelf (Tailored per Theme & Method) */}
      {showAccountsStrip && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-800" : isSystem ? "text-blue-100" : "text-zinc-200"
                }`}
              >
                <Building2
                  className={`h-4 w-4 ${isSystem ? "text-blue-400" : "text-emerald-500"}`}
                />
                <span>Verified Ethiopian Settlement Terminals</span>
              </h3>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                Authorized corporate bank accounts linked for RTGS settlement and instant Telebirr disbursements
              </p>
            </div>

            <button
              onClick={() => setIsAddAccountModalOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : isSystem
                  ? "border-blue-400/50 bg-blue-600/15 text-blue-200 hover:bg-blue-600/25"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Link Bank Rail</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {settlementAccounts.length === 0 ? (
              <div
                className={`col-span-full rounded-2xl border border-dashed p-8 text-center flex flex-col items-center justify-center ${
                  isLight
                    ? "border-slate-300 bg-slate-50/60"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0a1226]/50"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-3">
                  <Landmark className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm">No Settlement Accounts Linked</h4>
                <p
                  className={`text-xs max-w-md mt-1 mb-4 ${
                    isLight ? "text-slate-500" : "text-zinc-400"
                  }`}
                >
                  Add your preferred commercial bank, microfinance account, or mobile money merchant ID to receive automated treasury payouts.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Link Bank / Account</span>
                </button>
              </div>
            ) : (
              settlementAccounts.map((acc) => {
                const cardBg = isLight
                  ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  : isSystem
                  ? "bg-[#0c1630] border-blue-500/25 hover:border-blue-400/40 shadow-xs"
                  : "bg-[#111622] border-white/10 hover:border-white/20 shadow-xs";
                const titleColor = isLight ? "text-slate-900" : "text-white";
                const linkColor = isLight
                  ? "text-emerald-700 hover:text-emerald-900"
                  : "text-emerald-400 hover:text-emerald-300";

                return (
                  <div
                    key={acc.id}
                    className={`relative rounded-2xl border p-4 shadow-xs transition-all group overflow-hidden ${cardBg}`}
                  >
                    {/* Top indicator bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 opacity-80"
                      style={{ backgroundColor: acc.accentColor }}
                    />

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-xs text-white shadow-xs"
                          style={{ backgroundColor: acc.accentColor }}
                        >
                          {acc.shortCode}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold flex items-center gap-1.5 truncate ${titleColor}`}>
                            <span className="truncate">{acc.bankName}</span>
                          </h4>
                          <p
                            className={`text-[11px] font-mono flex items-center gap-1 mt-0.5 ${
                              isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                            }`}
                          >
                            <span>A/C: {acc.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.accountNumber, acc.id)}
                              title="Copy account number"
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              {copiedRef === acc.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {acc.isDefault ? (
                          <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            <BadgeCheck className="h-3 w-3" />
                            Default
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDefaultSettlementAccount(acc.id)}
                            title="Set as Default"
                            className="p-1 rounded-md text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${acc.bankName} (${acc.accountNumber})?`)) {
                              deleteSettlementAccount(acc.id);
                            }
                          }}
                          title="Remove Account"
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-3.5 border-t pt-2.5 flex items-center justify-between text-[11px] ${
                        isLight
                          ? "border-slate-100 text-slate-500"
                          : isSystem
                          ? "border-blue-500/20 text-blue-200/70"
                          : "border-white/5 text-zinc-400"
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{acc.branch || "Central Rail"}</span>
                      <span
                        className={`font-semibold ${
                          isLight ? "text-slate-800" : isSystem ? "text-blue-100" : "text-zinc-200"
                        }`}
                      >
                        {acc.clearingTime}
                      </span>
                    </div>

                    {/* Card Action footer */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1">
                      <span
                        className={`text-[10px] ${
                          isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                        }`}
                      >
                        Type: {acc.type}
                      </span>
                      <button
                        onClick={() => {
                          setWithdrawDestination(`${acc.bankName} (${acc.shortCode} - ${acc.accountNumber})`);
                          setIsWithdrawModalOpen(true);
                        }}
                        className={`text-xs font-bold hover:underline cursor-pointer ${linkColor}`}
                      >
                        Withdraw Here →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Interactive CBE Tripartite Escrow Protocol & Milestone Engine */}
      <div
        className={`rounded-2xl border p-4.5 shadow-xs space-y-3.5 transition-colors ${
          isLight
            ? "border-slate-200 bg-slate-50/70 text-slate-900"
            : isSystem
            ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
            : "border-white/10 bg-[#101522] text-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                isSystem ? "bg-blue-600" : "bg-emerald-600"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold">CBE Tripartite Escrow Clearing Pipeline</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : isSystem
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  100% Capital Guaranteed
                </span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                Buyer deposits locked securely at Commercial Bank of Ethiopia Corporate Branch until verified delivery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {milestoneFilter && (
              <button
                onClick={() => setMilestoneFilter(null)}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    : isSystem
                    ? "bg-blue-900/40 text-blue-200 hover:bg-blue-900/60"
                    : "bg-white/10 text-zinc-300 hover:bg-white/20"
                }`}
              >
                <X className="h-3 w-3" />
                <span>Clear Milestone Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive 4-Stage Stepper Grid with clear Active States per Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Stage 1: Deposit Funded */}
          <button
            onClick={() => {
              setMilestoneFilter(
                milestoneFilter === "deposit_confirmed" ? null : "deposit_confirmed"
              );
              setStatusFilter("escrow_held");
            }}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
              milestoneFilter === "deposit_confirmed"
                ? isLight
                  ? "border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/30"
                  : isSystem
                  ? "border-emerald-400 bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/40"
                  : "border-emerald-400 bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/40"
                : isLight
                ? "border-slate-200 bg-white hover:border-slate-300"
                : isSystem
                ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-400/40"
                : "border-white/10 bg-[#131826] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isLight
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  1
                </span>
                Buyer Funds Escrow
              </span>
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div
              className={`mt-2 text-sm font-bold font-mono ${
                isLight ? "text-emerald-700" : "text-emerald-400"
              }`}
            >
              {formatMoney(escrowStageStats.deposit.amount)}
            </div>
            <div
              className={`text-[10px] mt-0.5 ${
                isLight ? "text-slate-400" : isSystem ? "text-blue-200/60" : "text-zinc-500"
              }`}
            >
              {escrowStageStats.deposit.count} Orders Awaiting Dispatch
            </div>
          </button>

          {/* Stage 2: Goods In Transit */}
          <button
            onClick={() => {
              setMilestoneFilter(
                milestoneFilter === "goods_in_transit" ? null : "goods_in_transit"
              );
              setStatusFilter("escrow_held");
            }}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
              milestoneFilter === "goods_in_transit"
                ? isLight
                  ? "border-blue-600 bg-blue-50 shadow-sm ring-2 ring-blue-500/30"
                  : isSystem
                  ? "border-blue-400 bg-blue-950/40 shadow-md ring-2 ring-blue-400/40"
                  : "border-blue-400 bg-blue-950/40 shadow-md ring-2 ring-blue-400/40"
                : isLight
                ? "border-slate-200 bg-white hover:border-slate-300"
                : isSystem
                ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-400/40"
                : "border-white/10 bg-[#131826] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isLight ? "bg-blue-100 text-blue-800" : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  2
                </span>
                Dispatched & In Transit
              </span>
              <Clock className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div
              className={`mt-2 text-sm font-bold font-mono ${
                isLight ? "text-blue-700" : "text-blue-400"
              }`}
            >
              {formatMoney(escrowStageStats.transit.amount)}
            </div>
            <div
              className={`text-[10px] mt-0.5 ${
                isLight ? "text-slate-400" : isSystem ? "text-blue-200/60" : "text-zinc-500"
              }`}
            >
              {escrowStageStats.transit.count} Cargo Shipments Moving
            </div>
          </button>

          {/* Stage 3: Inspection & POD */}
          <button
            onClick={() => {
              setMilestoneFilter(
                milestoneFilter === "inspection_pending" ? null : "inspection_pending"
              );
              setStatusFilter("escrow_held");
            }}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
              milestoneFilter === "inspection_pending"
                ? isLight
                  ? "border-amber-600 bg-amber-50 shadow-sm ring-2 ring-amber-500/30"
                  : isSystem
                  ? "border-amber-400 bg-amber-950/40 shadow-md ring-2 ring-amber-400/40"
                  : "border-amber-400 bg-amber-950/40 shadow-md ring-2 ring-amber-400/40"
                : isLight
                ? "border-slate-200 bg-white hover:border-slate-300"
                : isSystem
                ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-400/40"
                : "border-white/10 bg-[#131826] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isLight ? "bg-amber-100 text-amber-800" : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  3
                </span>
                Buyer POD & Inspect
              </span>
              <Eye className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div
              className={`mt-2 text-sm font-bold font-mono ${
                isLight ? "text-amber-700" : "text-amber-400"
              }`}
            >
              {formatMoney(escrowStageStats.inspection.amount)}
            </div>
            <div
              className={`text-[10px] mt-0.5 ${
                isLight ? "text-slate-400" : isSystem ? "text-blue-200/60" : "text-zinc-500"
              }`}
            >
              {escrowStageStats.inspection.count} Awaiting Buyer Signoff
            </div>
          </button>

          {/* Stage 4: Funds Released */}
          <button
            onClick={() => {
              setMilestoneFilter(
                milestoneFilter === "funds_released" ? null : "funds_released"
              );
              setStatusFilter("completed");
            }}
            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
              milestoneFilter === "funds_released"
                ? isLight
                  ? "border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/30"
                  : isSystem
                  ? "border-emerald-400 bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/40"
                  : "border-emerald-400 bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/40"
                : isLight
                ? "border-slate-200 bg-white hover:border-slate-300"
                : isSystem
                ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-400/40"
                : "border-white/10 bg-[#131826] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isLight
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  4
                </span>
                Automated Release
              </span>
              <Unlock className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div
              className={`mt-2 text-sm font-bold font-mono ${
                isLight ? "text-emerald-700" : "text-emerald-400"
              }`}
            >
              {formatMoney(escrowStageStats.released.amount)}
            </div>
            <div
              className={`text-[10px] mt-0.5 ${
                isLight ? "text-slate-400" : isSystem ? "text-blue-200/60" : "text-zinc-500"
              }`}
            >
              {escrowStageStats.released.count} Cleared to Available Balance
            </div>
          </button>
        </div>
      </div>

      {/* 6. Filter & Search Toolbar with View Mode Switcher */}
      <div className="space-y-3">
        {/* Status Category Tabs with Dynamic Theme Active Styles */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 ${
            isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Transactions", count: transactions.length },
              {
                id: "escrow_held",
                label: "Secured in Escrow",
                count: transactions.filter((t) => t.status === "escrow_held").length,
              },
              {
                id: "completed",
                label: "Settled & Paid",
                count: transactions.filter((t) => t.status === "completed").length,
              },
              {
                id: "pending",
                label: "Pending Clearance",
                count: transactions.filter((t) => t.status === "pending").length,
              },
              {
                id: "refunded",
                label: "Refunded",
                count: transactions.filter((t) => t.status === "refunded").length,
              },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setMilestoneFilter(null);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs transition-all cursor-pointer ${getTabActiveStyle(
                    isActive
                  )}`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${getTabBadgeActiveStyle(
                      isActive
                    )}`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Table vs Card Grid) */}
          <div
            className={`flex items-center rounded-xl border p-0.5 shadow-xs ${
              isLight
                ? "bg-slate-100 border-slate-200"
                : isSystem
                ? "bg-[#0c1630] border-blue-500/25"
                : "bg-white/5 border-white/10"
            }`}
          >
            <button
              onClick={() => setActiveViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getViewBtnStyle(
                activeViewMode === "table"
              )}`}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setActiveViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getViewBtnStyle(
                activeViewMode === "grid"
              )}`}
              title="Card Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Search, Method Filter, Sort & Reset controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by transaction ID, buyer enterprise, order #, TIN, or bank ref..."
              className={`w-full rounded-xl border pl-9 pr-8 py-2 text-xs focus:outline-hidden shadow-xs transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white placeholder:text-blue-300/40 focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white placeholder:text-zinc-500 focus:border-emerald-500"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Method Selector */}
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`rounded-xl border px-3 py-2 text-xs font-medium focus:outline-hidden cursor-pointer shadow-xs transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-blue-100 focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-zinc-300 focus:border-emerald-500"
              }`}
            >
              <option value="all">All Banking Rails</option>
              {availableFilterMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Sort Field Selector */}
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split("-") as [any, any];
                setSortField(f);
                setSortOrder(o);
              }}
              className={`rounded-xl border px-3 py-2 text-xs font-medium focus:outline-hidden cursor-pointer shadow-xs transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-blue-100 focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-zinc-300 focus:border-emerald-500"
              }`}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="company-asc">Buyer: A to Z</option>
            </select>

            {(searchQuery || statusFilter !== "all" || methodFilter !== "all" || milestoneFilter) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setMethodFilter("all");
                  setMilestoneFilter(null);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer shadow-xs ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-blue-200 hover:bg-[#122045]"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7. Transactions Presentation: Table View OR Card Grid View */}
      {filtered.length === 0 ? (
        <div
          className={`rounded-2xl border p-10 shadow-xs ${
            isLight
              ? "border-slate-200 bg-white"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b]"
              : "border-white/10 bg-[#12161f]"
          }`}
        >
          <EmptyState
            title="No Transactions Found"
            description="No settlement records match your active search terms or selected filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setMethodFilter("all");
              setMilestoneFilter(null);
            }}
          />
        </div>
      ) : activeViewMode === "table" ? (
        /* TABLE VIEW */
        <div
          className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
              : "border-white/10 bg-[#12161f] text-white"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b font-semibold uppercase text-[10px] tracking-wider select-none ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : isSystem
                      ? "border-blue-500/20 bg-[#0c1630] text-blue-200/80"
                      : "border-white/10 bg-white/5 text-zinc-400"
                  }`}
                >
                  <th className="py-3 px-4">Transaction / Date</th>
                  <th className="py-3 px-3">Buyer Enterprise</th>
                  <th className="py-3 px-3">Order Ref</th>
                  <th className="py-3 px-3">Gross Value</th>
                  <th className="py-3 px-3">Net Payout (ETB)</th>
                  <th className="py-3 px-3">Settlement Channel</th>
                  <th className="py-3 px-3">Gateway Ref</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isLight
                    ? "divide-slate-100"
                    : isSystem
                    ? "divide-blue-500/15"
                    : "divide-white/5"
                }`}
              >
                {paginated.map((tx) => {
                  const badgeConfig = getMethodBadge(tx.paymentMethod);
                  const Icon = badgeConfig.icon;
                  const fee = tx.feeETB ?? Math.round(tx.amount * 0.015);
                  const net = tx.netAmountETB ?? tx.amount - fee;

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors group ${
                        isLight
                          ? "hover:bg-slate-50"
                          : isSystem
                          ? "hover:bg-blue-900/20"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* 1. Transaction ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold">{tx.transactionNumber}</span>
                          <button
                            onClick={() => handleCopy(tx.transactionNumber, `${tx.id}-num`)}
                            title="Copy transaction ID"
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            {copiedRef === `${tx.id}-num` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${
                            isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                          }`}
                        >
                          {tx.date}
                        </div>
                      </td>

                      {/* 2. Buyer Enterprise & TIN */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-[10px] ${
                              isLight
                                ? "bg-slate-100 text-slate-700"
                                : isSystem
                                ? "bg-blue-600/20 text-blue-200"
                                : "bg-white/10 text-zinc-300"
                            }`}
                          >
                            {getAvatarInitials(tx.buyerCompany)}
                          </div>
                          <div>
                            <div className="font-bold truncate max-w-[180px]">{tx.buyerCompany}</div>
                            {tx.buyerTIN && (
                              <div
                                className={`text-[10px] font-mono ${
                                  isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                                }`}
                              >
                                TIN: {tx.buyerTIN}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Order Reference */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 font-mono text-[11px] font-semibold ${
                            isLight
                              ? "bg-slate-100 text-slate-700"
                              : isSystem
                              ? "bg-blue-900/30 text-blue-200"
                              : "bg-white/5 text-zinc-300"
                          }`}
                        >
                          {tx.orderNumber}
                        </span>
                      </td>

                      {/* 4. Gross Amount */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-xs">{formatMoney(tx.amount)}</span>
                      </td>

                      {/* 5. Net Payout & Fee */}
                      <td className="py-3.5 px-3">
                        <div
                          className={`font-mono font-semibold text-xs ${
                            isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatMoney(net)}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                          }`}
                        >
                          Fee: ETB {fee.toLocaleString()} (1.5%)
                        </div>
                      </td>

                      {/* 6. Settlement Channel */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${badgeConfig.bg}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{badgeConfig.short}</span>
                        </span>
                      </td>

                      {/* 7. Gateway Reference */}
                      <td className="py-3.5 px-3">
                        <div
                          className={`flex items-center gap-1 font-mono text-[11px] ${
                            isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                          }`}
                        >
                          <span className="truncate max-w-[130px]">{tx.referenceNumber}</span>
                          <button
                            onClick={() => handleCopy(tx.referenceNumber, `${tx.id}-ref`)}
                            title="Copy reference number"
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            {copiedRef === `${tx.id}-ref` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={tx.status} size="sm" />
                      </td>

                      {/* 9. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === "escrow_held" && (
                            <button
                              onClick={() => setSelectedEscrowTx(tx)}
                              className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                                isLight
                                  ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  : isSystem
                                  ? "bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border-blue-400/30"
                                  : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                              }`}
                              title="Track Escrow Milestones"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>Track</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReceiptTx(tx)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer shadow-xs ${
                              isLight
                                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                : isSystem
                                ? "border-blue-500/25 bg-[#0c1630] hover:bg-[#122045] text-blue-200"
                                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                            }`}
                            title="View Official Fiscal Settlement Voucher"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Voucher</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((tx) => {
              const badgeConfig = getMethodBadge(tx.paymentMethod);
              const Icon = badgeConfig.icon;
              const fee = tx.feeETB ?? Math.round(tx.amount * 0.015);
              const net = tx.netAmountETB ?? tx.amount - fee;

              return (
                <div
                  key={tx.id}
                  className={`rounded-2xl border p-4.5 shadow-xs transition-all flex flex-col justify-between group ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-emerald-500/40 text-slate-900"
                      : isSystem
                      ? "border-blue-500/25 bg-[#0f1b3b] hover:border-blue-400 text-white shadow-md shadow-blue-950/20"
                      : "border-white/10 bg-[#121620] hover:border-emerald-500/40 text-white"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                          <span>{tx.transactionNumber}</span>
                          <button
                            onClick={() => handleCopy(tx.transactionNumber, `${tx.id}-num`)}
                            title="Copy transaction ID"
                            className="cursor-pointer transition-colors"
                          >
                            {copiedRef === `${tx.id}-num` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>
                        </div>
                        <span
                          className={`text-[11px] font-mono ${
                            isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                          }`}
                        >
                          {tx.date}
                        </span>
                      </div>
                      <StatusBadge status={tx.status} size="sm" />
                    </div>

                    {/* Buyer Info */}
                    <div
                      className={`flex items-center gap-2.5 rounded-xl p-2.5 ${
                        isLight
                          ? "bg-slate-50"
                          : isSystem
                          ? "bg-[#0c1630] border border-blue-500/20"
                          : "bg-white/5"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                          isSystem ? "bg-blue-600/20 text-blue-300" : "bg-emerald-500/10 text-emerald-500"
                        }`}
                      >
                        {getAvatarInitials(tx.buyerCompany)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs truncate">{tx.buyerCompany}</p>
                        <p
                          className={`text-[10px] font-mono ${
                            isLight ? "text-slate-500" : isSystem ? "text-blue-300/60" : "text-zinc-400"
                          }`}
                        >
                          Order: #{tx.orderNumber}
                        </p>
                      </div>
                    </div>

                    {/* Financial Figures */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div
                        className={`rounded-xl border p-2 ${
                          isLight
                            ? "border-slate-100 bg-slate-50/50"
                            : isSystem
                            ? "border-blue-500/20 bg-[#0c1630]"
                            : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Gross Value
                        </span>
                        <span className="font-mono font-bold">{formatMoney(tx.amount)}</span>
                      </div>
                      <div
                        className={`rounded-xl border p-2 ${
                          isLight
                            ? "border-emerald-300 bg-emerald-50/80 text-emerald-800"
                            : isSystem
                            ? "border-blue-400/30 bg-blue-600/15 text-blue-200"
                            : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider block font-semibold">
                          Net Disbursed
                        </span>
                        <span className="font-mono font-bold">{formatMoney(net)}</span>
                      </div>
                    </div>

                    {/* Channel & Gateway Ref */}
                    <div
                      className={`flex items-center justify-between text-[11px] pt-1 ${
                        isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                      }`}
                    >
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 ${badgeConfig.bg}`}>
                        <Icon className="h-3 w-3" />
                        <span>{badgeConfig.short}</span>
                      </span>
                      <span className="font-mono truncate max-w-[130px]">
                        Ref: {tx.referenceNumber}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    className={`mt-4 border-t pt-3 flex items-center justify-end gap-2 ${
                      isLight ? "border-slate-100" : isSystem ? "border-blue-500/20" : "border-white/5"
                    }`}
                  >
                    {tx.status === "escrow_held" && (
                      <button
                        onClick={() => setSelectedEscrowTx(tx)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isLight
                            ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            : isSystem
                            ? "bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border-blue-400/30"
                            : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Track Escrow</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReceiptTx(tx)}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                        isLight
                          ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          : isSystem
                          ? "border-blue-500/25 bg-[#0c1630] hover:bg-[#122045] text-blue-200"
                          : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Voucher</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div
            className={`rounded-2xl border shadow-xs ${
              isLight
                ? "border-slate-200 bg-white"
                : isSystem
                ? "border-blue-500/25 bg-[#0f1b3b]"
                : "border-white/10 bg-[#12161f]"
            }`}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* 8. Modern Fintech Withdrawal Modal (Fully Theme-Adapted) */}
      <ModalDialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Treasury Funds"
        subtitle="Transfer settled balance directly to your verified Ethiopian corporate bank or Telebirr account"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(false)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer ${
                isLight
                  ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/25 text-blue-200 hover:bg-blue-900/30"
                  : "border-white/10 text-zinc-300 hover:bg-white/5"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleWithdrawalSubmit}
              className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span>Confirm & Dispatch Transfer</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-xs">
          {/* Available balance card */}
          <div
            className={`rounded-2xl border p-4 ${
              isLight
                ? "border-emerald-300 bg-emerald-50/70 text-slate-900"
                : isSystem
                ? "border-blue-500/30 bg-[#0c1630] text-white"
                : "border-emerald-500/30 bg-emerald-500/10 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium opacity-80">Available for Immediate Payout:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLight
                    ? "bg-emerald-200/70 text-emerald-900"
                    : isSystem
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                ✓ RTGS Eligible
              </span>
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1 ${
                isLight
                  ? "text-emerald-800"
                  : isSystem
                  ? "text-blue-300"
                  : "text-emerald-400"
              }`}
            >
              ETB {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold">
                Withdrawal Amount (ETB) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] opacity-70">
                Min: ETB 1,000 • Max: ETB {availableBalance.toLocaleString()}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                ETB
              </span>
              <input
                type="number"
                min={1000}
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className={`w-full rounded-xl border pl-12 pr-4 py-2.5 font-mono font-bold text-sm focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
                required
              />
            </div>

            {/* Quick Percentage Presets with Active State Highlight */}
            <div className="mt-2 flex items-center gap-1.5">
              {[25, 50, 75, 100].map((pct) => {
                const targetVal = Math.floor((availableBalance * pct) / 100);
                const isActivePreset = withdrawAmount === targetVal;

                return (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => handleQuickPreset(pct)}
                    className={`rounded-xl border px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      isActivePreset
                        ? isLight
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                          : isSystem
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                          : "bg-emerald-400 text-slate-950 border-emerald-400 shadow-xs font-bold"
                        : isLight
                        ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        : isSystem
                        ? "border-blue-500/20 bg-blue-900/30 text-blue-200 hover:bg-blue-900/50"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {pct === 100 ? "Max (100%)" : `${pct}%`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination account selector with Active Highlight Cards */}
          <div>
            <label className="block font-semibold mb-1.5">
              Destination Settlement Channel
            </label>
            {settlementAccounts.length === 0 ? (
              <div
                className={`rounded-2xl border border-dashed p-5 text-center ${
                  isLight
                    ? "border-amber-300 bg-amber-50/70"
                    : isSystem
                    ? "border-blue-500/30 bg-[#0a1226]"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className={`text-xs font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}>
                  No settlement accounts linked yet
                </p>
                <p className={`text-[11px] mt-1 mb-3.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  You must link an authorized Ethiopian bank or mobile money account before dispatching a treasury withdrawal.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setIsAddAccountModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link Settlement Account Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {settlementAccounts.map((acc) => {
                  const isSelected = withdrawDestination.includes(acc.accountNumber);
                  return (
                    <div
                      key={acc.id}
                      onClick={() =>
                        setWithdrawDestination(`${acc.bankName} (${acc.shortCode} - ${acc.accountNumber})`)
                      }
                      className={`rounded-2xl border p-3 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? isLight
                            ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/25 shadow-xs"
                            : isSystem
                            ? "border-blue-400 bg-blue-950/40 ring-2 ring-blue-500/30 shadow-xs"
                            : "border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xs"
                          : isLight
                          ? "border-slate-200 bg-white hover:border-slate-300"
                          : isSystem
                          ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-500/35"
                          : "border-white/10 bg-[#12161f] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-[10px] text-white"
                          style={{ backgroundColor: acc.accentColor }}
                        >
                          {acc.shortCode}
                        </div>
                        <div>
                          <p className="font-bold text-xs">{acc.bankName}</p>
                          <p className="text-[11px] opacity-70 font-mono">
                            A/C: {acc.accountNumber} • {acc.clearingTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold opacity-60">{acc.type}</span>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? isLight
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : isSystem
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-emerald-400 bg-emerald-400 text-slate-950"
                              : "border-slate-300 dark:border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Optional transfer note */}
          <div>
            <label className="block font-semibold mb-1">
              Internal Reference / Accounting Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly operational treasury sweep to primary corporate account"
              value={withdrawNote}
              onChange={(e) => setWithdrawNote(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white placeholder:text-blue-300/40 focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white placeholder:text-zinc-500 focus:border-emerald-500"
              }`}
            />
          </div>

          {/* Fee Calculation preview */}
          <div
            className={`rounded-2xl border p-3.5 space-y-1.5 ${
              isLight
                ? "border-slate-200 bg-slate-50"
                : isSystem
                ? "border-blue-500/25 bg-[#0c1630]"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between opacity-80 text-[11px]">
              <span>Requested Gross Amount:</span>
              <span className="font-mono font-semibold">ETB {withdrawAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between opacity-80 text-[11px]">
              <span>National Bank RTGS Clearing Fee (0.15%):</span>
              <span className="font-mono">
                ETB {Math.round(withdrawAmount * 0.0015).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-current/10 pt-1.5 flex items-center justify-between font-bold text-xs">
              <span>Estimated Net Payout:</span>
              <span
                className={`font-mono ${
                  isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ETB {Math.round(withdrawAmount * 0.9985).toLocaleString()}
              </span>
            </div>
          </div>
        </form>
      </ModalDialog>

      {/* 9. Official B2B Fiscal Settlement Voucher Modal */}
      {selectedReceiptTx && (
        <ModalDialog
          isOpen={!!selectedReceiptTx}
          onClose={() => setSelectedReceiptTx(null)}
          title="Official Fiscal Settlement Voucher"
          subtitle={`National Bank of Ethiopia & MercatoX Escrow record for ${selectedReceiptTx.transactionNumber}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] opacity-60 font-mono">
                Hash: {selectedReceiptTx.referenceNumber.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}...
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Printing fiscal settlement voucher...");
                    window.print();
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                    isLight
                      ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                      : isSystem
                      ? "border-blue-500/25 text-blue-200 hover:bg-blue-900/30"
                      : "border-white/10 text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Downloading PDF voucher with digital seal...");
                    setSelectedReceiptTx(null);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold shadow-xs cursor-pointer ${
                    isLight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : isSystem
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                  }`}
                >
                  Download PDF
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Voucher Header with Watermark & Stamp */}
            <div className="flex items-start justify-between border-b border-current/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-tight">
                    MERCATO<span className="text-emerald-500">X</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-500 px-2 py-0.5 font-bold">
                    Official Fiscal Voucher
                  </span>
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">
                  MercatoX B2B Treasury & Commercial Bank of Ethiopia Escrow Clearing Authority
                </p>
              </div>

              <div className="text-right font-mono">
                <p className="font-bold">{selectedReceiptTx.transactionNumber}</p>
                <p className="text-[11px] opacity-70">{selectedReceiptTx.date}</p>
              </div>
            </div>

            {/* Parties Info */}
            <div
              className={`grid grid-cols-2 gap-4 rounded-2xl border p-3.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50/60 text-slate-900"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white"
                  : "border-white/10 bg-white/[0.02] text-white"
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Supplier / Payee
                </p>
                <p className="font-bold mt-1">Selam Agricultural & Industrial PLC</p>
                <p className="text-[11px] opacity-75">TIN: 0019283419 • VAT Reg: 2019-ETH</p>
                <p className="text-[11px] opacity-75">Addis Ababa, Ethiopia</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Buyer / Remitter
                </p>
                <p className="font-bold mt-1">{selectedReceiptTx.buyerCompany}</p>
                <p className="text-[11px] opacity-75">
                  TIN: {selectedReceiptTx.buyerTIN || "Verified Enterprise Buyer"}
                </p>
                <p className="text-[11px] opacity-75">Linked Order: #{selectedReceiptTx.orderNumber}</p>
              </div>
            </div>

            {/* Payment & Banking Rail Info */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div
                className={`rounded-xl border p-2.5 ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/20 bg-[#0c1630]"
                    : "border-white/10"
                }`}
              >
                <span className="opacity-60 block text-[10px]">Payment Method</span>
                <span className="font-semibold">{selectedReceiptTx.paymentMethod}</span>
              </div>
              <div
                className={`rounded-xl border p-2.5 ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/20 bg-[#0c1630]"
                    : "border-white/10"
                }`}
              >
                <span className="opacity-60 block text-[10px]">Gateway Reference</span>
                <span className="font-mono font-semibold truncate block">
                  {selectedReceiptTx.referenceNumber}
                </span>
              </div>
              <div
                className={`rounded-xl border p-2.5 ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/20 bg-[#0c1630]"
                    : "border-white/10"
                }`}
              >
                <span className="opacity-60 block text-[10px]">Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={selectedReceiptTx.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Itemized Financial Breakdown */}
            <div className="rounded-2xl border border-current/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-current/5 border-b border-current/10 text-[10px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Calculation</th>
                    <th className="py-2.5 px-3 text-right">Amount (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/5 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium">Gross Order Settlement Value</td>
                    <td className="py-2.5 px-3 text-right opacity-70">100.0%</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      ETB {selectedReceiptTx.amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans opacity-80">MercatoX Platform Escrow & Tech Fee</td>
                    <td className="py-2.5 px-3 text-right opacity-70">1.5%</td>
                    <td className="py-2.5 px-3 text-right text-rose-500">
                      - ETB {(selectedReceiptTx.feeETB ?? Math.round(selectedReceiptTx.amount * 0.015)).toLocaleString()}
                    </td>
                  </tr>
                  <tr
                    className={`font-bold ${
                      isLight
                        ? "bg-emerald-50 text-emerald-950"
                        : isSystem
                        ? "bg-blue-600/15 text-blue-300"
                        : "bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">Net Disbursed to Supplier Account</td>
                    <td className="py-3 px-3 text-right">Net</td>
                    <td className="py-3 px-3 text-right text-sm">
                      ETB {(selectedReceiptTx.netAmountETB ?? selectedReceiptTx.amount - (selectedReceiptTx.feeETB ?? Math.round(selectedReceiptTx.amount * 0.015))).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Notes & Security Stamp */}
            <div
              className={`rounded-2xl p-3 text-[11px] flex items-start gap-2 ${
                isLight
                  ? "bg-slate-50 text-slate-600"
                  : isSystem
                  ? "bg-[#0c1630] text-blue-200"
                  : "bg-white/5 text-zinc-400"
              }`}
            >
              <Info className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <p>
                {selectedReceiptTx.notes ||
                  "Funds cleared under Commercial Bank of Ethiopia Escrow terms. Guaranteed against electronic proof of delivery."}
              </p>
            </div>
          </div>
        </ModalDialog>
      )}

      {/* 10. Escrow Lifecycle & Milestone Modal */}
      {selectedEscrowTx && (
        <ModalDialog
          isOpen={!!selectedEscrowTx}
          onClose={() => setSelectedEscrowTx(null)}
          title="CBE Escrow Milestone Tracker"
          subtitle={`Order #${selectedEscrowTx.orderNumber} • ${selectedEscrowTx.buyerCompany}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs opacity-75">
                Amount Locked:{" "}
                <strong className="text-emerald-500 font-mono">
                  ETB {selectedEscrowTx.amount.toLocaleString()}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEscrowTx(null)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                    isLight
                      ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                      : isSystem
                      ? "border-blue-500/25 text-blue-200 hover:bg-blue-900/30"
                      : "border-white/10 text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    releaseEscrow(selectedEscrowTx.id);
                    setSelectedEscrowTx(null);
                  }}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold shadow-xs cursor-pointer ${
                    isLight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : isSystem
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                  }`}
                >
                  Simulate Escrow Release
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div
              className={`rounded-2xl border p-3.5 flex items-center justify-between ${
                isLight
                  ? "border-blue-200 bg-blue-50/70 text-slate-900"
                  : isSystem
                  ? "border-blue-500/30 bg-[#0c1630] text-white"
                  : "border-blue-500/20 bg-blue-500/10 text-white"
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold block text-blue-500">
                  Secured Escrow Account:
                </span>
                <span className="font-mono font-bold">{selectedEscrowTx.referenceNumber}</span>
              </div>
              <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                100% Funded
              </span>
            </div>

            {/* Stepper Timeline */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-current/15">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <h5 className="font-bold">Buyer Funds Deposited at CBE Corporate Branch</h5>
                <p className="text-[11px] opacity-75 mt-0.5">
                  Completed on {selectedEscrowTx.date} • Verified by Commercial Bank of Ethiopia RTGS.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <h5 className="font-bold">Consignment Dispatched & In Transit</h5>
                <p className="text-[11px] opacity-75 mt-0.5">
                  Cargo sealed with GPS tracking. Digital Waybill generated and verified.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white animate-pulse">
                  <Clock className="h-3 w-3" />
                </div>
                <h5 className="font-bold text-blue-500">Consignee Quality Inspection & Electronic POD Signoff</h5>
                <p className="text-[11px] opacity-75 mt-0.5">
                  {selectedEscrowTx.buyerCompany} receiving officer conducts batch check and signs electronic POD.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative opacity-60">
                <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-current/20">
                  <Unlock className="h-3 w-3" />
                </div>
                <h5 className="font-bold">Automated Escrow Payout Release</h5>
                <p className="text-[11px] opacity-75 mt-0.5">
                  Funds automatically unlocked to your Available Treasury Balance for immediate withdrawal.
                </p>
              </div>
            </div>

            <p className="text-[11px] opacity-60 leading-relaxed border-t border-current/10 pt-3">
              MercatoX Escrow guarantees payment protection: buyers cannot reverse funds after dispatch without dispute mediation.
            </p>
          </div>
        </ModalDialog>
      )}

      {/* 11. Connect New Bank Rail Modal */}
      <ModalDialog
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        title="Link Verified Settlement Account"
        subtitle="Connect an authorized Ethiopian commercial bank or mobile money terminal for automated treasury payouts"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddAccountModalOpen(false)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer ${
                isLight
                  ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/25 text-blue-200 hover:bg-blue-900/30"
                  : "border-white/10 text-zinc-300 hover:bg-white/5"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddAccountSubmit}
              className={`rounded-xl px-5 py-2 text-xs font-bold shadow-xs cursor-pointer ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
              }`}
            >
              Link & Verify Account
            </button>
          </>
        }
      >
        <form onSubmit={handleAddAccountSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1.5">
              Financial Institution / Bank Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="popular-ethiopian-banks"
              placeholder="Type any bank name (e.g. Commercial Bank of Ethiopia, Siinqee Bank, Coop Bank...)"
              value={newBankName}
              onChange={(e) => setNewBankName(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
              }`}
              required
            />
            <datalist id="popular-ethiopian-banks">
              <option value="Commercial Bank of Ethiopia (CBE)" />
              <option value="Bank of Abyssinia" />
              <option value="Dashen Bank" />
              <option value="Awash International Bank" />
              <option value="Cooperative Bank of Oromia" />
              <option value="Siinqee Bank" />
              <option value="Nib International Bank" />
              <option value="Wegagen Bank" />
              <option value="Hibret Bank" />
              <option value="Zemen Bank" />
              <option value="Berhan Bank" />
              <option value="Bunna International Bank" />
              <option value="Enat Bank" />
              <option value="Abay Bank" />
              <option value="Global Bank Ethiopia" />
              <option value="Addis International Bank" />
              <option value="Hijra Bank" />
              <option value="ZamZam Bank" />
              <option value="Telebirr Business" />
              <option value="CBE Birr" />
            </datalist>

            {/* Quick-Pick suggestions for rapid entry */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Quick pick:</span>
              {[
                "Commercial Bank of Ethiopia",
                "Bank of Abyssinia",
                "Dashen Bank",
                "Awash Bank",
                "Coop Bank of Oromia",
                "Siinqee Bank",
                "Telebirr Business",
              ].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setNewBankName(b)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                    newBankName === b
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                      : isLight
                      ? "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {b.replace("Commercial Bank of Ethiopia", "CBE").replace("Bank of Abyssinia", "Abyssinia")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5">
              Account Number / Merchant ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1000293848192 or TB-MERCH-..."
              value={newAccountNumber}
              onChange={(e) => setNewAccountNumber(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs font-mono focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
              }`}
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">
              Account Holder Legal Name
            </label>
            <input
              type="text"
              placeholder="Business name or registered account holder"
              value={newAccountHolder}
              onChange={(e) => setNewAccountHolder(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">
              Branch Name / Channel
            </label>
            <input
              type="text"
              placeholder="e.g. Bole Medhanialem Branch or Central Office"
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1.5">Account Purpose / Type</label>
              <select
                value={newAccountType}
                onChange={(e) => setNewAccountType(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden cursor-pointer ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
              >
                <option value="Primary Escrow">Primary Escrow Destination</option>
                <option value="Instant B2B">Instant B2B / Mobile Settlement</option>
                <option value="Trade LC">Trade Letter of Credit (LC)</option>
                <option value="Secondary">Secondary Commercial Account</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefaultAccount}
                  onChange={(e) => setIsDefaultAccount(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-semibold text-xs">Set as default account</span>
              </label>
            </div>
          </div>

          <div
            className={`rounded-xl p-3 text-[11px] ${
              isLight
                ? "bg-slate-50 text-slate-600"
                : isSystem
                ? "bg-[#0c1630] text-blue-200"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            Accounts are instantly validated against National Bank of Ethiopia interbank settlement standards.
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
