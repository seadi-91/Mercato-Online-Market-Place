"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  ShoppingCart,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ShoppingBag,
  Boxes,
  ShieldCheck,
  Truck,
  Package,
  CheckCircle2,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Menu,
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
import {
  isWholesaleProduct,
  isRetailProduct,
  TradeType,
} from "@/lib/product-classification";

interface MarketplaceClientProps {
  initialProducts?: Product[];
  initialCategories?: CategoryItem[];
}

const TRENDING_KEYWORDS = [
  "Specialty Coffee",
  "Habesha Tibeb",
  "MacBook Pro",
  "Smartphones",
  "Wholesale Teff",
  "Solar Inverters",
  "Cosmetics",
];

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
  const [customMinPrice, setCustomMinPrice] = useState<string>("");
  const [customMaxPrice, setCustomMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [escrowOnly, setEscrowOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "normal">("grid");
  const [categorySearch, setCategorySearch] = useState<string>("");

  // Lock body scroll and listen to ESC key when mobile drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsMobileFilterOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileFilterOpen]);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const scrollCategory = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const refreshMarketplace = async () => {
    setIsLoading(true);
    try {
      const [prodResult, catResult] = await Promise.all([
        fetchProducts({ limit: 50, sortBy: "createdAt", sortOrder: "DESC" }),
        fetchCategories(),
      ]);
      if (prodResult.products.length > 0) setProducts(prodResult.products);
      if (catResult.length > 0) setCategories(catResult);
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialProducts.length > 0) return;
    let isMounted = true;
    let retryTimer: NodeJS.Timeout | null = null;

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
          if (prodResult.products.length === 0) {
            retryTimer = setTimeout(async () => {
              if (!isMounted) return;
              try {
                const [retryProd, retryCat] = await Promise.all([
                  fetchProducts({ limit: 50, sortBy: "createdAt", sortOrder: "DESC" }),
                  fetchCategories(),
                ]);
                if (isMounted && retryProd.products.length > 0) {
                  setProducts(retryProd.products);
                  if (retryCat.length > 0) setCategories(retryCat);
                }
              } catch {
                // silent
              }
            }, 2500);
          }
        }
      } catch {
        // safe handling
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
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
        return <Laptop className="h-4 w-4" />;
      case "smartphones-mobile":
        return <Smartphone className="h-4 w-4" />;
      case "fashion-apparel-shoes":
        return <Shirt className="h-4 w-4" />;
      case "home-kitchen-appliances":
        return <Home className="h-4 w-4" />;
      case "grains-cereals-groceries":
      case "grains-cereals-teff":
      case "agricultural-commodities":
        return <Coffee className="h-4 w-4" />;
      case "cosmetics-skincare":
        return <Sparkles className="h-4 w-4" />;
      case "construction-industrial-materials":
        return <Briefcase className="h-4 w-4" />;
      case "packaging-logistics":
        return <Truck className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
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
    } else if (priceRange === "custom") {
      const min = parseFloat(customMinPrice) || 0;
      const max = parseFloat(customMaxPrice) || Infinity;
      result = result.filter((p) => p.price >= min && p.price <= max);
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
  }, [products, tradeType, moqFilter, searchQuery, selectedCategory, priceRange, customMinPrice, customMaxPrice, inStockOnly, escrowOnly, minRating, sortBy]);

  const clearFilters = () => {
    setTradeType("ALL");
    setMoqFilter("ALL");
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedZone("ALL");
    setPriceRange("ALL");
    setCustomMinPrice("");
    setCustomMaxPrice("");
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

  const sidebarCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const applyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMinPrice || customMaxPrice) {
      setPriceRange("custom");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#09090b] text-white"}`}>
      <CustomerHeader />

      {/* TOP GUARANTEES BAR - Desktop Only (Hidden on mobile to eliminate text clutter) */}
      <div
        className={`hidden sm:block border-b text-xs py-1.5 px-3 transition-colors ${
          isLight
            ? "bg-slate-900 text-white border-slate-800"
            : "bg-[#0d0f18] text-slate-300 border-white/10"
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0 font-medium text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-indigo-400 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>MercatoX Trade Assurance</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full font-normal hidden sm:inline">
                CBE &amp; Telebirr Escrow Protected
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Truck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Addis Express Dispatch</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Verified Merchant Warehouses</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>100% Inspection OTP Handover</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-[11px] text-slate-300">
            <MapPin className="h-3 w-3 text-indigo-400" />
            <span>ETB Currency &bull; Addis Ababa Central Hub</span>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-2.5 sm:px-4 lg:px-6 py-2 sm:py-4 space-y-2.5 sm:space-y-3 pb-20 sm:pb-12">

        {/* Mobile Search Bar - Sleek, fast, no wasted container borders */}
        <div className="sm:hidden">
          <div
            className={`flex items-center rounded-xl border transition-all overflow-hidden shadow-xs ${
              isLight
                ? "bg-white border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10"
                : "bg-[#161926] border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
            }`}
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified products, brands..."
                className="w-full bg-transparent pl-8.5 pr-8 py-2 text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer touch-manipulation"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 flex items-center gap-1 transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-95"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* HERO HEADER & SEARCH - Desktop Only (Mobile uses sleek standalone search bar & filter drawer) */}
        <section
          className={`hidden sm:block rounded-2xl border p-4 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#11131c] border-white/10 shadow-md"
          }`}
        >
          <div className="space-y-3">
            {/* Title, Description & Sourcing Mode Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Addis Ababa Commercial Hub
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight mt-0.5 text-slate-900 dark:text-white">
                  Verified Ethiopian{" "}
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Marketplace
                  </span>
                </h1>
                <p className="text-xs mt-0.5 text-slate-600 dark:text-zinc-400">
                  Direct wholesale bulk supply and retail from verified Mercato merchants with certified escrow protection.
                </p>
              </div>

              {/* Desktop Sourcing Mode Tabs */}
              <div
                className={`flex items-center rounded-xl border p-0.5 shrink-0 ${
                  isLight ? "border-slate-200 bg-slate-50" : "border-white/10 bg-white/5"
                }`}
              >
                {[
                  { id: "ALL" as TradeType, label: "All Items", icon: Layers, count: counts.total },
                  { id: "RETAIL" as TradeType, label: "Retail (1 Unit)", icon: ShoppingBag, count: counts.retail },
                  { id: "WHOLESALE" as TradeType, label: "Wholesale (Bulk)", icon: Boxes, count: counts.wholesale },
                ].map((m) => {
                  const isSelected = tradeType === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setTradeType(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : isLight
                            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                            : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <m.icon className="h-3.5 w-3.5" />
                      <span>{m.label}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isLight
                              ? "bg-slate-200 text-slate-700"
                              : "bg-white/10 text-zinc-400"
                        }`}
                      >
                        {m.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div>
              <div
                className={`flex items-center rounded-xl border transition-all overflow-hidden shadow-xs ${
                  isLight
                    ? "bg-white border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/10"
                    : "bg-[#161926] border-white/15 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
                }`}
              >
                <div className={`flex items-center border-r px-2.5 shrink-0 ${isLight ? "border-slate-200" : "border-white/10"}`}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs font-bold outline-none cursor-pointer py-2 text-slate-700 dark:text-zinc-200"
                  >
                    <option value="ALL">All Departments</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search verified products, brands, cargo in Addis..."
                    className="w-full bg-transparent pl-8 sm:pl-9 pr-8 py-2 text-xs sm:text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer touch-manipulation"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 touch-manipulation active:scale-95"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
              </div>

              {/* Trending Tags */}
              <div className="flex items-center gap-1.5 pt-1.5 flex-wrap text-[11px]">
                <span className={`font-semibold shrink-0 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  Trending:
                </span>
                {TRENDING_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setSearchQuery(kw)}
                    className={`px-2 py-0.5 rounded-full border transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                      searchQuery.toLowerCase() === kw.toLowerCase()
                        ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                        : isLight
                          ? "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DEPARTMENT HORIZONTAL CAROUSEL - Desktop Only (Mobile uses the Filter drawer) */}
        <section className="hidden sm:block space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Shop By Department
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCategory("left")}
                className={`p-1 rounded-full border transition-all cursor-pointer touch-manipulation active:scale-90 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                    : "bg-[#14141a] border-white/10 text-zinc-300 hover:text-white"
                }`}
                title="Scroll categories left"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategory("right")}
                className={`p-1 rounded-full border transition-all cursor-pointer touch-manipulation active:scale-90 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                    : "bg-[#14141a] border-white/10 text-zinc-300 hover:text-white"
                }`}
                title="Scroll categories right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth no-scrollbar"
          >
            {/* All Departments */}
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                selectedCategory === "ALL"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : isLight
                    ? "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20"
                    : "bg-[#121218] border-white/10 text-zinc-200 hover:border-white/20 hover:text-white"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedCategory === "ALL"
                    ? "bg-white/20 text-white"
                    : isLight
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-indigo-950/60 text-indigo-400"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <div className="leading-tight text-[11px] sm:text-xs">All Departments</div>
                <div className={`text-[9px] font-normal ${selectedCategory === "ALL" ? "text-white/80" : "text-slate-400"}`}>
                  {getCategoryCount("ALL")} items
                </div>
              </div>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : isLight
                        ? "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20"
                        : "bg-[#121218] border-white/10 text-zinc-200 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : isLight
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-indigo-950/60 text-indigo-400"
                    }`}
                  >
                    {getCategoryIcon(cat.slug)}
                  </div>
                  <div className="text-left">
                    <div className="leading-tight text-[11px] sm:text-xs max-w-[110px] truncate">{cat.name}</div>
                    <div className={`text-[9px] font-normal ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                      {count} items
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* TOOLBAR ROW - Sticky on mobile & desktop, ultra-clean on mobile */}
        <section
          className={`flex items-center justify-between gap-2 rounded-xl border p-2 sm:p-2.5 transition-all sticky top-1 sm:top-2 z-20 backdrop-blur-md ${
            isLight ? "bg-white/95 border-slate-200 shadow-xs" : "bg-[#11131c]/95 border-white/10 shadow-md"
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0 touch-manipulation"
              title="Open Filters"
              aria-label="Open Filters"
            >
              <Menu className="h-3.5 w-3.5" />
              <Filter className="h-3 w-3" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-white text-indigo-600 text-[9px] h-3.5 min-w-3.5 px-1 flex items-center justify-center font-extrabold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                isLight
                  ? "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
                  : "border-white/10 bg-white/5 hover:bg-white/8 text-zinc-300 hover:text-white"
              }`}
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

            {/* Quick Filter Chips (Desktop Only - on mobile, everything is cleanly inside Filters) */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                  minRating === 4
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                }`}
              >
                <Star className={`h-3 w-3 ${minRating === 4 ? "fill-white text-white" : "text-indigo-600"}`} />
                <span>4.0+ Stars</span>
              </button>

              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                  inStockOnly
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                }`}
              >
                <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                <span>In Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setEscrowOnly(!escrowOnly)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                  escrowOnly
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                }`}
              >
                <ShieldCheck className="h-3 w-3 text-indigo-600" />
                <span>Escrow Verified</span>
              </button>

              <button
                type="button"
                onClick={() => setPriceRange(priceRange === "under-5k" ? "ALL" : "under-5k")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                  priceRange === "under-5k"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold"
                    : isLight
                      ? "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                }`}
              >
                <span>&lt; 5k ETB</span>
              </button>
            </div>

            <span className={`text-[11px] sm:text-xs ml-0.5 sm:ml-1 font-medium shrink-0 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              <strong className={isLight ? "text-slate-900" : "text-white"}>{filteredProducts.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 justify-end shrink-0">
            {/* View Mode Switcher */}
            <div
              className={`flex items-center rounded-lg border p-0.5 ${
                isLight ? "border-slate-200 bg-slate-100" : "border-white/8 bg-white/5"
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
                  className={`flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 text-xs font-semibold transition-all cursor-pointer touch-manipulation active:scale-95 ${
                    viewMode === v.mode
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : isLight
                        ? "text-slate-600 hover:text-slate-900"
                        : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <v.Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`rounded-lg border px-2 py-1 text-[11px] sm:text-xs font-semibold outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 cursor-pointer transition-all touch-manipulation ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800 shadow-xs"
                    : "border-white/10 bg-[#161926] text-zinc-200"
                }`}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </section>

        {/* ACTIVE FILTER CHIPS ROW */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
            <span className={`font-semibold flex items-center gap-1 text-[11px] ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
              <Filter className="h-3 w-3" /> Filters:
            </span>

            {tradeType !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                {tradeType === "WHOLESALE" ? "Wholesale" : "Retail"}
                <button type="button" onClick={() => setTradeType("ALL")} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button type="button" onClick={() => setSelectedCategory("ALL")} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                &ldquo;{searchQuery}&rdquo;
                <button type="button" onClick={() => setSearchQuery("")} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceRange !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                {priceRange === "custom" ? `${customMinPrice || 0} - ${customMaxPrice || "Max"} ETB` : priceRange}
                <button type="button" onClick={() => setPriceRange("ALL")} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                In Stock
                <button type="button" onClick={() => setInStockOnly(false)} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {escrowOnly && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                Verified
                <button type="button" onClick={() => setEscrowOnly(false)} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                {minRating}★+
                <button type="button" onClick={() => setMinRating(0)} className="hover:opacity-70 cursor-pointer touch-manipulation">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[10px] font-bold ml-1 text-indigo-600 hover:underline cursor-pointer touch-manipulation"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* MAIN BODY: SIDEBAR + PRODUCT GRID */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* DESKTOP FILTER SIDEBAR - Compact & Minimized Width */}
          {!isSidebarCollapsed && (
            <aside
              className={`hidden lg:block w-48 xl:w-52 shrink-0 rounded-xl border sticky top-16 overflow-hidden transition-all duration-200 ${
                isLight
                  ? "bg-white border-slate-200 shadow-xs text-slate-900"
                  : "bg-[#11131c] border-white/10 shadow-md text-white"
              }`}
            >
              <div className="h-1 w-full bg-indigo-600" />

              <div className="p-2.5 xl:p-3 space-y-2.5 xl:space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-bold tracking-tight">Filters</h3>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer touch-manipulation"
                    >
                      Reset ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Escrow Guarantee Section */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Service &amp; Guarantee
                  </span>
                  <div className="space-y-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={escrowOnly}
                        onChange={(e) => setEscrowOnly(e.target.checked)}
                        className="rounded h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1 text-[11px] font-medium leading-tight">
                        <ShieldCheck className="h-3 w-3 text-indigo-600 shrink-0" />
                        <span className="truncate">Escrow Protected</span>
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="flex items-center gap-1 text-[11px] font-medium leading-tight">
                        <Truck className="h-3 w-3 text-indigo-600 shrink-0" />
                        <span className="truncate">Addis Express</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Sourcing / Trade Sector */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Sourcing Type
                  </span>
                  <div className="space-y-0.5 text-xs">
                    {[
                      { id: "ALL" as TradeType, label: "All Items", count: counts.total },
                      { id: "RETAIL" as TradeType, label: "Retail (1 Unit)", count: counts.retail },
                      { id: "WHOLESALE" as TradeType, label: "Wholesale (Bulk)", count: counts.wholesale },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTradeType(t.id)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          tradeType === t.id
                            ? "bg-indigo-600 text-white font-bold shadow-xs"
                            : isLight
                              ? "text-slate-700 hover:bg-slate-100"
                              : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{t.label}</span>
                        <span className="font-mono text-[9px] opacity-75 ml-1">{t.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Departments */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Departments
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                      selectedCategory === "ALL"
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : isLight
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    <span>All Departments</span>
                    <span className="font-mono text-[9px] opacity-75">{getCategoryCount("ALL")}</span>
                  </button>

                  <div className="space-y-0.5 max-h-40 overflow-y-auto no-scrollbar">
                    {sidebarCategories.map((c) => {
                      const isSel = selectedCategory === c.slug;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCategory(c.slug)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                            isSel
                              ? "bg-indigo-600 text-white font-bold shadow-xs"
                              : isLight
                                ? "text-slate-700 hover:bg-slate-100"
                                : "text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate pr-1 text-left">{c.name}</span>
                          <span className="font-mono text-[9px] opacity-75 shrink-0">
                            {getCategoryCount(c.slug)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Price Range (ETB)
                  </span>

                  <div className="space-y-0.5 text-xs">
                    {[
                      { label: "All Prices", value: "ALL" },
                      { label: "< 5,000 ETB", value: "under-5k" },
                      { label: "5k - 20k ETB", value: "5k-20k" },
                      { label: "20k - 60k ETB", value: "20k-60k" },
                      { label: "> 60,000 ETB", value: "over-60k" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriceRange(p.value)}
                        className={`w-full text-left px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          priceRange === p.value
                            ? "bg-indigo-600 text-white font-bold shadow-xs"
                            : isLight
                              ? "text-slate-700 hover:bg-slate-100"
                              : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Min / Max Price Inputs */}
                  <form onSubmit={applyCustomPrice} className="pt-1 flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={customMinPrice}
                      onChange={(e) => setCustomMinPrice(e.target.value)}
                      className={`w-full rounded-md border px-1.5 py-0.5 text-[11px] outline-none focus:border-indigo-600 ${
                        isLight ? "border-slate-300 bg-white" : "border-white/15 bg-white/5"
                      }`}
                    />
                    <span className="text-slate-400 text-[10px]">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={customMaxPrice}
                      onChange={(e) => setCustomMaxPrice(e.target.value)}
                      className={`w-full rounded-md border px-1.5 py-0.5 text-[11px] outline-none focus:border-indigo-600 ${
                        isLight ? "border-slate-300 bg-white" : "border-white/15 bg-white/5"
                      }`}
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-700 cursor-pointer shrink-0 touch-manipulation"
                    >
                      Go
                    </button>
                  </form>
                </div>

                {/* Customer Reviews Rating Filter */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                    Customer Reviews
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { rating: 4, label: "4.0+" },
                      { rating: 3, label: "3.0+" },
                      { rating: 0, label: "Any" },
                    ].map((r) => (
                      <button
                        key={r.rating}
                        type="button"
                        onClick={() => setMinRating(r.rating)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer touch-manipulation active:scale-95 ${
                          minRating === r.rating
                            ? "bg-indigo-600 text-white font-bold shadow-xs"
                            : isLight
                              ? "text-slate-600 hover:bg-slate-50"
                              : "text-zinc-400 hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  minRating === r.rating
                                    ? "fill-white text-white"
                                    : i < (r.rating || 5)
                                      ? "fill-indigo-600 text-indigo-600"
                                      : "text-slate-300 dark:text-zinc-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px]">{r.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* PRODUCT GRID SECTION - Optimized for compact density */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div
                className={`grid gap-2 sm:gap-2.5 lg:gap-3 ${
                  isSidebarCollapsed
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                }`}
              >
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-64 sm:h-72 rounded-xl border animate-pulse space-y-2 p-2.5 ${
                      isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/8"
                    }`}
                  >
                    <div className={`w-full aspect-square rounded-lg ${isLight ? "bg-slate-200" : "bg-white/8"}`} />
                    <div className={`h-3 w-1/3 rounded-full ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                    <div className={`h-3.5 w-4/5 rounded-full ${isLight ? "bg-slate-200" : "bg-white/8"}`} />
                    <div className={`h-3 w-1/2 rounded-full ${isLight ? "bg-slate-200" : "bg-white/6"}`} />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <div
                  className={`grid gap-2 sm:gap-2.5 lg:gap-3 ${
                    isSidebarCollapsed
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                      tradeView={tradeType}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:gap-2.5 w-full">
                  {filteredProducts.map((product) => (
                    <HorizontalProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                      tradeView={tradeType}
                    />
                  ))}
                </div>
              )
            ) : (
              /* CLEAN EMPTY STATE */
              <div
                className={`rounded-3xl border border-dashed p-12 text-center space-y-4 ${
                  isLight ? "bg-white border-slate-300" : "bg-[#11131c] border-white/10"
                }`}
              >
                <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <Layers className="h-7 w-7" />
                </div>

                <h3 className="text-lg font-bold">
                  {tradeType === "WHOLESALE"
                    ? "No wholesale bulk items matched"
                    : tradeType === "RETAIL"
                      ? "No retail items found"
                      : "No matching products found"}
                </h3>

                <p className={`text-xs max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {searchQuery
                    ? `No products matched "${searchQuery}". Try a different keyword or reset filters.`
                    : "No products matched the selected filters. Please reset active filters."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTradeType("ALL")}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                  >
                    View All Products
                  </button>

                  <button
                    type="button"
                    onClick={refreshMarketplace}
                    className="rounded-xl border border-slate-300 dark:border-white/20 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Refresh Catalog
                  </button>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl border border-slate-300 dark:border-white/20 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer text-indigo-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM BUYER PROTECTION STRIP - Desktop Only (Hidden on mobile to eliminate text clutter) */}
        <section
          className={`hidden sm:block rounded-2xl border p-3.5 sm:p-4.5 transition-all ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : "bg-[#11131c] border-white/10"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-5">
            <div className="space-y-0.5 max-w-md">
              <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Guaranteed Buyer Protection
              </span>
              <h4 className="text-sm sm:text-base font-extrabold tracking-tight">
                How MercatoX Escrow Protection Works
              </h4>
              <p className={`text-[11px] sm:text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                Your payment remains securely protected in certified escrow until you inspect your items and submit your OTP.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-1">
              {[
                { step: "01", title: "Select Item", desc: "Retail or wholesale" },
                { step: "02", title: "Escrow Deposit", desc: "CBE or Telebirr" },
                { step: "03", title: "Door Arrival", desc: "Fast Addis dispatch" },
                { step: "04", title: "OTP Handover", desc: "Inspect & release code" },
              ].map((s) => (
                <div key={s.step} className="space-y-0.5 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    STEP {s.step}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold leading-tight">{s.title}</div>
                  <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* MOBILE FILTER DRAWER - Optimized for Instant Response Time */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-start bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-[85%] max-w-xs sm:max-w-sm h-full border-r p-3.5 sm:p-4 overflow-y-auto space-y-3.5 shadow-2xl relative animate-in slide-in-from-left duration-200 flex flex-col justify-between ${
              isLight
                ? "bg-white text-slate-900 border-slate-200"
                : "bg-[#09090b] text-white border-white/10"
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />

            <div className="space-y-3.5">
              {/* Header: Filters Title + Close Icon (X) */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <Menu className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-xs font-bold flex items-center gap-1.5">
                    <span>Filters &amp; Sourcing</span>
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-indigo-600 text-white text-[9px] h-3.5 min-w-3.5 px-1 flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  title="Close"
                  aria-label="Close"
                  className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors touch-manipulation active:scale-90 ${
                    isLight
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      : "bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sourcing / Trade Sector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Trade Sector
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "ALL" as TradeType, label: "All Items", count: counts.total },
                    { id: "RETAIL" as TradeType, label: "Retail", count: counts.retail },
                    { id: "WHOLESALE" as TradeType, label: "Wholesale", count: counts.wholesale },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTradeType(t.id)}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all touch-manipulation active:scale-95 ${
                        tradeType === t.id
                          ? "bg-indigo-600 text-white shadow-xs font-bold"
                          : isLight
                            ? "bg-slate-50 border border-slate-200 text-slate-700"
                            : "bg-white/5 border border-white/8 text-zinc-300"
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="font-mono text-[9px] opacity-75">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service & Guarantee */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Service &amp; Guarantee
                </span>
                <label className="flex items-center justify-between text-xs cursor-pointer select-none py-0.5">
                  <span className="flex items-center gap-1.5 font-medium text-[11px]">
                    <ShieldCheck className="h-3 w-3 text-indigo-600" />
                    <span>Escrow Protected</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={escrowOnly}
                    onChange={(e) => setEscrowOnly(e.target.checked)}
                    className="rounded h-3.5 w-3.5 text-indigo-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer select-none py-0.5">
                  <span className="flex items-center gap-1.5 font-medium text-[11px]">
                    <Truck className="h-3 w-3 text-indigo-600" />
                    <span>Addis Express Dispatch</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded h-3.5 w-3.5 text-indigo-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Departments */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Departments
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`w-full text-left p-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all touch-manipulation active:scale-95 ${
                    selectedCategory === "ALL"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  All Departments ({getCategoryCount("ALL")})
                </button>
                <div className="space-y-0.5 max-h-36 overflow-y-auto no-scrollbar">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all touch-manipulation active:scale-95 ${
                        selectedCategory === c.slug
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate pr-1">{c.name}</span>
                      <span className="font-mono text-[9px] opacity-75 shrink-0">({getCategoryCount(c.slug)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Price Range (ETB)
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "All Prices", value: "ALL" },
                    { label: "< 5,000 ETB", value: "under-5k" },
                    { label: "5k - 20k ETB", value: "5k-20k" },
                    { label: "20k - 60k ETB", value: "20k-60k" },
                    { label: "> 60,000 ETB", value: "over-60k" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriceRange(p.value)}
                      className={`text-left px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer transition-all touch-manipulation active:scale-95 ${
                        priceRange === p.value
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Min / Max Price Inputs */}
                <form onSubmit={applyCustomPrice} className="pt-1 flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={customMinPrice}
                    onChange={(e) => setCustomMinPrice(e.target.value)}
                    className={`w-full rounded-md border px-1.5 py-0.5 text-[11px] outline-none focus:border-indigo-600 ${
                      isLight ? "border-slate-300 bg-white" : "border-white/15 bg-white/5"
                    }`}
                  />
                  <span className="text-slate-400 text-[10px]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={customMaxPrice}
                    onChange={(e) => setCustomMaxPrice(e.target.value)}
                    className={`w-full rounded-md border px-1.5 py-0.5 text-[11px] outline-none focus:border-indigo-600 ${
                      isLight ? "border-slate-300 bg-white" : "border-white/15 bg-white/5"
                    }`}
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-indigo-700 cursor-pointer shrink-0 touch-manipulation"
                  >
                    Go
                  </button>
                </form>
              </div>

              {/* Customer Reviews Rating */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Reviews
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { rating: 4, label: "4.0+" },
                    { rating: 3, label: "3.0+" },
                    { rating: 0, label: "Any" },
                  ].map((r) => (
                    <button
                      key={r.rating}
                      type="button"
                      onClick={() => setMinRating(r.rating)}
                      className={`flex-1 flex items-center justify-center gap-1 p-1 rounded-md text-[10px] font-medium transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        minRating === r.rating
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : isLight
                            ? "border border-slate-200 text-slate-700"
                            : "border border-white/10 text-zinc-300"
                      }`}
                    >
                      <Star className={`h-2.5 w-2.5 ${minRating === r.rating ? "fill-white text-white" : "text-indigo-600"}`} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Action Bar with Instant Live Product Count */}
            <div className="sticky bottom-0 -mx-3.5 -mb-3.5 sm:-mx-4 sm:-mb-4 p-2.5 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-t border-slate-100 dark:border-white/10 flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  clearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer touch-manipulation active:scale-95 shrink-0"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md cursor-pointer hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <span>Apply Filters</span>
                <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">({filteredProducts.length})</span>
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
