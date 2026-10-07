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
  MoveRight,
  Sparkles,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { ProductCard } from "@/components/products/product-card";
import { HorizontalProductCard } from "@/components/products/horizontal-product-card";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import { Product, CategoryItem } from "@/constants/mock-data";
import { fetchProducts, fetchCategories } from "@/lib/api/catalog";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/store";
import { toast } from "sonner";

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

  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "ALL";
  const initialZone = searchParams.get("zone") || "ALL";

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(initialProducts.length === 0);

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
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // Sync products if initialProducts were empty or if re-fetching
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

  // Sync url param if changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== selectedCategory) setSelectedCategory(cat);
    const z = searchParams.get("zone");
    if (z && z !== selectedZone) setSelectedZone(z);
    const q = searchParams.get("q");
    if (q && q !== searchQuery) setSearchQuery(q);
  }, [searchParams]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      shopName: product.shopName,
      marketZone: product.marketZone,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
    });
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    toast.success("Added to cart", {
      description: `${product.name} (1 unit) added.`,
    });
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
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
        return <Coffee className="h-3.5 w-3.5" />;
      case "cosmetics-skincare":
        return <Sparkles className="h-3.5 w-3.5" />;
      default:
        return <Layers className="h-3.5 w-3.5" />;
    }
  };

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shopName.toLowerCase().includes(q) ||
          p.marketZone.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
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

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (escrowOnly) {
      result = result.filter((p) => p.isVerifiedSeller || p.badge === "Escrow Verified");
    }

    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    priceRange,
    inStockOnly,
    escrowOnly,
    minRating,
    sortBy,
  ]);

  const clearFilters = () => {
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
    (selectedCategory !== "ALL" ? 1 : 0) +
    (priceRange !== "ALL" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (escrowOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const getCategoryCount = (slug: string) => {
    if (slug === "ALL") return products.length;
    return products.filter((p) => p.categorySlug === slug).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 pb-24 sm:pb-12">
        {/* Marketplace Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300">
                Live Database Catalog
              </span>
              <span className="text-xs text-zinc-400">
                {filteredProducts.length} verified items
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Ethiopian Protected Marketplace
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse authentic products direct from verified commercial suppliers in Addis Ababa
            </p>
          </div>

          {/* Quick Search in Banner */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, category..."
              className="w-full rounded-xl border border-white/10 bg-[#0d1222] pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Category Chips on Mobile, Toggle Sidebar, Sort, View Modes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1222]/80 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-white/10 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-500 text-white text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Show Filters Sidebar" : "Minimize Filters Sidebar"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Show Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Hide Sidebar</span>
                </>
              )}
            </button>

            {/* View Mode Switcher: Grid vs Normal View */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 ml-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white shadow-sm"
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
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Compact</span>
              </button>
            </div>

            {/* Total count indicator */}
            <span className="text-xs text-zinc-400 hidden xl:inline ml-2">
              Showing <strong className="text-white">{filteredProducts.length}</strong> items
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-white/10 bg-[#090e1c] px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer"
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
            <span className="text-zinc-500 font-medium">Applied Filters:</span>

            {selectedCategory !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-indigo-300 text-[11px]">
                <span>
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceRange !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-indigo-300 text-[11px]">
                <span>{priceRange}</span>
                <button
                  type="button"
                  onClick={() => setPriceRange("ALL")}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 text-[11px]">
                <span>In Stock Only</span>
                <button
                  type="button"
                  onClick={() => setInStockOnly(false)}
                  className="hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-zinc-400 hover:text-white underline cursor-pointer text-[11px] ml-1"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Main Layout: Desktop Sidebar + Product Display */}
        <div className="flex items-start gap-5">
          {/* Sidebar (Desktop) */}
          {!isSidebarCollapsed && (
            <aside className="hidden lg:block w-56 xl:w-60 shrink-0 rounded-2xl border border-white/10 bg-[#0d1222]/95 p-3.5 backdrop-blur-xl shadow-xl space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white">Categories</h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Categories Section */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === "ALL"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Layers className="h-3 w-3 shrink-0" />
                    <span className="truncate">All Items</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono ml-1 shrink-0">
                    {products.length}
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
                          ? "bg-indigo-600 text-white shadow-sm font-bold"
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
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Price (ETB)
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
                      className={`w-full text-left px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        priceRange === p.value
                          ? "bg-white/10 text-white font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-3 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0"
                  />
                  <span>In Stock Only</span>
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
                    className="h-72 rounded-2xl border border-white/10 bg-[#0d1222]/80 p-3 animate-pulse space-y-2.5"
                  >
                    <div className="w-full aspect-square bg-white/5 rounded-xl" />
                    <div className="h-3 w-1/3 bg-white/10 rounded" />
                    <div className="h-4 w-4/5 bg-white/15 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                /* Grid View: 5 columns within sidebar, 6 columns without sidebar on desktop */
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
                    />
                  ))}
                </div>
              ) : (
                /* Compact View: Display in one column horizontally */
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
                  {filteredProducts.map((product) => (
                    <HorizontalProductCard
                      key={product.id}
                      product={product}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0d1222]/60 p-12 text-center space-y-3">
                <Layers className="h-10 w-10 text-zinc-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No products found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  No items matched your current filters. Try resetting filters or searching another keyword.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

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
