"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  Percent,
  Sparkles,
  Flame,
  Zap,
  RotateCcw,
  Search,
  Filter,
  Layers,
  Grid,
  List,
  MoreVertical,
  Pause,
  Play,
  Copy,
  Trash2,
  Share2,
  BarChart3,
  ArrowUpRight,
  Clock,
  Check,
  ChevronRight,
  ShoppingBag,
  BadgePercent,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Target,
  Award,
  HelpCircle,
} from "lucide-react";
import { PageHeader } from "../shared/page-header";
import { StatusBadge } from "../shared/status-badge";
import { ModalDialog } from "../shared/modal-dialog";
import { EmptyState } from "../shared/empty-state";
import { Pagination } from "../shared/pagination";
import { useSupplierStore } from "@/store/supplier-store";
import { useThemeStore } from "@/store/theme-store";
import { PromotionCampaign } from "@/types/supplier";
import { toast } from "sonner";

export function SupplierPromotionsView() {
  const { promotions: storePromotions, products, setActiveTab } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  // Local state for campaigns to allow real-time creation, pausing, editing, and duplication
  const [campaignsList, setCampaignsList] = useState<PromotionCampaign[]>(storePromotions);

  // View & Filter states
  const [activeViewMode, setActiveViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");
  const [showAnalyticsStrip, setShowAnalyticsStrip] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnalyticsCampaign, setSelectedAnalyticsCampaign] = useState<PromotionCampaign | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<PromotionCampaign["type"]>("bulk_volume_discount");
  const [newProductName, setNewProductName] = useState(products[0]?.name || "Speciality Coffee Grade 1");
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(10);
  const [newMinQty, setNewMinQty] = useState<number>(1000);
  const [newStartDate, setNewStartDate] = useState("2026-10-15");
  const [newEndDate, setNewEndDate] = useState("2026-11-15");

  // Summary Metrics calculations
  const totalGeneratedRevenue = useMemo(() => {
    return campaignsList.reduce((acc, c) => acc + c.generatedRevenue, 0);
  }, [campaignsList]);

  const totalConversions = useMemo(() => {
    return campaignsList.reduce((acc, c) => acc + c.conversions, 0);
  }, [campaignsList]);

  const totalViews = useMemo(() => {
    return campaignsList.reduce((acc, c) => acc + c.views, 0);
  }, [campaignsList]);

  const activeCount = useMemo(() => {
    return campaignsList.filter((c) => c.status === "active").length;
  }, [campaignsList]);

  const scheduledCount = useMemo(() => {
    return campaignsList.filter((c) => c.status === "scheduled").length;
  }, [campaignsList]);

  const expiredCount = useMemo(() => {
    return campaignsList.filter((c) => c.status === "expired").length;
  }, [campaignsList]);

  // Overall conversion rate
  const overallConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : "0.00";

  // Filtering & Search
  const filteredCampaigns = useMemo(() => {
    return campaignsList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.productName.toLowerCase().includes(q) ||
        c.discountPercentage.toString().includes(q);

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaignsList, searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize) || 1;
  const paginatedCampaigns = useMemo(() => {
    return filteredCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredCampaigns, currentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle status (Pause / Activate)
  const handleToggleStatus = (id: string) => {
    setCampaignsList((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === "active" ? "scheduled" : "active";
          toast.success(
            `Campaign "${c.title}" is now ${newStatus === "active" ? "Live & Active" : "Paused / Scheduled"}.`
          );
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // Duplicate campaign
  const handleDuplicate = (campaign: PromotionCampaign) => {
    const duplicated: PromotionCampaign = {
      ...campaign,
      id: `prm-${Date.now()}`,
      title: `${campaign.title} (Copy)`,
      status: "scheduled",
      views: 0,
      conversions: 0,
      generatedRevenue: 0,
    };
    setCampaignsList((prev) => [duplicated, ...prev]);
    toast.success(`Campaign "${campaign.title}" duplicated successfully.`);
  };

  // Delete campaign
  const handleDelete = (id: string, title: string) => {
    setCampaignsList((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Campaign "${title}" removed.`);
  };

  // Create Campaign Submit
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }

    const newCampaign: PromotionCampaign = {
      id: `prm-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      productName: newProductName,
      discountPercentage: Number(newDiscountPercent),
      minOrderQuantity: Number(newMinQty),
      startDate: newStartDate,
      endDate: newEndDate,
      status: "active",
      views: 120,
      conversions: 1,
      generatedRevenue: Math.round(Number(newMinQty) * 1500 * (1 - Number(newDiscountPercent) / 100)),
    };

    setCampaignsList((prev) => [newCampaign, ...prev]);
    setIsCreateModalOpen(false);
    toast.success(`Promotional Campaign "${newTitle}" launched and live across MercatoX!`);

    // Reset fields
    setNewTitle("");
    setNewDiscountPercent(10);
    setNewMinQty(1000);
  };

  // Type styling and icon helper tailored for Light, Dark, and System
  const getTypeConfig = (type: PromotionCampaign["type"]) => {
    switch (type) {
      case "bulk_volume_discount":
        return {
          label: "Volume Tier Rebate",
          icon: Layers,
          colorLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
          colorDark: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
          colorSystem: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
          accentColor: "#6366f1",
        };
      case "seasonal_flash":
        return {
          label: "Harvest Flash Sale",
          icon: Flame,
          colorLight: "bg-amber-50 text-amber-800 border-amber-200",
          colorDark: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          colorSystem: "bg-amber-500/20 text-amber-200 border-amber-400/30",
          accentColor: "#f59e0b",
        };
      case "featured_catalog":
        return {
          label: "Featured Spotlight",
          icon: Sparkles,
          colorLight: "bg-emerald-50 text-emerald-800 border-emerald-200",
          colorDark: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          colorSystem: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
          accentColor: "#10b981",
        };
      case "category_special":
        return {
          label: "Category Special",
          icon: Tag,
          colorLight: "bg-blue-50 text-blue-800 border-blue-200",
          colorDark: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          colorSystem: "bg-blue-500/20 text-blue-200 border-blue-400/30",
          accentColor: "#0284c7",
        };
    }
  };

  // Button active state helper matching the theme-responsive design system
  const getTabActiveStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
      if (isSystem) return "text-blue-200/70 hover:bg-blue-900/40 hover:text-white";
      return "text-zinc-400 hover:bg-white/5 hover:text-white";
    }
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
      {/* 1. Page Header with Actions */}
      <PageHeader
        title="Promotions & Wholesale Rebate Engine"
        subtitle="Incentivize bulk purchasing, highlight seasonal harvest surpluses, and feature catalog listings on MercatoX"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Promotions & Rebates" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAnalyticsStrip(!showAnalyticsStrip)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                showAnalyticsStrip
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
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{showAnalyticsStrip ? "Hide Analytics" : "Campaign ROI"}</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40"
                  : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
              }`}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Launch New Campaign</span>
            </button>
          </div>
        }
      />

      {/* 2. Hero Glassmorphic Promotions Command Center */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 lg:p-7 text-white shadow-2xl border transition-all ${
          isLight
            ? "border-indigo-600/30 bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-[#0f172a] shadow-indigo-950/15"
            : isSystem
            ? "border-blue-500/35 bg-gradient-to-br from-[#091a32] via-[#0b2142] to-[#051124] shadow-blue-950/40"
            : "border-emerald-500/30 bg-gradient-to-br from-[#091e14] via-[#0e271a] to-[#04120c] shadow-black/60"
        }`}
      >
        {/* Ambient Glows */}
        <div
          className={`pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-30 ${
            isSystem ? "bg-blue-500" : isLight ? "bg-indigo-500" : "bg-emerald-500"
          }`}
        />
        <div
          className={`pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full blur-3xl opacity-20 ${
            isSystem ? "bg-cyan-500" : isLight ? "bg-blue-500" : "bg-teal-500"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Primary Promotional Revenue & Quick CTAs */}
          <div className="space-y-4 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold backdrop-blur-xs ${
                  isSystem
                    ? "border-blue-400/40 bg-blue-500/20 text-blue-200"
                    : isLight
                    ? "border-indigo-400/40 bg-indigo-500/20 text-indigo-200"
                    : "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full animate-pulse ${
                    isSystem ? "bg-blue-400" : isLight ? "bg-indigo-400" : "bg-emerald-400"
                  }`}
                />
                Wholesale Campaign Yield
              </span>
              <span className="text-xs text-white/70 font-mono">
                {activeCount} Active • {scheduledCount} Scheduled
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                Total Promotional Sales Generated
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-mono text-white drop-shadow-xs">
                  ETB {(totalGeneratedRevenue / 1000000).toFixed(2)}M
                </span>
                <span className="text-xs font-mono font-medium text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  +{overallConversionRate}% Conversion Lift
                </span>
              </div>
              <p className="mt-1.5 text-xs text-white/80 max-w-xl leading-relaxed">
                Wholesale volume discounts drive larger average order values (AOV) and accelerate inventory turnover for seasonal commodities.
              </p>
            </div>

            {/* Quick Actions inside Card */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-98 ${
                  isLight
                    ? "bg-white text-indigo-950 hover:bg-slate-100 shadow-indigo-950/20"
                    : isSystem
                    ? "bg-blue-500 hover:bg-blue-400 text-white shadow-blue-950/40"
                    : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
                }`}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Create New Campaign</span>
              </button>

              <button
                onClick={() => {
                  setStatusFilter("active");
                  toast.success("Filtered to active wholesale promotions.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-3.5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer backdrop-blur-xs"
              >
                <Flame className="h-4 w-4 text-amber-300" />
                <span>View Live Promotions</span>
              </button>
            </div>
          </div>

          {/* Right Column: 4 Frosted KPI Tiles */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-6">
            {/* Tile 1: Wholesale Orders */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Wholesale Orders
                </span>
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">{totalConversions}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/80">
                <span>Direct B2B checkouts</span>
              </div>
            </div>

            {/* Tile 2: Total Impressions */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-blue-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Buyer Views
                </span>
                <Eye className="h-4 w-4 text-blue-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">
                {totalViews.toLocaleString()}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300">
                <span className="font-semibold">+34.8%</span>
                <span className="text-white/60 text-[10px]">catalog reach</span>
              </div>
            </div>

            {/* Tile 3: Avg Discount */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Average Rebate
                </span>
                <Percent className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">11.2%</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span>Healthy margin balance</span>
              </div>
            </div>

            {/* Tile 4: Active Campaigns */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Active Live
                </span>
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">{activeCount} Promos</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span className="text-white/60 text-[10px]">{scheduledCount} queued upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Campaign Archetypes & Fast Launch Shelf */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3
            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? "text-slate-800" : isSystem ? "text-blue-100" : "text-zinc-200"
            }`}
          >
            <Sparkles className={`h-4 w-4 ${isSystem ? "text-blue-400" : "text-emerald-500"}`} />
            <span>Recommended Wholesale Campaign Templates</span>
          </h3>
          <span
            className={`text-[11px] ${
              isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
            }`}
          >
            Quick 1-click B2B campaign archetypes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            {
              type: "bulk_volume_discount" as const,
              title: "Tiered Volume Rebate",
              desc: "Offer 10–15% off for orders over 5,000 units to attract hotel & food mill enterprises.",
              icon: Layers,
              presetDiscount: 12.5,
              presetMin: 5000,
            },
            {
              type: "seasonal_flash" as const,
              title: "Harvest Surplus Flash",
              desc: "Clear freshly harvested grain or produce before storage expiry with time-limited rebates.",
              icon: Flame,
              presetDiscount: 15,
              presetMin: 2500,
            },
            {
              type: "featured_catalog" as const,
              title: "Category Top Spotlight",
              desc: "Boost your listing to page 1 on MercatoX wholesale searches with sponsored tags.",
              icon: Sparkles,
              presetDiscount: 8,
              presetMin: 500,
            },
            {
              type: "category_special" as const,
              title: "Corporate Tier Pricing",
              desc: "Special contract incentives for verified Ethiopian manufacturing & construction buyers.",
              icon: Tag,
              presetDiscount: 10,
              presetMin: 1000,
            },
          ].map((template, idx) => {
            const Icon = template.icon;
            const config = getTypeConfig(template.type);

            return (
              <div
                key={idx}
                className={`rounded-2xl border p-4 shadow-xs transition-all hover:scale-[1.01] flex flex-col justify-between group ${
                  isLight
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0f1b3b] hover:border-blue-400 text-white shadow-md shadow-blue-950/20"
                    : "border-white/10 bg-[#121620] hover:border-white/20 text-white"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isLight ? config.colorLight : isSystem ? config.colorSystem : config.colorDark
                      }`}
                    >
                      {template.presetDiscount}% OFF
                    </span>
                  </div>

                  <h4 className="font-bold text-xs">{template.title}</h4>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                    }`}
                  >
                    {template.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setNewType(template.type);
                    setNewTitle(`${template.title} - ${products[0]?.name || "Catalog Special"}`);
                    setNewDiscountPercent(template.presetDiscount);
                    setNewMinQty(template.presetMin);
                    setIsCreateModalOpen(true);
                  }}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      : isSystem
                      ? "bg-blue-900/30 hover:bg-blue-900/60 text-blue-200"
                      : "bg-white/5 hover:bg-white/10 text-zinc-300"
                  }`}
                >
                  <span>Use Template</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Toolbar: Search, Status Tabs, Type Selector, View Switcher */}
      <div className="space-y-3 pt-2">
        {/* Status Category Tabs with Theme-Aware Active States */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 ${
            isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Campaigns", count: campaignsList.length },
              { id: "active", label: "Active Live", count: activeCount },
              { id: "scheduled", label: "Scheduled", count: scheduledCount },
              { id: "expired", label: "Expired", count: expiredCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
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

          {/* View Mode Switcher (Grid vs Table) */}
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
              onClick={() => setActiveViewMode("grid")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getViewBtnStyle(
                activeViewMode === "grid"
              )}`}
              title="Cards Grid View"
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setActiveViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${getViewBtnStyle(
                activeViewMode === "table"
              )}`}
              title="Data Table View"
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Search & Type Filters */}
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
              placeholder="Search campaigns by title, product name, discount %..."
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
            {/* Campaign Type Selector */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
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
              <option value="all">All Campaign Types</option>
              <option value="bulk_volume_discount">Bulk Volume Discount</option>
              <option value="seasonal_flash">Seasonal Flash Sale</option>
              <option value="featured_catalog">Featured Catalog Spotlight</option>
              <option value="category_special">Category Special</option>
            </select>

            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
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

      {/* 5. Campaigns Presentation: Cards Grid OR Data Table */}
      {filteredCampaigns.length === 0 ? (
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
            title="No Campaigns Found"
            description="No promotional campaigns match your active search terms or selected filters."
            actionLabel="Reset All Filters"
            onAction={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
          />
        </div>
      ) : activeViewMode === "grid" ? (
        /* CARDS GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {paginatedCampaigns.map((p) => {
              const typeCfg = getTypeConfig(p.type);
              const TypeIcon = typeCfg.icon;
              const isLive = p.status === "active";

              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between group overflow-hidden ${
                    isLight
                      ? "border-slate-200 bg-white hover:border-slate-300 text-slate-900"
                      : isSystem
                      ? "border-blue-500/25 bg-[#0f1b3b] hover:border-blue-400 text-white shadow-md shadow-blue-950/20"
                      : "border-white/10 bg-[#121620] hover:border-white/20 text-white"
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 opacity-80"
                    style={{ backgroundColor: typeCfg.accentColor }}
                  />

                  <div className="space-y-3.5">
                    {/* Header: Type Badge & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border uppercase tracking-wider ${
                          isLight
                            ? typeCfg.colorLight
                            : isSystem
                            ? typeCfg.colorSystem
                            : typeCfg.colorDark
                        }`}
                      >
                        <TypeIcon className="h-3.5 w-3.5" />
                        <span>{typeCfg.label}</span>
                      </span>

                      <StatusBadge status={p.status} size="sm" />
                    </div>

                    {/* Title & Product */}
                    <div>
                      <h3 className="font-bold text-sm leading-snug line-clamp-2">{p.title}</h3>
                      <p
                        className={`text-xs mt-1 font-medium truncate ${
                          isLight ? "text-slate-600" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                        }`}
                      >
                        {p.productName}
                      </p>
                    </div>

                    {/* Rebate Mechanics Banner */}
                    <div
                      className={`rounded-xl border p-3 space-y-2 text-xs ${
                        isLight
                          ? "border-slate-100 bg-slate-50"
                          : isSystem
                          ? "border-blue-500/20 bg-[#0c1630]"
                          : "border-white/5 bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="opacity-70">Volume Discount:</span>
                        <span className="font-black font-mono text-sm" style={{ color: typeCfg.accentColor }}>
                          {p.discountPercentage}% OFF
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-70">Min Order Requirement:</span>
                        <span className="font-bold font-mono">
                          {p.minOrderQuantity.toLocaleString()} Units
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono pt-1.5 border-t border-current/10 opacity-70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {p.startDate}
                        </span>
                        <span>→</span>
                        <span>{p.endDate}</span>
                      </div>
                    </div>

                    {/* Performance Metrics Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-current/10">
                      <div>
                        <span className="text-[10px] opacity-60">Buyer Views</span>
                        <p className="font-bold font-mono mt-0.5">{p.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-60">Wholesale Orders</span>
                        <p className="font-bold font-mono mt-0.5 text-emerald-500">{p.conversions}</p>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-60">Revenue</span>
                        <p className="font-bold font-mono mt-0.5">
                          ETB {(p.generatedRevenue / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedAnalyticsCampaign(p)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer ${
                        isSystem ? "text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>ROI Analytics</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(p.id)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          isLight
                            ? "hover:bg-slate-100 text-slate-600"
                            : isSystem
                            ? "hover:bg-blue-900/30 text-blue-200"
                            : "hover:bg-white/10 text-zinc-300"
                        }`}
                        title={isLive ? "Pause Campaign" : "Activate Campaign"}
                      >
                        {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-500" />}
                      </button>

                      <button
                        onClick={() => handleDuplicate(p)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          isLight
                            ? "hover:bg-slate-100 text-slate-600"
                            : isSystem
                            ? "hover:bg-blue-900/30 text-blue-200"
                            : "hover:bg-white/10 text-zinc-300"
                        }`}
                        title="Duplicate Campaign"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
              totalItems={filteredCampaigns.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* DATA TABLE VIEW */
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
                  <th className="py-3 px-4">Campaign Title</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Target Product</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Min Order</th>
                  <th className="py-3 px-3">Timeline</th>
                  <th className="py-3 px-3">Views / Orders</th>
                  <th className="py-3 px-3">Revenue (ETB)</th>
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
                {paginatedCampaigns.map((p) => {
                  const typeCfg = getTypeConfig(p.type);
                  const isLive = p.status === "active";

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isLight
                          ? "hover:bg-slate-50"
                          : isSystem
                          ? "hover:bg-blue-900/20"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold max-w-[200px] truncate">{p.title}</div>
                        <div className="text-[10px] font-mono opacity-60">ID: {p.id}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            isLight
                              ? typeCfg.colorLight
                              : isSystem
                              ? typeCfg.colorSystem
                              : typeCfg.colorDark
                          }`}
                        >
                          {typeCfg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium max-w-[170px] truncate block">
                          {p.productName}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-sm">
                        {p.discountPercentage}%
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        {p.minOrderQuantity.toLocaleString()} Units
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] opacity-75">
                        {p.startDate} → {p.endDate}
                      </td>

                      <td className="py-3.5 px-3 font-mono">
                        <span>{p.views.toLocaleString()}</span>
                        <span className="opacity-50"> / </span>
                        <span className="font-bold text-emerald-500">{p.conversions}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold">
                        ETB {(p.generatedRevenue / 1000000).toFixed(2)}M
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedAnalyticsCampaign(p)}
                            className="rounded-lg p-1.5 hover:bg-current/10 transition-colors cursor-pointer"
                            title="Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(p.id)}
                            className="rounded-lg p-1.5 hover:bg-current/10 transition-colors cursor-pointer"
                            title={isLive ? "Pause" : "Activate"}
                          >
                            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-500" />}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
            totalItems={filteredCampaigns.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 6. Launch Campaign Modal with Full Archetype Selector */}
      <ModalDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch Wholesale Promotion Campaign"
        subtitle="Incentivize bulk purchasing, highlight seasonal harvest surpluses, and feature catalog listings"
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
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
              onClick={handleCreateCampaign}
              className={`rounded-xl px-5 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
              }`}
            >
              Launch Live Campaign
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
          {/* Campaign Archetype Selection Cards */}
          <div>
            <label className="block font-semibold mb-1.5">
              Select Promotion Archetype <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: "bulk_volume_discount" as const, label: "Volume Rebate", icon: Layers },
                { type: "seasonal_flash" as const, label: "Harvest Flash", icon: Flame },
                { type: "featured_catalog" as const, label: "Featured Top", icon: Sparkles },
                { type: "category_special" as const, label: "Corporate Deal", icon: Tag },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = newType === item.type;

                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setNewType(item.type)}
                    className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? isLight
                          ? "border-emerald-600 bg-emerald-50 text-slate-900 ring-2 ring-emerald-500/30 shadow-xs"
                          : isSystem
                          ? "border-blue-400 bg-blue-950/40 text-white ring-2 ring-blue-500/30 shadow-xs"
                          : "border-emerald-400 bg-emerald-950/40 text-white ring-2 ring-emerald-500/30 shadow-xs"
                        : isLight
                        ? "border-slate-200 bg-white hover:border-slate-300"
                        : isSystem
                        ? "border-blue-500/20 bg-[#0c1630] hover:border-blue-400/40"
                        : "border-white/10 bg-[#12161f] hover:border-white/20"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-bold text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campaign Title */}
          <div>
            <label className="block font-semibold mb-1">
              Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Seasonal Harvest Pre-Holiday Teff Bulk Rebate"
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white placeholder:text-blue-300/40 focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white placeholder:text-zinc-500 focus:border-emerald-500"
              }`}
              required
            />
          </div>

          {/* Target Product */}
          <div>
            <label className="block font-semibold mb-1">
              Select Target Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden cursor-pointer ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                  : isSystem
                  ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                  : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
              }`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} (Stock: {p.stock.toLocaleString()} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Discount & Min Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">Discount Percentage</label>
                <span className="font-bold font-mono text-emerald-500">{newDiscountPercent}%</span>
              </div>
              <input
                type="number"
                min={1}
                max={50}
                value={newDiscountPercent}
                onChange={(e) => setNewDiscountPercent(Number(e.target.value))}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono font-bold focus:outline-hidden ${
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">Min Order Volume (MOQ)</label>
                <span className="font-mono opacity-70">Units</span>
              </div>
              <input
                type="number"
                min={100}
                value={newMinQty}
                onChange={(e) => setNewMinQty(Number(e.target.value))}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono font-bold focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
                required
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
              />
            </div>
          </div>

          {/* Real-time Forecast Preview Card */}
          <div
            className={`rounded-2xl border p-3.5 space-y-1.5 ${
              isLight
                ? "border-emerald-200 bg-emerald-50/70 text-slate-900"
                : isSystem
                ? "border-blue-500/25 bg-[#0c1630] text-white"
                : "border-emerald-500/20 bg-emerald-500/10 text-white"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] opacity-80">
              <span>Projected Order Value per MOQ:</span>
              <span className="font-mono font-bold">
                ETB {(newMinQty * 1250 * (1 - newDiscountPercent / 100)).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] opacity-80">
              <span>Buyer Savings per Order:</span>
              <span className="font-mono font-bold text-emerald-500">
                ETB {(newMinQty * 1250 * (newDiscountPercent / 100)).toLocaleString()} ({newDiscountPercent}%)
              </span>
            </div>
            <p className="text-[10px] opacity-60 pt-1">
              Campaign will automatically display promotional badges across category listings and RFQ search.
            </p>
          </div>
        </form>
      </ModalDialog>

      {/* 7. Detailed Campaign Analytics Modal */}
      {selectedAnalyticsCampaign && (
        <ModalDialog
          isOpen={!!selectedAnalyticsCampaign}
          onClose={() => setSelectedAnalyticsCampaign(null)}
          title="Campaign ROI & Conversion Intelligence"
          subtitle={`Detailed funnel for ${selectedAnalyticsCampaign.title}`}
          maxWidth="md"
          footer={
            <button
              type="button"
              onClick={() => setSelectedAnalyticsCampaign(null)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer ${
                isLight
                  ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                  : isSystem
                  ? "border-blue-500/25 text-blue-200 hover:bg-blue-900/30"
                  : "border-white/10 text-zinc-300 hover:bg-white/5"
              }`}
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div
              className={`rounded-2xl border p-3.5 ${
                isLight
                  ? "border-slate-200 bg-slate-50"
                  : isSystem
                  ? "border-blue-500/20 bg-[#0c1630]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{selectedAnalyticsCampaign.productName}</h4>
                  <p className="text-[11px] opacity-70 mt-0.5">
                    {selectedAnalyticsCampaign.discountPercentage}% Discount • MOQ:{" "}
                    {selectedAnalyticsCampaign.minOrderQuantity.toLocaleString()} Units
                  </p>
                </div>
                <StatusBadge status={selectedAnalyticsCampaign.status} size="sm" />
              </div>
            </div>

            {/* Funnel Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div
                className={`rounded-xl border p-3 ${
                  isLight ? "border-slate-100 bg-white" : "border-white/5 bg-white/5"
                }`}
              >
                <span className="text-[10px] opacity-60">Impressions</span>
                <p className="font-bold text-base font-mono mt-1">
                  {selectedAnalyticsCampaign.views.toLocaleString()}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 ${
                  isLight ? "border-slate-100 bg-white" : "border-white/5 bg-white/5"
                }`}
              >
                <span className="text-[10px] opacity-60">Wholesale Orders</span>
                <p className="font-bold text-base font-mono text-emerald-500 mt-1">
                  {selectedAnalyticsCampaign.conversions}
                </p>
              </div>
              <div
                className={`rounded-xl border p-3 ${
                  isLight ? "border-slate-100 bg-white" : "border-white/5 bg-white/5"
                }`}
              >
                <span className="text-[10px] opacity-60">Revenue Lift</span>
                <p className="font-bold text-base font-mono mt-1">
                  ETB {(selectedAnalyticsCampaign.generatedRevenue / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>

            {/* Campaign Duration Progress */}
            <div
              className={`rounded-xl border p-3 space-y-2 ${
                isLight ? "border-slate-100 bg-white" : "border-white/5 bg-white/5"
              }`}
            >
              <div className="flex justify-between text-[11px]">
                <span className="opacity-70">Campaign Duration</span>
                <span className="font-mono font-bold">
                  {selectedAnalyticsCampaign.startDate} → {selectedAnalyticsCampaign.endDate}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-current/10 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-2/3" />
              </div>
              <p className="text-[10px] opacity-60">
                18 days active • 12 days remaining until scheduled expiry.
              </p>
            </div>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}
