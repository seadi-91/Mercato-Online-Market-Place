"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  X,
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Coffee,
  Briefcase,
  Layers,
  LayoutGrid,
  List,
  Eye,
  ShoppingCart,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShoppingBag,
  Boxes,
  ShieldCheck,
  Truck,
  TrendingUp,
  Package,
  FileText,
  BadgePercent,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { ProductCard } from "@/components/products/product-card";
import { HorizontalProductCard } from "@/components/products/horizontal-product-card";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import { Product, CategoryItem } from "@/constants/mock-data";
import { fetchProducts, fetchCategories } from "@/lib/api/catalog";
import { useCartStore } from "@/store";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import {
  isWholesaleProduct,
  isRetailProduct,
  TradeType,
  getProductTradeInfo,
} from "@/lib/product-classification";

interface MarketplaceClientProps {
  initialProducts?: Product[];
  initialCategories?: CategoryItem[];
}

export function MarketplaceClient({
  initialProducts = [],
  initialCategories = [],
}: MarketplaceClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { theme, resolvedTheme } = useThemeStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme : "system";
  const isLight = activeTheme === "light";
  const isDark = activeTheme === "dark";
  const isSystem = activeTheme === "system";

  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "ALL";
  const initialZone = searchParams.get("zone") || "ALL";
  const rawType = (searchParams.get("type") || "").toUpperCase();
  const initialType: TradeType =
    rawType === "RETAIL" ? "RETAIL" : rawType === "WHOLESALE" ? "WHOLESALE" : "ALL";

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(initialProducts.length === 0);

  // Filters State
  const [tradeType, setTradeType] = useState<TradeType>(initialType);
  const [moqFilter, setMoqFilter] = useState<"ALL" | "1" | "2-9" | "10+">("ALL");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedZone, setSelectedZone] = useState<string>(initialZone);
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [escrowOnly, setEscrowOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "normal">("grid");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load catalog if initialProducts was empty
  useEffect(() => {
    if (initialProducts.length > 0) return;
    let isMounted = true;
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [prodResult, catResult] = await Promise.all([
          fetchProducts({ limit: 50, sortBy: "createdAt", sortOrder: "DESC" }),
          fetchCategories(),
        ]);
        if (isMounted) {
          setProducts(prodResult.products);
          setCategories(catResult);
        }
      } catch (err) {
        console.error("Failed to load marketplace catalog:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

  // Sync URL search params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) setSelectedCategory(cat);
    const z = searchParams.get("zone");
    if (z && z !== selectedZone) setSelectedZone(z);
    const q = searchParams.get("q");
    if (q && q !== searchQuery) setSearchQuery(q);
    const t = searchParams.get("type");
    if (t) {
      const up = t.toUpperCase();
      if ((up === "RETAIL" || up === "WHOLESALE" || up === "ALL") && up !== tradeType) {
        setTradeType(up as TradeType);
      }
    }
  }, [searchParams]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "computers-electronics":
        return <Laptop className="h-3.5 w-3.5" />;
      case "smartphones-mobile":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "fashion-apparel-shoes":
        return <Shirt className="h-3.5 w-3.5" />;
      case "home-kitchen-appliances":
        return <Home className="h-3.5 w-3.5" />;
      case "grains-cereals-groceries":
      case "grains-cereals-teff":
      case "agricultural-commodities":
        return <Coffee className="h-3.5 w-3.5" />;
      case "cosmetics-skincare":
        return <Sparkles className="h-3.5 w-3.5" />;
      default:
        return <Layers className="h-3.5 w-3.5" />;
    }
  };

  // Pre-calculate trade counts
  const counts = useMemo(() => {
    let retail = 0;
    let wholesale = 0;
    for (const p of products) {
      if (isRetailProduct(p)) retail++;
      if (isWholesaleProduct(p)) wholesale++;
    }
    return {
      total: products.length,
      retail,
      wholesale,
    };
  }, [products]);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Trade Sector Filter
    if (tradeType === "RETAIL") {
      result = result.filter(isRetailProduct);
    } else if (tradeType === "WHOLESALE") {
      result = result.filter(isWholesaleProduct);
    }

    // 2. MOQ Filter
    if (moqFilter !== "ALL") {
      if (moqFilter === "1") {
        result = result.filter((p) => (p.minOrderQuantity || p.moq || 1) === 1);
      } else if (moqFilter === "2-9") {
        result = result.filter((p) => {
          const m = p.minOrderQuantity || p.moq || 1;
          return m >= 2 && m <= 9;
        });
      } else if (moqFilter === "10+") {
        result = result.filter((p) => (p.minOrderQuantity || p.moq || 1) >= 10);
      }
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shopName.toLowerCase().includes(q) ||
          p.marketZone.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 4. Category
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    // 5. Price range
    if (priceRange === "under-5k") {
      result = result.filter((p) => p.price < 5000);
    } else if (priceRange === "5k-20k") {
      result = result.filter((p) => p.price >= 5000 && p.price <= 20000);
    } else if (priceRange === "20k-60k") {
      result = result.filter((p) => p.price > 20000 && p.price <= 60000);
    } else if (priceRange === "over-60k") {
      result = result.filter((p) => p.price > 60000);
    }

    // 6. Availability and Ratings
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (escrowOnly) {
      result = result.filter((p) => p.isVerifiedSeller || p.badge === "Escrow Verified");
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // 7. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pA = tradeType === "WHOLESALE" && a.wholesalePrice ? a.wholesalePrice : a.price;
        const pB = tradeType === "WHOLESALE" && b.wholesalePrice ? b.wholesalePrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pA = tradeType === "WHOLESALE" && a.wholesalePrice ? a.wholesalePrice : a.price;
        const pB = tradeType === "WHOLESALE" && b.wholesalePrice ? b.wholesalePrice : b.price;
        return pB - pA;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    tradeType,
    moqFilter,
    searchQuery,
    selectedCategory,
    priceRange,
    inStockOnly,
    escrowOnly,
    minRating,
    sortBy,
  ]);

  const clearFilters = () => {
    setTradeType("ALL");
    setMoqFilter("ALL");
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedZone("ALL");
    setPriceRange("ALL");
    setInStockOnly(false);
    setEscrowOnly(false);
    setMinRating(0);
    setSortBy("featured");
  };

  const activeFilterCount =
    (tradeType !== "ALL" ? 1 : 0) +
    (moqFilter !== "ALL" ? 1 : 0) +
    (selectedCategory !== "ALL" ? 1 : 0) +
    (priceRange !== "ALL" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (escrowOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const getCategoryCount = (slug: string) => {
    let pool = products;
    if (tradeType === "RETAIL") pool = pool.filter(isRetailProduct);
    if (tradeType === "WHOLESALE") pool = pool.filter(isWholesaleProduct);
    if (slug === "ALL") return pool.length;
    return pool.filter((p) => p.categorySlug === slug).length;
  };

  // Theme-aware container & border classes
  const themePageBg = isLight
    ? "bg-white text-slate-900"
    : isDark
    ? "bg-[#09090b] text-white"
    : "bg-[#070d1e] text-slate-100";

  const themeBorder = isLight
    ? "border-slate-200"
    : isDark
    ? "border-white/10"
    : "border-blue-500/20";

  const themeSurfaceBg = isLight
    ? "bg-slate-50 border-slate-200 shadow-xs"
    : isDark
    ? "bg-[#121215] border-white/10"
    : "bg-[#0c1630]/90 border-blue-500/20";

  const themeCardBg = isLight
    ? "bg-white border-slate-200 shadow-xs hover:border-slate-300"
    : isDark
    ? "bg-[#141418] border-white/10 hover:border-white/20"
    : "bg-[#0f1b3b]/90 border-blue-500/20 hover:border-blue-500/40";

  const themeInputBg = isLight
    ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-indigo-600/20"
    : isDark
    ? "bg-[#121215] border-white/10 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-indigo-500/20"
    : "bg-[#0c1630] border-blue-500/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${themePageBg}`}>
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 pb-24 sm:pb-12">
        {/* Marketplace Header Banner */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${themeBorder}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-600/10 border border-indigo-600/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-500 dark:text-indigo-400">
                Live Commercial Catalog
              </span>
              <span className={`text-xs ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                {counts.total} verified products
              </span>
            </div>
            <h1 className={`mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              Ethiopian Protected Marketplace
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Wholesale & Retail Commercial Hub — Authentic Direct Supply with CBE & Telebirr Escrow
            </p>
          </div>

          {/* Quick Search in Banner */}
          <div className="relative w-full sm:w-80">
            <Search className={`absolute left-3.5 top-2.5 h-4 w-4 pointer-events-none ${isLight ? "text-slate-400" : "text-zinc-400"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, bulk cargo..."
              className={`w-full rounded-xl border pl-10 pr-9 py-2 text-xs outline-none transition-all ${themeInputBg}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute right-3 top-2.5 hover:opacity-80 cursor-pointer ${isLight ? "text-slate-400" : "text-zinc-400"}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 🌟 ULTRA-MODERN 3-MODE TRADE SECTOR SWITCHER (LIGHT, DARK & SYSTEM COMPATIBLE) 🌟 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. All Products Card */}
          <button
            type="button"
            onClick={() => setTradeType("ALL")}
            className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              tradeType === "ALL"
                ? isLight
                  ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-500 shadow-md ring-1 ring-indigo-500/20 text-slate-900"
                  : isDark
                  ? "bg-gradient-to-br from-indigo-950/70 via-[#12121e] to-[#09090b] border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/30 text-white"
                  : "bg-gradient-to-br from-indigo-950/80 via-[#0e1738] to-[#070d1e] border-indigo-400/60 shadow-lg ring-1 ring-indigo-400/30 text-white"
                : themeCardBg
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    tradeType === "ALL"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isLight
                      ? "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      : "bg-white/5 text-zinc-400 group-hover:text-white"
                  }`}
                >
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                    <span>All Products</span>
                    <span className={`text-[11px] font-normal ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      (Full Catalog)
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Complete marketplace inventory across retail & bulk
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  tradeType === "ALL"
                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30"
                    : isLight
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {counts.total}
              </span>
            </div>
          </button>

          {/* 2. Retail Direct Card */}
          <button
            type="button"
            onClick={() => setTradeType("RETAIL")}
            className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              tradeType === "RETAIL"
                ? isLight
                  ? "bg-gradient-to-br from-cyan-50 to-white border-cyan-500 shadow-md ring-1 ring-cyan-500/20 text-slate-900"
                  : isDark
                  ? "bg-gradient-to-br from-cyan-950/70 via-[#0a151f] to-[#09090b] border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/30 text-white"
                  : "bg-gradient-to-br from-cyan-950/80 via-[#092238] to-[#070d1e] border-cyan-400/60 shadow-lg ring-1 ring-cyan-400/30 text-white"
                : themeCardBg
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    tradeType === "RETAIL"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : isLight
                      ? "bg-slate-100 text-slate-600 group-hover:text-cyan-600"
                      : "bg-white/5 text-zinc-400 group-hover:text-cyan-400"
                  }`}
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span className="text-cyan-600 dark:text-cyan-400">Retail Direct</span>
                    <span className={`text-[11px] font-normal ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      (B2C Single Units)
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    1 Unit Minimum Order • Direct doorstep delivery
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  tradeType === "RETAIL"
                    ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-200 border border-cyan-500/30"
                    : isLight
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {counts.retail}
              </span>
            </div>
          </button>

          {/* 3. Wholesale Bulk Card */}
          <button
            type="button"
            onClick={() => setTradeType("WHOLESALE")}
            className={`group relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
              tradeType === "WHOLESALE"
                ? isLight
                  ? "bg-gradient-to-br from-amber-50 to-white border-amber-500 shadow-md ring-1 ring-amber-500/20 text-slate-900"
                  : isDark
                  ? "bg-gradient-to-br from-amber-950/70 via-[#1a110a] to-[#09090b] border-amber-500/60 shadow-lg ring-1 ring-amber-500/30 text-white"
                  : "bg-gradient-to-br from-amber-950/80 via-[#2a1708] to-[#070d1e] border-amber-400/60 shadow-lg ring-1 ring-amber-400/30 text-white"
                : themeCardBg
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    tradeType === "WHOLESALE"
                      ? "bg-amber-600 text-white shadow-xs"
                      : isLight
                      ? "bg-slate-100 text-slate-600 group-hover:text-amber-600"
                      : "bg-white/5 text-zinc-400 group-hover:text-amber-400"
                  }`}
                >
                  <Boxes className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400">Wholesale Hub</span>
                    <span className={`text-[11px] font-normal ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      (B2B Bulk Orders)
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    Volume tier discounts • Sacks, cartons & cargo freight
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  tradeType === "WHOLESALE"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-200 border border-amber-500/30"
                    : isLight
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {counts.wholesale}
              </span>
            </div>
          </button>
        </div>

        {/* 🌟 CONTEXTUAL FEATURE STRIP (LIGHT, DARK & SYSTEM COMPATIBLE) 🌟 */}
        {tradeType === "WHOLESALE" && (
          <div
            className={`rounded-2xl border p-3.5 sm:p-4 backdrop-blur-md space-y-3 ${
              isLight
                ? "bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white border-amber-300 text-slate-800 shadow-xs"
                : isDark
                ? "bg-gradient-to-r from-amber-950/40 via-[#15100a] to-[#09090b] border-amber-500/30 text-zinc-300"
                : "bg-gradient-to-r from-amber-950/40 via-[#201408] to-[#070d1e] border-amber-500/30 text-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                  <Boxes className="h-4 w-4" />
                  <span>Wholesale Commercial Hub (B2B Bulk Supply)</span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                  Source directly from verified commercial importers and manufacturers with CBE & Telebirr Escrow protection.
                </p>
              </div>

              {/* MOQ Quick Selector Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[11px] font-semibold mr-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  MOQ:
                </span>
                {[
                  { label: "All Bulk", value: "ALL" },
                  { label: "2 - 9 Units", value: "2-9" },
                  { label: "10+ Units (Sacks/Cargo)", value: "10+" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMoqFilter(item.value as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      moqFilter === item.value
                        ? "bg-amber-600 text-white shadow-xs"
                        : isLight
                        ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px] ${
                isLight ? "border-amber-200 text-slate-700" : "border-amber-500/20 text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <BadgePercent className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Tiered Volume Discounts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>100% Escrow Buyer Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Addis Ababa & Regional Freight Logistics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Official Tax & VAT Commercial Invoices</span>
              </div>
            </div>
          </div>
        )}

        {tradeType === "RETAIL" && (
          <div
            className={`rounded-2xl border p-3.5 sm:p-4 backdrop-blur-md space-y-3 ${
              isLight
                ? "bg-gradient-to-r from-cyan-50/90 via-indigo-50/40 to-white border-cyan-300 text-slate-800 shadow-xs"
                : isDark
                ? "bg-gradient-to-r from-cyan-950/40 via-[#0a151f] to-[#09090b] border-cyan-500/30 text-zinc-300"
                : "bg-gradient-to-r from-cyan-950/40 via-[#091b2c] to-[#070d1e] border-cyan-500/30 text-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-sm">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Direct Retail Marketplace (B2C Shopping)</span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                  Curated consumer items available in individual units (1 Unit Minimum) with rapid doorstep delivery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600/10 border border-cyan-600/30 px-3 py-1 text-xs text-cyan-600 dark:text-cyan-200 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" />
                  <span>1 Unit • Single Item Purchase</span>
                </span>
              </div>
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-[11px] ${
                isLight ? "border-cyan-200 text-slate-700" : "border-cyan-500/20 text-zinc-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Fast Doorstep Delivery in Addis Ababa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Inspect Package Before 4-Digit OTP Release</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Verified Bole & Mercato Commercial Stores</span>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar: Toggle Sidebar, Mobile Filters, View Modes, Sort */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-2xl p-2.5 backdrop-blur-md ${themeSurfaceBg}`}>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600/20 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-600 text-white text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? "border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-xs"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
              }`}
              title={isSidebarCollapsed ? "Show Filters Sidebar" : "Minimize Filters Sidebar"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Show Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-3.5 w-3.5 opacity-70" />
                  <span>Hide Sidebar</span>
                </>
              )}
            </button>

            {/* View Mode Switcher: Grid vs Normal View */}
            <div
              className={`flex items-center rounded-xl border p-0.5 ml-1 ${
                isLight ? "border-slate-200 bg-slate-100" : "border-white/10 bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("normal")}
                title="Normal View"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "normal"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Compact</span>
              </button>
            </div>

            {/* Total count indicator */}
            <span className={`text-xs hidden xl:inline ml-2 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Showing <strong className={isLight ? "text-slate-900" : "text-white"}>{filteredProducts.length}</strong> items
              {tradeType === "WHOLESALE" && <span className="text-amber-500 ml-1 font-semibold">(Wholesale)</span>}
              {tradeType === "RETAIL" && <span className="text-cyan-500 ml-1 font-semibold">(Retail)</span>}
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className={`text-xs hidden sm:inline ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`rounded-xl border px-3 py-1.5 text-xs outline-none focus:border-indigo-500 cursor-pointer ${
                isLight
                  ? "border-slate-300 bg-white text-slate-800 shadow-xs"
                  : isDark
                  ? "border-white/10 bg-[#090e1c] text-zinc-200"
                  : "border-blue-500/20 bg-[#08122c] text-white"
              }`}
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className={`font-medium ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
              Applied Filters:
            </span>

            {tradeType !== "ALL" && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[11px] font-bold border ${
                  tradeType === "WHOLESALE"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300"
                    : "bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-300"
                }`}
              >
                <span>{tradeType === "WHOLESALE" ? "Wholesale Only" : "Retail Only"}</span>
                <button
                  type="button"
                  onClick={() => setTradeType("ALL")}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {moqFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-600 dark:text-amber-300 text-[11px]">
                <span>MOQ: {moqFilter}</span>
                <button
                  type="button"
                  onClick={() => setMoqFilter("ALL")}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-indigo-600 dark:text-indigo-300 text-[11px]">
                <span>
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceRange !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-indigo-600 dark:text-indigo-300 text-[11px]">
                <span>{priceRange}</span>
                <button
                  type="button"
                  onClick={() => setPriceRange("ALL")}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-600 dark:text-emerald-300 text-[11px]">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {escrowOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-600 dark:text-emerald-300 text-[11px]">
                <span>Verified Merchant</span>
                <button
                  type="button"
                  onClick={() => setEscrowOnly(false)}
                  className="hover:opacity-80 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className={`underline cursor-pointer text-[11px] ml-1 hover:opacity-80 ${
                isLight ? "text-slate-500" : "text-zinc-400"
              }`}
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main Layout: Desktop Sidebar + Product Display */}
        <div className="flex items-start gap-5">
          {/* Sidebar (Desktop) */}
          {!isSidebarCollapsed && (
            <aside
              className={`hidden lg:block w-60 xl:w-64 shrink-0 rounded-2xl border p-4 backdrop-blur-xl space-y-4 sticky top-20 ${
                isLight
                  ? "bg-white border-slate-200 shadow-sm text-slate-900"
                  : isDark
                  ? "bg-[#141418] border-white/10 shadow-xl text-white"
                  : "bg-[#0f1b3b]/95 border-blue-500/20 shadow-xl text-white"
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-2.5 ${themeBorder}`}>
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />
                  <h3 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    Filters & Sectors
                  </h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`text-[10px] underline cursor-pointer hover:opacity-80 ${
                      isLight ? "text-slate-500" : "text-zinc-400"
                    }`}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Trade Type Filter */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                  Trade Sector
                </span>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setTradeType("ALL")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tradeType === "ALL"
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>All Products</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{counts.total}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeType("RETAIL")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tradeType === "RETAIL"
                        ? "bg-cyan-600 text-white font-bold shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-cyan-500" />
                      <span>Retail Only (1 Unit)</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{counts.retail}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeType("WHOLESALE")}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      tradeType === "WHOLESALE"
                        ? "bg-amber-600 text-white font-bold shadow-xs"
                        : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Boxes className="h-3.5 w-3.5 text-amber-500" />
                      <span>Wholesale Only (Bulk)</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{counts.wholesale}</span>
                  </button>
                </div>
              </div>

              {/* Categories Section */}
              <div className={`pt-3 border-t space-y-1 ${themeBorder}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                  Categories
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === "ALL"
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : isLight
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="h-3 w-3 shrink-0" />
                    <span className="truncate">All Categories</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono ml-1 shrink-0">
                    {getCategoryCount("ALL")}
                  </span>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs font-bold"
                          : isLight
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getCategoryIcon(cat.slug)}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-mono ml-1 shrink-0">
                        {getCategoryCount(cat.slug)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Price Range Filter */}
              <div className={`pt-3 border-t space-y-2 ${themeBorder}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                  Price Range (ETB)
                </span>
                <div className="space-y-1 text-xs">
                  {[
                    { label: "All Prices", value: "ALL" },
                    { label: "Under 5,000 ETB", value: "under-5k" },
                    { label: "5,000 - 20,000 ETB", value: "5k-20k" },
                    { label: "20,000 - 60,000 ETB", value: "20k-60k" },
                    { label: "Above 60,000 ETB", value: "over-60k" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriceRange(p.value)}
                      className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        priceRange === p.value
                          ? isLight
                            ? "bg-indigo-50 text-indigo-700 font-bold"
                            : "bg-white/10 text-white font-bold"
                          : isLight
                          ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock & Escrow Toggles */}
              <div className={`pt-3 border-t space-y-2 ${themeBorder}`}>
                <label className={`flex items-center gap-2 cursor-pointer text-xs ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>
                <label className={`flex items-center gap-2 cursor-pointer text-xs ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                  <input
                    type="checkbox"
                    checked={escrowOnly}
                    onChange={(e) => setEscrowOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Verified Merchant Only</span>
                </label>
              </div>
            </aside>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className={`grid gap-2.5 sm:gap-3.5 ${
                  isSidebarCollapsed
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}
              >
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-72 rounded-2xl border p-3 animate-pulse space-y-2.5 ${
                      isLight
                        ? "bg-slate-100 border-slate-200"
                        : "bg-[#0d1222]/80 border-white/10"
                    }`}
                  >
                    <div className={`w-full aspect-square rounded-xl ${isLight ? "bg-slate-200" : "bg-white/5"}`} />
                    <div className={`h-3 w-1/3 rounded ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`h-4 w-4/5 rounded ${isLight ? "bg-slate-200" : "bg-white/15"}`} />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                /* Grid View */
                <div
                  className={`grid gap-2.5 sm:gap-3.5 ${
                    isSidebarCollapsed
                      ? "grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6"
                      : "grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                      tradeView={tradeType}
                      hideBadges
                      transparentCartButton
                    />
                  ))}
                </div>
              ) : (
                /* Compact View */
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
                  {filteredProducts.map((product) => (
                    <HorizontalProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                      tradeView={tradeType}
                      hideBadges
                      transparentCartButton
                    />
                  ))}
                </div>
              )
            ) : (
              <div
                className={`rounded-2xl border border-dashed p-12 text-center space-y-3 ${
                  isLight
                    ? "bg-slate-50 border-slate-300"
                    : isDark
                    ? "bg-[#141418] border-white/15"
                    : "bg-[#0d1222]/60 border-blue-500/20"
                }`}
              >
                {tradeType === "WHOLESALE" ? (
                  <Boxes className="h-10 w-10 text-amber-500 mx-auto" />
                ) : tradeType === "RETAIL" ? (
                  <ShoppingBag className="h-10 w-10 text-cyan-500 mx-auto" />
                ) : (
                  <Layers className={`h-10 w-10 mx-auto ${isLight ? "text-slate-400" : "text-zinc-500"}`} />
                )}
                <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {tradeType === "WHOLESALE"
                    ? "No wholesale products found"
                    : tradeType === "RETAIL"
                    ? "No retail products found"
                    : "No products found"}
                </h3>
                <p className={`text-xs max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {tradeType === "WHOLESALE"
                    ? "No bulk products matched the selected filters. Switch to retail or reset filters."
                    : "No items matched your current filters. Try resetting filters or searching another keyword."}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTradeType("ALL")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer shadow-sm"
                  >
                    <span>View All Products</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isLight
                        ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                        : "border-white/20 bg-white/5 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-xs h-full border-l p-5 overflow-y-auto space-y-4 shadow-2xl ${
              isLight
                ? "bg-white text-slate-900 border-slate-200"
                : isDark
                ? "bg-[#09090b] text-white border-white/10"
                : "bg-[#070d1e] text-white border-blue-500/20"
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${themeBorder}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                <span>Filters & Trade Modes</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer ${
                  isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Trade Type Selection */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-500 uppercase">
                Trade Sector
              </span>
              <div className="space-y-1">
                {[
                  { id: "ALL", label: "All Products", count: counts.total },
                  { id: "RETAIL", label: "Retail Direct", count: counts.retail },
                  { id: "WHOLESALE", label: "Wholesale Hub", count: counts.wholesale },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTradeType(t.id as TradeType);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      tradeType === t.id
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isLight
                        ? "bg-slate-50 hover:bg-slate-100 text-slate-700"
                        : "bg-white/5 text-zinc-300"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="font-mono text-[10px] opacity-75">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className={`pt-3 border-t space-y-1 ${themeBorder}`}>
              <span className="text-[11px] font-bold text-indigo-500 uppercase block mb-1">
                Categories
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs font-medium cursor-pointer ${
                  selectedCategory === "ALL"
                    ? "bg-indigo-600 text-white font-bold"
                    : isLight
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-zinc-300"
                }`}
              >
                All Categories ({getCategoryCount("ALL")})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium cursor-pointer ${
                    selectedCategory === c.slug
                      ? "bg-indigo-600 text-white font-bold"
                      : isLight
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-zinc-300"
                  }`}
                >
                  {c.name} ({getCategoryCount(c.slug)})
                </button>
              ))}
            </div>

            {/* Reset / Apply */}
            <div className={`pt-4 border-t space-y-2 ${themeBorder}`}>
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                  isLight
                    ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    : "border-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}
