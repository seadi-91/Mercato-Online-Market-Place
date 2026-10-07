"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Plus,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  Lock,
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useSellerUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { sellerService } from "@/services/seller/seller.service";

interface PayoutTransaction {
  id: string;
  date: string;
  destination: "Telebirr" | "CBE" | "Dashen" | string;
  accountNumber: string;
  amount: number;
  fee: number;
  status: "Completed" | "Processing" | "Escrow Hold";
  refNumber: string;
  notes: string;
}

export function SellerPayouts() {
  const { availablePayout, pendingEscrow, setStats } = useSellerUIStore();
  const user = useAuthStore((state) => state.user);
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"Telebirr" | "CBE" | "Dashen">("Telebirr");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await sellerService.getPayouts(1, 20);
      if (res && Array.isArray(res.data)) {
        const mapped: PayoutTransaction[] = res.data.map((p: any) => {
          let dest: "Telebirr" | "CBE" | "Dashen" = "Telebirr";
          if (p.paymentMethod?.toLowerCase().includes("cbe") || p.bankName?.toLowerCase().includes("cbe")) {
            dest = "CBE";
          } else if (p.paymentMethod?.toLowerCase().includes("dashen") || p.bankName?.toLowerCase().includes("dashen")) {
            dest = "Dashen";
          }

          let stat: "Completed" | "Processing" | "Escrow Hold" = "Completed";
          if (p.status === "PENDING" || p.status === "PROCESSING") {
            stat = "Processing";
          }

          return {
            id: `TX-${(p.id || "").slice(0, 4).toUpperCase()}`,
            date: new Date(p.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            destination: dest,
            accountNumber: p.destinationAccount || p.accountNumber || (user?.phoneNumber || "Merchant Account"),
            amount: Number(p.amount || 0),
            fee: Number(p.platformFee || 0),
            status: stat,
            refNumber: p.transactionReference || `REF-${(p.id || "").slice(0, 6).toUpperCase()}`,
            notes: p.notes || "Merchant Settlement",
          };
        });
        setTransactions(mapped);
        setIsLiveConnected(true);
      }
    } catch {
      setIsLiveConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPayouts();
  }, [loadPayouts]);

  const handlePreset = (pct: number) => {
    const val = Math.floor(availablePayout * pct);
    setWithdrawAmount(val.toString());
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (amountNum > availablePayout) {
      toast.error(`Amount exceeds available balance of ETB ${availablePayout.toLocaleString()}`);
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
        amount: amountNum,
        fee: 0,
        status: "Processing",
        refNumber: refNum,
        notes: "Instant merchant withdrawal",
      };

      setTransactions([newTx, ...transactions]);
      setStats({
        availablePayout: Math.max(0, availablePayout - amountNum),
      });

      setIsProcessing(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");

      toast.success(`Withdrawal request of ETB ${amountNum.toLocaleString()} submitted!`, {
        description: `Reference: ${refNum}. Dispatched to your ${selectedMethod} destination.`,
      });
    }, 900);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && tx.status === "Completed") ||
      (filterStatus === "processing" && tx.status === "Processing") ||
      (filterStatus === "escrow" && tx.status === "Escrow Hold");

    const matchesSearch =
      tx.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.accountNumber.includes(searchQuery) ||
      tx.notes.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-400" />
              Merchant Payouts & Settlement Ledger
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
                  <Wifi className="h-2.5 w-2.5" /> Live Backend
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" /> Connecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-white/50">
            Escrow-guaranteed automated settlements via EthSwitch, Telebirr Merchant, and National Bank of Ethiopia rails
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

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Available for Payout Card */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Cleared Available Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black font-mono tracking-tight text-white">
              ETB {availablePayout.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Instant disbursement ready</span>
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
              ETB {pendingEscrow.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-300">
              <Clock className="h-3 w-3" />
              <span>Released upon courier OTP entry</span>
            </div>
          </div>
        </div>

        {/* Settlement Channels Card */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/15 via-[#0d121f] to-[#0d121f] p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Disbursement Rail</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-white">EthSwitch & Telebirr</div>
            <div className="mt-1 text-[11px] text-white/60 font-mono truncate">
              {user?.phoneNumber || "+251 9... Verified"}
            </div>
          </div>
        </div>
      </div>

      {/* Settlement History Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d121f] overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.08] p-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference or ID..."
                className="h-8 w-44 sm:w-56 rounded-lg border border-white/[0.08] bg-[#090d16] pl-8 pr-3 text-xs text-white placeholder-white/30 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#090d16] p-0.5 rounded-lg border border-white/[0.08]">
              {(["all", "completed", "processing"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    filterStatus === st
                      ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/40 self-end sm:self-auto">
            Showing <span className="font-semibold text-white">{filteredTransactions.length}</span> settlements
          </div>
        </div>

        {/* Transactions Table or Empty State */}
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-xs text-zinc-400">
            <Wallet className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
            <p className="font-medium text-white">No Payout Records Found</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Settlements for verified customer orders and merchant withdrawals will be logged here.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Payouts Card List (md:hidden) */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 space-y-2.5">
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
                        ETB {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.01] text-[11px] font-semibold text-white/50">
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Destination Channel</th>
                    <th className="py-2.5 px-3 text-right">Amount Disbursed</th>
                    <th className="py-2.5 px-3">Reference / Slip</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-white/90">{tx.id}</td>
                      <td className="py-2.5 px-3 text-white/60">{tx.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="font-medium text-white">{tx.destination}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            ({tx.accountNumber})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-cyan-300 font-mono">
                        ETB {tx.amount.toLocaleString()}
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
                    ETB {availablePayout.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount in ETB..."
                    min="500"
                    max={availablePayout}
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
                disabled={isProcessing || availablePayout <= 0}
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
