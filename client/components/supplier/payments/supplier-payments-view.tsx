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
  Package,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Bot,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { ModalDialog } from "../shared/modal-dialog";
import { useSupplierStore, getBankShortCode, getBankAccentColor } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { useTranslation } from "@/store/language-store";
import {
  PAYMENT_PORTAL_TRANSLATIONS,
  type PaymentPortalDictionary,
} from "@/lib/i18n/payment-portal-translations";
import { PaymentTransaction, SettlementAccount, SourcingOrder } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierPaymentsView() {
  const { language } = useTranslation();
  const tr = (key: keyof PaymentPortalDictionary, params?: Record<string, string | number>): string => {
    const dict = PAYMENT_PORTAL_TRANSLATIONS[language] || PAYMENT_PORTAL_TRANSLATIONS.en;
    let val = dict[key] || PAYMENT_PORTAL_TRANSLATIONS.en[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return val;
  };

  const {
    transactions,
    isLoadingTransactions,
    fetchTransactions,
    payouts,
    sourcingOrders,
    fetchSourcingOrders,
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
  const [activeMainSection, setActiveMainSection] = useState<
    "inflows" | "payouts" | "wholesale" | "banks"
  >("inflows");
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
  const [selectedPayoutSlip, setSelectedPayoutSlip] = useState<any | null>(null);
  const [selectedWholesaleOrder, setSelectedWholesaleOrder] = useState<SourcingOrder | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Official Admin settlement profile for 100% synchronization with /dashboard/admin?tab=sellers-suppliers
  const [adminMerchantProfile, setAdminMerchantProfile] = useState<any | null>(null);
  const [isLoadingAdminProfile, setIsLoadingAdminProfile] = useState(false);

  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: "bot" | "user";
      text: string;
      timestamp: string;
      actionType?: "withdraw_prompt" | "balance_card" | "commission_card" | "payout_card";
    }>
  >([]);
  const [chatInput, setChatInput] = useState("");
  const [botWithdrawAmount, setBotWithdrawAmount] = useState<number>(50000);

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

  // Load live supplier payments, wholesale sourcing orders, and sync official Admin settlement metrics on mount
  useEffect(() => {
    fetchTransactions();
    fetchSourcingOrders();

    async function syncOfficialAdminProfile() {
      try {
        setIsLoadingAdminProfile(true);
        const user = useAuthStore.getState().user;
        const targetId = (user as any)?.sellerId || user?.id;
        const url = targetId
          ? `/api/admin/sellers-suppliers?sellerId=${encodeURIComponent(targetId)}`
          : `/api/admin/sellers-suppliers`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.merchant) {
            setAdminMerchantProfile(json.merchant);
          } else if (Array.isArray(json.data) && json.data.length > 0) {
            const match = json.data.find(
              (m: any) =>
                (targetId && (String(m.id) === String(targetId) || String(m.userId) === String(targetId))) ||
                (user?.email && m.email?.toLowerCase() === user.email.toLowerCase()) ||
                (user?.shopName && m.shopName?.toLowerCase() === user.shopName.toLowerCase()) ||
                (user?.name && (m.fullName?.toLowerCase() === user.name.toLowerCase() || m.shopName?.toLowerCase() === user.name.toLowerCase()))
            ) || json.data[0];
            if (match) {
              setAdminMerchantProfile(match);
            }
          }
        }
      } catch (err) {
        console.warn("[SupplierPaymentsView] Sync admin profile warning:", err);
      } finally {
        setIsLoadingAdminProfile(false);
      }
    }

    syncOfficialAdminProfile();
  }, [fetchTransactions, fetchSourcingOrders]);

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
    if (adminMerchantProfile && typeof adminMerchantProfile.grossSales === "number" && adminMerchantProfile.grossSales > 0) {
      return adminMerchantProfile.grossSales;
    }
    return transactions.reduce((acc, tx) => acc + (tx.status !== "failed" && tx.status !== "refunded" ? tx.amount : 0), 0);
  }, [transactions, adminMerchantProfile]);

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

  // Total Platform Commission Deducted
  const totalCommissionDeducted = useMemo(() => {
    if (adminMerchantProfile && typeof adminMerchantProfile.platformCommission === "number" && adminMerchantProfile.platformCommission > 0) {
      return adminMerchantProfile.platformCommission;
    }
    // Calculate matching admin standard platform rate (3.5%) or fallback to itemized fees
    const standardCommission = Math.round(totalVolume * 0.035 * 100) / 100;
    const txCommission = transactions.reduce((acc, tx) => {
      const fee = tx.feeETB ?? Math.round(tx.amount * 0.035);
      return acc + (tx.status !== "failed" ? fee : 0);
    }, 0);
    const payoutCommission = (payouts || []).reduce(
      (acc, p) => acc + Number(p.platformFee || 0),
      0
    );
    const sumCommission = txCommission + payoutCommission;
    return sumCommission > 0 ? sumCommission : standardCommission;
  }, [transactions, payouts, totalVolume, adminMerchantProfile]);

  // Total Admin Payout Transfers Received
  const totalAdminTransferred = useMemo(() => {
    if (adminMerchantProfile && typeof adminMerchantProfile.totalPaidOut === "number" && adminMerchantProfile.totalPaidOut > 0) {
      return adminMerchantProfile.totalPaidOut;
    }
    if (payouts && payouts.length > 0) {
      return payouts.reduce((acc, p) => {
        const net = Number(p.netPayoutAmount || p.amount || 0);
        return acc + (p.status?.toUpperCase() !== "FAILED" ? net : 0);
      }, 0);
    }
    return transactions
      .filter((tx) => tx.status === "completed" && tx.buyerCompany?.includes("Treasury Payout"))
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [payouts, transactions, adminMerchantProfile]);

  // Total Wholesale Sourcing Orders Paid
  const totalWholesaleSpend = useMemo(() => {
    return (sourcingOrders || []).reduce((acc, order) => {
      const amt = Number(order.totalETB || order.subtotal || 0);
      return acc + (order.status !== "cancelled" ? amt : 0);
    }, 0);
  }, [sourcingOrders]);

  const activeWholesaleEscrow = useMemo(() => {
    return (sourcingOrders || [])
      .filter((o) => o.status === "escrow_locked" || o.status === "in_transit")
      .reduce((acc, o) => acc + Number(o.totalETB || o.subtotal || 0), 0);
  }, [sourcingOrders]);

  // Available balance (Net Platform Balance)
  // Perfectly matches the official Admin API calculation:
  // Math.max(0, Math.round((grossSales - platformCommission - totalPaidOut) * 100) / 100)
  const availableBalance = useMemo(() => {
    if (adminMerchantProfile && typeof adminMerchantProfile.availableBalance === "number") {
      return adminMerchantProfile.availableBalance;
    }
    return Math.max(0, Math.round((totalVolume - totalCommissionDeducted - totalAdminTransferred) * 100) / 100);
  }, [totalVolume, totalCommissionDeducted, totalAdminTransferred, adminMerchantProfile]);

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
      return `$${inUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `ETB ${amountETB.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          tx.id.toLowerCase().includes(q) ||
          (tx.paymentId && tx.paymentId.toLowerCase().includes(q)) ||
          tx.transactionNumber.toLowerCase().includes(q) ||
          tx.buyerCompany.toLowerCase().includes(q) ||
          (tx.payerName && tx.payerName.toLowerCase().includes(q)) ||
          (tx.payerPhone && tx.payerPhone.toLowerCase().includes(q)) ||
          (tx.payerEmail && tx.payerEmail.toLowerCase().includes(q)) ||
          (tx.itemsSummary && tx.itemsSummary.toLowerCase().includes(q)) ||
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

  // Chatbot intelligence handler
  const handleSendChatMessage = (customQuery?: string) => {
    const q = (customQuery || chatInput).trim();
    if (!q) return;

    const userMsgId = `usr-${Date.now()}`;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newHistory = [
      ...chatMessages,
      { id: userMsgId, sender: "user" as const, text: q, timestamp: now },
    ];
    setChatMessages(newHistory);
    setChatInput("");

    setTimeout(() => {
      const lower = q.toLowerCase();
      const botMsgId = `bot-${Date.now()}`;
      let replyText = "";
      let actionType: "withdraw_prompt" | "balance_card" | "commission_card" | "payout_card" | undefined;

      if (
        lower.includes("balance") ||
        lower.includes("net") ||
        lower.includes("ሂሳብ") ||
        lower.includes("ስንት አለኝ") ||
        lower.includes("ቀሪ") ||
        lower.includes("hafteen") ||
        lower.includes("ተረፍ")
      ) {
        replyText =
          language === "am"
            ? `በአሁኑ ሰዓት በፕላትፎርሙ ላይ ለወጪ ዝግጁ የሆነ የተጣራ ቀሪ ሂሳብዎ **${formatMoney(availableBalance)}** ነው።\n\n• አጠቃላይ ሽያጭ፡ ${formatMoney(totalVolume)}\n• የተቆረጠ የመድረክ ኮሚሽን፡ - ${formatMoney(totalCommissionDeducted)}\n• አድሚን ያስተላለፈው ክፍያ፡ - ${formatMoney(totalAdminTransferred)}\n• የተጣራ ቀሪ ሂሳብ፡ ${formatMoney(availableBalance)}\n\nገንዘቡን ወደ ባንክ ሂሳብዎ ለማውጣት ከታች 'ገንዘብ አውጣ' የሚለውን መጫን ይችላሉ።`
            : language === "om"
            ? `Hafteen qulqulluu herrega keessanii yeroo ammaa baasiif qophii ta'e **${formatMoney(availableBalance)}** dha.\n\n• Gurgurtaa waliigalaa: ${formatMoney(totalVolume)}\n• Komishinii platformii: - ${formatMoney(totalCommissionDeducted)}\n• Adimiin kan dabarfame: - ${formatMoney(totalAdminTransferred)}\n• Haftee Qulqulluu: ${formatMoney(availableBalance)}`
            : language === "ti"
            ? `ኣብዚ ሰዓት ኣብ ፕላትፎርም ንምውጻእ ድሉው ዝኾነ ዝተጻረየ ተረፍ ሕሳብኩም **${formatMoney(availableBalance)}** እዩ።\n\n• ጠቕላላ መሸጣ፡ ${formatMoney(totalVolume)}\n• ዝተቖርጸ ኮሚሽን፡ - ${formatMoney(totalCommissionDeducted)}\n• ኣድሚን ዘመሓላለፎ፡ - ${formatMoney(totalAdminTransferred)}\n• ዝተጻረየ ተረፍ: ${formatMoney(availableBalance)}`
            : `Your net available treasury balance ready for immediate payout is **${formatMoney(availableBalance)}**.\n\n• Gross Sales Volume: ${formatMoney(totalVolume)}\n• Platform Commission Deducted: - ${formatMoney(totalCommissionDeducted)}\n• Admin Payouts Transferred: - ${formatMoney(totalAdminTransferred)}\n• Net Platform Balance: ${formatMoney(availableBalance)}`;
        actionType = "withdraw_prompt";
      } else if (
        lower.includes("commission") ||
        lower.includes("fee") ||
        lower.includes("ኮሚሽን") ||
        lower.includes("ተቆረጠ") ||
        lower.includes("hir'ifame") ||
        lower.includes("ዝተቖርጸ")
      ) {
        replyText =
          language === "am"
            ? `ከሽያጭዎ ላይ የተቆረጠው አጠቃላይ የመድረክ ኮሚሽን **- ${formatMoney(totalCommissionDeducted)}** ነው።\n• መደበኛ የመድረክ የኢስክሮው ተመን፡ 3.5%\n• የተጣራ የተከፈለዎት ገቢ፡ ${formatMoney(Math.max(0, totalVolume - totalCommissionDeducted))}`
            : language === "om"
            ? `Komishiniin platformii gurgurtaa keessan irraa hir'ifame waliigalaan **- ${formatMoney(totalCommissionDeducted)}** dha (Gatii Eeskirawuu 1.5%).`
            : language === "ti"
            ? `ካብ መሸጣኹም ዝተቖርጸ ናይ መድረኽ ኮሚሽን ጠቕላላ **- ${formatMoney(totalCommissionDeducted)}** እዩ (ናይ ኢስክሮው ክፍሊት 1.5%)።`
            : `Total platform escrow and technology commission deducted from your sales is **- ${formatMoney(totalCommissionDeducted)}** (Fixed 1.5% - 2.5% escrow fee rate).`;
      } else if (
        lower.includes("admin") ||
        lower.includes("transfer") ||
        lower.includes("አድሚን") ||
        lower.includes("ዝውውር") ||
        lower.includes("ተላከ") ||
        lower.includes("dabarse") ||
        lower.includes("ኣድሚን") ||
        lower.includes("ምስግጋር")
      ) {
        const lastPayout = payouts && payouts.length > 0 ? payouts[0] : null;
        const lastPayoutDate = lastPayout
          ? new Date(lastPayout.processedAt || lastPayout.createdAt).toLocaleDateString()
          : "N/A";
        const lastBank = lastPayout?.bankName || "Commercial Bank of Ethiopia";

        replyText =
          language === "am"
            ? `አድሚኑ እስካሁን ድረስ **${payouts?.length || 0}** ጊዜ አጠቃላይ **${formatMoney(totalAdminTransferred)}** ወደ ባንክ/ቴሌብር ሂሳብዎ አስተላልፏል።\n• የመጨረሻው ዝውውር፡ ${lastPayoutDate} በ ${lastBank}\n• ሁኔታ፡ የተረጋገጠ (RTGS Confirmed)\nሙሉ ዝርዝሩን 'ከአድሚን የተላለፉ ክፍያዎች' ታብ ላይ ማየት ይችላሉ።`
            : language === "om"
            ? `Adimiin hamma yoonaatti yeroo **${payouts?.length || 0}** waliigalaan **${formatMoney(totalAdminTransferred)}** gara herreega baankii/Telebirr keessaniitti dabarseera.`
            : language === "ti"
            ? `ኣድሚን ክሳብ ሕዚ ን **${payouts?.length || 0}** ግዜ ጠቕላላ **${formatMoney(totalAdminTransferred)}** ናብ ባንክ/ቴሌብር ሕሳብኩም ኣመሓላሊፉ ኣሎ።`
            : `Platform administration has executed **${payouts?.length || 0}** payout transfers totaling **${formatMoney(totalAdminTransferred)}** to your verified bank accounts & mobile wallets via Chapa & CBE RTGS clearing rails.`;
      } else if (
        lower.includes("escrow") ||
        lower.includes("ኢስክሮው") ||
        lower.includes("የተያዘ") ||
        lower.includes("ዋስትና") ||
        lower.includes("eeskirawuu") ||
        lower.includes("ውሕስነት")
      ) {
        const escrowCount = transactions.filter((t) => t.status === "escrow_held").length;
        replyText =
          language === "am"
            ? `በኢትዮጵያ ንግድ ባንክ ባለሦስት ወገን ኢስክሮው (CBE Tripartite Escrow) የተቆለፈ ዋስትና መጠን **${formatMoney(escrowBalance)}** (${escrowCount} ትዕዛዞች) ነው። ደንበኛው ዕቃውን ተረክቦ የዲጂታል ርክክብ ሲያረጋግጥ ገንዘቡ ወዲያውኑ ወደሚገኝ ሂሳብዎ ይለቀቃል!`
            : language === "om"
            ? `Kuusaa Eeskirawuu CBE keessatti maallaqni wabiidhaan hidhame **${formatMoney(escrowBalance)}** (${escrowCount} ajajoota) dha.`
            : language === "ti"
            ? `ኣብ ንግዲ ባንኪ ኢስክሮው ዝተታሕዘ መጠን ገንዘብ **${formatMoney(escrowBalance)}** (${escrowCount} ትእዛዛት) እዩ። ዓማዊል ኣቑሑቶም ተረኪቦም ምስ ኣረጋገጹ ብቐጥታ ይልቀቕ።`
            : `Buyer deposits locked under Commercial Bank of Ethiopia (CBE) Tripartite Escrow total **${formatMoney(escrowBalance)}** (${escrowCount} active orders). Released immediately upon electronic delivery POD signoff.`;
      } else if (
        lower.includes("wholesale") ||
        lower.includes("sourcing") ||
        lower.includes("ጅምላ") ||
        lower.includes("ግዢ") ||
        lower.includes("bittaa") ||
        lower.includes("ዕደጋ")
      ) {
        replyText =
          language === "am"
            ? `ከሌሎች ጅምላ አቅራቢዎች እና ፋብሪካዎች ለገዟቸው ሸቀጦች የከፈሉት አጠቃላይ ወጪ **${formatMoney(totalWholesaleSpend)}** (${sourcingOrders?.length || 0} የጅምላ ትዕዛዞች) ነው።`
            : language === "om"
            ? `Baasiin bittaa jumlaa oomishaalee dhiyeessitoota biroo irraa bittan waliigalaan **${formatMoney(totalWholesaleSpend)}** (${sourcingOrders?.length || 0} ajajoota) dha.`
            : language === "ti"
            ? `ካብ ካልኦት ናይ ጅምላ ኣቕረብቲ ዝተዓደገ ናይ ጅምላ ሸቐጥ ወጻኢታት ጠቕላላ **${formatMoney(totalWholesaleSpend)}** (${sourcingOrders?.length || 0} ትእዛዛት) እዩ።`
            : `Outbound procurement spend for wholesale commodities sourced from other platform producers totals **${formatMoney(totalWholesaleSpend)}** (${sourcingOrders?.length || 0} wholesale purchase orders).`;
      } else if (
        lower.includes("withdraw") ||
        lower.includes("payout") ||
        lower.includes("አውጣ") ||
        lower.includes("ማውጣት") ||
        lower.includes("ክፍያ") ||
        lower.includes("baasi") ||
        lower.includes("ኣውጽእ")
      ) {
        replyText =
          language === "am"
            ? `የክፍያ ማውጣት ጥያቄ ለማቅረብ ተዘጋጅቷል። በአሁኑ ሰዓት ለወጪ ዝግጁ የሆነ ሂሳብዎ **${formatMoney(availableBalance)}** ነው። ማውጣት የሚፈልጉትን የብር መጠን ይምረጡ ወይም ያስገቡ፡`
            : language === "om"
            ? `Gaaffii kaffaltii baasii dhiyeessuuf qophii dha. Hafteen keessan **${formatMoney(availableBalance)}** dha. Hamma baasuu barbaaddan filadhaa:`
            : language === "ti"
            ? `ናይ ክፍሊት ምውጻእ ሕቶ ንምቕራብ ድሉው እዩ። ዘሎ ዝተረፈ ገንዘብኩም **${formatMoney(availableBalance)}** እዩ። ክተውጽእዎ ዝደለኹም መጠን ምረጹ፡`
            : `Ready to dispatch a treasury payout request. Your available balance is **${formatMoney(availableBalance)}**. Select or enter the amount you wish to withdraw:`;
        actionType = "withdraw_prompt";
      } else {
        replyText =
          language === "am"
            ? `ሰላም! እኔ የክፍያ እና ግምጃ ቤት ረዳትዎ ነኝ። ስለ ቀሪ ሂሳብዎ (**${formatMoney(availableBalance)}**), ስለተቆረጠ ኮሚሽን (**- ${formatMoney(totalCommissionDeducted)}**), ከአድሚን ስለተላለፈ ክፍያ (**${formatMoney(totalAdminTransferred)}**), ወይም ገንዘብ ስለማውጣት የሚፈልጉትን መጠየቅ ይችላሉ።`
            : `Hello! I am your Treasury & Payout Assistant. You can ask about your available balance (${formatMoney(availableBalance)}), commission deducted (- ${formatMoney(totalCommissionDeducted)}), admin payouts (${formatMoney(totalAdminTransferred)}), or request a payout right now.`;
        actionType = "withdraw_prompt";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType,
        },
      ]);
    }, 350);
  };

  // Bot quick withdrawal dispatcher
  const handleBotQuickWithdraw = (amount: number) => {
    if (amount <= 0 || amount > availableBalance) {
      toast.error("Withdrawal amount cannot exceed available treasury balance.");
      return;
    }
    const def = settlementAccounts.find((a) => a.isDefault) || settlementAccounts[0];
    const destination = def
      ? `${def.bankName} (${def.shortCode} - ${def.accountNumber})`
      : "Commercial Bank of Ethiopia (CBE)";

    requestWithdrawal(amount, destination, "Dispatched via Treasury AI Assistant");

    const botMsgId = `bot-${Date.now()}`;
    const confirmationText =
      language === "am"
        ? `✓ የ **${formatMoney(amount)}** የክፍያ ማውጣት ጥያቄ በተሳካ ሁኔታ ተልኳል!\n• መድረሻ፡ ${destination}\n• የማጣሪያ ጊዜ፡ RTGS 1-3 ሰዓታት\nአድሚኑ ማስተላለፉን እንዳጠናቀቀ ማሳወቂያ ይደርስዎታል።`
        : `✓ Payout request of **${formatMoney(amount)}** successfully dispatched to ${destination}! RTGS interbank clearing initiated.`;

    setChatMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        sender: "bot",
        text: confirmationText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    toast.success(`Payout of ${formatMoney(amount)} requested successfully.`);
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
    const m = (method || "").toLowerCase();
    if (m.includes("mercatox card") || m.includes("card")) {
      return {
        bg: isLight
          ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold"
          : isSystem
          ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30 font-semibold"
          : "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-semibold",
        icon: CreditCard,
        short: m.includes("mercatox") ? "MercatoX Card" : "Card / Chapa",
      };
    }
    if (m.includes("telebirr")) {
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
    if (m.includes("chapa")) {
      return {
        bg: isLight
          ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
          : isSystem
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 font-semibold"
          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold",
        icon: ShieldCheck,
        short: "Chapa Gateway",
      };
    }
    if (m.includes("commercial bank") || m.includes("cbe")) {
      return {
        bg: isLight
          ? "bg-purple-50 text-purple-800 border-purple-300 font-semibold"
          : isSystem
          ? "bg-purple-500/20 text-purple-300 border-purple-400/30 font-semibold"
          : "bg-purple-500/15 text-purple-400 border-purple-500/30 font-semibold",
        icon: Landmark,
        short: "CBE Escrow",
      };
    }
    if (m.includes("awash")) {
      return {
        bg: isLight
          ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
          : isSystem
          ? "bg-amber-500/20 text-amber-300 border-amber-400/30 font-semibold"
          : "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
        icon: Building2,
        short: "Awash Escrow",
      };
    }
    if (m.includes("escrow")) {
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
    return {
      bg: isLight
        ? "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
        : isSystem
        ? "bg-blue-900/30 text-blue-200 border-blue-500/25 font-semibold"
        : "bg-slate-500/15 text-slate-400 border-slate-500/30 font-semibold",
      icon: CreditCard,
      short: method || "Wire",
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
        title={tr("title")}
        subtitle={tr("subtitle")}
        breadcrumbs={[
          { label: tr("breadcrumbDashboard"), onClick: () => setActiveTab("dashboard") },
          { label: tr("breadcrumbPayments") },
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
              <span>{tr("btnExport")}</span>
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
              <span>{showAccountsStrip ? tr("btnHideBanks") : tr("btnShowBanks")}</span>
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
              <span>{tr("btnWithdrawToBank")}</span>
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
            <strong>{tr("nbeEngine")}</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-80">
            <ShieldCheck className="h-3.5 w-3.5" />
            {tr("cbeVault")}
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
            <Smartphone className="h-3.5 w-3.5" />
            {tr("telebirrGateway")}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] opacity-75">
          <span>{tr("exchangeRateLabel")}</span>
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

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Primary Available Balance & Quick Actions */}
          <div className="space-y-3.5 lg:col-span-7">
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
                {tr("liveTreasuryBalance")}
              </span>
              <span className="text-xs text-white/70 font-mono">
                {tr("tierBadge")}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                {tr("availableForImmediate")}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-mono text-white drop-shadow-xs">
                  {formatMoney(availableBalance)}
                </span>
                {currencyMode === "ETB" && (
                  <span className="text-xs font-mono font-medium text-white/70">
                    ≈ ${(availableBalance / usdRate).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-white/80 max-w-xl leading-relaxed">
                {tr("settledNetDescription")}
              </p>
            </div>

            {/* Primary Action Buttons inside Hero */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setWithdrawAmount(Math.min(1000000, availableBalance));
                  setIsWithdrawModalOpen(true);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-98 ${
                  isLight
                    ? "bg-white text-emerald-950 hover:bg-slate-100 shadow-emerald-950/20"
                    : isSystem
                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-950/40"
                    : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
                }`}
              >
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                <span>{tr("btnWithdrawHero")}</span>
              </button>

              <button
                onClick={() => setIsChatbotOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-200 transition-all cursor-pointer shadow-lg shadow-amber-950/20 backdrop-blur-xs"
              >
                <Bot className="h-4 w-4 text-amber-300 animate-pulse" />
                <span>{tr("botOpenAssistant")}</span>
              </button>

              <button
                onClick={() => {
                  setMilestoneFilter("deposit_confirmed");
                  toast.success("Filtered table to active Escrow transactions.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-semibold text-white transition-all cursor-pointer backdrop-blur-xs"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span>{tr("btnViewLockedEscrow")}</span>
              </button>

              <button
                onClick={() => setShowAnalyticsStrip(!showAnalyticsStrip)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-white/90 transition-all cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{showAnalyticsStrip ? tr("btnHideTrends") : tr("btnShowTrends")}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchTransactions();
                  toast.info("Refreshing live payment & escrow ledger...");
                }}
                disabled={isLoadingTransactions}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-white/90 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingTransactions ? "animate-spin" : ""}`} />
                <span>{isLoadingTransactions ? tr("btnSyncing") : tr("btnRefresh")}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Transparent Net Settlement Formula Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/20 bg-black/35 p-3.5 sm:p-4 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{tr("formulaTitle")}</span>
                </div>
                <span className="text-[10px] font-mono text-white/60 uppercase">NBE RTGS</span>
              </div>

              <div className="mt-2.5 space-y-1.5 text-xs">
                {/* 1. Gross Sales */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/80 font-medium text-[11px] sm:text-xs">{tr("formulaGrossSales")}</span>
                  <span className="font-mono font-bold text-white text-xs sm:text-sm">+{formatMoney(totalVolume)}</span>
                </div>

                {/* 2. Platform Commission */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-200">
                  <span className="text-rose-200/90 font-medium text-[11px] sm:text-xs">{tr("formulaCommission")}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm">- {formatMoney(totalCommissionDeducted)}</span>
                </div>

                {/* 3. Admin Transferred */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-200">
                  <span className="text-emerald-200/90 font-medium text-[11px] sm:text-xs">{tr("formulaAdminTransferred")}</span>
                  <span className="font-mono font-bold text-xs sm:text-sm">- {formatMoney(totalAdminTransferred)}</span>
                </div>

                {/* 4. Net Platform Balance */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-400/25 border border-emerald-300/50 text-white shadow-md">
                  <span className="text-emerald-200 font-bold text-[11px] sm:text-xs">{tr("formulaNetAvailable")}</span>
                  <span className="font-mono font-black text-sm sm:text-base text-emerald-300">{formatMoney(availableBalance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Expanded High-Impact Metric Cards (Spacious Full-Width Grid with Balanced Typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* 1. Gross Volume */}
        <div
          onClick={() => {
            setActiveMainSection("inflows");
            setStatusFilter("all");
            setMilestoneFilter(null);
          }}
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-blue-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-blue-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-blue-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardGrossVolume")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-blue-50 text-blue-600 border border-blue-200" : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
            }`}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono tracking-tight">
            {formatShortMoney(totalVolume)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-blue-700" : "text-blue-300"
          }`}>
            <span className="font-semibold">{transactions.length}</span>
            <span className={isLight ? "text-slate-500" : "text-white/60"}>{tr("tabAll")}</span>
          </div>
        </div>

        {/* 2. Secured in Escrow */}
        <div
          onClick={() => {
            setActiveMainSection("inflows");
            setStatusFilter("escrow_held");
            setMilestoneFilter(null);
          }}
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-emerald-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-emerald-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardSecuredEscrow")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
            }`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono tracking-tight">
            {formatShortMoney(escrowBalance)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-emerald-700" : "text-emerald-300"
          }`}>
            <span className="font-semibold">{transactions.filter((t) => t.status === "escrow_held").length} Orders</span>
            <span className={isLight ? "text-slate-400" : "text-white/40"}>•</span>
            <span className="font-semibold">{tr("cardGuaranteed")}</span>
          </div>
        </div>

        {/* 3. Platform Commission Deducted */}
        <div
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all shadow-xs flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-rose-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-rose-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-rose-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardCommissionDeducted")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
            }`}>
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tracking-tight">
            - {formatShortMoney(totalCommissionDeducted)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-slate-500" : "text-white/70"
          }`}>
            <span>{tr("cardCommissionRate")}</span>
          </div>
        </div>

        {/* 4. Admin Transfers Received */}
        <div
          onClick={() => setActiveMainSection("payouts")}
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-emerald-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-blue-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardAdminTransferred")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
            }`}>
              <BadgeCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono tracking-tight">
            {formatShortMoney(totalAdminTransferred)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-emerald-700" : "text-emerald-300"
          }`}>
            <span>
              {tr("cardAdminTransfersCount", { count: payouts?.length || 0 })}
            </span>
          </div>
        </div>

        {/* 5. Wholesale Sourcing Orders Paid */}
        <div
          onClick={() => setActiveMainSection("wholesale")}
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-purple-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-purple-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-purple-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardWholesaleSpend")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-purple-500/20 text-purple-300 border border-purple-400/30"
            }`}>
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono text-purple-600 dark:text-purple-300 tracking-tight">
            {formatShortMoney(totalWholesaleSpend)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-purple-700" : "text-purple-300"
          }`}>
            <span>
              {tr("cardWholesaleOrdersCount", { count: sourcingOrders?.length || 0 })}
            </span>
          </div>
        </div>

        {/* 6. Total Disbursed / Settled */}
        <div
          onClick={() => {
            setActiveMainSection("inflows");
            setStatusFilter("completed");
            setMilestoneFilter(null);
          }}
          className={`group rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            isLight
              ? "border-slate-200/90 bg-white text-slate-900 hover:border-cyan-500/50"
              : isSystem
              ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-blue-950/20 hover:border-cyan-400/50"
              : "border-white/10 bg-[#12161f] text-white hover:border-cyan-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-600 group-hover:text-slate-900" : "text-white/80 group-hover:text-white"
            }`}>
              {tr("cardPaidOut")}
            </span>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isLight ? "bg-cyan-50 text-cyan-600 border border-cyan-200" : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
            }`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2.5 text-base sm:text-lg font-bold font-mono tracking-tight">
            {formatShortMoney(completedVolume)}
          </p>
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${
            isLight ? "text-slate-600" : "text-white/80"
          }`}>
            <span className={isLight ? "text-slate-500" : "text-white/70"}>
              {transactions.filter((t) => t.status === "completed").length} {tr("cardDisbursedVouchers")}
            </span>
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
                <span>{tr("chartTitle")}</span>
              </h3>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                {tr("chartSubtitle")}
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
                    <span>{tr("legendInflow")}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    <span>{tr("legendEscrow")}</span>
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
                <span>{tr("platformFee")}</span>
                <span
                  className={`font-semibold ${
                    isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {tr("successRate")}
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
                {tr("channelShareTitle")}
              </h4>

              <div className="space-y-3">
                {channelDistribution.length === 0 ? (
                  <div className="py-5 text-center">
                    <p className={`text-xs ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                      {tr("noChannelsRecorded")}
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
                <span className="font-semibold">{tr("dailyRtgsSweep")}</span> {tr("dailyRtgsSchedule")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Multi-Dimensional Primary Treasury Section Switcher */}
      <div
        className={`flex flex-wrap items-center gap-2 rounded-2xl border p-1.5 shadow-xs ${
          isLight
            ? "border-slate-200 bg-white"
            : isSystem
            ? "border-blue-500/25 bg-[#0f1b3b]"
            : "border-white/10 bg-[#12161f]"
        }`}
      >
        {[
          {
            id: "inflows",
            label: tr("sectionCustomerInflows"),
            icon: TrendingUp,
            count: transactions.length,
            badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
          },
          {
            id: "payouts",
            label: tr("sectionAdminPayouts"),
            icon: BadgeCheck,
            count: payouts?.length || 0,
            badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
          },
          {
            id: "wholesale",
            label: tr("sectionWholesaleSourcing"),
            icon: Package,
            count: sourcingOrders?.length || 0,
            badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
          },
          {
            id: "banks",
            label: tr("sectionBankingRails"),
            icon: Building2,
            count: settlementAccounts.length,
            badgeColor: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
          },
        ].map((sec) => {
          const isActive = activeMainSection === sec.id;
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveMainSection(sec.id as any)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
                    : isSystem
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "bg-emerald-400 text-slate-950 shadow-md font-black"
                  : isLight
                  ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  : isSystem
                  ? "text-blue-200/70 hover:bg-blue-900/40 hover:text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{sec.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  isActive
                    ? isLight || isSystem
                      ? "bg-white/25 text-white"
                      : "bg-slate-950/25 text-slate-950 font-black"
                    : sec.badgeColor
                }`}
              >
                {sec.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Verified Settlement Accounts & Banking Rails Shelf (Tailored per Theme & Method) */}
      {(activeMainSection === "banks" || (activeMainSection === "inflows" && showAccountsStrip)) && (
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
                <span>{tr("bankShelfTitle")}</span>
              </h3>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                {tr("bankShelfSubtitle")}
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
              <span>{tr("btnLinkBankRail")}</span>
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
                <h4 className="font-bold text-sm">{tr("noBanksLinkedTitle")}</h4>
                <p
                  className={`text-xs max-w-md mt-1 mb-4 ${
                    isLight ? "text-slate-500" : "text-zinc-400"
                  }`}
                >
                  {tr("noBanksLinkedDesc")}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{tr("btnLinkAccount")}</span>
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
                            {tr("defaultBadge")}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDefaultSettlementAccount(acc.id)}
                            title={tr("setDefaultAction")}
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
                          title={tr("removeAccountAction")}
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
                        {tr("withdrawHere")}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. Customer Inflows & CBE Escrow Management Section */}
      {activeMainSection === "inflows" && (
        <div className="space-y-6">
          {/* Interactive CBE Tripartite Escrow Protocol & Milestone Engine */}
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
                <h4 className="text-xs font-bold">{tr("escrowPipelineTitle")}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isLight
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : isSystem
                      ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {tr("cardGuaranteed")}
                </span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                {tr("escrowPipelineSubtitle")}
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
                <span>{tr("clearFilter")}</span>
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
                {tr("stage1Title")}
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
              {escrowStageStats.deposit.count} {tr("stage1Desc")}
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
                {tr("stage2Title")}
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
              {escrowStageStats.transit.count} {tr("stage2Desc")}
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
                {tr("stage3Title")}
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
              {escrowStageStats.inspection.count} {tr("stage3Desc")}
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
                {tr("stage4Title")}
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
              {escrowStageStats.released.count} {tr("stage4Desc")}
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
              { id: "all", label: tr("tabAll"), count: transactions.length },
              {
                id: "escrow_held",
                label: tr("tabEscrow"),
                count: transactions.filter((t) => t.status === "escrow_held").length,
              },
              {
                id: "completed",
                label: tr("tabCompleted"),
                count: transactions.filter((t) => t.status === "completed").length,
              },
              {
                id: "pending",
                label: tr("tabPending"),
                count: transactions.filter((t) => t.status === "pending").length,
              },
              {
                id: "refunded",
                label: tr("tabRefunded"),
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
              <span className="hidden sm:inline">{tr("viewTable")}</span>
            </button>

            <button
              onClick={() => setActiveViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getViewBtnStyle(
                activeViewMode === "grid"
              )}`}
              title="Card Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tr("viewCards")}</span>
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
              placeholder={tr("searchPlaceholder")}
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
              <option value="all">{tr("allBankingRails")}</option>
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
              <option value="date-desc">{tr("sortNewest")}</option>
              <option value="date-asc">{tr("sortOldest")}</option>
              <option value="amount-desc">{tr("sortAmountHigh")}</option>
              <option value="amount-asc">{tr("sortAmountLow")}</option>
              <option value="company-asc">{tr("sortBuyerAz")}</option>
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
                <span>{tr("btnReset")}</span>
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
            title={tr("emptyTitle")}
            description={tr("emptyDesc")}
            actionLabel={tr("btnResetFilters")}
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
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[1460px] text-left text-xs">
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
                  <th className="py-3.5 px-5 min-w-[190px] whitespace-nowrap">{tr("colPaymentIdDate")}</th>
                  <th className="py-3.5 px-4 min-w-[215px] whitespace-nowrap">{tr("colPayer")}</th>
                  <th className="py-3.5 px-4 min-w-[235px] whitespace-nowrap">{tr("colOrderPurpose")}</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">{tr("colGrossAmount")}</th>
                  <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">{tr("colCommissionFee")}</th>
                  <th className="py-3.5 px-4 min-w-[155px] whitespace-nowrap">{tr("colNetDisbursed")}</th>
                  <th className="py-3.5 px-4 min-w-[165px] whitespace-nowrap">{tr("colChannel")}</th>
                  <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">{tr("colGatewayRef")}</th>
                  <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">{tr("colStatus")}</th>
                  <th className="py-3.5 px-5 min-w-[140px] text-right whitespace-nowrap">{tr("colActions")}</th>
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
                  const displayPayId = tx.paymentId || tx.id;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedReceiptTx(tx)}
                      className={`transition-colors group cursor-pointer ${
                        isLight
                          ? "hover:bg-slate-50"
                          : isSystem
                          ? "hover:bg-blue-900/20"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* 1. Payment ID, Tx Ref & Date */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold">
                            {displayPayId.length > 14 ? `${displayPayId.slice(0, 12)}…` : displayPayId}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(displayPayId, `${tx.id}-pid`);
                            }}
                            title={`Copy Payment ID: ${displayPayId}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            {copiedRef === `${tx.id}-pid` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div
                          className={`text-[11px] font-mono mt-0.5 ${
                            isLight ? "text-slate-500" : isSystem ? "text-blue-200/75" : "text-zinc-400"
                          }`}
                        >
                          {tx.transactionNumber}
                        </div>
                        <div
                          className={`text-[10px] font-mono mt-0.5 ${
                            isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                          }`}
                        >
                          {tx.date}
                        </div>
                      </td>

                      {/* 2. Who Paid (Payer Name, Phone, Email / TIN) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-[10px] ${
                              isLight
                                ? "bg-slate-100 text-slate-700"
                                : isSystem
                                ? "bg-blue-600/20 text-blue-200"
                                : "bg-white/10 text-zinc-300"
                            }`}
                          >
                            {getAvatarInitials(tx.payerName || tx.buyerCompany)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold truncate max-w-[170px]">{tx.payerName || tx.buyerCompany}</div>
                            {(tx.payerPhone || tx.payerEmail || tx.buyerTIN) && (
                              <div
                                className={`text-[10px] font-mono truncate max-w-[170px] mt-0.5 ${
                                  isLight ? "text-slate-500" : isSystem ? "text-blue-300/70" : "text-zinc-400"
                                }`}
                              >
                                {tx.payerPhone || tx.payerEmail || `TIN: ${tx.buyerTIN}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Order Reference & Paid Items */}
                      <td className="py-4 px-4">
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
                        <p
                          className={`text-[11px] truncate max-w-[215px] mt-1 ${
                            isLight ? "text-slate-600" : isSystem ? "text-blue-100/80" : "text-zinc-300"
                          }`}
                          title={tx.itemsSummary || undefined}
                        >
                          {tx.itemsSummary || "B2B Wholesale Order Settlement"}
                        </p>
                      </td>

                      {/* 4. Gross Amount Paid */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs">{formatMoney(tx.amount)}</span>
                        {tx.deliveryFee != null && tx.deliveryFee > 0 && (
                          <div
                            className={`text-[10px] font-mono mt-0.5 ${
                              isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                            }`}
                          >
                            Incl. ETB {tx.deliveryFee.toLocaleString()} ship
                          </div>
                        )}
                      </td>

                      {/* 5. Platform Commission Fee Deducted */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-xs text-rose-500">
                          - {formatMoney(fee)}
                        </div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isLight ? "text-slate-400" : isSystem ? "text-blue-300/60" : "text-zinc-500"
                          }`}
                        >
                          1.5% Escrow
                        </div>
                      </td>

                      {/* 6. Net Disbursed */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div
                          className={`font-mono font-bold text-xs ${
                            isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {formatMoney(net)}
                        </div>
                      </td>

                      {/* 6. Payment Channel & Card/Bank */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-medium ${badgeConfig.bg}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{badgeConfig.short}</span>
                        </span>
                        {(tx.maskedCardNumber || tx.bankName) && (
                          <div
                            className={`text-[10px] font-mono truncate max-w-[155px] mt-1 ${
                              isLight ? "text-slate-500" : isSystem ? "text-blue-300/70" : "text-zinc-400"
                            }`}
                          >
                            {tx.maskedCardNumber || tx.bankName}
                          </div>
                        )}
                      </td>

                      {/* 7. Gateway Reference */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-1 font-mono text-[11px] ${
                            isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                          }`}
                        >
                          <span className="truncate max-w-[135px]">{tx.referenceNumber}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(tx.referenceNumber, `${tx.id}-ref`);
                            }}
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
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={tx.status} size="sm" />
                      </td>

                      {/* 9. Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                              <span>{tr("btnTrack")}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedReceiptTx(tx)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer shadow-xs ${
                              isLight
                                ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                : isSystem
                                ? "border-blue-500/25 bg-[#0c1630] hover:bg-[#122045] text-blue-200"
                                : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
                            }`}
                            title="View Full Payment Details & Official Voucher"
                          >
                            <Eye className="h-3 w-3" />
                            <span>{tr("btnDetails")}</span>
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
                        <p className="font-bold text-xs truncate">{tx.payerName || tx.buyerCompany}</p>
                        <p
                          className={`text-[10px] font-mono truncate ${
                            isLight ? "text-slate-500" : isSystem ? "text-blue-300/60" : "text-zinc-400"
                          }`}
                        >
                          Order: #{tx.orderNumber} {tx.payerPhone ? `• ${tx.payerPhone}` : ""}
                        </p>
                        {tx.itemsSummary && (
                          <p
                            className={`text-[10px] truncate mt-0.5 ${
                              isLight ? "text-slate-600" : isSystem ? "text-blue-100/75" : "text-zinc-300"
                            }`}
                          >
                            Paid for: {tx.itemsSummary}
                          </p>
                        )}
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
        </div>
      )}

      {/* 7. Admin Payout Transfers Received Section */}
      {activeMainSection === "payouts" && (
        <div className="space-y-4">
          {/* Admin Payouts Banner */}
          <div
            className={`rounded-2xl border p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              isLight
                ? "border-emerald-200 bg-emerald-50/70 text-slate-900"
                : isSystem
                ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
                : "border-emerald-500/20 bg-emerald-950/20 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs ${
                  isSystem ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">{tr("adminTransfersTitle")}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLight
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : isSystem
                        ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    Chapa & CBE RTGS
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isLight ? "text-slate-600" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                  }`}
                >
                  {tr("adminTransfersSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl border px-3.5 py-2 text-right ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/30 bg-[#0c1630]"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-70 block">
                  {tr("cardAdminTransferred")}
                </span>
                <span className="font-mono font-bold text-sm text-emerald-500">
                  {formatMoney(totalAdminTransferred)}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Admin Transfers */}
          {payouts.length === 0 ? (
            <div
              className={`rounded-2xl border p-10 text-center shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0f1b3b]"
                  : "border-white/10 bg-[#12161f]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-3">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">{tr("noAdminTransfersTitle")}</h4>
              <p
                className={`text-xs max-w-md mx-auto mt-1 mb-4 ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                {tr("noAdminTransfersDesc")}
              </p>
              <button
                onClick={() => {
                  setWithdrawAmount(Math.min(1000000, availableBalance));
                  setIsWithdrawModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>{tr("btnWithdrawToBank")}</span>
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
                  : "border-white/10 bg-[#12161f] text-white"
              }`}
            >
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[1060px] text-left text-xs">
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
                      <th className="py-3.5 px-5 min-w-[180px] whitespace-nowrap">{tr("colTransferRef")}</th>
                      <th className="py-3.5 px-4 min-w-[160px] whitespace-nowrap">{tr("colTransferDate")}</th>
                      <th className="py-3.5 px-4 min-w-[220px] whitespace-nowrap">{tr("colTargetAccount")}</th>
                      <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">{tr("colGrossAmount")}</th>
                      <th className="py-3.5 px-4 min-w-[140px] whitespace-nowrap">{tr("colCommissionFee")}</th>
                      <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">{tr("colTransferAmount")}</th>
                      <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">{tr("colTransferStatus")}</th>
                      <th className="py-3.5 px-5 min-w-[130px] text-right whitespace-nowrap">{tr("colActions")}</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isLight ? "divide-slate-100" : isSystem ? "divide-blue-500/15" : "divide-white/5"
                    }`}
                  >
                    {payouts.map((payout: any) => {
                      const pId = payout.id || "";
                      const txRef = payout.txRef || payout.transactionReference || `TXN-PAY-${String(pId).slice(0, 8).toUpperCase()}`;
                      const gross = Number(payout.amount || 0);
                      const fee = Number(payout.platformFee || 0);
                      const net = Number(payout.netPayoutAmount || (gross - fee));
                      const dateStr = payout.processedAt || payout.createdAt || new Date().toISOString();
                      const dateObj = new Date(dateStr);
                      const formattedDate = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : "—";
                      const formattedTime = !isNaN(dateObj.getTime())
                        ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
                        : "—";
                      const status = payout.status?.toUpperCase() === "PROCESSED" || payout.status?.toUpperCase() === "COMPLETED"
                        ? "completed"
                        : payout.status?.toUpperCase() === "FAILED"
                        ? "failed"
                        : "pending";

                      return (
                        <tr
                          key={payout.id}
                          className={`transition-colors group cursor-pointer ${
                            isLight ? "hover:bg-slate-50" : isSystem ? "hover:bg-blue-900/20" : "hover:bg-white/[0.02]"
                          }`}
                          onClick={() => setSelectedPayoutSlip(payout)}
                        >
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="font-mono font-bold flex items-center gap-1.5">
                              <span>{txRef}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(txRef, `payout-${payout.id}`);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                {copiedRef === `payout-${payout.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] font-mono opacity-60 mt-0.5">ID: {pId}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-mono">
                            <div className="flex items-center gap-1.5 font-semibold text-xs">
                              <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] opacity-75 mt-1 text-emerald-400 font-mono">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{formattedTime}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold">{payout.bankName || "Commercial Bank of Ethiopia"}</div>
                            <div className="text-[11px] font-mono opacity-70">
                              A/C: {payout.bankAccountNumber || "••••••••"}
                            </div>
                            {payout.bankAccountHolderName && (
                              <div className="text-[10px] opacity-60 truncate max-w-[180px]">
                                {payout.bankAccountHolderName}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                            {formatMoney(gross)}
                          </td>
                          <td className="py-4 px-4 font-mono font-medium text-rose-500 whitespace-nowrap">
                            - {formatMoney(fee)}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatMoney(net)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <StatusBadge status={status} size="sm" />
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedPayoutSlip(payout)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs ${
                                isLight
                                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  : isSystem
                                  ? "border-blue-500/25 bg-[#0c1630] text-blue-100 hover:bg-[#122045]"
                                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{tr("btnViewTransferVoucher")}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Wholesale Sourcing Orders & Purchases Paid Section */}
      {activeMainSection === "wholesale" && (
        <div className="space-y-4">
          {/* Wholesale Orders Banner */}
          <div
            className={`rounded-2xl border p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
              isLight
                ? "border-purple-200 bg-purple-50/70 text-slate-900"
                : isSystem
                ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
                : "border-purple-500/20 bg-purple-950/20 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-xs ${
                  isSystem ? "bg-blue-600" : "bg-purple-600"
                }`}
              >
                <Package className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">{tr("wholesaleOrdersTitle")}</h4>
                  <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 text-[10px] font-bold">
                    B2B Sourcing Rails
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isLight ? "text-slate-600" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                  }`}
                >
                  {tr("wholesaleOrdersSubtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl border px-3.5 py-2 text-right ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/30 bg-[#0c1630]"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-70 block">
                  {tr("cardWholesaleSpend")}
                </span>
                <span className="font-mono font-bold text-sm text-purple-400">
                  {formatMoney(totalWholesaleSpend)}
                </span>
              </div>
            </div>
          </div>

          {/* Table of Wholesale Orders */}
          {sourcingOrders.length === 0 ? (
            <div
              className={`rounded-2xl border p-10 text-center shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0f1b3b]"
                  : "border-white/10 bg-[#12161f]"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm">{tr("noWholesaleOrdersTitle")}</h4>
              <p
                className={`text-xs max-w-md mx-auto mt-1 mb-4 ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                {tr("noWholesaleOrdersDesc")}
              </p>
              <button
                onClick={() => setActiveTab("sourcing")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{tr("btnExploreWholesale")}</span>
              </button>
            </div>
          ) : (
            <div
              className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0f1b3b] text-white shadow-md shadow-blue-950/20"
                  : "border-white/10 bg-[#12161f] text-white"
              }`}
            >
              <div className="overflow-x-auto pb-2">
                <table className="w-full min-w-[1060px] text-left text-xs">
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
                      <th className="py-3.5 px-5 min-w-[180px] whitespace-nowrap">{tr("colPoNumber")}</th>
                      <th className="py-3.5 px-4 min-w-[200px] whitespace-nowrap">{tr("colSupplierName")}</th>
                      <th className="py-3.5 px-4 min-w-[220px] whitespace-nowrap">{tr("colCommodityQuantity")}</th>
                      <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">{tr("colAmountPaidWholesale")}</th>
                      <th className="py-3.5 px-4 min-w-[150px] whitespace-nowrap">{tr("colPaymentRail")}</th>
                      <th className="py-3.5 px-4 min-w-[130px] whitespace-nowrap">{tr("colOrderStatus")}</th>
                      <th className="py-3.5 px-5 min-w-[130px] text-right whitespace-nowrap">{tr("colActions")}</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isLight ? "divide-slate-100" : isSystem ? "divide-blue-500/15" : "divide-white/5"
                    }`}
                  >
                    {sourcingOrders.map((order: SourcingOrder) => {
                      const totalPaid = Number(order.totalETB || order.subtotal || 0);
                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors group cursor-pointer ${
                            isLight ? "hover:bg-slate-50" : isSystem ? "hover:bg-blue-900/20" : "hover:bg-white/[0.02]"
                          }`}
                          onClick={() => setSelectedWholesaleOrder(order)}
                        >
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="font-mono font-bold flex items-center gap-1.5">
                              <span>{order.orderNumber}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(order.orderNumber, `so-${order.id}`);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                {copiedRef === `so-${order.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] font-mono opacity-60 mt-0.5">{order.id}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-bold">{order.supplierName}</div>
                            {order.supplierTin && (
                              <div className="text-[10px] font-mono opacity-60">TIN: {order.supplierTin}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold truncate max-w-[200px]">{order.productName}</div>
                            <div className="text-[11px] font-mono opacity-70">
                              {order.quantity} {order.unit} × ETB {order.unitPrice?.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono font-bold whitespace-nowrap text-purple-400">
                            {formatMoney(totalPaid)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              <span>{order.paymentMethod || "Chapa Escrow"}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <StatusBadge status={order.status as any} size="sm" />
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedWholesaleOrder(order)}
                              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer shadow-xs ${
                                isLight
                                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  : isSystem
                                  ? "border-blue-500/25 bg-[#0c1630] text-blue-100 hover:bg-[#122045]"
                                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{tr("btnDetails")}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Modern Fintech Withdrawal Modal (Fully Theme-Adapted) */}
      <ModalDialog
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title={tr("modalWithdrawTitle")}
        subtitle={tr("modalWithdrawSubtitle")}
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
          title={tr("modalVoucherTitle")}
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
                <p className="font-bold mt-1">{profile?.businessName || "Verified MercatoX Supplier"}</p>
                <p className="text-[11px] opacity-75">
                  TIN: {(profile as any)?.tinNumber || "Verified Merchant"} • Payment ID: {selectedReceiptTx.paymentId || selectedReceiptTx.id}
                </p>
                <p className="text-[11px] opacity-75">Addis Ababa, Ethiopia</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Payer / Customer Details
                </p>
                <p className="font-bold mt-1">{selectedReceiptTx.payerName || selectedReceiptTx.buyerCompany}</p>
                {selectedReceiptTx.payerPhone && (
                  <p className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="h-3 w-3 opacity-70" />
                    <span>{selectedReceiptTx.payerPhone}</span>
                  </p>
                )}
                {selectedReceiptTx.payerEmail && (
                  <p className="text-[11px] opacity-80 flex items-center gap-1 mt-0.5 font-mono truncate">
                    <Mail className="h-3 w-3 opacity-70" />
                    <span>{selectedReceiptTx.payerEmail}</span>
                  </p>
                )}
                {selectedReceiptTx.deliveryAddress && (
                  <p className="text-[11px] opacity-75 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 opacity-70 shrink-0" />
                    <span className="truncate">{selectedReceiptTx.deliveryAddress}</span>
                  </p>
                )}
                <p className="text-[11px] opacity-75 mt-0.5 font-mono">
                  Order: #{selectedReceiptTx.orderNumber} {selectedReceiptTx.orderStatus ? `(${selectedReceiptTx.orderStatus})` : ""}
                </p>
              </div>
            </div>

            {/* Complete Payment Identifiers & Banking Rail Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div
                className={`rounded-xl border p-2.5 ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : isSystem
                    ? "border-blue-500/20 bg-[#0c1630]"
                    : "border-white/10"
                }`}
              >
                <span className="opacity-60 block text-[10px]">Payment ID</span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedReceiptTx.paymentId || selectedReceiptTx.id, "modal-pid")}
                  className="font-mono font-semibold truncate flex items-center gap-1 w-full text-left cursor-pointer hover:underline"
                >
                  <span className="truncate">{selectedReceiptTx.paymentId || selectedReceiptTx.id}</span>
                  <Copy className="h-3 w-3 shrink-0 opacity-60" />
                </button>
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
                <span className="opacity-60 block text-[10px]">Transaction Ref</span>
                <span className="font-mono font-semibold truncate block">
                  {selectedReceiptTx.transactionNumber}
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
                <span className="opacity-60 block text-[10px]">Payment Method</span>
                <span className="font-semibold">{selectedReceiptTx.paymentMethod}</span>
                {(selectedReceiptTx.maskedCardNumber || selectedReceiptTx.bankName) && (
                  <span className="block text-[10px] font-mono opacity-75 mt-0.5 truncate">
                    {[selectedReceiptTx.bankName, selectedReceiptTx.maskedCardNumber, selectedReceiptTx.depositorName].filter(Boolean).join(" • ")}
                  </span>
                )}
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
                <span className="opacity-60 block text-[10px]">Paid Date & Time</span>
                <span className="font-mono font-semibold block">{selectedReceiptTx.date}</span>
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
                <span className="opacity-60 block text-[10px]">Status & Escrow</span>
                <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <StatusBadge status={selectedReceiptTx.status} size="sm" />
                  {selectedReceiptTx.escrowStatus && (
                    <span className="text-[10px] font-mono opacity-75">({selectedReceiptTx.escrowStatus})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Paid Items / What Customer Paid For */}
            {((selectedReceiptTx.items && selectedReceiptTx.items.length > 0) || selectedReceiptTx.itemsSummary) && (
              <div className="rounded-2xl border border-current/10 overflow-hidden">
                <div className="bg-current/5 border-b border-current/10 px-3 py-2 flex items-center justify-between text-[10px] uppercase font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Items Paid For ({selectedReceiptTx.itemsCount || selectedReceiptTx.items?.length || 1})</span>
                  </span>
                  <span className="font-mono">Order #{selectedReceiptTx.orderNumber}</span>
                </div>
                {selectedReceiptTx.items && selectedReceiptTx.items.length > 0 ? (
                  <div className="divide-y divide-current/5 text-xs">
                    {selectedReceiptTx.items.map((item, idx) => (
                      <div key={item.id || idx} className="px-3 py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.productTitle}</p>
                          <p className="text-[10px] opacity-70 font-mono">
                            {item.quantity} {item.unitOfMeasure || "unit"} × ETB {Number(item.unitPrice || 0).toLocaleString()}
                          </p>
                        </div>
                        <span className="font-mono font-bold shrink-0">
                          ETB {Number(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-3 py-2.5 text-xs opacity-85">{selectedReceiptTx.itemsSummary}</p>
                )}
              </div>
            )}

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
                  {selectedReceiptTx.subtotalAmount != null && (
                    <tr>
                      <td className="py-2 px-3 font-sans opacity-85">Items Subtotal</td>
                      <td className="py-2 px-3 text-right opacity-70">Goods</td>
                      <td className="py-2 px-3 text-right">
                        ETB {selectedReceiptTx.subtotalAmount.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {selectedReceiptTx.deliveryFee != null && selectedReceiptTx.deliveryFee > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans opacity-85">Freight / Delivery Fee</td>
                      <td className="py-2 px-3 text-right opacity-70">Shipping</td>
                      <td className="py-2 px-3 text-right">
                        ETB {selectedReceiptTx.deliveryFee.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium">Gross Order Payment Received</td>
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
          title={tr("modalEscrowTitle")}
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
        title={tr("modalLinkBankTitle")}
        subtitle={tr("modalLinkBankSubtitle")}
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

      {/* 12. Official Admin Payout Slip Modal */}
      {selectedPayoutSlip && (
        <ModalDialog
          isOpen={!!selectedPayoutSlip}
          onClose={() => setSelectedPayoutSlip(null)}
          title={tr("modalVoucherTitle")}
          subtitle={`National Bank of Ethiopia & Chapa RTGS record for ${selectedPayoutSlip.txRef || selectedPayoutSlip.id}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] opacity-60 font-mono">
                Ref: {selectedPayoutSlip.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Printing admin payout voucher...");
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
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPayoutSlip(null)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold shadow-xs cursor-pointer ${
                    isLight
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : isSystem
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-current/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-tight">
                    MERCATO<span className="text-emerald-500">X</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider rounded-lg bg-emerald-500/20 text-emerald-500 px-2 py-0.5 font-bold">
                    Admin Payout Transfer Slip
                  </span>
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">
                  MercatoX Administrative Treasury & National Bank of Ethiopia Clearing Rail
                </p>
              </div>

              <div className="text-right font-mono">
                <p className="font-bold">{selectedPayoutSlip.txRef || selectedPayoutSlip.id.slice(0, 10)}</p>
                <p className="text-[11px] opacity-75 mt-0.5">
                  {(() => {
                    const d = new Date(selectedPayoutSlip.processedAt || selectedPayoutSlip.createdAt || "");
                    return !isNaN(d.getTime())
                      ? `${d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} • ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`
                      : "Confirmed";
                  })()}
                </p>
              </div>
            </div>

            {/* Target Account Info */}
            <div
              className={`rounded-2xl border p-3.5 space-y-2 ${
                isLight
                  ? "border-slate-200 bg-slate-50/70"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                Destination Settlement Account
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{selectedPayoutSlip.bankName || "Commercial Bank of Ethiopia"}</p>
                  <p className="font-mono text-xs opacity-75 mt-0.5">
                    A/C: {selectedPayoutSlip.bankAccountNumber || "••••••••"}
                  </p>
                  {selectedPayoutSlip.bankAccountHolderName && (
                    <p className="text-[11px] opacity-70">{selectedPayoutSlip.bankAccountHolderName}</p>
                  )}
                </div>
                <StatusBadge
                  status={
                    selectedPayoutSlip.status?.toUpperCase() === "PROCESSED" ||
                    selectedPayoutSlip.status?.toUpperCase() === "COMPLETED"
                      ? "completed"
                      : "pending"
                  }
                  size="sm"
                />
              </div>
            </div>

            {/* Financial Breakdown */}
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
                    <td className="py-2.5 px-3 font-sans font-medium">Gross Payout Requested</td>
                    <td className="py-2.5 px-3 text-right opacity-70">100.0%</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      ETB {Number(selectedPayoutSlip.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans opacity-80">Platform Commission & Clearing Fee</td>
                    <td className="py-2.5 px-3 text-right opacity-70">Fee</td>
                    <td className="py-2.5 px-3 text-right text-rose-500">
                      - ETB {Number(selectedPayoutSlip.platformFee || 0).toLocaleString()}
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
                    <td className="py-3 px-3 font-sans">Net Transferred to Destination Account</td>
                    <td className="py-3 px-3 text-right">Transferred</td>
                    <td className="py-3 px-3 text-right text-sm">
                      ETB {Number(selectedPayoutSlip.netPayoutAmount || (selectedPayoutSlip.amount - (selectedPayoutSlip.platformFee || 0))).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={`rounded-2xl p-3 text-[11px] flex items-start gap-2 ${
                isLight
                  ? "bg-slate-50 text-slate-600"
                  : isSystem
                  ? "bg-[#0c1630] text-blue-200"
                  : "bg-white/5 text-zinc-400"
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              <p>
                Transfer initiated and approved by MercatoX Administrative Treasury. Funds credited via National Bank of Ethiopia RTGS clearing channel.
              </p>
            </div>
          </div>
        </ModalDialog>
      )}

      {/* 13. Official Wholesale Purchase Voucher Modal */}
      {selectedWholesaleOrder && (
        <ModalDialog
          isOpen={!!selectedWholesaleOrder}
          onClose={() => setSelectedWholesaleOrder(null)}
          title={tr("modalVoucherTitle")}
          subtitle={`Wholesale Sourcing Order #${selectedWholesaleOrder.orderNumber}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] opacity-60 font-mono">
                Vendor: {selectedWholesaleOrder.supplierName}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Printing wholesale purchase voucher...");
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
                  onClick={() => setSelectedWholesaleOrder(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-current/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-tight">
                    MERCATO<span className="text-emerald-500">X</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider rounded-lg bg-purple-500/20 text-purple-400 px-2 py-0.5 font-bold">
                    Wholesale Purchase Voucher
                  </span>
                </div>
                <p className="text-[11px] opacity-75 mt-0.5">
                  B2B Commercial Procurement & Escrow Deposit Record
                </p>
              </div>
              <div className="text-right font-mono">
                <p className="font-bold">{selectedWholesaleOrder.orderNumber}</p>
                <p className="text-[11px] opacity-70">
                  {selectedWholesaleOrder.destinationWarehouseName || "Central Logistics Hub"}
                </p>
              </div>
            </div>

            {/* Vendor & Delivery info */}
            <div
              className={`grid grid-cols-2 gap-4 rounded-2xl border p-3.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50/60"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Wholesale Vendor / Supplier
                </span>
                <p className="font-bold mt-1">{selectedWholesaleOrder.supplierName}</p>
                {selectedWholesaleOrder.supplierTin && (
                  <p className="text-[11px] font-mono opacity-70">TIN: {selectedWholesaleOrder.supplierTin}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                  Payment & Escrow Status
                </span>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <StatusBadge status={selectedWholesaleOrder.status as any} size="sm" />
                  <span className="text-[11px] font-mono opacity-75">
                    Rail: {selectedWholesaleOrder.paymentMethod || "Chapa Escrow"}
                  </span>
                </div>
              </div>
            </div>

            {/* Commodity Details */}
            <div className="rounded-2xl border border-current/10 p-3 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                Purchased Commodity Details
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{selectedWholesaleOrder.productName}</p>
                  <p className="text-[11px] font-mono opacity-75 mt-0.5">
                    SKU: {selectedWholesaleOrder.productSku} • Qty: {selectedWholesaleOrder.quantity} {selectedWholesaleOrder.unit}
                  </p>
                </div>
                <p className="font-mono font-bold text-base text-purple-400">
                  ETB {Number(selectedWholesaleOrder.totalETB || selectedWholesaleOrder.subtotal || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-2xl border border-current/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-current/5 border-b border-current/10 text-[10px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Item Breakdown</th>
                    <th className="py-2.5 px-3 text-right">Calculation</th>
                    <th className="py-2.5 px-3 text-right">ETB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/5 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans opacity-85">Subtotal</td>
                    <td className="py-2 px-3 text-right opacity-70">
                      {selectedWholesaleOrder.quantity} × {selectedWholesaleOrder.unitPrice?.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      ETB {Number(selectedWholesaleOrder.subtotal || (selectedWholesaleOrder.quantity * selectedWholesaleOrder.unitPrice)).toLocaleString()}
                    </td>
                  </tr>
                  {selectedWholesaleOrder.vatTax != null && selectedWholesaleOrder.vatTax > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans opacity-85">VAT (15%)</td>
                      <td className="py-2 px-3 text-right opacity-70">Tax</td>
                      <td className="py-2 px-3 text-right">
                        ETB {Number(selectedWholesaleOrder.vatTax).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {selectedWholesaleOrder.freightCost != null && selectedWholesaleOrder.freightCost > 0 && (
                    <tr>
                      <td className="py-2 px-3 font-sans opacity-85">Freight & Logistics</td>
                      <td className="py-2 px-3 text-right opacity-70">Shipping</td>
                      <td className="py-2 px-3 text-right">
                        ETB {Number(selectedWholesaleOrder.freightCost).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr
                    className={`font-bold ${
                      isLight
                        ? "bg-purple-50 text-purple-950"
                        : isSystem
                        ? "bg-blue-600/15 text-blue-300"
                        : "bg-purple-500/10 text-purple-300"
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">Total Amount Paid Out</td>
                    <td className="py-3 px-3 text-right">Paid</td>
                    <td className="py-3 px-3 text-right text-sm">
                      ETB {Number(selectedWholesaleOrder.totalETB || selectedWholesaleOrder.subtotal || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className={`rounded-2xl p-3 text-[11px] flex items-start gap-2 ${
                isLight
                  ? "bg-slate-50 text-slate-600"
                  : isSystem
                  ? "bg-[#0c1630] text-blue-200"
                  : "bg-white/5 text-zinc-400"
              }`}
            >
              <Info className="h-4 w-4 shrink-0 text-purple-500 mt-0.5" />
              <p>
                Funds held securely in MercatoX Buyer Escrow. Upon delivery inspection and OTP confirmation, funds will release to the seller.
              </p>
            </div>
          </div>
        </ModalDialog>
      )}

      {/* Floating Treasury AI Assistant Launcher & Interactive Drawer */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {!isChatbotOpen && (
          <button
            type="button"
            onClick={() => setIsChatbotOpen(true)}
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 px-4 py-3 text-white shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/30 backdrop-blur-md"
            title={tr("botTitle")}
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight">{tr("botTitle")}</p>
              <p className="text-[10px] text-emerald-100 font-medium opacity-85 leading-tight">
                {tr("botQuickPromptBalance")}
              </p>
            </div>
          </button>
        )}

        {/* Chatbot Window / Popover */}
        {isChatbotOpen && (
          <div
            className={`w-[95vw] sm:w-[440px] max-h-[640px] h-[85vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200 z-50 ${
              isLight
                ? "border-slate-200 bg-white/95 text-slate-900 shadow-slate-900/20"
                : isSystem
                ? "border-blue-500/30 bg-[#0c1630]/95 text-white shadow-blue-950/50"
                : "border-white/15 bg-[#12161f]/95 text-white shadow-black/60"
            }`}
          >
            {/* Header */}
            <div
              className={`p-3.5 sm:p-4 border-b flex items-center justify-between ${
                isLight
                  ? "border-slate-200 bg-gradient-to-r from-emerald-700 to-teal-800 text-white"
                  : isSystem
                  ? "border-blue-500/30 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white"
                  : "border-white/10 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                      {tr("botTitle")}
                    </h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 leading-tight mt-0.5 truncate max-w-[240px]">
                    {tr("botSubtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsChatbotOpen(false)}
                  className="rounded-lg p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={tr("botClose")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Pills Bar */}
            <div
              className={`p-2 border-b overflow-x-auto flex items-center gap-1.5 scrollbar-thin ${
                isLight ? "border-slate-200 bg-slate-50" : isSystem ? "border-blue-500/20 bg-[#091024]" : "border-white/5 bg-black/20"
              }`}
            >
              <button
                type="button"
                onClick={() => handleSendChatMessage(tr("botQuickPromptBalance"))}
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
              >
                💰 {tr("botQuickPromptBalance")}
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(tr("botQuickPromptCommission"))}
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-rose-500/15 border border-rose-400/30 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer"
              >
                📊 {tr("botQuickPromptCommission")}
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(tr("botQuickPromptAdminTransfers"))}
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-blue-500/15 border border-blue-400/30 text-blue-400 hover:bg-blue-500/25 transition-all cursor-pointer"
              >
                🏦 {tr("botQuickPromptAdminTransfers")}
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(tr("botQuickPromptEscrow"))}
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-amber-500/15 border border-amber-400/30 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer"
              >
                🔒 {tr("botQuickPromptEscrow")}
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage(tr("botQuickPromptWithdraw"))}
                className="whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold bg-teal-500/15 border border-teal-400/30 text-teal-300 hover:bg-teal-500/25 transition-all cursor-pointer"
              >
                ⚡ {tr("botQuickPromptWithdraw")}
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 text-xs">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {!isUser && (
                        <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mb-1">
                          <Bot className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                          isUser
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-md"
                            : isLight
                            ? "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200"
                            : isSystem
                            ? "bg-[#14234b] text-blue-50 rounded-bl-xs border border-blue-500/30"
                            : "bg-white/10 text-white rounded-bl-xs border border-white/10"
                        }`}
                      >
                        <p className="whitespace-pre-line text-xs">{msg.text}</p>
                      </div>
                    </div>
                    <span className="text-[10px] opacity-50 px-8 mt-1 font-mono">
                      {msg.timestamp}
                    </span>

                    {/* Interactive Withdrawal Box if bot returned withdraw_prompt */}
                    {!isUser && msg.actionType === "withdraw_prompt" && (
                      <div
                        className={`mt-2 ml-8 p-3 rounded-xl border space-y-2.5 max-w-[90%] shadow-lg ${
                          isLight
                            ? "bg-white border-slate-200"
                            : isSystem
                            ? "bg-[#0f1b3b] border-blue-500/30"
                            : "bg-black/30 border-white/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                            {tr("botQuickPromptWithdraw")}
                          </span>
                          <span className="text-[11px] font-mono opacity-80">
                            Max: {formatMoney(availableBalance)}
                          </span>
                        </div>

                        {/* Presets */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                            const val = Math.floor(availableBalance * ratio);
                            const label = `${Math.round(ratio * 100)}%`;
                            return (
                              <button
                                key={ratio}
                                type="button"
                                onClick={() => setBotWithdrawAmount(val)}
                                className={`rounded-lg py-1 px-1.5 text-[10px] font-bold border transition-all cursor-pointer ${
                                  botWithdrawAmount === val
                                    ? "bg-emerald-500 text-white border-emerald-400"
                                    : "bg-white/5 border-current/15 hover:bg-white/10"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Amount Input */}
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold font-mono text-[11px] opacity-70">
                            ETB
                          </span>
                          <input
                            type="number"
                            min="1"
                            max={availableBalance}
                            value={botWithdrawAmount || ""}
                            onChange={(e) => setBotWithdrawAmount(Number(e.target.value))}
                            placeholder="Enter amount..."
                            className={`w-full rounded-lg border pl-10 pr-2.5 py-1.5 text-xs font-mono font-bold focus:outline-hidden ${
                              isLight
                                ? "border-slate-200 bg-slate-50 text-slate-900"
                                : isSystem
                                ? "border-blue-500/30 bg-[#0c1630] text-white"
                                : "border-white/15 bg-white/5 text-white"
                            }`}
                          />
                        </div>

                        {/* Destination Bank display */}
                        <div className="text-[10px] opacity-75 truncate">
                          To: {settlementAccounts[0]?.bankName || "Commercial Bank of Ethiopia"} (
                          {settlementAccounts[0]?.accountNumber || "••••••••"})
                        </div>

                        {/* Submit button */}
                        <button
                          type="button"
                          onClick={() => handleBotQuickWithdraw(botWithdrawAmount)}
                          disabled={botWithdrawAmount <= 0 || botWithdrawAmount > availableBalance}
                          className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-1.5 text-xs shadow-md cursor-pointer transition-all active:scale-98"
                        >
                          {tr("botWithdrawAction")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className={`p-2.5 sm:p-3 border-t flex items-center gap-2 ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/30 bg-[#0c1630]" : "border-white/10 bg-[#12161f]"
              }`}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={tr("botAskPlaceholder")}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs focus:outline-hidden transition-colors ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500"
                    : isSystem
                    ? "border-blue-500/30 bg-[#091024] text-white focus:border-blue-400"
                    : "border-white/15 bg-white/5 text-white focus:border-emerald-400"
                }`}
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tr("botSend")}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
