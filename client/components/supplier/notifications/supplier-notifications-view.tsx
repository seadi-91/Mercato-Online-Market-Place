"use client";

import React, { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  Boxes,
  FileQuestion,
  MessageCircle,
  Truck,
  ArrowUpRight,
  Eye,
  RotateCcw,
  Sparkles,
  Smartphone,
  Mail,
  Building,
  Copy,
  Check,
  SlidersHorizontal,
  X,
  Layers,
  Info,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { useSupplierStore, SupplierNotification } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";

export function SupplierNotificationsView() {
  const {
    notifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    setActiveTab,
  } = useSupplierStore();

  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedNotif, setSelectedNotif] = useState<SupplierNotification | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Counters
  const unreadCount = notifications.filter((n) => !n.read).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "urgent" || n.priority === "high"
  ).length;
  const escrowCount = notifications.filter(
    (n) => n.type === "payment" || n.type === "order"
  ).length;
  const logisticsCount = notifications.filter(
    (n) => n.type === "stock" || n.linkTab === "shipments" || n.linkTab === "warehouse"
  ).length;

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.counterpartName &&
          item.counterpartName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.entityId &&
          item.entityId.toLowerCase().includes(searchQuery.toLowerCase()));

      // Read status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !item.read) ||
        (statusFilter === "read" && item.read);

      // Priority
      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;

      // Category
      const matchesCategory = (() => {
        if (categoryFilter === "all") return true;
        if (categoryFilter === "orders") return item.type === "order" || item.linkTab === "orders";
        if (categoryFilter === "rfqs")
          return item.type === "rfq" || item.linkTab === "rfqs" || item.linkTab === "negotiations" || item.linkTab === "quotations";
        if (categoryFilter === "payments")
          return item.type === "payment" || item.linkTab === "payments" || item.linkTab === "invoices";
        if (categoryFilter === "logistics")
          return item.type === "stock" || item.linkTab === "shipments" || item.linkTab === "inventory" || item.linkTab === "warehouse";
        if (categoryFilter === "compliance")
          return item.type === "verification" || item.type === "dispute" || item.linkTab === "verification";
        if (categoryFilter === "unread") return !item.read;
        return true;
      })();

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [notifications, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied "${text}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleActionClick = (notif: SupplierNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(notif.id);
    setActiveTab(notif.linkTab);
  };

  const getCategoryIcon = (type: SupplierNotification["type"]) => {
    switch (type) {
      case "rfq":
        return <FileQuestion className="h-4 w-4 text-emerald-400" />;
      case "order":
        return <ShoppingCart className="h-4 w-4 text-indigo-400" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-400" />;
      case "stock":
        return <Boxes className="h-4 w-4 text-amber-400" />;
      case "dispute":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case "verification":
        return <ShieldCheck className="h-4 w-4 text-cyan-400" />;
      default:
        return <MessageCircle className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPriorityBadge = (priority?: SupplierNotification["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Urgent SLA
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            High Priority
          </span>
        );
      case "normal":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-medium text-blue-400">
            Standard
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-500/15 border border-zinc-500/30 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            Informational
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Page Header with Breadcrumbs and Main Actions */}
      <PageHeader
        title="Notification Center & Live Alerts"
        subtitle="Full-scale enterprise notification feed for Ethiopian B2B trade, CBE escrow milestones, tender RFQs, warehouse alerts, and compliance verifications."
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Notifications & Alerts" },
        ]}
        badge={
          unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              {unreadCount} Unread Alert{unreadCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              All Caught Up
            </span>
          )
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCheck className="h-4 w-4 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("settings")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
              <span>Notification Preferences</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Executive Stat Cards (Full Width Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unread Alerts */}
        <div
          onClick={() => {
            setStatusFilter(statusFilter === "unread" ? "all" : "unread");
            setCategoryFilter("all");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "unread"
              ? "border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-500/5"
              : isLight
              ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              : isSystem
              ? "bg-[#0b142c] border-blue-500/20 hover:border-blue-500/40"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Unread Alerts</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {unreadCount}
            </span>
            <span className="text-[11px] text-zinc-400">
              {unreadCount > 0 ? "Requires review" : "Up to date"}
            </span>
          </div>
        </div>

        {/* Card 2: Urgent Priority Actions */}
        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === "urgent" ? "all" : "urgent");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            priorityFilter === "urgent"
              ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
              : isLight
              ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              : isSystem
              ? "bg-[#0b142c] border-blue-500/20 hover:border-blue-500/40"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Urgent SLA Action</span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {urgentCount}
            </span>
            <span className="text-[11px] text-amber-400/90 font-medium">B2B buyer response SLA</span>
          </div>
        </div>

        {/* Card 3: Escrow & Financial Updates */}
        <div
          onClick={() => {
            setCategoryFilter(categoryFilter === "payments" ? "all" : "payments");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === "payments"
              ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/5"
              : isLight
              ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              : isSystem
              ? "bg-[#0b142c] border-blue-500/20 hover:border-blue-500/40"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Escrow & Treasury</span>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {escrowCount}
            </span>
            <span className="text-[11px] text-purple-400/90 font-medium">CBE / Telebirr settlements</span>
          </div>
        </div>

        {/* Card 4: Logistics & Warehouses */}
        <div
          onClick={() => {
            setCategoryFilter(categoryFilter === "logistics" ? "all" : "logistics");
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === "logistics"
              ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/5"
              : isLight
              ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              : isSystem
              ? "bg-[#0b142c] border-blue-500/20 hover:border-blue-500/40"
              : "bg-[#10131c] border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Logistics & Stocks</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {logisticsCount}
            </span>
            <span className="text-[11px] text-cyan-400/90 font-medium">Depots & shipments</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Interactive Filter Control Bar */}
      <div
        className={`p-4 rounded-2xl border space-y-3.5 ${
          isLight
            ? "bg-white border-slate-200 shadow-xs"
            : isSystem
            ? "bg-[#0b142c] border-blue-500/20"
            : "bg-[#10131c] border-white/10"
        }`}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, reference ID, buyer enterprise, or description..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:bg-white/10 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Read Status Pills */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Items" },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "read", label: "Read" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category & Topic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Category:</span>
          </span>

          {[
            { id: "all", label: "All Topics" },
            { id: "orders", label: "Orders & Escrow" },
            { id: "rfqs", label: "RFQs & Negotiations" },
            { id: "payments", label: "Treasury & Payments" },
            { id: "logistics", label: "Logistics & Depot Stock" },
            { id: "compliance", label: "Verification & Legal" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-white/15 text-white font-semibold border border-white/20"
                  : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Reset Filters */}
          {(categoryFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter("all");
                setPriorityFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Full-Width Notification Feed List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border space-y-4 ${
              isLight
                ? "bg-white border-slate-200"
                : isSystem
                ? "bg-[#0b142c] border-blue-500/20"
                : "bg-[#10131c] border-white/10"
            }`}
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mx-auto flex items-center justify-center text-indigo-400">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Notifications Found</h3>
              <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
                No alerts matching your current filter criteria. Try clearing search filters or checking other categories.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setPriorityFilter("all");
                setStatusFilter("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Filter Query</span>
            </button>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? "border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-[#101322] to-[#10131c] shadow-lg shadow-indigo-950/20 hover:border-indigo-500/60"
                    : isLight
                    ? "bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:bg-slate-50/50"
                    : isSystem
                    ? "bg-[#0b142c]/70 border-blue-500/15 hover:border-blue-500/35 hover:bg-[#0b142c]"
                    : "bg-[#10131c] border-white/10 hover:border-white/20 hover:bg-[#141824]"
                }`}
              >
                {/* Unread Left Border Highlight Bar */}
                {isUnread && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full" />
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Icon, Details, and Contextual Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Category Icon Container */}
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                        isUnread
                          ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400"
                          : "bg-white/5 border-white/10 text-zinc-400"
                      }`}
                    >
                      {getCategoryIcon(notif.type)}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Top Meta Line: Badges + Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityBadge(notif.priority)}

                        <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {notif.type}
                        </span>

                        {notif.counterpartName && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
                            <Building className="h-3 w-3 text-indigo-400" />
                            <span>{notif.counterpartName}</span>
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-500 font-mono ml-auto sm:ml-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{notif.timestamp}</span>
                        </span>
                      </div>

                      {/* Notification Title */}
                      <h4
                        className={`text-sm font-bold tracking-tight truncate flex items-center gap-2 ${
                          isUnread ? "text-white" : "text-zinc-200"
                        }`}
                      >
                        <span>{notif.title}</span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </h4>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>

                      {/* Bottom Contextual Pills: Reference ID, Amount, Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {notif.entityId && (
                          <button
                            onClick={(e) => handleCopy(notif.entityId!, e)}
                            className="inline-flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-zinc-300 transition-colors"
                            title="Click to copy reference"
                          >
                            <span>Ref: {notif.entityId}</span>
                            {copiedId === notif.entityId ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-zinc-500" />
                            )}
                          </button>
                        )}

                        {notif.amountETB && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400">
                            ETB {notif.amountETB.toLocaleString()}
                          </span>
                        )}

                        <span className="text-[10px] text-zinc-500">
                          Target Module: <strong className="text-zinc-400 capitalize">{notif.linkTab}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                    {/* Primary Jump-To Module CTA */}
                    {notif.actionLabel &&
                      !notif.actionLabel.toLowerCase().includes("formal quot") && (
                        <button
                          onClick={(e) => handleActionClick(notif, e)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <span>{notif.actionLabel}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                    {/* Toggle Read / Unread */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isUnread) {
                          markNotificationAsRead(notif.id);
                        } else {
                          markNotificationAsUnread(notif.id);
                        }
                      }}
                      className="h-8 w-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title={isUnread ? "Mark as Read" : "Mark as Unread"}
                    >
                      {isUnread ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </button>

                    {/* Delete Item */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="h-8 w-8 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 transition-colors cursor-pointer"
                      title="Delete this notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Notification Channels & Ethiopian Logistics Integration Banner */}
      <div
        className={`p-5 rounded-2xl border ${
          isLight
            ? "bg-slate-50 border-slate-200"
            : isSystem
            ? "bg-[#0b142c] border-blue-500/20"
            : "bg-[#0e121d] border-white/10"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Active Notification Gateways & Alerts
              </h4>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Critical procurement tenders and CBE Escrow disbursements are dispatched in real-time across connected enterprise channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>SMS (+251 91 144 2200)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>Email Digest</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>CBE Escrow Webhook</span>
            </span>

            <button
              onClick={() => setActiveTab("settings")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer ml-1"
            >
              <span>Manage Settings</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Comprehensive Notification Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 ${
              isLight
                ? "bg-white border-slate-200"
                : isSystem
                ? "bg-[#0d1733] border-blue-500/30"
                : "bg-[#101322] border-white/15"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {getCategoryIcon(selectedNotif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedNotif.priority)}
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      {selectedNotif.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedNotif.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotif(null)}
                className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Notification Content
                </span>
                <p className="text-zinc-200 leading-relaxed text-sm">
                  {selectedNotif.description}
                </p>
              </div>

              {/* Extended Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Received Time
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                    {selectedNotif.timestamp}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Target Workspace
                  </span>
                  <span className="text-xs font-semibold capitalize text-indigo-400 mt-0.5 block">
                    {selectedNotif.linkTab}
                  </span>
                </div>

                {selectedNotif.counterpartName && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      Enterprise Counterparty
                    </span>
                    <span className="text-xs font-semibold text-white mt-0.5 block">
                      {selectedNotif.counterpartName}
                    </span>
                  </div>
                )}

                {selectedNotif.entityId && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                      Reference Dossier
                    </span>
                    <button
                      onClick={(e) => handleCopy(selectedNotif.entityId!, e)}
                      className="text-xs font-mono font-bold text-zinc-200 hover:text-white mt-0.5 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{selectedNotif.entityId}</span>
                      <Copy className="h-3 w-3 text-zinc-500" />
                    </button>
                  </div>
                )}
              </div>

              {selectedNotif.amountETB && (
                <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Associated Financial Sum:
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    ETB {selectedNotif.amountETB.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  deleteNotification(selectedNotif.id);
                  setSelectedNotif(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Alert</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    markNotificationAsRead(selectedNotif.id);
                    setSelectedNotif(null);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                >
                  Mark as Read
                </button>

                {selectedNotif.actionLabel &&
                  !selectedNotif.actionLabel.toLowerCase().includes("formal quot") && (
                    <button
                      onClick={(e) => {
                        handleActionClick(selectedNotif, e);
                        setSelectedNotif(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{selectedNotif.actionLabel}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
