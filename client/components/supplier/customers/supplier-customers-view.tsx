"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  CreditCard,
  FileText,
  ShoppingCart,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  X,
  Search,
  CheckCircle2,
  MoreVertical,
  Trash2,
  ArrowLeft,
  BadgeCheck,
  Award,
  Wallet,
  Clock,
  Plus,
  Copy,
  Printer,
  ChevronRight,
  Eye,
  ShieldCheck,
  Tag,
  Star,
  Package,
  Handshake,
  Check,
  AlertCircle,
  Sparkles,
  Globe,
  Calendar,
  DollarSign,
  Briefcase,
  Landmark,
  UserCheck,
  ShieldAlert,
  FileCheck,
  Layers,
  Hash,
  Compass,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { DataFilterBar } from "../shared/data-filter-bar";
import { StatusBadge } from "../shared/status-badge";
import { Pagination } from "../shared/pagination";
import { EmptyState } from "../shared/empty-state";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { CustomerCRM } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierCustomersView() {
  const {
    customers,
    orders,
    rfqs,
    quotations,
    negotiations,
    invoices,
    deleteCustomer,
    openModal,
    setActiveTab,
    setActiveChatThreadId,
  } = useSupplierStore();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isSystem = theme === "system";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "orders" | "identification" | "profile" | "invoices">("overview");

  const pageSize = 8;

  // Close 3-dot dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tinNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industrySector && c.industrySector.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.faydaNationalId && c.faydaNationalId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Customer 360 Related Data: Filter specifically for orders placed with THIS supplier
  const customerOrdersWithThisSupplier = selectedCustomer
    ? orders.filter(
      (o) =>
        o.buyerCompany.toLowerCase().includes(selectedCustomer.companyName.toLowerCase().split(" ")[0]) ||
        selectedCustomer.companyName.toLowerCase().includes(o.buyerCompany.toLowerCase().split(" ")[0])
    )
    : [];

  const customerNegotiations = selectedCustomer
    ? negotiations.filter(
      (n) =>
        n.buyerCompany.toLowerCase().includes(selectedCustomer.companyName.toLowerCase().split(" ")[0]) ||
        selectedCustomer.companyName.toLowerCase().includes(n.buyerCompany.toLowerCase().split(" ")[0])
    )
    : [];

  const customerRFQs = selectedCustomer
    ? rfqs.filter(
      (r) =>
        r.buyerCompany.toLowerCase().includes(selectedCustomer.companyName.toLowerCase().split(" ")[0]) ||
        selectedCustomer.companyName.toLowerCase().includes(r.buyerCompany.toLowerCase().split(" ")[0])
    )
    : [];

  const customerInvoices = selectedCustomer
    ? invoices.filter(
      (inv) =>
        inv.buyerCompany.toLowerCase().includes(selectedCustomer.companyName.toLowerCase().split(" ")[0]) ||
        selectedCustomer.companyName.toLowerCase().includes(inv.buyerCompany.toLowerCase().split(" ")[0])
    )
    : [];

  // Calculate actual total spend specifically with THIS supplier
  const actualOrdersCountWithSupplier = selectedCustomer
    ? selectedCustomer.supplierSpecificOrdersCount || customerOrdersWithThisSupplier.length
    : 0;

  const actualSpendWithSupplier = selectedCustomer
    ? selectedCustomer.supplierSpecificTotalSpend ||
    customerOrdersWithThisSupplier.reduce((sum, o) => sum + o.total, 0)
    : 0;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDeleteCustomer = (customerId: string, companyName: string) => {
    deleteCustomer(customerId);
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(null);
    }
  };

  // Card theme helper classes
  const cardBgClass = isLight
    ? "bg-white border-slate-200 text-slate-800"
    : isSystem
      ? "bg-[#0b142c] border-blue-500/20 text-white"
      : "bg-[#10131c] border-white/10 text-white";

  const innerCardBgClass = isLight
    ? "bg-slate-50 border-slate-200 text-slate-800"
    : isSystem
      ? "bg-blue-950/20 border-blue-500/20 text-white"
      : "bg-white/[0.02] border-white/10 text-white";

  // =========================================================================
  // FULL SCREEN VIEW: COMPREHENSIVE CUSTOMER 360 DETAIL VIEW
  // (Reuses Supplier Header & Sidebar in the Main Layout Shell)
  // =========================================================================
  if (selectedCustomerId && selectedCustomer) {
    const creditPercent =
      selectedCustomer.creditLimit > 0
        ? Math.min(100, Math.round((selectedCustomer.outstandingBalance / selectedCustomer.creditLimit) * 100))
        : 0;

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Top Back Navigation Bar */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
            }`}
        >
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedCustomerId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer mb-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All Customers</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-zinc-400 flex-wrap">
              <span>Customer ID: <strong className="font-mono text-zinc-300">{selectedCustomer.id}</strong></span>
              <span>•</span>
              <span>KYC: <strong className="text-emerald-400 font-bold">{selectedCustomer.kycLevel || "Tier 3 Enterprise KYC"}</strong></span>
              <span>•</span>
              <span className="text-zinc-500 italic">Passwords & Authentication Secrets Fully Protected</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab("messages");
                setActiveChatThreadId("chat-01");
                toast.info(`Switched to secure messages desk with ${selectedCustomer.companyName}.`);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
                }`}
            >
              <MessageCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>Open Chat Desk</span>
            </button>

            <button
              onClick={() => {
                openModal("create-quotation", {
                  buyerCompany: selectedCustomer.companyName,
                  buyerName: selectedCustomer.contactPerson,
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Create Quotation</span>
            </button>

            <button
              onClick={() => toast.success(`Exported complete 360 buyer dossier for ${selectedCustomer.companyName}.`)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
                }`}
            >
              <Printer className="h-3.5 w-3.5 text-zinc-400" />
              <span>Export Dossier</span>
            </button>

            <button
              onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.companyName)}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
              title="Delete customer record"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Customer Header Dossier Card with Profile Picture & Branding */}
        <div className={`p-5 sm:p-6 rounded-2xl border ${cardBgClass}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Photos & Corporate Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Authorized Representative Portrait Picture & Corporate Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-md bg-zinc-800 shrink-0">
                  <img
                    src={
                      selectedCustomer.avatarUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={selectedCustomer.contactPerson}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Embedded Corporate Logo badge */}
                {selectedCustomer.companyLogoUrl && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-900 shadow bg-white">
                    <img
                      src={selectedCustomer.companyLogoUrl}
                      alt={selectedCustomer.companyName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Company Title, Verification Badges & Core Identifiers */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"
                      }`}
                  >
                    <span>{selectedCustomer.companyName}</span>
                    <BadgeCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  </h1>
                  <StatusBadge status={selectedCustomer.status} size="sm" />
                  {selectedCustomer.buyerTier && (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {selectedCustomer.buyerTier}
                    </span>
                  )}
                </div>

                <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                  {selectedCustomer.legalName || selectedCustomer.companyName}
                  {selectedCustomer.businessType ? ` • ${selectedCustomer.businessType}` : ""}
                </p>

                <div
                  className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${isLight ? "text-slate-500" : "text-zinc-400"
                    }`}
                >
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span>{selectedCustomer.location}</span>
                  </span>
                  <span>•</span>
                  <span>
                    TIN: <strong className="font-mono text-indigo-400">{selectedCustomer.tinNumber}</strong>
                  </span>
                  {selectedCustomer.faydaNationalId && (
                    <>
                      <span>•</span>
                      <span>
                        Fayda ID:{" "}
                        <strong className="font-mono text-emerald-400">{selectedCustomer.faydaNationalId}</strong>
                      </span>
                    </>
                  )}
                  {selectedCustomer.establishedYear && (
                    <>
                      <span>•</span>
                      <span>Est. {selectedCustomer.establishedYear}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Representative Contact Mini Card */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 w-full md:w-auto md:min-w-[260px] text-xs ${innerCardBgClass}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Authorized Representative
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Signatory
                </span>
              </div>

              <div className="space-y-0.5">
                <p className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {selectedCustomer.contactPerson}
                </p>
                <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {selectedCustomer.authorizedSignatoryTitle || "Procurement Director"}
                </p>
              </div>

              <div className="pt-2 border-t border-inherit flex items-center justify-between gap-2">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="font-mono font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  <span>{selectedCustomer.phone}</span>
                </a>
                <button
                  onClick={() => handleCopy(selectedCustomer.phone, "Phone Number")}
                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy phone"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Relationship with THIS Supplier - Primary KPI Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
              <ShoppingCart className="h-4 w-4 text-indigo-400" />
              <span>Direct Trade Relationship With THIS Supplier (ከዚህ ሰፕላየር የተደረጉ ግብይቶች)</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              100% On-time CBE Escrow Releases
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Orders With THIS Supplier */}
            <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
              <span className={`text-[11px] font-semibold uppercase block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Orders Placed With You
              </span>
              <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
                {actualOrdersCountWithSupplier} Direct Orders
              </p>
              <span className={`text-[10px] mt-0.5 block ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                First Order: {selectedCustomer.firstOrderWithSupplierDate || "2025-04-12"}
              </span>
            </div>

            {/* Total Spend With THIS Supplier */}
            <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
              <span className={`text-[11px] font-semibold uppercase block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Total Spend With You
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ETB {(actualSpendWithSupplier / 1000000).toFixed(2)}M
              </p>
              <span className={`text-[10px] mt-0.5 block ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                ETB {actualSpendWithSupplier.toLocaleString()} Total Value
              </span>
            </div>

            {/* Average Order Value with THIS Supplier */}
            <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
              <span className={`text-[11px] font-semibold uppercase block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Average Order Value
              </span>
              <p className={`text-xl font-bold font-mono mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                ETB {((selectedCustomer.averageOrderValueWithSupplier || 1200000) / 1000).toFixed(0)}K
              </p>
              <span className={`text-[10px] mt-0.5 block ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                Per individual shipment contract
              </span>
            </div>

            {/* Approved Credit Facility */}
            <div className={`p-4 rounded-2xl border ${cardBgClass}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Approved Credit Line
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  {creditPercent}% Used
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
                ETB {(selectedCustomer.creditLimit / 1000000).toFixed(1)}M
              </p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, creditPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-xl border overflow-x-auto ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/[0.03] border-white/10"
            }`}
        >
          <button
            onClick={() => setDetailTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${detailTab === "overview"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>360 Comprehensive Overview</span>
          </button>

          <button
            onClick={() => setDetailTab("orders")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${detailTab === "orders"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>Orders With This Supplier ({customerOrdersWithThisSupplier.length})</span>
          </button>

          <button
            onClick={() => setDetailTab("identification")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${detailTab === "identification"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Identification & KYC Verification</span>
          </button>

          <button
            onClick={() => setDetailTab("profile")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${detailTab === "profile"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Company Profile & Representative</span>
          </button>

          <button
            onClick={() => setDetailTab("invoices")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${detailTab === "invoices"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-zinc-400 hover:text-white"
              }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Invoices & Billing ({customerInvoices.length})</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: 360 COMPREHENSIVE OVERVIEW (DEFAULT)
           ========================================================================= */}
        {(detailTab === "overview" || detailTab === "orders") && (
          <div className="space-y-6">
            {/* Top Commodities Ordered from THIS Supplier */}
            {selectedCustomer.topOrderedCommoditiesFromSupplier && (
              <div className={`p-5 rounded-2xl border space-y-3 ${cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-800" : "text-white"}`}>
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span>Top Commodities Ordered from THIS Supplier</span>
                  </h3>
                  <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Historical Volume Breakdown
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedCustomer.topOrderedCommoditiesFromSupplier.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${innerCardBgClass}`}
                    >
                      <p className={`font-semibold text-xs truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {item.commodity}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400">{item.volume}</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ETB {(item.totalSpend / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Showcase with Product Images */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <Package className="h-4 w-4 text-indigo-400" />
                    <span>Orders Placed With This Supplier ({customerOrdersWithThisSupplier.length})</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    All purchase orders submitted to your desk with complete product photos, quantities, and CBE Escrow status
                  </p>
                </div>
              </div>

              {customerOrdersWithThisSupplier.length === 0 ? (
                <div
                  className={`p-8 text-center text-xs rounded-xl border border-dashed ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-zinc-400"
                    }`}
                >
                  No purchase orders currently recorded with this customer account.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {customerOrdersWithThisSupplier.map((order) => {
                    const primaryImage =
                      order.productImage ||
                      (order.productImages && order.productImages[0]) ||
                      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80";

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-xl border transition-all hover:border-indigo-500/40 ${innerCardBgClass}`}
                      >
                        <div className="flex flex-col sm:flex-row gap-3.5">
                          {/* Product Thumbnail with hover zoom */}
                          <div className="relative w-full sm:w-28 h-28 sm:h-24 rounded-lg overflow-hidden bg-black/20 shrink-0 border border-white/10 group/img">
                            <img
                              src={primaryImage}
                              alt={order.productName}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono text-zinc-200 font-bold">
                              {order.unit}
                            </div>
                          </div>

                          {/* Product Details & Commercials */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="font-mono text-xs font-bold text-indigo-400">
                                {order.orderNumber}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <StatusBadge status={order.orderStatus} size="sm" />
                                <StatusBadge status={order.paymentStatus} size="sm" />
                              </div>
                            </div>

                            <h4
                              className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"
                                }`}
                            >
                              {order.productName}
                            </h4>

                            <div
                              className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"
                                }`}
                            >
                              <span>
                                Volume:{" "}
                                <strong className={isLight ? "text-slate-800" : "text-zinc-200"}>
                                  {order.quantity.toLocaleString()} {order.unit}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Unit Price:{" "}
                                <strong className="font-mono text-emerald-400">
                                  ETB {order.unitPrice.toLocaleString()}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>Date: {order.orderDate}</span>
                            </div>

                            {/* Specifications snippet */}
                            {order.specifications && Object.keys(order.specifications).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {Object.entries(order.specifications)
                                  .slice(0, 3)
                                  .map(([key, val], idx) => (
                                    <span
                                      key={idx}
                                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${isLight
                                          ? "bg-slate-200/70 text-slate-700"
                                          : "bg-white/5 text-zinc-300 border border-white/5"
                                        }`}
                                    >
                                      {key}: {val}
                                    </span>
                                  ))}
                              </div>
                            )}

                            {/* Delivery & Total Value */}
                            <div className="flex items-center justify-between pt-1 border-t border-inherit">
                              <span
                                className={`text-[11px] truncate max-w-[200px] ${isLight ? "text-slate-500" : "text-zinc-400"
                                  }`}
                              >
                                Destination: {order.buyerLocation}
                              </span>
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 mr-1.5">Order Total:</span>
                                <span className="font-mono font-bold text-xs text-emerald-400">
                                  ETB {order.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: IDENTIFICATION & KYC VERIFICATION (FULL LEGAL CREDENTIALS)
           ========================================================================= */}
        {(detailTab === "overview" || detailTab === "identification") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Identification Documents */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <FileCheck className="h-4 w-4 text-indigo-400" />
                  <span>National Identification & Trade Credentials</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Government Certified
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Fayda National Digital ID */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Ethiopian National ID (Fayda Digital ID)
                    </span>
                    <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {selectedCustomer.faydaNationalId || "ETH-FAYDA-9821-4402"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedCustomer.faydaNationalId || "ETH-FAYDA-9821-4402", "Fayda ID")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Fayda ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Taxpayer Identification Number (TIN) */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Taxpayer Identification Number (TIN)
                    </span>
                    <p className="font-mono font-bold text-indigo-400 text-sm mt-0.5">
                      {selectedCustomer.tinNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedCustomer.tinNumber, "TIN")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy TIN"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* VAT Registration Number */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      VAT Registration Certificate
                    </span>
                    <p className={`font-mono font-bold text-xs mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                      {selectedCustomer.vatNumber || "VAT-ET-00827104"}
                    </p>
                    <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Reg. Date: {selectedCustomer.vatRegistrationDate || "2016-09-12"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedCustomer.vatNumber || "VAT-ET-00827104", "VAT Number")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy VAT"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Commercial Registration Number (የንግድ ምዝገባ) */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Commercial Registration No. (የንግድ ምዝገባ)
                    </span>
                    <p className="font-mono font-bold text-xs mt-0.5 text-zinc-300">
                      {selectedCustomer.businessRegistrationNumber || "MOT/FED/009182/2016"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(selectedCustomer.businessRegistrationNumber || "MOT/FED/009182/2016", "Reg Number")
                    }
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Trade License & Expiry */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Trade License & Validity
                    </span>
                    <p className="font-mono font-bold text-xs mt-0.5 text-zinc-300">
                      {selectedCustomer.tradeLicenseNumber || "MOC/AA/14/0982/2016"}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Valid Through: {selectedCustomer.tradeLicenseExpiry || "2027-07-07"}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(selectedCustomer.tradeLicenseNumber || "MOC/AA/14/0982/2016", "Trade License")
                    }
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Representative Passport / ID */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBgClass}`}>
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      Signatory Passport / National ID
                    </span>
                    <p className="font-mono text-xs mt-0.5 text-zinc-300">
                      {selectedCustomer.representativePassportOrIdNo || "EP-0982410"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400">Verified</span>
                </div>
              </div>
            </div>

            {/* Right: Verification & Institutional Trust Credentials */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Institutional KYC & Verification</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  100% Audit Passed
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Institutional KYC Level */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBgClass}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase ${isLight ? "text-slate-800" : "text-white"}`}>
                      KYC Verification Tier
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {selectedCustomer.kycLevel || "Tier 3 Enterprise Full KYC"}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Verified by: {selectedCustomer.verifiedBy || "Ministry of Innovation & Technology (MInT) & CBE"}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Audit Date: {selectedCustomer.kycVerificationDate || "2026-01-15"}
                  </p>
                </div>

                {/* CBE Escrow Account Linked */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${innerCardBgClass}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <Landmark className="h-3.5 w-3.5" />
                      <span>Commercial Bank of Ethiopia Escrow</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">Active</span>
                  </div>
                  <p className="font-mono font-bold text-xs text-indigo-400">
                    Account: {selectedCustomer.cbeEscrowAccountNumber || "CBE-ESC-1000-4829-1920"}
                  </p>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Branch: {selectedCustomer.cbeBankBranch || "Commercial Bank of Ethiopia - Finfine Main Branch"}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Dispute Record: 0 Historical Disputes • 100% Escrow Released
                  </p>
                </div>

                {/* Physical Site Inspection Audit */}
                <div className={`p-3.5 rounded-xl border space-y-1 ${innerCardBgClass}`}>
                  <span className={`text-[11px] font-bold uppercase block ${isLight ? "text-slate-800" : "text-white"}`}>
                    Physical Site & Yard Inspection
                  </span>
                  <p className="text-xs text-emerald-400 font-medium">
                    ✓ {selectedCustomer.siteAuditStatus || "Verified On-Ground Heavy Yard Audit (Passed 100%)"}
                  </p>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Inspected by MercatoX On-Ground Logistics Audit Team
                  </p>
                </div>

                {/* Quality & Standards Certifications */}
                {selectedCustomer.certifications && (
                  <div className={`p-3.5 rounded-xl border space-y-2 ${innerCardBgClass}`}>
                    <span className={`text-[11px] font-bold uppercase block ${isLight ? "text-slate-800" : "text-white"}`}>
                      Quality & Industrial Standards
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCustomer.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMPANY PROFILE & AUTHORIZED REPRESENTATIVE DOSSIER
           ========================================================================= */}
        {(detailTab === "overview" || detailTab === "profile") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Complete Corporate Profile */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <Building className="h-4 w-4 text-indigo-400" />
                  <span>Corporate Profile Information</span>
                </h3>
                <span className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Registered Commercial Entity
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Legal Name */}
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Company Legal Name:</span>
                  <span className={`font-bold text-right max-w-[220px] truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                    {selectedCustomer.legalName || selectedCustomer.companyName}
                  </span>
                </div>

                {/* Business Type */}
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Entity Type:</span>
                  <span className={`font-semibold ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                    {selectedCustomer.businessType || "Private Limited Company (PLC)"}
                  </span>
                </div>

                {/* Industry Sector */}
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Industry Sector:</span>
                  <span className={`font-semibold text-right max-w-[220px] truncate ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                    {selectedCustomer.industrySector || "Mega Infrastructure & Construction"}
                  </span>
                </div>

                {/* Paid-Up Capital */}
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Paid-up Capital:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ETB {((selectedCustomer.paidUpCapitalETB || 150000000) / 1000000).toFixed(0)} Million
                  </span>
                </div>

                {/* Employee Count */}
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Workforce Size:</span>
                  <span className={`font-medium ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                    {selectedCustomer.employeeCount || "500+ Employees"}
                  </span>
                </div>

                {/* Official Website */}
                {selectedCustomer.website && (
                  <div className="flex items-center justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Official Portal:</span>
                    <a
                      href={selectedCustomer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[180px]">{selectedCustomer.website}</span>
                    </a>
                  </div>
                )}

                {/* Complete Physical Facility Address */}
                <div className="pt-2 border-t border-inherit space-y-1.5">
                  <span className={`text-[11px] font-bold uppercase block ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                    Physical Warehouse & Receiving Facility
                  </span>
                  <p className={`text-xs ${isLight ? "text-slate-800" : "text-white"}`}>
                    {selectedCustomer.facilityAddress || selectedCustomer.location}
                  </p>
                  <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Sub-City: {selectedCustomer.subCity || "Kirkos Sub-City"} • {selectedCustomer.houseNumber || "Gate 3"}
                  </p>
                  {selectedCustomer.gpsCoordinates && (
                    <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Compass className="h-3 w-3" />
                      <span>GPS: {selectedCustomer.gpsCoordinates}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Representative Dossier & Emergency Contacts */}
            <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <UserCheck className="h-4 w-4 text-indigo-400" />
                  <span>Authorized Personnel & Emergency Contacts</span>
                </h3>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  ★ {selectedCustomer.buyerRating || 4.95} Rating
                </span>
              </div>

              {/* Primary Representative Detailed Card */}
              <div className={`p-4 rounded-xl border space-y-3 ${innerCardBgClass}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-indigo-500/30 bg-black/20 shrink-0">
                    <img
                      src={
                        selectedCustomer.avatarUrl ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={selectedCustomer.contactPerson}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isLight ? "text-slate-900" : "text-white"}`}>
                      {selectedCustomer.contactPerson}
                    </p>
                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      {selectedCustomer.authorizedSignatoryTitle || "Chief Procurement Director"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-inherit space-y-2 text-xs">
                  {/* Phone */}
                  <div className="flex items-center justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Direct Line:</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="font-mono font-semibold text-indigo-400 hover:underline"
                      >
                        {selectedCustomer.phone}
                      </a>
                      <button
                        onClick={() => handleCopy(selectedCustomer.phone, "Phone")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>Work Email:</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`mailto:${selectedCustomer.email}`}
                        className="font-mono font-semibold text-indigo-400 hover:underline truncate max-w-[170px]"
                      >
                        {selectedCustomer.email}
                      </a>
                      <button
                        onClick={() => handleCopy(selectedCustomer.email, "Email")}
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Alternate Contact */}
                  {selectedCustomer.alternateContactPerson && (
                    <div className="pt-2 border-t border-inherit space-y-1">
                      <span className={`text-[10px] uppercase font-bold block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                        Alternate Sourcing / Finance Contact
                      </span>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                          {selectedCustomer.alternateContactPerson}
                        </span>
                        <a
                          href={`tel:${selectedCustomer.alternatePhone}`}
                          className="font-mono text-indigo-400 hover:underline"
                        >
                          {selectedCustomer.alternatePhone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveTab("messages");
                    setActiveChatThreadId("chat-01");
                  }}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${isLight
                      ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                >
                  <MessageCircle className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Start Chat</span>
                </button>

                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${isLight
                      ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                >
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Call Buyer</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: COMMERCIAL TAX INVOICES & BILLINGS
           ========================================================================= */}
        {(detailTab === "overview" || detailTab === "invoices") && (
          <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${cardBgClass}`}>
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Commercial Tax Invoices & VAT Billing ({customerInvoices.length})</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  All issued commercial tax documents with 15% Ethiopian VAT and CBE escrow release clearance
                </p>
              </div>
              <span className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                Ethiopian Ministry of Revenue Compliant
              </span>
            </div>

            {customerInvoices.length === 0 ? (
              <div
                className={`p-6 text-center text-xs rounded-xl border border-dashed ${isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-zinc-400"
                  }`}
              >
                No commercial tax invoices issued to this customer account yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5 text-xs">
                {customerInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="py-3 flex items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors rounded-xl px-2"
                  >
                    <div>
                      <p className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                        {inv.invoiceNumber}
                      </p>
                      <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                        Issued: {inv.issuedDate} • Due: {inv.dueDate}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="font-mono font-bold text-emerald-400">
                        ETB {inv.total.toLocaleString()}
                      </p>
                      <StatusBadge status={inv.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // DEFAULT VIEW: BORDERLESS & CLEAN CUSTOMER CRM TABLE
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="B2B Customer CRM & Buyer Accounts"
        subtitle="Manage verified enterprise buyers, trade credit facilities, purchase frequency, and cross-module 360 customer profiles"
        breadcrumbs={[{ label: "Dashboard", onClick: () => setActiveTab("dashboard") }, { label: "Customers" }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-indigo-200/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400">
              {customers.length} Enterprise Clients
            </span>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <DataFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customer company, contact person, TIN number, Fayda ID, or sector..."
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "vip", label: "VIP High-Volume" },
          { value: "active", label: "Active Recurring" },
          { value: "pending_credit", label: "Pending Credit Review" },
        ]}
        onReset={() => {
          setSearchQuery("");
          setStatusFilter("all");
        }}
        onExport={() => toast.success("Exporting B2B buyers directory...")}
      />

      {/* Customer CRM Data Table: Borderless, Background-less, Clean & Light */}
      <div className="w-full overflow-x-auto">
        {paginated.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Customers Found"
              description="No buyer corporate accounts match your search filters."
            />
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className={`border-b font-semibold uppercase text-[10px] tracking-wider select-none ${isLight
                    ? "border-slate-200 text-slate-500"
                    : isSystem
                      ? "border-blue-500/20 text-slate-400"
                      : "border-white/10 text-zinc-400"
                  }`}
              >
                <th className="py-3 px-3">Company & TIN</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-3">Location & Sector</th>
                <th className="py-3 px-3">Orders With You</th>
                <th className="py-3 px-3">Total Spend (ETB)</th>
                <th className="py-3 px-3">Outstanding</th>
                <th className="py-3 px-3">Credit Limit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${isLight ? "divide-slate-200" : isSystem ? "divide-blue-500/10" : "divide-white/5"
                }`}
            >
              {paginated.map((c) => {
                const isMenuOpen = activeMenuId === c.id;
                const ordersCount = c.supplierSpecificOrdersCount || c.totalOrders;
                const totalSpend = c.supplierSpecificTotalSpend || c.totalSpend;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-white/[0.04] transition-colors cursor-pointer group ${isLight ? "hover:bg-slate-100/60" : ""
                      }`}
                    onClick={() => setSelectedCustomerId(c.id)}
                  >
                    {/* Company & TIN with Avatar Thumbnail */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-zinc-800 shrink-0">
                          <img
                            src={
                              c.companyLogoUrl ||
                              c.avatarUrl ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                            }
                            alt={c.companyName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p
                            className={`font-bold truncate max-w-[190px] flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"
                              }`}
                          >
                            <span>{c.companyName}</span>
                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          </p>
                          <p className="text-[11px] font-mono text-indigo-400">TIN: {c.tinNumber}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-4 px-3">
                      <p className={`font-semibold ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                        {c.contactPerson}
                      </p>
                      <p className={`text-[11px] truncate max-w-[170px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                        {c.email}
                      </p>
                    </td>

                    {/* Location & Sector */}
                    <td className="py-4 px-3">
                      <p className={`truncate max-w-[170px] ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        {c.location}
                      </p>
                      {c.industrySector && (
                        <p className={`text-[10px] truncate max-w-[170px] ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
                          {c.industrySector}
                        </p>
                      )}
                    </td>

                    {/* Orders Placed With You */}
                    <td className={`py-4 px-3 font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {ordersCount} Orders
                    </td>

                    {/* Total Spend */}
                    <td className="py-4 px-3 font-mono font-bold text-emerald-400">
                      ETB {(totalSpend / 1000000).toFixed(1)}M
                    </td>

                    {/* Outstanding Balance */}
                    <td className="py-4 px-3 font-mono">
                      {c.outstandingBalance > 0 ? (
                        <span className="font-bold text-amber-400">
                          ETB {c.outstandingBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Settled</span>
                      )}
                    </td>

                    {/* Credit Limit */}
                    <td className={`py-4 px-3 font-mono ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                      ETB {(c.creditLimit / 1000000).toFixed(1)}M
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Actions 3-Dots Menu */}
                    <td
                      className="py-4 px-3 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : c.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isLight
                            ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                            : "hover:bg-white/10 text-zinc-400 hover:text-white"
                          }`}
                        title="Customer Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          className={`absolute right-3 top-10 w-44 rounded-xl border shadow-2xl py-1.5 z-30 animate-in zoom-in-95 duration-150 ${isLight
                              ? "bg-white border-slate-200 text-slate-800"
                              : isSystem
                                ? "bg-[#0b142c] border-blue-500/30 text-white"
                                : "bg-[#141824] border-white/15 text-white"
                            }`}
                        >
                          {/* 360 Detail View */}
                          <button
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setActiveMenuId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
                              }`}
                          >
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Customer 360</span>
                          </button>

                          {/* Chat Desk */}
                          <button
                            onClick={() => {
                              setActiveTab("messages");
                              setActiveChatThreadId("chat-01");
                              setActiveMenuId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
                              }`}
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Start Chat</span>
                          </button>

                          {/* Create Quote */}
                          <button
                            onClick={() => {
                              openModal("create-quotation", {
                                buyerCompany: c.companyName,
                                buyerName: c.contactPerson,
                              });
                              setActiveMenuId(null);
                            }}
                            className={`w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer text-emerald-400 ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"
                              }`}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Create Quote</span>
                          </button>

                          <div className={`my-1 border-t ${isLight ? "border-slate-100" : "border-white/5"}`} />

                          {/* Delete Customer */}
                          <button
                            onClick={() => {
                              handleDeleteCustomer(c.id, c.companyName);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-rose-500/10 text-rose-400 transition-colors text-left cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Account</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
  );
}
