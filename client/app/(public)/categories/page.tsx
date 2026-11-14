"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  X,
  Package,
  Loader2,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
  Sparkles,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { Product, CategoryItem } from "@/constants/mock-data";
import { fetchCategories, fetchAllProducts } from "@/lib/api/catalog";
import { CategoryCard } from "@/components/categories/category-card";

function CategoriesContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [cats, prodsResult] = await Promise.all([
          fetchCategories(),
          fetchAllProducts({ limit: 100 }),
        ]);
        if (isMounted) {
          setCategories(cats);
          setProducts(prodsResult.products);
        }
      } catch (e: any) {
        console.warn("Categories page data waiting for backend:", e?.message || e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCatCount = (category: CategoryItem) => {
    return products.filter((p) => {
      if (
        p.categorySlug &&
        category.slug &&
        p.categorySlug.toLowerCase() === category.slug.toLowerCase()
      ) {
        return true;
      }
      if (
        category.name &&
        p.category &&
        p.category.toLowerCase() === category.name.toLowerCase()
      ) {
        return true;
      }
      if (
        category.slug &&
        p.category &&
        p.category.toLowerCase() === category.slug.toLowerCase()
      ) {
        return true;
      }
      return false;
    }).length;
  };

  // Only display categories that have at least 1 product
  const categoriesWithProducts = useMemo(() => {
    return categories.filter((cat) => getCatCount(cat) > 0);
  }, [categories, products]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    const list = categoriesWithProducts;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.subcategories?.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categoriesWithProducts, searchQuery]);

  return (
    <div className="relative min-h-screen flex flex-col bg-app text-app transition-colors duration-200 overflow-x-clip">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* Top Header & Breadcrumb (ZiiMarket Style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-app-muted">
              <Link href="/" className="hover:text-app transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-app-muted/60" />
              <span className="text-app font-semibold">Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-app">
                Shop by Department & Category
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {categoriesWithProducts.length} Departments
              </span>
            </div>
            <p className="text-xs text-app-muted">
              Select any verified department to view live products and wholesale catalogs
            </p>
          </div>

          {/* Search bar with quick clear */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-app-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by department name..."
              className="w-full rounded-xl border border-app bg-app-card py-2.5 pl-9 pr-8 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-3 text-app-muted hover:text-app cursor-pointer"
                title="Clear Search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Value & Trust Features Strip (ZiiMarket Style) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Fast Delivery</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Addis Ababa & Regional</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">100% Authentic</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Vetted Merchant Sourcing</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Local Payments</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Telebirr, CBE, Chapa</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Escrow Protected</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">4-Digit Handover OTP</p>
            </div>
          </div>
        </section>

        {/* Categories Grid (ZiiMarket Style with 2x2 Quad, Zoom & Shimmer) */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8 gap-3 text-app-muted">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <span className="text-xs font-medium">
                Loading verified departments...
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl sm:rounded-3xl border border-app bg-app-card overflow-hidden animate-pulse flex flex-col justify-between shadow-xs"
                >
                  <div className="w-full aspect-[13/14] bg-slate-200/60 dark:bg-white/5 border-b border-app" />
                  <div className="px-3.5 py-3.5 sm:py-4 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200/80 dark:bg-white/10 rounded-md" />
                    <div className="h-3 w-1/2 bg-slate-200/50 dark:bg-white/5 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                itemCount={getCatCount(category)}
                products={products}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-app bg-app-card p-12 text-center space-y-3 shadow-xs">
            <Package className="h-10 w-10 text-app-muted/40 mx-auto" />
            <h3 className="text-sm font-semibold text-app">
              {searchQuery.trim()
                ? "No departments found"
                : "No departments with products available"}
            </h3>
            <p className="text-xs text-app-muted max-w-sm mx-auto">
              {searchQuery.trim()
                ? `We couldn't find any departments matching "${searchQuery}".`
                : "There are currently no departments with listed products. Check back soon!"}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer shadow-md"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-app flex items-center justify-center text-app-muted">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs">Loading categories...</span>
          </div>
        </div>
      }
    >
      <CategoriesContent />
    </React.Suspense>
  );
}
