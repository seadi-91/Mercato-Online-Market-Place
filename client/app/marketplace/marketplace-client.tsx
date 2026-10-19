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
  Zap,
  Globe,
  Filter,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { ProductCard } from "@/components/products/product-card";
import { HorizontalProductCard } from "@/components/products/horizontal-product-card";
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
  const { theme } = useThemeStore();

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
    router.push(`/products/${product.id}`);
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

  const counts = useMemo(() => {
    let retail = 0;
    let wholesale = 0;
    for (const p of products) {
      if (isRetailProduct(p)) retail++;
      if (isWholesaleProduct(p)) wholesale++;
    }
    return { total: products.length, retail, wholesale };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (tradeType === "RETAIL") {
      result = result.filter(isRetailProduct);
    } else if (tradeType === "WHOLESALE") {
      result = result.filter(isWholesaleProduct);
    }

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

    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.categorySlug === selectedCategory);
    }

    if (priceRange === "under-5k") {
      result = result.filter((p) => p.price < 5000);
    } else if (priceRange === "5k-20k") {
      result = result.filter((p) => p.price >= 5000 && p.price <= 20000);
    } else if (priceRange === "20k-60k") {
      result = result.filter((p) => p.price > 20000 && p.price <= 60000);
    } else if (priceRange === "over-60k") {
      result = result.filter((p) => p.price > 60000);
    }

    if (inStockOnly) result = result.filter((p) => p.stock > 0);
    if (escrowOnly) result = result.filter((p) => p.isVerifiedSeller || p.badge === "Escrow Verified");
    if (minRating > 0) result = result.filter((p) => p.rating >= minRating);

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
  }, [products, tradeType, moqFilter, searchQuery, selectedCategory, priceRange, inStockOnly, escrowOnly, minRating, sortBy]);

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

  // Theme-aware classes matching globals.css tokens
  const themePageBg = isLight
    ? "bg-[#fafbfe] text-slate-900"
    : isDark
      ? "bg-[#09090b] text-white"
      : "bg-[#070d1e] text-slate-100";

  const themeBorder = isLight
    ? "border-slate-200/80"
    : isDark
      ? "border-white/8"
      : "border-blue-500/15";

  const themeSurfaceBg = isLight
    ? "bg-white border-slate-200/80 shadow-xs"
    : isDark
      ? "bg-[#111115] border-white/8"
      : "bg-[#0c1630] border-blue-500/15";

  const themeCardBg = isLight
    ? "bg-white border-slate-200/80 hover:border-indigo-200 shadow-xs hover:shadow-sm"
    : isDark
      ? "bg-[#141418] border-white/8 hover:border-white/16"
      : "bg-[#0f1b3b] border-blue-500/15 hover:border-blue-400/35";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${themePageBg}`}>
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 pb-24 sm:pb-12">

        {/* HERO SECTION - Sleek, Modern, Brand-Aligned */}
        <div
          className={`relative overflow-hidden rounded-2xl border transition-all ${isLight
              ? "bg-white border-slate-200/80 shadow-sm"
              : isDark
                ? "bg-[#121216] border-white/8 shadow-md"
                : "bg-[#0c1630] border-blue-500/20 shadow-md"
            }`}
        >
          {/* Subtle top brand accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 sm:p-7">
            {/* Title & Trust Info */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${isLight
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Marketplace
                </span>
                <span
                  className={`text-xs ${isLight ? "text-slate-500" : isDark ? "text-zinc-400" : "text-slate-400"
                    }`}
                >
                  {counts.total} Verified Products &bull; Addis Ababa Commercial Hub
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ethiopian Protected{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  Marketplace
                </span>
              </h1>

              <p
                className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-600" : isDark ? "text-zinc-400" : "text-slate-300"
                  }`}
              >
                Wholesale bulk supply &amp; retail direct from verified Mercato merchants. Guaranteed with CBE &amp; Telebirr Escrow protection.
              </p>

              {/* Trust Badges */}
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${isLight ? "text-slate-700" : isDark ? "text-zinc-300" : "text-slate-200"
                    }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Escrow Protected
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${isLight ? "text-slate-700" : isDark ? "text-zinc-300" : "text-slate-200"
                    }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Verified Merchants
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-medium ${isLight ? "text-slate-700" : isDark ? "text-zinc-300" : "text-slate-200"
                    }`}
                >
                  <Truck className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  Direct Delivery
                </span>
              </div>
            </div>

            {/* Modern Search Input */}
            <div className="w-full md:w-80 lg:w-96 shrink-0">
              <div className="relative">
                <Search
                  className={`absolute left-3.5 top-3 h-4 w-4 pointer-events-none ${isLight ? "text-slate-400" : "text-zinc-500"
                    }`}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, bulk cargo..."
                  className={`w-full rounded-xl border pl-10 pr-9 py-2.5 text-xs sm:text-sm outline-none transition-all ${isLight
                      ? "bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                      : isDark
                        ? "bg-[#18181c] border-white/10 text-white placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        : "bg-[#091228] border-blue-500/20 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-3 top-2.5 p-0.5 rounded-full transition-colors cursor-pointer ${isLight
                        ? "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        : "text-zinc-400 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TRADE SECTOR SWITCHER - Clean Modern Cards adhering strictly to Brand Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "ALL" as TradeType,
              label: "All Products",
              sub: "Full Catalog",
              desc: "Complete marketplace inventory across retail & bulk",
              count: counts.total,
              Icon: Layers,
              // Brand Primary (Indigo)
              activeTheme: isLight
                ? "bg-white border-indigo-600 ring-2 ring-indigo-600/15 shadow-sm"
                : "bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/30 shadow-sm",
              iconBgActive: isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/20 text-indigo-400",
              badgeActive: isLight
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
              activeBorderBar: "bg-indigo-600",
            },
            {
              id: "RETAIL" as TradeType,
              label: "Retail Direct",
              sub: "B2C Single Units",
              desc: "1 Unit Minimum Order — Direct doorstep delivery",
              count: counts.retail,
              Icon: ShoppingBag,
              // Brand Retail (Emerald)
              activeTheme: isLight
                ? "bg-white border-emerald-600 ring-2 ring-emerald-600/15 shadow-sm"
                : "bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30 shadow-sm",
              iconBgActive: isLight ? "bg-emerald-50 text-emerald-600" : "bg-emerald-500/20 text-emerald-400",
              badgeActive: isLight
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
              activeBorderBar: "bg-emerald-600",
            },
            {
              id: "WHOLESALE" as TradeType,
              label: "Wholesale Hub",
              sub: "B2B Bulk Orders",
              desc: "Volume tier discounts — Cartons, sacks & commercial cargo",
              count: counts.wholesale,
              Icon: Boxes,
              // Brand Wholesale (Amber)
              activeTheme: isLight
                ? "bg-white border-amber-500 ring-2 ring-amber-500/15 shadow-sm"
                : "bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/30 shadow-sm",
              iconBgActive: isLight ? "bg-amber-50 text-amber-600" : "bg-amber-500/20 text-amber-400",
              badgeActive: isLight
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
              activeBorderBar: "bg-amber-500",
            },
          ].map((card) => {
            const isSelected = tradeType === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setTradeType(card.id)}
                className={`relative text-left rounded-2xl border transition-all duration-150 cursor-pointer overflow-hidden p-4 ${isSelected ? card.activeTheme : `${themeCardBg}`
                  }`}
              >
                {/* Active accent top bar */}
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${card.activeBorderBar}`} />
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isSelected
                          ? card.iconBgActive
                          : isLight
                            ? "bg-slate-100 text-slate-600"
                            : "bg-white/5 text-zinc-400"
                        }`}
                    >
                      <card.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        <span>{card.label}</span>
                        <span
                          className={`text-[11px] font-normal ${isLight ? "text-slate-400" : "text-zinc-500"
                            }`}
                        >
                          ({card.sub})
                        </span>
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 line-clamp-1 ${isLight ? "text-slate-500" : "text-zinc-400"
                          }`}
                      >
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0 ${isSelected
                        ? card.badgeActive
                        : isLight
                          ? "bg-slate-100 text-slate-600"
                          : "bg-white/5 text-zinc-400"
                      }`}
                  >
                    {card.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CONTEXTUAL FEATURE STRIP - WHOLESALE (Amber brand token) */}
        {tradeType === "WHOLESALE" && (
          <div
            className={`rounded-2xl border p-4 transition-all ${isLight
                ? "bg-white border-amber-200/80 shadow-xs"
                : isDark
                  ? "bg-[#14120e] border-amber-500/20"
                  : "bg-[#121324] border-amber-500/20"
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                  <Boxes className="h-4 w-4" />
                  <span>Wholesale Commercial Hub (B2B Bulk Supply)</span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Source directly from verified commercial importers and manufacturers with CBE &amp; Telebirr Escrow protection.
                </p>
              </div>

              {/* MOQ Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[11px] font-semibold mr-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  MOQ Filter:
                </span>
                {[
                  { label: "All Bulk", value: "ALL" },
                  { label: "2-9 Units", value: "2-9" },
                  { label: "10+ Units", value: "10+" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMoqFilter(item.value as any)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${moqFilter === item.value
                        ? "bg-amber-500 text-white shadow-xs"
                        : isLight
                          ? "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                          : "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10"
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wholesale Value Highlights */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t text-[11px] ${isLight ? "border-slate-100 text-slate-600" : "border-white/5 text-zinc-400"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <BadgePercent className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Tiered Volume Pricing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>100% Escrow Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Addis Ababa Freight</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Official VAT Invoices</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTEXTUAL FEATURE STRIP - RETAIL (Emerald brand token) */}
        {tradeType === "RETAIL" && (
          <div
            className={`rounded-2xl border p-4 transition-all ${isLight
                ? "bg-white border-emerald-200/80 shadow-xs"
                : isDark
                  ? "bg-[#0d1410] border-emerald-500/20"
                  : "bg-[#0b1820] border-emerald-500/20"
              }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Direct Retail Marketplace (B2C Shopping)</span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Curated consumer items available in individual units (1 Unit Minimum) with rapid doorstep delivery.
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap border ${isLight
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                1 Unit Minimum
              </span>
            </div>

            {/* Retail Value Highlights */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 mt-3 border-t text-[11px] ${isLight ? "border-slate-100 text-slate-600" : "border-white/5 text-zinc-400"
                }`}
            >
              <div className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                <span>Fast Doorstep Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>OTP Package Inspection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Verified Mercato Stores</span>
              </div>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-2.5 transition-all ${themeSurfaceBg}`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white text-indigo-600 text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  : "border-white/10 bg-white/5 hover:bg-white/8 text-zinc-300 hover:text-white"
                }`}
              title={isSidebarCollapsed ? "Show Filters Sidebar" : "Minimize Filters Sidebar"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Show Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-3.5 w-3.5 opacity-60" />
                  <span>Hide Sidebar</span>
                </>
              )}
            </button>

            {/* View Mode Switcher */}
            <div
              className={`flex items-center rounded-xl border p-0.5 ${isLight ? "border-slate-200 bg-slate-50" : "border-white/8 bg-white/5"
                }`}
            >
              {[
                { mode: "grid" as const, Icon: LayoutGrid, label: "Grid" },
                { mode: "normal" as const, Icon: List, label: "Compact" },
              ].map((v) => (
                <button
                  key={v.mode}
                  type="button"
                  onClick={() => setViewMode(v.mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${viewMode === v.mode
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-zinc-400 hover:text-white"
                    }`}
                >
                  <v.Icon className="h-3.5 w-3.5" />
                  <span>{v.label}</span>
                </button>
              ))}
            </div>

            <span className={`text-xs hidden xl:inline ml-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              Showing{" "}
              <strong className={isLight ? "text-slate-900" : "text-white"}>{filteredProducts.length}</strong> items
              {tradeType === "WHOLESALE" && <span className="text-amber-500 ml-1 font-semibold">(Wholesale)</span>}
              {tradeType === "RETAIL" && <span className="text-emerald-500 ml-1 font-semibold">(Retail)</span>}
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className={`text-xs hidden sm:inline ${isLight ? "text-slate-400" : "text-zinc-500"}`}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`rounded-xl border px-3 py-1.5 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 cursor-pointer transition-all ${isLight
                  ? "border-slate-200 bg-white text-slate-800"
                  : isDark
                    ? "border-white/10 bg-[#111115] text-zinc-200"
                    : "border-blue-500/20 bg-[#0a1230] text-white"
                }`}
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className={`font-semibold flex items-center gap-1 ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
              <Filter className="h-3 w-3" /> Filters:
            </span>

            {tradeType !== "ALL" && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[11px] font-bold border ${tradeType === "WHOLESALE"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  }`}
              >
                {tradeType === "WHOLESALE" ? "Wholesale Only" : "Retail Only"}
                <button type="button" onClick={() => setTradeType("ALL")} className="hover:opacity-70 cursor-pointer ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {moqFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                MOQ: {moqFilter}
                <button type="button" onClick={() => setMoqFilter("ALL")} className="hover:opacity-70 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className="hover:opacity-70 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceRange !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
                {priceRange}
                <button type="button" onClick={() => setPriceRange("ALL")} className="hover:opacity-70 cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                In Stock Only
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:opacity-70 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {escrowOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                Verified Merchant
                <button
                  type="button"
                  onClick={() => setEscrowOnly(false)}
                  className="hover:opacity-70 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className={`text-[11px] font-semibold underline cursor-pointer hover:no-underline ml-1 transition-all ${isLight ? "text-slate-400 hover:text-slate-700" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              Clear all
            </button>
          </div>
        )}

        {/* MAIN LAYOUT: SIDEBAR + PRODUCT GRID */}
        <div className="flex items-start gap-4">
          {/* Desktop Sidebar */}
          {!isSidebarCollapsed && (
            <aside
              className={`hidden lg:block w-60 xl:w-64 shrink-0 rounded-2xl border sticky top-20 overflow-hidden transition-all ${isLight
                  ? "bg-white border-slate-200/80 shadow-xs text-slate-900"
                  : isDark
                    ? "bg-[#141418] border-white/8 shadow-md text-white"
                    : "bg-[#0f1b3b] border-blue-400/15 shadow-md text-white"
                }`}
            >
              {/* Subtle top indicator */}
              <div className="h-1 w-full bg-indigo-600" />

              <div className="p-4 space-y-4">
                <div className={`flex items-center justify-between border-b pb-2.5 ${themeBorder}`}>
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold">Filters</h3>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Trade Sectors */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Trade Sector
                  </span>
                  <div className="space-y-1 text-xs">
                    {[
                      {
                        id: "ALL" as TradeType,
                        label: "All Products",
                        icon: <Layers className="h-3.5 w-3.5" />,
                        count: counts.total,
                        activeClass: "bg-indigo-600 text-white font-bold",
                      },
                      {
                        id: "RETAIL" as TradeType,
                        label: "Retail Only",
                        icon: <ShoppingBag className="h-3.5 w-3.5" />,
                        count: counts.retail,
                        activeClass: "bg-emerald-600 text-white font-bold",
                      },
                      {
                        id: "WHOLESALE" as TradeType,
                        label: "Wholesale Only",
                        icon: <Boxes className="h-3.5 w-3.5" />,
                        count: counts.wholesale,
                        activeClass: "bg-amber-500 text-white font-bold",
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTradeType(t.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${tradeType === t.id
                            ? `${t.activeClass} shadow-xs`
                            : isLight
                              ? "text-slate-700 hover:bg-slate-100"
                              : "text-zinc-300 hover:bg-white/5"
                          }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {t.icon}
                          <span>{t.label}</span>
                        </span>
                        <span className="text-[10px] opacity-75 font-mono">{t.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className={`pt-3 border-t space-y-1 ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1.5">
                    Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${selectedCategory === "ALL"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : isLight
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-zinc-300 hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 shrink-0" />
                      <span>All Categories</span>
                    </div>
                    <span className="text-[10px] opacity-70 font-mono">{getCategoryCount("ALL")}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left ${selectedCategory === cat.slug
                          ? "bg-indigo-600 text-white shadow-xs"
                          : isLight
                            ? "text-slate-700 hover:bg-slate-100"
                            : "text-zinc-300 hover:bg-white/5"
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getCategoryIcon(cat.slug)}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] opacity-70 font-mono ml-1 shrink-0">
                        {getCategoryCount(cat.slug)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Price Range */}
                <div className={`pt-3 border-t space-y-1.5 ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Price Range (ETB)
                  </span>
                  <div className="space-y-0.5 text-xs">
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
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${priceRange === p.value
                            ? isLight
                              ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                              : "bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30"
                            : isLight
                              ? "text-slate-600 hover:bg-slate-50"
                              : "text-zinc-400 hover:bg-white/5"
                          }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Toggles */}
                <div className={`pt-3 border-t space-y-3 ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Availability
                  </span>
                  {[
                    { label: "In Stock Only", value: inStockOnly, onChange: setInStockOnly },
                    { label: "Verified Merchant Only", value: escrowOnly, onChange: setEscrowOnly },
                  ].map((toggle) => (
                    <label
                      key={toggle.label}
                      className={`flex items-center gap-2.5 cursor-pointer text-xs select-none ${isLight ? "text-slate-700" : "text-zinc-300"
                        }`}
                    >
                      <div
                        onClick={() => toggle.onChange(!toggle.value)}
                        className={`relative h-4 w-7 rounded-full transition-all cursor-pointer shrink-0 ${toggle.value ? "bg-indigo-600" : isLight ? "bg-slate-200" : "bg-white/10"
                          }`}
                      >
                        <div
                          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-xs transition-all ${toggle.value ? "left-3.5" : "left-0.5"
                            }`}
                        />
                      </div>
                      <span>{toggle.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Product Grid Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className={`grid gap-3 ${isSidebarCollapsed
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}
              >
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-72 rounded-2xl border animate-pulse space-y-3 p-3 ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/3 border-white/8"
                      }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className={`w-full aspect-square rounded-xl ${isLight ? "bg-slate-200" : "bg-white/6"}`} />
                    <div className={`h-3 w-1/3 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`h-4 w-4/5 rounded-full ${isLight ? "bg-slate-200" : "bg-white/8"}`} />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div
                  className={`grid gap-2.5 sm:gap-3.5 ${isSidebarCollapsed
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
              /* Refined Clean Empty State */
              <div
                className={`rounded-2xl border border-dashed p-14 text-center space-y-4 ${isLight
                    ? "bg-white border-slate-300"
                    : isDark
                      ? "bg-[#141418] border-white/10"
                      : "bg-[#0d1222] border-blue-500/15"
                  }`}
              >
                <div className="relative">
                  {tradeType === "WHOLESALE" ? (
                    <Boxes className="h-12 w-12 text-amber-500 mx-auto" />
                  ) : tradeType === "RETAIL" ? (
                    <ShoppingBag className="h-12 w-12 text-emerald-500 mx-auto" />
                  ) : (
                    <Layers className={`h-12 w-12 mx-auto ${isLight ? "text-slate-300" : "text-zinc-600"}`} />
                  )}
                  <h3 className="text-base font-bold mt-4">
                    {tradeType === "WHOLESALE"
                      ? "No wholesale products found"
                      : tradeType === "RETAIL"
                        ? "No retail products found"
                        : "No products found"}
                  </h3>
                  <p className={`text-xs max-w-sm mx-auto mt-1.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                    {tradeType === "WHOLESALE"
                      ? "No bulk products matched the selected filters. Switch to retail or reset filters."
                      : "No items matched your current filters. Try resetting filters or searching another keyword."}
                  </p>
                  <div className="flex items-center justify-center gap-2.5 mt-5">
                    <button
                      type="button"
                      onClick={() => setTradeType("ALL")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
                    >
                      View All Products
                    </button>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${isLight
                          ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          : "border-white/15 bg-white/5 text-zinc-300 hover:text-white"
                        }`}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/50 backdrop-blur-xs">
          <div
            className={`w-full max-w-xs h-full border-l p-5 overflow-y-auto space-y-5 shadow-2xl relative ${isLight
                ? "bg-white text-slate-900 border-slate-200"
                : isDark
                  ? "bg-[#09090b] text-white border-white/8"
                  : "bg-[#070d1e] text-white border-blue-500/15"
              }`}
          >
            {/* Top brand accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />

            <div className={`flex items-center justify-between border-b pb-3 ${themeBorder}`}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Filters &amp; Trade Modes
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-indigo-600 text-white text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-white/8 text-zinc-400 hover:text-white"
                  }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                Trade Sector
              </span>
              <div className="space-y-1.5">
                {[
                  { id: "ALL" as TradeType, label: "All Products", count: counts.total, color: "bg-indigo-600" },
                  { id: "RETAIL" as TradeType, label: "Retail Direct", count: counts.retail, color: "bg-emerald-600" },
                  {
                    id: "WHOLESALE" as TradeType,
                    label: "Wholesale Hub",
                    count: counts.wholesale,
                    color: "bg-amber-500",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTradeType(t.id);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${tradeType === t.id
                        ? `${t.color} text-white shadow-xs`
                        : isLight
                          ? "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700"
                          : "bg-white/5 border border-white/8 text-zinc-300 hover:bg-white/8"
                      }`}
                  >
                    <span>{t.label}</span>
                    <span className="font-mono text-[10px] opacity-75">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`pt-3 border-t space-y-1.5 ${themeBorder}`}>
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Categories
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full text-left p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${selectedCategory === "ALL"
                    ? "bg-indigo-600 text-white font-bold"
                    : isLight
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-zinc-300 hover:bg-white/5"
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
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${selectedCategory === c.slug
                      ? "bg-indigo-600 text-white font-bold"
                      : isLight
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                >
                  {c.name} ({getCategoryCount(c.slug)})
                </button>
              ))}
            </div>

            <div className={`pt-3 border-t space-y-1.5 ${themeBorder}`}>
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Price Range (ETB)
              </span>
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
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${priceRange === p.value
                      ? isLight
                        ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200"
                        : "bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30"
                      : isLight
                        ? "text-slate-600 hover:bg-slate-50"
                        : "text-zinc-400 hover:bg-white/5"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className={`pt-4 border-t space-y-2 ${themeBorder}`}>
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${isLight
                    ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    : "border-white/10 text-zinc-300 hover:text-white hover:border-white/20"
                  }`}
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-indigo-700 transition-all"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerBottomNav />
      <CustomerFooter />
    </div>
  );
}
