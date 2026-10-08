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
  Truck,
  Ticket,
  Edit3,
  Store,
  AlertCircle,
  CheckCheck,
  PercentCircle,
  Layers3,
  Gift,
  ArrowRight,
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
  const {
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    duplicatePromotion,
    products,
    setActiveTab,
  } = useSupplierStore();
  const { theme } = useThemeStore();

  const isLight = theme === "light";
  const isSystem = theme === "system";
  const isDark = theme === "dark";

  // Active top sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"campaigns" | "coupons" | "analytics" | "preview">("campaigns");

  // View & Filter states
  const [activeViewMode, setActiveViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D">("30D");
  const [showAnalyticsStrip, setShowAnalyticsStrip] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PromotionCampaign | null>(null);
  const [selectedAnalyticsCampaign, setSelectedAnalyticsCampaign] = useState<PromotionCampaign | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<PromotionCampaign["type"]>("bulk_volume_discount");
  const [newDiscountType, setNewDiscountType] = useState<"percentage" | "fixed_amount" | "free_shipping">("percentage");
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(10);
  const [newDiscountAmount, setNewDiscountAmount] = useState<number>(2500);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newScope, setNewScope] = useState<"all_products" | "specific_category" | "specific_products">("all_products");
  const [newCategory, setNewCategory] = useState("All Categories");
  const [newProductName, setNewProductName] = useState(products[0]?.name || "All Catalog Products");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [newMinQty, setNewMinQty] = useState<number>(500);
  const [newMinSpendETB, setNewMinSpendETB] = useState<number>(100000);
  const [newMaxDiscountETB, setNewMaxDiscountETB] = useState<number>(50000);
  const [newUsageLimit, setNewUsageLimit] = useState<number>(50);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [newBannerHeadline, setNewBannerHeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(10);
  const [editDiscountAmount, setEditDiscountAmount] = useState<number>(0);
  const [editMinQty, setEditMinQty] = useState<number>(500);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editPromoCode, setEditPromoCode] = useState("");

  // Categories list derived from real products
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return cats.length > 0 ? cats : ["Agriculture & Commodity Crops", "Construction Materials", "Textiles & Garments", "Manufactured Goods"];
  }, [products]);

  // Financial & Performance Metrics
  const totalGeneratedRevenue = useMemo(() => {
    return promotions.reduce((acc, c) => acc + c.generatedRevenue, 0);
  }, [promotions]);

  const totalConversions = useMemo(() => {
    return promotions.reduce((acc, c) => acc + c.conversions, 0);
  }, [promotions]);

  const totalViews = useMemo(() => {
    return promotions.reduce((acc, c) => acc + c.views, 0);
  }, [promotions]);

  const totalDiscountsGiven = useMemo(() => {
    return promotions.reduce((acc, c) => {
      if (c.discountType === "fixed_amount" && c.discountAmountETB) {
        return acc + c.discountAmountETB * c.conversions;
      }
      return acc + (c.generatedRevenue * (c.discountPercentage / 100));
    }, 0);
  }, [promotions]);

  const activeCount = useMemo(() => {
    return promotions.filter((c) => c.status === "active").length;
  }, [promotions]);

  const scheduledCount = useMemo(() => {
    return promotions.filter((c) => c.status === "scheduled").length;
  }, [promotions]);

  const pausedCount = useMemo(() => {
    return promotions.filter((c) => c.status === "paused").length;
  }, [promotions]);

  const expiredCount = useMemo(() => {
    return promotions.filter((c) => c.status === "expired").length;
  }, [promotions]);

  const couponCampaigns = useMemo(() => {
    return promotions.filter((c) => c.promoCode && c.promoCode.trim().length > 0);
  }, [promotions]);

  // Overall conversion lift
  const overallConversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(2) : "0.00";

  // Filtering & Search
  const filteredCampaigns = useMemo(() => {
    return promotions.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.productName.toLowerCase().includes(q) ||
        (c.promoCode && c.promoCode.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        c.discountPercentage.toString().includes(q);

      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      const matchesScope = scopeFilter === "all" || c.scope === scopeFilter;

      return matchesSearch && matchesStatus && matchesType && matchesScope;
    });
  }, [promotions, searchQuery, statusFilter, typeFilter, scopeFilter]);

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize) || 1;
  const paginatedCampaigns = useMemo(() => {
    return filteredCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredCampaigns, currentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, id: string, label = "Code") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`${label} "${text}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Auto-generate promo code helper
  const handleGenerateCode = () => {
    const prefixes = ["BULK", "HARVEST", "MERCATO", "PROMO", "ETHIO", "DEAL"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setNewPromoCode(`${randomPrefix}${num}`);
  };

  // Create Campaign Submit
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }

    const resolvedProductName =
      newScope === "all_products"
        ? "All Catalog Products"
        : newScope === "specific_category"
        ? `All ${newCategory} Products`
        : newProductName;

    addPromotion({
      title: newTitle.trim(),
      type: newType,
      discountType: newDiscountType,
      productName: resolvedProductName,
      discountPercentage: newDiscountType === "percentage" ? Number(newDiscountPercent) : 0,
      discountAmountETB: newDiscountType === "fixed_amount" ? Number(newDiscountAmount) : undefined,
      promoCode: newPromoCode.trim() ? newPromoCode.trim().toUpperCase() : undefined,
      scope: newScope,
      category: newScope === "specific_category" ? newCategory : undefined,
      productIds: selectedProductIds,
      minOrderQuantity: Number(newMinQty),
      minOrderValueETB: Number(newMinSpendETB),
      maxDiscountETB: Number(newMaxDiscountETB),
      usageLimit: Number(newUsageLimit),
      startDate: newStartDate,
      endDate: newEndDate,
      status: "active",
      bannerHeadline: newBannerHeadline.trim() || undefined,
      description: newDescription.trim() || undefined,
    });

    setIsCreateModalOpen(false);

    // Reset fields
    setNewTitle("");
    setNewPromoCode("");
    setNewDiscountPercent(10);
    setNewDiscountAmount(2500);
    setNewMinQty(500);
    setNewBannerHeadline("");
    setNewDescription("");
  };

  // Open Edit Modal
  const handleOpenEditModal = (campaign: PromotionCampaign) => {
    setEditingCampaign(campaign);
    setEditTitle(campaign.title);
    setEditDiscountPercent(campaign.discountPercentage);
    setEditDiscountAmount(campaign.discountAmountETB || 0);
    setEditMinQty(campaign.minOrderQuantity);
    setEditStartDate(campaign.startDate);
    setEditEndDate(campaign.endDate);
    setEditPromoCode(campaign.promoCode || "");
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    updatePromotion(editingCampaign.id, {
      title: editTitle.trim(),
      discountPercentage: Number(editDiscountPercent),
      discountAmountETB: Number(editDiscountAmount),
      minOrderQuantity: Number(editMinQty),
      startDate: editStartDate,
      endDate: editEndDate,
      promoCode: editPromoCode.trim() ? editPromoCode.trim().toUpperCase() : undefined,
    });

    setIsEditModalOpen(false);
    setEditingCampaign(null);
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
      case "coupon_code":
        return {
          label: "Promo Coupon Code",
          icon: Ticket,
          colorLight: "bg-purple-50 text-purple-800 border-purple-200",
          colorDark: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          colorSystem: "bg-purple-500/20 text-purple-200 border-purple-400/30",
          accentColor: "#a855f7",
        };
      case "free_shipping":
        return {
          label: "Logistics Freight Subsidy",
          icon: Truck,
          colorLight: "bg-teal-50 text-teal-800 border-teal-200",
          colorDark: "bg-teal-500/20 text-teal-300 border-teal-500/30",
          colorSystem: "bg-teal-500/20 text-teal-200 border-teal-400/30",
          accentColor: "#14b8a6",
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
      default:
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
    if (isLight) return "bg-emerald-600 text-white shadow-xs font-bold";
    if (isSystem) return "bg-blue-600 text-white shadow-md font-bold";
    return "bg-white text-slate-950 shadow-md font-bold";
  };

  const getSubTabStyle = (isActive: boolean) => {
    if (!isActive) {
      if (isLight) return "text-slate-600 hover:text-slate-900 border-transparent";
      if (isSystem) return "text-blue-200/70 hover:text-white border-transparent";
      return "text-zinc-400 hover:text-white border-transparent";
    }
    if (isLight) return "border-emerald-600 text-emerald-700 font-bold bg-emerald-50/50";
    if (isSystem) return "border-blue-400 text-white font-bold bg-blue-600/20";
    return "border-emerald-400 text-emerald-300 font-bold bg-emerald-500/10";
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

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Actions */}
      <PageHeader
        title="Promotions & Wholesale Rebate Engine"
        subtitle="Create volume tier rebates, harvest flash sales, buyer coupon codes, and logistics subsidies across MercatoX"
        breadcrumbs={[
          { label: "Dashboard", onClick: () => setActiveTab("dashboard") },
          { label: "Promotions & Rebates" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setNewType("coupon_code");
                setNewDiscountType("percentage");
                setNewTitle("Exclusive Wholesale Coupon Code");
                handleGenerateCode();
                setIsCreateModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100"
                  : isSystem
                  ? "border-purple-400/40 bg-purple-900/30 text-purple-200 hover:bg-purple-900/50"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
              }`}
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Create Coupon Code</span>
            </button>

            <button
              onClick={() => {
                setNewType("bulk_volume_discount");
                setNewDiscountType("percentage");
                setNewTitle("");
                setIsCreateModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98 ${
                isLight
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10"
                  : isSystem
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40"
                  : "bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-950/30"
              }`}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Launch Promotion Campaign</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Sub-Navigation Tabs for Dedicated Promotion Modules */}
      <div
        className={`flex items-center gap-2 border-b overflow-x-auto pb-0 ${
          isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
        }`}
      >
        <button
          onClick={() => setActiveSubTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 font-medium transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${getSubTabStyle(
            activeSubTab === "campaigns"
          )}`}
        >
          <Layers className="h-4 w-4" />
          <span>All Campaigns & Rebates</span>
          <span className="rounded-full bg-current/10 px-1.5 py-0.2 text-[10px] font-bold">
            {promotions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("coupons")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 font-medium transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${getSubTabStyle(
            activeSubTab === "coupons"
          )}`}
        >
          <Ticket className="h-4 w-4" />
          <span>Coupons & Promo Codes</span>
          <span className="rounded-full bg-purple-500/20 text-purple-400 px-1.5 py-0.2 text-[10px] font-bold">
            {couponCampaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 font-medium transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${getSubTabStyle(
            activeSubTab === "analytics"
          )}`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Promotion ROI & Conversion</span>
        </button>

        <button
          onClick={() => setActiveSubTab("preview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 font-medium transition-all rounded-t-xl cursor-pointer whitespace-nowrap ${getSubTabStyle(
            activeSubTab === "preview"
          )}`}
        >
          <Store className="h-4 w-4" />
          <span>Storefront Banner Preview</span>
        </button>
      </div>

      {/* 3. Hero Glassmorphic Promotions Command Center */}
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
                Live Promotion Engine
              </span>
              <span className="text-xs text-white/70 font-mono">
                {activeCount} Active • {scheduledCount} Scheduled • {pausedCount} Paused
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
                Wholesale volume discounts, coupon codes, and harvest flash sales incentivize commercial buyers to place larger bulk purchase orders on MercatoX.
              </p>
            </div>

            {/* Quick Actions inside Hero */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => {
                  setNewType("bulk_volume_discount");
                  setIsCreateModalOpen(true);
                }}
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
                  setActiveSubTab("campaigns");
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

            {/* Tile 3: Total Discounts Given */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Buyer Savings
                </span>
                <Percent className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">
                ETB {(totalDiscountsGiven / 1000).toFixed(0)}k
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span>Total discounts awarded</span>
              </div>
            </div>

            {/* Tile 4: Active Campaigns */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs transition-all hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
                  Live Deals
                </span>
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-bold font-mono text-white">{activeCount} Promos</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-white/80">
                <span className="text-white/60 text-[10px]">{couponCampaigns.length} active coupons</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: CAMPAIGNS & REBATES */}
      {activeSubTab === "campaigns" && (
        <>
          {/* Recommended Wholesale Templates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-800" : isSystem ? "text-blue-100" : "text-zinc-200"
                }`}
              >
                <Sparkles className={`h-4 w-4 ${isSystem ? "text-blue-400" : "text-emerald-500"}`} />
                <span>1-Click Wholesale Campaign Templates</span>
              </h3>
              <span
                className={`text-[11px] ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                Pre-configured promotion archetypes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  type: "bulk_volume_discount" as const,
                  title: "Tiered Volume Rebate",
                  desc: "Offer 10–15% off for orders over 5,000 units to attract institutional buyers & food mills.",
                  icon: Layers,
                  presetDiscount: 12.5,
                  presetMin: 5000,
                  code: "BULK12",
                },
                {
                  type: "seasonal_flash" as const,
                  title: "Harvest Surplus Flash",
                  desc: "Clear freshly harvested grain or produce before storage expiry with time-limited rebates.",
                  icon: Flame,
                  presetDiscount: 15,
                  presetMin: 2500,
                  code: "HARVEST15",
                },
                {
                  type: "coupon_code" as const,
                  title: "New Buyer Coupon Code",
                  desc: "Offer ETB 5,000 flat discount voucher for first-time verified corporate purchases.",
                  icon: Ticket,
                  presetDiscount: 0,
                  presetAmount: 5000,
                  presetMin: 100,
                  code: "WELCOME5K",
                },
                {
                  type: "free_shipping" as const,
                  title: "Mojo Dry Port Freight Subsidy",
                  desc: "Cover 100% inland transport freight to Mojo dry port for bulk export buyers.",
                  icon: Truck,
                  presetDiscount: 100,
                  presetMin: 1000,
                  code: "FREEMOJO",
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
                          {template.presetAmount ? `ETB ${template.presetAmount} OFF` : `${template.presetDiscount}% OFF`}
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
                        setNewDiscountAmount(template.presetAmount || 0);
                        setNewMinQty(template.presetMin);
                        setNewPromoCode(template.code);
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

          {/* Toolbar: Search, Status Tabs, Type Selector, View Switcher */}
          <div className="space-y-3 pt-2">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 ${
                isLight ? "border-slate-200" : isSystem ? "border-blue-500/20" : "border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "all", label: "All Campaigns", count: promotions.length },
                  { id: "active", label: "Active Live", count: activeCount },
                  { id: "scheduled", label: "Scheduled", count: scheduledCount },
                  { id: "paused", label: "Paused", count: pausedCount },
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
                  placeholder="Search campaigns by title, coupon code, product name, discount %..."
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
                  <option value="coupon_code">Coupon / Promo Code</option>
                  <option value="free_shipping">Freight / Logistics Subsidy</option>
                  <option value="featured_catalog">Featured Spotlight</option>
                  <option value="category_special">Category Special</option>
                </select>

                {/* Scope Selector */}
                <select
                  value={scopeFilter}
                  onChange={(e) => {
                    setScopeFilter(e.target.value);
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
                  <option value="all">All Scopes</option>
                  <option value="all_products">Entire Catalog</option>
                  <option value="specific_category">Specific Category</option>
                  <option value="specific_products">Specific Products</option>
                </select>

                {(searchQuery || statusFilter !== "all" || typeFilter !== "all" || scopeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setScopeFilter("all");
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

          {/* Campaigns Presentation: Cards Grid OR Data Table */}
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
                  setScopeFilter("all");
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
                      {/* Top indicator bar */}
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
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`text-xs font-medium truncate ${
                                isLight ? "text-slate-600" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                              }`}
                            >
                              {p.productName}
                            </span>
                            {p.category && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-current/10 opacity-70">
                                {p.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Coupon Code Banner if applicable */}
                        {p.promoCode && (
                          <div
                            className={`flex items-center justify-between rounded-xl border border-dashed px-3 py-1.5 text-xs ${
                              isLight
                                ? "border-purple-300 bg-purple-50 text-purple-900"
                                : isSystem
                                ? "border-purple-400/40 bg-purple-900/30 text-purple-200"
                                : "border-purple-500/30 bg-purple-500/15 text-purple-300"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-mono font-bold">
                              <Ticket className="h-3.5 w-3.5 text-purple-500" />
                              <span>Code: {p.promoCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(p.promoCode!, p.id, "Promo Code")}
                              className="inline-flex items-center gap-1 text-[10px] font-bold hover:underline cursor-pointer"
                            >
                              {copiedId === p.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}

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
                            <span className="opacity-70">Discount / Rebate:</span>
                            <span className="font-black font-mono text-sm" style={{ color: typeCfg.accentColor }}>
                              {p.discountType === "fixed_amount" && p.discountAmountETB
                                ? `ETB ${p.discountAmountETB.toLocaleString()} OFF`
                                : p.discountType === "free_shipping"
                                ? "100% Free Freight"
                                : `${p.discountPercentage}% OFF`}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="opacity-70">Min Requirement:</span>
                            <span className="font-bold font-mono">
                              {p.minOrderQuantity > 0 ? `${p.minOrderQuantity.toLocaleString()} Units` : "No MOQ"}
                              {p.minOrderValueETB ? ` (≥ ETB ${(p.minOrderValueETB / 1000).toFixed(0)}k)` : ""}
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
                            <span className="text-[10px] opacity-60">Impressions</span>
                            <p className="font-bold font-mono mt-0.5">{p.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[10px] opacity-60">Promo Orders</span>
                            <p className="font-bold font-mono mt-0.5 text-emerald-500">{p.conversions}</p>
                          </div>
                          <div>
                            <span className="text-[10px] opacity-60">Sales Lift</span>
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

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePromotionStatus(p.id)}
                            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                              isLight
                                ? "hover:bg-slate-100 text-slate-600"
                                : isSystem
                                ? "hover:bg-blue-900/30 text-blue-200"
                                : "hover:bg-white/10 text-zinc-300"
                            }`}
                            title={isLive ? "Pause Promotion" : "Activate Promotion"}
                          >
                            {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-500" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                              isLight
                                ? "hover:bg-slate-100 text-slate-600"
                                : isSystem
                                ? "hover:bg-blue-900/30 text-blue-200"
                                : "hover:bg-white/10 text-zinc-300"
                            }`}
                            title="Edit Campaign"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => duplicatePromotion(p.id)}
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
                            onClick={() => {
                              if (confirm(`Remove promotion "${p.title}"?`)) {
                                deletePromotion(p.id);
                              }
                            }}
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
                      <th className="py-3 px-3">Target Scope</th>
                      <th className="py-3 px-3">Coupon Code</th>
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

                          <td className="py-3.5 px-3 font-mono">
                            {p.promoCode ? (
                              <button
                                onClick={() => handleCopy(p.promoCode!, p.id, "Code")}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 font-bold text-[11px] hover:bg-purple-500/25 cursor-pointer"
                              >
                                <span>{p.promoCode}</span>
                                <Copy className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-zinc-500 text-[10px]">Auto-Applied</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-sm">
                            {p.discountType === "fixed_amount" && p.discountAmountETB
                              ? `ETB ${p.discountAmountETB.toLocaleString()}`
                              : p.discountType === "free_shipping"
                              ? "Free Freight"
                              : `${p.discountPercentage}%`}
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
                                onClick={() => handleOpenEditModal(p)}
                                className="rounded-lg p-1.5 hover:bg-current/10 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => togglePromotionStatus(p.id)}
                                className="rounded-lg p-1.5 hover:bg-current/10 transition-colors cursor-pointer"
                                title={isLive ? "Pause" : "Activate"}
                              >
                                {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-500" />}
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove promotion "${p.title}"?`)) {
                                    deletePromotion(p.id);
                                  }
                                }}
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
        </>
      )}

      {/* SUB-VIEW 2: DEDICATED COUPONS & PROMO CODES */}
      {activeSubTab === "coupons" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3
                className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <Ticket className="h-4 w-4 text-purple-500" />
                <span>Active Wholesale Voucher & Coupon Codes</span>
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  isLight ? "text-slate-500" : isSystem ? "text-blue-200/70" : "text-zinc-400"
                }`}
              >
                Share these promotional discount vouchers directly with institutional buyers, retail chains, or in quotation counter-offers.
              </p>
            </div>

            <button
              onClick={() => {
                setNewType("coupon_code");
                handleGenerateCode();
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Promo Code</span>
            </button>
          </div>

          {couponCampaigns.length === 0 ? (
            <div
              className={`rounded-2xl border border-dashed p-10 text-center flex flex-col items-center justify-center ${
                isLight ? "border-slate-300 bg-slate-50" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <Ticket className="w-10 h-10 text-purple-400 mb-3 opacity-60" />
              <h4 className="font-bold text-sm">No Active Coupon Codes</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Create coupon codes with flat or percentage discounts to share with buyers on MercatoX.
              </p>
              <button
                onClick={() => {
                  setNewType("coupon_code");
                  handleGenerateCode();
                  setIsCreateModalOpen(true);
                }}
                className="rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-bold"
              >
                Create First Coupon Code
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {couponCampaigns.map((coupon) => {
                const isLive = coupon.status === "active";
                const usageLimit = coupon.usageLimit || 100;
                const usageCount = coupon.usageCount || coupon.conversions || 0;
                const pctUsed = Math.min(100, Math.round((usageCount / usageLimit) * 100));

                return (
                  <div
                    key={coupon.id}
                    className={`rounded-2xl border p-5 space-y-3.5 shadow-xs transition-all relative overflow-hidden ${
                      isLight
                        ? "border-slate-200 bg-white"
                        : isSystem
                        ? "border-blue-500/25 bg-[#0f1b3b]"
                        : "border-white/10 bg-[#121620]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                          Wholesale Voucher
                        </span>
                        <h4 className="font-bold text-xs">{coupon.title}</h4>
                      </div>
                      <StatusBadge status={coupon.status} size="sm" />
                    </div>

                    {/* Big Copyable Code Box */}
                    <div
                      className={`flex items-center justify-between rounded-xl border-2 border-dashed p-3 ${
                        isLight
                          ? "border-purple-300 bg-purple-50/70"
                          : "border-purple-500/40 bg-purple-950/20"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] opacity-70 block">Buyer Voucher Code</span>
                        <span className="font-mono font-black text-lg tracking-wider text-purple-400">
                          {coupon.promoCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(coupon.promoCode!, coupon.id, "Voucher")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        {copiedId === coupon.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === coupon.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Discount & Requirements */}
                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-current/10 py-2.5">
                      <div>
                        <span className="text-[10px] opacity-60">Discount Value</span>
                        <p className="font-bold font-mono text-emerald-500">
                          {coupon.discountType === "fixed_amount" && coupon.discountAmountETB
                            ? `ETB ${coupon.discountAmountETB.toLocaleString()}`
                            : `${coupon.discountPercentage}% OFF`}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-60">Min Order Spend</span>
                        <p className="font-bold font-mono">
                          ETB {(coupon.minOrderValueETB || 100000).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="opacity-70">Redemption Quota:</span>
                        <span className="font-bold font-mono">
                          {usageCount} / {usageLimit} ({pctUsed}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-current/10 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${pctUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] font-mono opacity-60">
                        Expires: {coupon.endDate}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePromotionStatus(coupon.id)}
                          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                          title={isLive ? "Pause" : "Activate"}
                        >
                          {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove coupon "${coupon.promoCode}"?`)) {
                              deletePromotion(coupon.id);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-400 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: PROMOTION ROI & CONVERSION INTELLIGENCE */}
      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`rounded-2xl border p-5 shadow-xs space-y-2 ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#121620]"
              }`}
            >
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-xs font-bold uppercase tracking-wider">Promotional Sales Lift</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-mono">
                ETB {(totalGeneratedRevenue / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-slate-500">
                Direct revenue from buyers applying active volume rebates and voucher codes.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 shadow-xs space-y-2 ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#121620]"
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-bold uppercase tracking-wider">Discount Budget Spent</span>
                <PercentCircle className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-mono text-emerald-400">
                ETB {(totalDiscountsGiven / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-slate-500">
                Total margin sacrifice yielded {(totalGeneratedRevenue / Math.max(1, totalDiscountsGiven)).toFixed(1)}x gross revenue ROI.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 shadow-xs space-y-2 ${
                isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#121620]"
              }`}
            >
              <div className="flex items-center justify-between text-purple-400">
                <span className="text-xs font-bold uppercase tracking-wider">Conversion Efficiency</span>
                <Target className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-mono text-purple-400">
                {overallConversionRate}%
              </p>
              <p className="text-xs text-slate-500">
                {totalConversions} successful wholesale purchases from {totalViews.toLocaleString()} buyer views.
              </p>
            </div>
          </div>

          {/* Funnel Breakdown */}
          <div
            className={`rounded-2xl border p-6 shadow-xs space-y-4 ${
              isLight ? "border-slate-200 bg-white" : isSystem ? "border-blue-500/25 bg-[#0f1b3b]" : "border-white/10 bg-[#121620]"
            }`}
          >
            <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>Buyer Promotional Journey Funnel</span>
            </h4>

            <div className="space-y-3 pt-2">
              {[
                { label: "1. Promotional Catalog Impressions", count: totalViews, pct: 100, color: "bg-blue-500" },
                { label: "2. Product Detail Views & RFQ Inquiries", count: Math.round(totalViews * 0.35), pct: 35, color: "bg-indigo-500" },
                { label: "3. Added to Wholesale Cart / Counter-Offer", count: Math.round(totalViews * 0.12), pct: 12, color: "bg-purple-500" },
                { label: "4. Escrow Deposit & Verified Checkout", count: totalConversions, pct: Math.max(2, Math.round((totalConversions / Math.max(1, totalViews)) * 100)), color: "bg-emerald-500" },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{step.label}</span>
                    <span className="font-mono font-bold">{step.count.toLocaleString()} buyers ({step.pct}%)</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-current/10 overflow-hidden">
                    <div
                      className={`h-full ${step.color} rounded-full transition-all duration-700`}
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: STOREFRONT BANNER & BADGE PREVIEW SIMULATOR */}
      {activeSubTab === "preview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-500" />
                <span>Buyer Marketplace Badge Simulator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This is exactly how your active promotions and volume discount ribbons appear to commercial buyers across the MercatoX marketplace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
              {/* Simulator Card 1: Product Card with Volume Discount Ribbon */}
              <div
                className={`rounded-2xl border p-4 space-y-3 relative overflow-hidden shadow-sm ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111622] border-white/10"
                }`}
              >
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[10px] font-black uppercase shadow-xs">
                    <Flame className="w-3 h-3" />
                    12.5% OFF
                  </span>
                </div>

                <div className="h-36 w-full rounded-xl bg-gradient-to-br from-amber-700/20 to-emerald-900/30 flex items-center justify-center text-4xl">
                  ☕
                </div>

                <div>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Agriculture • Coffee</span>
                  <h4 className="font-bold text-xs mt-0.5">Yirgacheffe Grade 1 Speciality Washed</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-mono font-black text-sm text-emerald-500">ETB 1,050 / KG</span>
                    <span className="font-mono text-xs line-through opacity-50">ETB 1,200</span>
                  </div>
                  <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-1.5 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 shrink-0" />
                    <span>Tier Rebate: Min 5,000 KG order</span>
                  </div>
                </div>
              </div>

              {/* Simulator Card 2: Coupon Voucher Input at Checkout */}
              <div
                className={`rounded-2xl border p-4 space-y-3 relative shadow-sm ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111622] border-white/10"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Buyer Checkout Preview
                </span>
                <h4 className="font-bold text-xs">Voucher Code Application</h4>

                <div className="rounded-xl border border-purple-400/30 bg-purple-950/10 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-400 flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" />
                      WELCOME5K
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">APPLIED ✓</span>
                  </div>
                  <div className="flex justify-between text-[11px] opacity-80 pt-1 border-t border-current/10">
                    <span>Discount Deducted:</span>
                    <span className="font-mono font-bold text-rose-400">- ETB 5,000.00</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Buyers enter your coupon in their checkout drawer or RFQ proposal for instant invoice credit.
                </p>
              </div>

              {/* Simulator Card 3: Free Shipping / Freight Badge */}
              <div
                className={`rounded-2xl border p-4 space-y-3 relative shadow-sm ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111622] border-white/10"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  Logistics Tag
                </span>
                <h4 className="font-bold text-xs">Export Logistics Subsidy</h4>

                <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <Truck className="w-4 h-4" />
                    <span>Free Mojo Port Delivery</span>
                  </div>
                  <p className="text-[10px] text-teal-200/80">
                    Orders over 750,000 ETB qualify for 100% complimentary inland carriage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Launch Campaign Modal with Full Archetype Selector */}
      <ModalDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch Wholesale Promotion Campaign"
        subtitle="Create volume tier rebates, harvest flash sales, buyer coupon codes, and logistics subsidies"
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: "bulk_volume_discount" as const, label: "Volume Rebate", icon: Layers },
                { type: "seasonal_flash" as const, label: "Harvest Flash", icon: Flame },
                { type: "coupon_code" as const, label: "Promo Coupon", icon: Ticket },
                { type: "free_shipping" as const, label: "Free Freight", icon: Truck },
                { type: "featured_catalog" as const, label: "Featured Top", icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = newType === item.type;

                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => {
                      setNewType(item.type);
                      if (item.type === "coupon_code") {
                        if (!newPromoCode) handleGenerateCode();
                      }
                      if (item.type === "free_shipping") {
                        setNewDiscountType("free_shipping");
                        setNewDiscountPercent(100);
                      }
                    }}
                    className={`rounded-xl border p-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
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
                    <span className="font-bold text-[10px] truncate">{item.label}</span>
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
              placeholder="e.g. Harvest Opening Special: Grade 1 Washed Coffee 12.5% Bulk Rebate"
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

          {/* Scope Selector: Entire Catalog vs Category vs Specific Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">
                Target Product Scope <span className="text-rose-500">*</span>
              </label>
              <select
                value={newScope}
                onChange={(e) => setNewScope(e.target.value as any)}
                className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden cursor-pointer ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
              >
                <option value="all_products">Entire Catalog (All Products)</option>
                <option value="specific_category">Specific Product Category</option>
                <option value="specific_products">Selected Specific Product</option>
              </select>
            </div>

            {newScope === "specific_category" ? (
              <div>
                <label className="block font-semibold mb-1">Select Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`w-full rounded-xl border p-2.5 text-xs focus:outline-hidden cursor-pointer ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                      : isSystem
                      ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                      : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                  }`}
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            ) : newScope === "specific_products" ? (
              <div>
                <label className="block font-semibold mb-1">Select Product</label>
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
            ) : (
              <div>
                <label className="block font-semibold mb-1">Catalog Reach</label>
                <div
                  className={`rounded-xl border p-2.5 text-xs ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-zinc-400"
                  }`}
                >
                  Applies to all {products.length} live catalog listings
                </div>
              </div>
            )}
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Discount Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewDiscountType("percentage")}
                  className={`flex-1 rounded-xl p-2 text-xs font-bold border transition-all cursor-pointer ${
                    newDiscountType === "percentage"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-current/10 opacity-70"
                  }`}
                >
                  Percentage (% Off)
                </button>
                <button
                  type="button"
                  onClick={() => setNewDiscountType("fixed_amount")}
                  className={`flex-1 rounded-xl p-2 text-xs font-bold border transition-all cursor-pointer ${
                    newDiscountType === "fixed_amount"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-current/10 opacity-70"
                  }`}
                >
                  Flat Amount (ETB)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">
                  {newDiscountType === "percentage" ? "Discount Percentage" : "Flat ETB Off"}
                </label>
                <span className="font-bold font-mono text-emerald-500">
                  {newDiscountType === "percentage" ? `${newDiscountPercent}%` : `ETB ${newDiscountAmount.toLocaleString()}`}
                </span>
              </div>
              {newDiscountType === "percentage" ? (
                <input
                  type="number"
                  min={1}
                  max={90}
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
              ) : (
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={newDiscountAmount}
                  onChange={(e) => setNewDiscountAmount(Number(e.target.value))}
                  className={`w-full rounded-xl border p-2.5 text-xs font-mono font-bold focus:outline-hidden ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                      : isSystem
                      ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                      : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                  }`}
                  required
                />
              )}
            </div>
          </div>

          {/* Promo Code & Min Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">Promo / Voucher Code (Optional)</label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[10px] text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  Auto-Generate
                </button>
              </div>
              <input
                type="text"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. HARVEST15, WELCOME5K"
                className={`w-full rounded-xl border p-2.5 text-xs font-mono font-bold uppercase focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-purple-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-purple-500"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold">Minimum Order Quantity (MOQ)</label>
                <span className="font-mono opacity-70">Units</span>
              </div>
              <input
                type="number"
                min={0}
                value={newMinQty}
                onChange={(e) => setNewMinQty(Number(e.target.value))}
                className={`w-full rounded-xl border p-2.5 text-xs font-mono font-bold focus:outline-hidden ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-900 focus:border-emerald-600"
                    : isSystem
                    ? "border-blue-500/25 bg-[#0c1630] text-white focus:border-blue-400"
                    : "border-white/10 bg-[#12161f] text-white focus:border-emerald-500"
                }`}
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
                ETB {(Math.max(1, newMinQty) * 1250 * (1 - newDiscountPercent / 100)).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] opacity-80">
              <span>Buyer Savings per Order:</span>
              <span className="font-mono font-bold text-emerald-500">
                {newDiscountType === "fixed_amount"
                  ? `ETB ${newDiscountAmount.toLocaleString()}`
                  : `ETB ${(Math.max(1, newMinQty) * 1250 * (newDiscountPercent / 100)).toLocaleString()} (${newDiscountPercent}%)`}
              </span>
            </div>
            <p className="text-[10px] opacity-60 pt-1">
              Campaign will automatically display promotional badges across category listings and RFQ search.
            </p>
          </div>
        </form>
      </ModalDialog>

      {/* 5. Edit Campaign Modal */}
      {isEditModalOpen && editingCampaign && (
        <ModalDialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Promotion Campaign"
          subtitle={`Update rules and settings for ${editingCampaign.title}`}
          maxWidth="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Campaign Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border p-2.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Discount %</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={editDiscountPercent}
                  onChange={(e) => setEditDiscountPercent(Number(e.target.value))}
                  className="w-full rounded-xl border p-2.5 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Min Order Qty (Units)</label>
                <input
                  type="number"
                  min={0}
                  value={editMinQty}
                  onChange={(e) => setEditMinQty(Number(e.target.value))}
                  className="w-full rounded-xl border p-2.5 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Coupon Code (Optional)</label>
              <input
                type="text"
                value={editPromoCode}
                onChange={(e) => setEditPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g. HARVEST15"
                className="w-full rounded-xl border p-2.5 text-xs font-mono font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full rounded-xl border p-2.5 text-xs font-mono"
                />
              </div>
            </div>
          </form>
        </ModalDialog>
      )}

      {/* 6. Detailed Campaign Analytics Modal */}
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
                Active live promotion with verified escrow clearing.
              </p>
            </div>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}
