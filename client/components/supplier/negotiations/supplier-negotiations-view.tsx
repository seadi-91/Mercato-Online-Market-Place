"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MessagesSquare,
  DollarSign,
  Send,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  FileCheck,
  Check,
  Search,
  X,
  Scale,
  Handshake,
  Sparkles,
  Download,
  Copy,
  Flame,
  BadgeCheck,
  Truck,
  Phone,
  Mail,
  Info,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { NegotiationSession } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierNegotiationsView() {
  const {
    negotiations,
    isLoadingNegotiations,
    fetchNegotiations,
    openModal,
    acceptNegotiationOffer,
    sendCounterOffer,
    declineNegotiationOffer,
    setActiveTab,
    setActiveChatThreadId,
    currentStaffUser,
  } = useSupplierStore();
  const { user } = useAuthStore();
  const isBranchManager = user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  // State
  const [activeSessionId, setActiveSessionId] = useState<string>(negotiations[0]?.id || "");

  // Synchronize active session when negotiations load
  useEffect(() => {
    if (negotiations.length > 0 && (!activeSessionId || !negotiations.some((n) => n.id === activeSessionId))) {
      setActiveSessionId(negotiations[0].id);
    }
  }, [negotiations, activeSessionId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "action_required" | "buyer_turn" | "agreed">("all");
  const [messageInput, setMessageInput] = useState("");
  const [inlinePriceInput, setInlinePriceInput] = useState<string>("");
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Session
  const activeSession = negotiations.find((n) => n.id === activeSessionId) || negotiations[0];

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, activeSessionId]);

  // Counts
  const actionRequiredCount = useMemo(() => {
    return negotiations.filter((s) => s.status === "supplier_turn").length;
  }, [negotiations]);

  // Filtered list
  const filteredSessions = useMemo(() => {
    return negotiations.filter((session) => {
      const matchesSearch =
        session.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "action_required" && session.status === "supplier_turn") ||
        (statusFilter === "buyer_turn" && session.status === "buyer_turn") ||
        (statusFilter === "agreed" && session.status === "agreed");

      return matchesSearch && matchesStatus;
    });
  }, [negotiations, searchQuery, statusFilter]);

  // Handlers
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    toast.success(`Copied "${text}"`);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    const trimmedMsg = messageInput.trim();
    const customPrice = inlinePriceInput ? Number(inlinePriceInput) : undefined;

    if (!trimmedMsg && !customPrice) return;

    const priceToSend = customPrice || activeSession.supplierCurrentOffer;
    sendCounterOffer(activeSession.id, priceToSend, trimmedMsg || undefined);

    setMessageInput("");
    setInlinePriceInput("");
    setShowPriceInput(false);
  };

  const handleQuickConcession = (price: number, label: string) => {
    if (!activeSession) return;
    sendCounterOffer(
      activeSession.id,
      price,
      `We propose a revised commercial rate of ${price.toLocaleString()} ETB/${activeSession.unit} (${label}).`
    );
    toast.success(`Counter offer of ${price.toLocaleString()} ETB sent!`);
  };

  // Price calculations for active session
  const currentDiff = activeSession ? Math.abs(activeSession.supplierCurrentOffer - activeSession.originalBuyerTarget) : 0;
  const currentGapPercent =
    activeSession && activeSession.supplierCurrentOffer > 0
      ? ((currentDiff / activeSession.supplierCurrentOffer) * 100).toFixed(1)
      : "0";
  const activeLotTotal = activeSession ? activeSession.supplierCurrentOffer * activeSession.targetQty : 0;
  const midpoint = activeSession
    ? Math.round((activeSession.originalBuyerTarget + activeSession.supplierCurrentOffer) / 2)
    : 0;
  const discount1Pct = activeSession ? Math.round(activeSession.supplierCurrentOffer * 0.99) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Header (Compact & Light) */}
      <PageHeader
        title="Customer Price Negotiations"
        subtitle="Real-time commercial discussions, counter-offers, and CBE Escrow agreements with your buyers"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Negotiations" }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNegotiations()}
              disabled={isLoadingNegotiations}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                isLight
                  ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "bg-[#0f1b3b] border-blue-500/25 text-blue-200 hover:bg-[#13224a]"
                  : "bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08]"
              }`}
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoadingNegotiations ? "animate-spin text-indigo-400" : "text-slate-400"}`} />
              <span>Refresh</span>
            </button>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                isLight
                  ? "bg-white border-slate-200 text-slate-700"
                  : isSystem
                  ? "bg-[#0f1b3b] border-blue-500/25 text-blue-200"
                  : "bg-white/[0.04] border-white/10 text-zinc-300"
              }`}
            >
              <MessagesSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>{negotiations.length} Active Deals</span>
            </span>

            {actionRequiredCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>{actionRequiredCount} Action Needed</span>
              </span>
            )}
          </div>
        }
      />

      {/* 2. Main Workroom: Clean & Relaxed 2-Panel Messenger */}
      {negotiations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1118] p-12 flex flex-col items-center justify-center text-center shadow-xs">
          <EmptyState
            title="No Active Negotiations"
            description="There are currently no active price negotiations in the system. When buyers initiate a counter-offer or submit price proposals, real-time negotiation threads will appear here."
          />
        </div>
      ) : (
        <div
          className={`rounded-2xl border shadow-sm overflow-hidden flex h-[calc(100vh-190px)] min-h-[560px] ${
            isLight
              ? "border-slate-200 bg-white"
              : isSystem
              ? "border-blue-500/20 bg-[#0a1226]"
              : "border-white/10 bg-[#0e1118]"
          }`}
        >
        {/* =========================================================================
            LEFT PANEL: CUSTOMER NEGOTIATION THREADS (w-80 sm:w-96)
           ========================================================================= */}
        <div
          className={`w-72 sm:w-88 border-r flex flex-col shrink-0 ${
            isLight
              ? "border-slate-200 bg-slate-50/60"
              : isSystem
              ? "border-blue-500/15 bg-[#070e20]"
              : "border-white/10 bg-[#0a0d14]"
          }`}
        >
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-inherit space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer, RFQ, product..."
                className={`w-full rounded-xl pl-8.5 pr-7 py-1.5 text-xs transition-colors focus:outline-hidden ${
                  isLight
                    ? "bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
                    : isSystem
                    ? "bg-[#0f1b3b] border border-blue-500/30 text-blue-100 placeholder-blue-300/40 focus:border-blue-400"
                    : "bg-white/[0.04] border border-white/10 text-zinc-200 placeholder-zinc-500 focus:border-indigo-400"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All" },
                { id: "action_required", label: "Your Turn", alert: actionRequiredCount > 0 },
                { id: "buyer_turn", label: "Buyer" },
                { id: "agreed", label: "Agreed" },
              ].map((pill) => {
                const isActive = statusFilter === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => setStatusFilter(pill.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : isLight
                        ? "text-slate-600 hover:bg-slate-200/70"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{pill.label}</span>
                    {pill.alert && (
                      <span className="ml-1 px-1 py-0.2 rounded-full text-[9px] bg-amber-500 text-black font-bold">
                        {actionRequiredCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-inherit p-2 space-y-1">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs opacity-50">
                No customer negotiations found.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = session.id === activeSessionId;
                const isYourTurn = session.status === "supplier_turn";
                const isAgreed = session.status === "agreed";
                const initials = session.buyerCompany
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const lastMsg = session.messages[session.messages.length - 1];

                return (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "bg-white shadow-xs border border-indigo-200 ring-1 ring-indigo-500/30"
                          : isSystem
                          ? "bg-[#0f1f45] border border-blue-500/40 text-white"
                          : "bg-white/[0.08] border border-indigo-500/40 text-white"
                        : isLight
                        ? "hover:bg-slate-100/70 text-slate-800"
                        : "hover:bg-white/[0.03] text-zinc-300"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : isLight
                          ? "bg-slate-200 text-slate-700"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-xs truncate">{session.buyerCompany}</p>
                        {isAgreed ? (
                          <span className="text-[10px] font-bold text-emerald-400">Agreed</span>
                        ) : isYourTurn ? (
                          <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
                        ) : (
                          <span className="text-[10px] opacity-60">Review</span>
                        )}
                      </div>

                      <p className="text-[11px] opacity-75 truncate mt-0.5">
                        {session.targetQty.toLocaleString()} {session.unit} • {session.productName}
                      </p>

                      <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold">
                          Target: {session.originalBuyerTarget.toLocaleString()} ETB
                        </span>
                        <span className="text-indigo-400 font-bold">
                          {session.supplierCurrentOffer.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT PANEL: ACTIVE CUSTOMER NEGOTIATION ROOM
           ========================================================================= */}
        <div className="flex-1 flex flex-col justify-between min-w-0 relative">
          {activeSession ? (
            <>
              {/* 1. Slim Top Bar with Customer Info & Quick Actions */}
              <div
                className={`px-5 py-3 border-b flex items-center justify-between gap-4 ${
                  isLight
                    ? "bg-white border-slate-200"
                    : isSystem
                    ? "bg-[#0b142c] border-blue-500/20"
                    : "bg-[#0c0f16] border-white/10"
                }`}
              >
                {/* Customer Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {activeSession.buyerCompany.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate">{activeSession.buyerCompany}</h3>
                      {activeSession.buyerVerified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-60 truncate">
                      {activeSession.contactPerson} • {activeSession.rfqNumber}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isBranchManager ? (
                    <>
                      <button
                        onClick={() => openModal("counter-offer", activeSession)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Counter Offer</span>
                      </button>

                      {activeSession.status !== "agreed" ? (
                        <button
                          onClick={() => acceptNegotiationOffer(activeSession.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#388E3C] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept Deal</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Deal Locked</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
                      HQ Negotiation Authority Required
                    </span>
                  )}

                  <button
                    onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      showDetailsPanel
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : isLight
                        ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                        : "border-white/10 text-zinc-300 hover:bg-white/10"
                    }`}
                    title="View Deal Details"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 2. Slim Pinned Deal Strip (Light & Relaxed) */}
              <div
                className={`px-5 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isLight
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : isSystem
                    ? "bg-[#070e20] border-blue-500/15 text-blue-200/80"
                    : "bg-black/25 border-white/5 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">
                    {activeSession.targetQty.toLocaleString()} {activeSession.unit} {activeSession.productName}
                  </span>
                  <span>•</span>
                  <span>
                    Buyer Target: <strong className="text-emerald-400 font-mono">{activeSession.originalBuyerTarget.toLocaleString()} ETB</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Current Offer: <strong className="text-indigo-400 font-mono">{activeSession.supplierCurrentOffer.toLocaleString()} ETB</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {activeSession.status === "agreed" ? "0% Gap (Aligned)" : `${currentGapPercent}% Spread`}
                  </span>
                  <span className="text-[11px] opacity-60 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>100% CBE Escrow</span>
                  </span>
                </div>
              </div>

              {/* 3. Spacious & Relaxed Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {activeSession.messages.map((msg) => {
                  const isSupplier = msg.sender === "supplier";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSupplier ? "items-end" : "items-start"}`}
                    >
                      {/* Name & Time */}
                      <div className="flex items-center gap-1.5 text-[10px] opacity-50 font-mono mb-1">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Chat Bubble */}
                      <div
                        className={`rounded-2xl p-3.5 max-w-lg text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isSupplier
                            ? "bg-indigo-600 text-white rounded-br-xs"
                            : isLight
                            ? "bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-xs"
                            : isSystem
                            ? "bg-[#101e40] border border-blue-500/25 text-blue-100 rounded-bl-xs"
                            : "bg-white/[0.07] border border-white/10 text-zinc-200 rounded-bl-xs"
                        }`}
                      >
                        <p>{msg.message}</p>

                        {/* Proposal Card Inside Bubble */}
                        {msg.proposedPrice && (
                          <div
                            className={`mt-2.5 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs font-mono ${
                              isSupplier
                                ? "bg-white/15 text-white"
                                : isLight
                                ? "bg-white border border-slate-200 text-slate-800"
                                : "bg-black/40 border border-white/10 text-white"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] uppercase font-bold opacity-75 block">
                                Rate Proposal:
                              </span>
                              <span className="font-bold text-sm">
                                {msg.proposedPrice.toLocaleString()} ETB / {activeSession.unit}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold opacity-75 block">
                                Lot Total:
                              </span>
                              <span className="font-bold text-sm text-emerald-400">
                                ETB {(msg.proposedPrice * activeSession.targetQty).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Attachment Link */}
                        {msg.attachmentName && (
                          <div
                            onClick={() => toast.success(`Opening: ${msg.attachmentName}`)}
                            className="mt-2.5 flex items-center gap-2 text-xs underline cursor-pointer opacity-90 hover:opacity-100"
                          >
                            <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{msg.attachmentName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Agreement Banner */}
                {activeSession.status === "agreed" && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="font-semibold">Deal successfully agreed and locked!</span>
                    </div>
                    {!isBranchManager ? (
                      <button
                        onClick={() =>
                          openModal("create-quotation", {
                            buyerCompany: activeSession.buyerCompany,
                            buyerName: activeSession.contactPerson,
                            targetPrice: activeSession.supplierCurrentOffer,
                            requestedQty: activeSession.targetQty,
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Generate Binding Quote
                      </button>
                    ) : (
                      <span className="text-[11px] opacity-75">Quotations generated by Super Supplier HQ</span>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 4. Bottom Negotiation Bar: Fast Concessions + Input */}
              <div
                className={`p-3.5 border-t space-y-2.5 ${
                  isLight
                    ? "bg-slate-50/80 border-slate-200"
                    : isSystem
                    ? "bg-[#070e20] border-blue-500/20"
                    : "bg-[#0a0d14] border-white/10"
                }`}
              >
                {isBranchManager ? (
                  <div className="p-3.5 text-center rounded-xl border border-white/10 bg-white/[0.02] text-xs text-zinc-400">
                    Commercial counter-offers, contractual rate adjustments, and negotiation messages are conducted exclusively by Super Supplier Enterprise HQ.
                  </div>
                ) : (
                  <>
                    {/* Fast One-Click Concession Buttons */}
                    {activeSession.status !== "agreed" && (
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
                        <span className="text-[11px] opacity-60 font-semibold shrink-0">Quick Offer:</span>

                        <button
                          type="button"
                          onClick={() => handleQuickConcession(midpoint, "Meet in Middle")}
                          className={`px-3 py-1 rounded-xl border text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                            isLight
                              ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-zinc-200"
                          }`}
                        >
                          <Handshake className="h-3 w-3 text-amber-400" />
                          <span>Meet in Middle ({midpoint.toLocaleString()} ETB)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickConcession(discount1Pct, "-1% Fast Deal")}
                          className={`px-2.5 py-1 rounded-xl border text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                            isLight
                              ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-zinc-200"
                          }`}
                        >
                          <span>-1% Quick Deal ({discount1Pct.toLocaleString()} ETB)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickConcession(activeSession.originalBuyerTarget, "Match Buyer Target")}
                          className={`px-2.5 py-1 rounded-xl border text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                            isLight
                              ? "bg-white hover:bg-slate-100 border-slate-200 text-slate-800"
                              : "bg-white/[0.04] hover:bg-white/10 border-white/10 text-zinc-200"
                          }`}
                        >
                          <span>Match Target ({activeSession.originalBuyerTarget.toLocaleString()} ETB)</span>
                        </button>
                      </div>
                    )}

                    {/* Inline Price Proposal Input (if opened) */}
                    {showPriceInput && (
                      <div className="flex items-center gap-2 p-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-xs">
                        <span className="font-semibold text-indigo-300">Set Proposed Rate:</span>
                        <input
                          type="number"
                          value={inlinePriceInput}
                          onChange={(e) => setInlinePriceInput(e.target.value)}
                          placeholder={`e.g. ${midpoint}`}
                          className="w-36 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1 text-white font-mono text-xs focus:outline-hidden"
                        />
                        <span className="text-zinc-400 font-mono">ETB / {activeSession.unit}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPriceInput(false);
                            setInlinePriceInput("");
                          }}
                          className="ml-auto text-zinc-400 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Input Form */}
                    <form
                      onSubmit={handleSendMessage}
                      className={`flex items-center gap-2 rounded-2xl border p-1.5 transition-all ${
                        isLight
                          ? "bg-white border-slate-200 focus-within:border-indigo-500"
                          : isSystem
                          ? "bg-[#0b1633] border-blue-500/30 focus-within:border-blue-400"
                          : "bg-[#141824] border-white/15 focus-within:border-indigo-400"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setShowPriceInput(!showPriceInput)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          showPriceInput
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-white/10"
                        }`}
                        title="Attach proposed price"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Set Price</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openModal("counter-offer", activeSession)}
                        className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        title="Attach specification or open counter offer modal"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>

                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder={`Type response to ${activeSession.buyerCompany}...`}
                        className="flex-1 bg-transparent px-2 text-xs sm:text-sm focus:outline-hidden"
                      />

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer shrink-0"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* 5. Slide-Out Deal Info Drawer */}
              {showDetailsPanel && (
                <div
                  className={`absolute right-0 top-0 bottom-0 w-80 sm:w-96 border-l shadow-2xl p-5 overflow-y-auto space-y-4 z-20 animate-in slide-in-from-right duration-200 ${
                    isLight
                      ? "bg-white border-slate-200 text-slate-800"
                      : isSystem
                      ? "bg-[#0b1633] border-blue-500/30 text-white"
                      : "bg-[#0f1422] border-white/10 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-inherit">
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-indigo-400" />
                      <span>Deal & Buyer Dossier</span>
                    </h4>
                    <button
                      onClick={() => setShowDetailsPanel(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Buyer Profile */}
                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-sm">{activeSession.buyerCompany}</p>
                    <p className="opacity-75">Contact: {activeSession.contactPerson}</p>
                    {activeSession.buyerTinNumber && (
                      <p className="opacity-75">TIN: {activeSession.buyerTinNumber}</p>
                    )}
                    {activeSession.buyerRating && (
                      <p className="opacity-75">
                        Rating: <strong className="text-amber-400">★ {activeSession.buyerRating}</strong>
                      </p>
                    )}
                  </div>

                  {/* Commercial Terms */}
                  <div className="pt-3 border-t border-inherit space-y-2 text-xs">
                    <span className="font-bold text-indigo-400 block uppercase text-[10px]">Commercial Terms</span>
                    {activeSession.incoterm && (
                      <div className="flex justify-between">
                        <span className="opacity-70">Incoterm:</span>
                        <span className="font-semibold">{activeSession.incoterm}</span>
                      </div>
                    )}
                    {activeSession.deliveryLeadTimeDays && (
                      <div className="flex justify-between">
                        <span className="opacity-70">Lead Time:</span>
                        <span className="font-semibold">{activeSession.deliveryLeadTimeDays} Days</span>
                      </div>
                    )}
                    {activeSession.paymentTerms && (
                      <div className="flex justify-between">
                        <span className="opacity-70">Payment:</span>
                        <span className="font-semibold text-emerald-400">{activeSession.paymentTerms}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="opacity-70">Lot Total:</span>
                      <span className="font-mono font-bold text-indigo-400">
                        ETB {activeLotTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Direct Actions */}
                  <div className="pt-3 border-t border-inherit flex gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("messages");
                      }}
                      className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Chat Desk</span>
                    </button>
                    <button
                      onClick={() => toast.success(`Calling ${activeSession.contactPerson}...`)}
                      className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call Buyer</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-12 text-xs opacity-50">
              Select a customer negotiation from the list.
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

