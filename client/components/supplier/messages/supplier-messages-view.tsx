"use client";

import React, { useState, useMemo } from "react";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Building,
  CheckCheck,
  FileText,
  ShoppingCart,
  Phone,
  Video,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
  FileCheck,
  BadgeCheck,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

interface MessageItem {
  id: string;
  sender: "buyer" | "supplier" | "system";
  senderName: string;
  time: string;
  text: string;
  attachment?: {
    name: string;
    size: string;
    type: "pdf" | "doc" | "image";
  };
}

export function SupplierMessagesView() {
  const {
    chatThreads,
    activeChatThreadId,
    setActiveChatThreadId,
    sendChatMessage,
    openModal,
    setActiveTab,
  } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  const [messageInput, setMessageInput] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "unread" | "orders" | "quotes">("all");
  const [threadMessages, setThreadMessages] = useState<Record<string, MessageItem[]>>({});

  const activeThread =
    chatThreads.find((t) => t.id === activeChatThreadId) || chatThreads[0];

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return chatThreads.filter((t) => {
      const q = chatSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.buyerCompany.toLowerCase().includes(q) ||
        t.contactPerson.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q) ||
        (t.pinnedContext && t.pinnedContext.reference.toLowerCase().includes(q));

      let matchesFilter = true;
      if (activeFilterTab === "unread") {
        matchesFilter = t.unreadCount > 0;
      } else if (activeFilterTab === "orders") {
        matchesFilter = t.pinnedContext?.type === "order";
      } else if (activeFilterTab === "quotes") {
        matchesFilter = t.pinnedContext?.type === "quote";
      }

      return matchesSearch && matchesFilter;
    });
  }, [chatThreads, chatSearch, activeFilterTab]);

  // Current messages for active thread
  const currentMessages = useMemo(() => {
    if (!activeThread) return [];
    return threadMessages[activeThread.id] || [
      {
        id: `fallback-${activeThread.id}`,
        sender: "buyer",
        senderName: activeThread.contactPerson,
        time: activeThread.lastMessageTime,
        text: activeThread.lastMessage,
      },
    ];
  }, [activeThread, threadMessages]);

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const content = customText || messageInput;
    if (!content.trim() || !activeThread) return;

    const newMessage: MessageItem = {
      id: `m-${Date.now()}`,
      sender: "supplier",
      senderName: "Selam Agro Commercial Desk",
      time: "Just now",
      text: content.trim(),
    };

    setThreadMessages((prev) => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] || []), newMessage],
    }));

    sendChatMessage(activeThread.id, content.trim());
    if (!customText) setMessageInput("");
    toast.success("Commercial message dispatched to buyer portal.");
  };

  const handleShareQuotation = () => {
    openModal("create-quotation", {
      buyerCompany: activeThread?.buyerCompany,
      buyerName: activeThread?.contactPerson,
    });
  };

  const handleCallBuyer = () => {
    if (!activeThread) return;
    toast.info(`Initiating secure direct call with ${activeThread.contactPerson} (${activeThread.buyerCompany})...`);
  };

  const handleVideoConference = () => {
    if (!activeThread) return;
    toast.info(`Generating MercatoX Commercial Teleconference room for ${activeThread.buyerCompany}...`);
  };

  // Button active state helpers using MercatoX Brand Indigo
  const getTabActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      if (isSystem) return "text-slate-300 hover:bg-white/5 hover:text-white";
      return "text-zinc-400 hover:bg-white/5 hover:text-white";
    }
    if (isLight) return "bg-indigo-600 text-white shadow-xs font-semibold";
    if (isSystem) return "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50 font-semibold";
    return "bg-indigo-600 text-white shadow-xs font-semibold";
  };

  const getTabBadgeActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "bg-slate-100 text-slate-600";
      if (isSystem) return "bg-white/10 text-slate-300";
      return "bg-white/10 text-zinc-300";
    }
    return "bg-white/20 text-white";
  };

  const totalUnreadCount = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  if (chatThreads.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Direct B2B Commercial Messaging"
          subtitle="Real-time procurement communications with authenticated enterprise buyers, instant quotation sharing, and order milestone context"
          breadcrumbs={[
            { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
            { label: "Messages" },
          ]}
        />
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e1118] p-12 flex flex-col items-center justify-center text-center shadow-xs">
          <EmptyState
            title="No Conversations Yet"
            description="There are currently no active communication channels with buyers. When buyers message your sales desk or submit RFQs, real-time message channels will appear here."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Actions */}
      <PageHeader
        title="Direct B2B Commercial Messaging"
        subtitle="Real-time procurement communications with authenticated enterprise buyers, instant quotation sharing, and order milestone context"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Messages" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border flex items-center gap-1.5 shadow-xs ${
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-700"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                  : "border-white/10 bg-white/5 text-zinc-300"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-indigo-500" />
              <span>{totalUnreadCount} Unread Inquiry Messages</span>
            </span>

            <button
              onClick={() => {
                toast.success("Audit log export generated with SHA-256 cryptographic seal.");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                  : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Export Channel Audit Log</span>
            </button>
          </div>
        }
      />

      {/* 2. Commercial Messaging Telemetry Ribbon */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-[11px] shadow-xs ${
          isLight
            ? "border-slate-200 bg-slate-50/80 text-slate-800"
            : isSystem
            ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
            : "border-white/10 bg-[#121215] text-zinc-300"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <strong>End-to-End Enterprise Certified:</strong> Direct commercial channel with Ministry of Trade KYC-verified buyers
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 opacity-80">
            <Clock className="h-3.5 w-3.5" />
            Average Response Time: <strong>&lt; 14 minutes</strong> (Top 5% Supplier Tier)
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 opacity-80">
            <FileCheck className="h-3.5 w-3.5" />
            Direct Proforma &amp; Escrow Integration Active
          </span>
        </div>

        <span className="font-mono text-[10px] opacity-75">
          CBE Escrow Node Connected
        </span>
      </div>

      {/* 3. Hero Messaging Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Active Procurement Channels
            </span>
            <Building className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">{chatThreads.length} Enterprises</p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Verified Tier-1 commercial buyers
          </p>
        </div>

        {/* Metric 2 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Online Procurement Officers
            </span>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">
            {chatThreads.filter((t) => t.online).length} Active Now
          </p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Immediate quotation response ready
          </p>
        </div>

        {/* Metric 3 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Linked Active Orders
            </span>
            <ShoppingCart className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">
            {chatThreads.filter((t) => t.pinnedContext?.type === "order").length} In Execution
          </p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            With active delivery milestones
          </p>
        </div>

        {/* Metric 4 */}
        <div
          className={`rounded-2xl border p-4.5 shadow-xs transition-colors ${
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : isSystem
              ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
              : "border-white/10 bg-[#141418] text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
              Quotation Conversion Rate
            </span>
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono">76.4%</p>
          <p
            className={`text-[11px] mt-1 ${
              isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
            }`}
          >
            Direct inquiry to escrow contract
          </p>
        </div>
      </div>

      {/* 4. Filter Tabs and Search Bar */}
      <div className="space-y-3">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 ${
            isLight ? "border-slate-200" : isSystem ? "border-indigo-500/20" : "border-white/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Channels", count: chatThreads.length },
              {
                id: "unread",
                label: "Unread Messages",
                count: chatThreads.filter((t) => t.unreadCount > 0).length,
              },
              {
                id: "orders",
                label: "Active Orders",
                count: chatThreads.filter((t) => t.pinnedContext?.type === "order").length,
              },
              {
                id: "quotes",
                label: "Proforma Quotes",
                count: chatThreads.filter((t) => t.pinnedContext?.type === "quote").length,
              },
            ].map((tab) => {
              const isActive = activeFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id as any)}
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
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            placeholder="Search conversations by Buyer Enterprise, Officer, Order #, or quotation reference..."
            className={`w-full rounded-xl border pl-9 pr-8 py-2 text-xs focus:outline-hidden shadow-xs transition-colors ${
              isLight
                ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600"
                : isSystem
                ? "border-indigo-500/20 bg-[#0c1630] text-white placeholder:text-slate-400 focus:border-indigo-400"
                : "border-white/10 bg-[#121215] text-white placeholder:text-zinc-500 focus:border-indigo-500"
            }`}
          />
          {chatSearch && (
            <button
              onClick={() => setChatSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Two-Panel Enterprise Chat Container */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 rounded-2xl border shadow-xs overflow-hidden min-h-[640px] transition-colors ${
          isLight
            ? "border-slate-200 bg-white text-slate-900"
            : isSystem
            ? "border-indigo-500/20 bg-[#0f1b3b] text-white"
            : "border-white/10 bg-[#141418] text-white"
        }`}
      >
        {/* Left Panel: Conversation Threads (4 columns) */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r p-4 space-y-3 flex flex-col ${
            isLight
              ? "border-slate-200 bg-slate-50/60"
              : isSystem
              ? "border-indigo-500/20 bg-[#0c1630]/70"
              : "border-white/10 bg-[#09090b]/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              Procurement Channels ({filteredThreads.length})
            </span>
            <span className="text-[10px] font-mono opacity-60">Live B2B Network</span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 max-h-[580px] pr-1">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-xs opacity-60">
                No conversation threads match your search filter.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === activeThread?.id;

                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveChatThreadId(thread.id)}
                    className={`rounded-2xl border p-3.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? isLight
                          ? "border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-600/30 text-slate-900"
                          : isSystem
                          ? "border-indigo-500 bg-[#131e3d] shadow-sm ring-1 ring-indigo-500/40 text-white"
                          : "border-indigo-500 bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500/40 text-white"
                        : isLight
                        ? "border-slate-200 bg-white hover:border-slate-300 text-slate-900"
                        : isSystem
                        ? "border-indigo-500/15 bg-[#0f1b3b] hover:border-indigo-500/30 text-white"
                        : "border-white/10 bg-[#141418] hover:border-white/20 text-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold text-xs shadow-xs ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : isLight
                              ? "bg-slate-100 text-slate-700"
                              : isSystem
                              ? "bg-[#0c1630] text-slate-300 border border-indigo-500/20"
                              : "bg-white/5 text-zinc-300 border border-white/10"
                          }`}
                        >
                          {thread.avatarText}
                        </div>
                        {thread.online && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950"
                            title="Active Now"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span>{thread.buyerCompany}</span>
                            <BadgeCheck className="h-3 w-3 text-indigo-500 shrink-0" />
                          </h4>
                          <span className="text-[10px] font-mono opacity-60 whitespace-nowrap">
                            {thread.lastMessageTime}
                          </span>
                        </div>

                        <p className="text-[11px] opacity-70 mt-0.5 font-medium truncate">
                          {thread.contactPerson}
                        </p>

                        <p className="text-[11px] opacity-80 truncate mt-1 leading-relaxed">
                          {thread.lastMessage}
                        </p>

                        {/* Pinned order/quote pill & unread badge */}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          {thread.pinnedContext ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border truncate max-w-[200px] ${
                                isLight
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                  : isSystem
                                  ? "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
                                  : "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
                              }`}
                            >
                              {thread.pinnedContext.type === "order" ? (
                                <ShoppingCart className="h-3 w-3 shrink-0" />
                              ) : (
                                <FileText className="h-3 w-3 shrink-0" />
                              )}
                              <span>{thread.pinnedContext.reference}</span>
                            </span>
                          ) : (
                            <span />
                          )}

                          {thread.unreadCount > 0 && (
                            <span className="rounded-full bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-bold shrink-0">
                              {thread.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Chat Room (8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between h-full bg-inherit">
          {activeThread ? (
            <>
              {/* Header */}
              <div
                className={`flex flex-wrap items-center justify-between border-b px-6 py-4 gap-3 ${
                  isLight
                    ? "border-slate-100 bg-slate-50/60"
                    : isSystem
                    ? "border-indigo-500/20 bg-[#0c1630]/60"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                      {activeThread.avatarText}
                    </div>
                    {activeThread.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm">{activeThread.buyerCompany}</h3>
                      <span
                        className={`rounded-md px-1.5 py-0.2 text-[9px] font-semibold border uppercase tracking-wider ${
                          isLight
                            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                            : isSystem
                            ? "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
                            : "border-indigo-500/30 bg-indigo-950/40 text-indigo-300"
                        }`}
                      >
                        KYC Verified
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isLight ? "text-slate-500" : isSystem ? "text-slate-400" : "text-zinc-400"
                      }`}
                    >
                      {activeThread.contactPerson} •{" "}
                      {activeThread.online ? (
                        <span className="text-indigo-500 font-semibold">Active Now in Commercial Desk</span>
                      ) : (
                        "Last seen recently"
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Action Triggers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCallBuyer}
                    title="Direct Call"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={handleVideoConference}
                    title="Start Teleconference"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0c1630] text-slate-200 hover:bg-[#122045]"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={handleShareQuotation}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Share Proforma Quotation</span>
                  </button>
                </div>
              </div>

              {/* Linked Context Banner if exists */}
              {activeThread.pinnedContext && (
                <div
                  className={`border-b px-6 py-2.5 flex flex-wrap items-center justify-between text-xs gap-2 ${
                    isLight
                      ? "bg-indigo-50/50 border-indigo-100 text-slate-900"
                      : isSystem
                      ? "bg-indigo-950/20 border-indigo-500/20 text-slate-100"
                      : "bg-indigo-950/20 border-indigo-500/20 text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md border ${
                        isLight
                          ? "bg-indigo-100/70 border-indigo-200 text-indigo-800"
                          : isSystem
                          ? "bg-indigo-900/40 border-indigo-500/30 text-indigo-200"
                          : "bg-indigo-900/40 border-indigo-500/30 text-indigo-200"
                      }`}
                    >
                      Linked {activeThread.pinnedContext.type.toUpperCase()}
                    </span>
                    <span className="font-mono font-bold">{activeThread.pinnedContext.reference}:</span>
                    <span className="opacity-90">{activeThread.pinnedContext.summary}</span>
                  </div>

                  <button
                    onClick={() => setActiveTab("orders")}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:underline cursor-pointer"
                  >
                    <span>View Contract Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[380px]">
                {/* Date separator */}
                <div className="flex items-center justify-center my-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-mono border ${
                      isLight
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0c1630] text-slate-400"
                        : "border-white/10 bg-white/5 text-zinc-400"
                    }`}
                  >
                    Today, Oct 6, 2026 • Encrypted B2B Commercial Channel
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isSupplier = msg.sender === "supplier";

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSupplier ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] opacity-60 font-mono">{msg.senderName}</span>
                        <span className="text-[10px] opacity-40 font-mono">• {msg.time}</span>
                      </div>

                      <div
                        className={`rounded-2xl p-4 text-xs max-w-lg shadow-xs space-y-2.5 ${
                          isSupplier
                            ? "rounded-br-xs bg-indigo-600 text-white"
                            : isLight
                            ? "rounded-bl-xs bg-slate-100 border border-slate-200 text-slate-900"
                            : isSystem
                            ? "rounded-bl-xs bg-[#131e3d] border border-indigo-500/20 text-white"
                            : "rounded-bl-xs bg-[#18181c] border border-white/10 text-zinc-100"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>

                        {/* Optional Attachment Card */}
                        {msg.attachment && (
                          <div
                            className={`rounded-xl border p-2.5 flex items-center justify-between gap-3 text-xs font-mono ${
                              isSupplier
                                ? "border-white/20 bg-white/10 text-white"
                                : isLight
                                ? "border-slate-200 bg-white text-slate-800"
                                : isSystem
                                ? "border-indigo-500/20 bg-[#0c1630] text-slate-200"
                                : "border-white/10 bg-white/5 text-zinc-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                              <div className="truncate">
                                <p className="font-bold truncate text-[11px]">{msg.attachment.name}</p>
                                <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => toast.success(`Downloading ${msg.attachment?.name}...`)}
                              className="p-1 hover:opacity-100 opacity-75 cursor-pointer shrink-0"
                              title="Download attachment"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {isSupplier && (
                          <div className="flex items-center justify-end gap-1 text-[10px] opacity-80 pt-0.5">
                            <span>Delivered &amp; Read</span>
                            <CheckCheck className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Canned Commercial Replies */}
              <div
                className={`px-6 py-2 border-t flex items-center gap-2 overflow-x-auto ${
                  isLight
                    ? "border-slate-100 bg-slate-50/50"
                    : isSystem
                    ? "border-indigo-500/20 bg-[#0c1630]/40"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 whitespace-nowrap">
                  Quick Replies:
                </span>
                {[
                  "🚚 We confirm warehouse dispatch schedule.",
                  "📋 Commercial invoice & packing manifest attached.",
                  "⚖️ Goods passed joint ECAE lab testing.",
                  "💼 Proforma quotation sent with volume rebate.",
                ].map((canned, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, canned)}
                    className={`whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0f1b3b] text-slate-200 hover:border-indigo-400 hover:text-white hover:bg-indigo-950/40"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:border-indigo-400 hover:text-white hover:bg-indigo-950/30"
                    }`}
                  >
                    {canned}
                  </button>
                ))}
              </div>

              {/* Chat Message Compose Bar */}
              <div
                className={`p-4 border-t ${
                  isLight
                    ? "border-slate-200 bg-slate-50/80"
                    : isSystem
                    ? "border-indigo-500/20 bg-[#0c1630]/80"
                    : "border-white/10 bg-[#09090b]/80"
                }`}
              >
                <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Select laboratory specification or waybill to attach...")}
                    title="Attach Commercial Document"
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0f1b3b] text-slate-200 hover:text-white hover:bg-indigo-950/40"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Type official commercial message to ${activeThread.buyerCompany}...`}
                    className={`flex-1 rounded-xl border px-3.5 py-2.5 text-xs focus:outline-hidden transition-colors ${
                      isLight
                        ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600"
                        : isSystem
                        ? "border-indigo-500/20 bg-[#0f1b3b] text-white placeholder:text-slate-400 focus:border-indigo-400"
                        : "border-white/10 bg-[#121215] text-white placeholder:text-zinc-500 focus:border-indigo-500"
                    }`}
                  />

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs opacity-60">
              Select a procurement conversation thread from the left docket.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


