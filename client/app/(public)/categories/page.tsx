"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  X,
  Package,
  Loader2,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { Product, CategoryItem } from "@/constants/mock-data";
import { fetchCategories, fetchProducts } from "@/lib/api/catalog";
import {
  CURATED_HOME_CATEGORIES,
  getCuratedHomeSections,
  getQuadProductsForCategory,
} from "@/constants/curated-home-data";

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
          fetchProducts({ limit: 50 }),
        ]);
        if (isMounted) {
          const loadedCats = cats && cats.length > 0 ? cats : CURATED_HOME_CATEGORIES;
          setCategories(loadedCats);
          setProducts(prodsResult.products);
        }
      } catch (e) {
        console.error("Failed to load categories page data:", e);
        if (isMounted) {
          setCategories(CURATED_HOME_CATEGORIES);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    const list = categories.length > 0 ? categories : CURATED_HOME_CATEGORIES;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.subcategories?.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const curatedSections = useMemo(() => {
    return getCuratedHomeSections(products);
  }, [products]);

  // Helper to retrieve up to 4 distinct products strictly belonging to this category.
  const getQuadProducts = (catSlug: string): (Product | null)[] => {
    try {
      const curated = getQuadProductsForCategory(catSlug, curatedSections, products);
      if (curated && curated.some((p) => p !== null)) {
        return curated;
      }
    } catch {
      // ignore
    }
    const matching = products.filter((p) => p.categorySlug === catSlug);
    return [
      matching[0] || null,
      matching[1] || null,
      matching[2] || null,
      matching[3] || null,
    ];
  };

  const getCatCount = (category: CategoryItem) => {
    const matching = products.filter((p) => p.categorySlug === category.slug).length;
    if (matching > 0) return matching;
    return category.itemCount || 6;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-app text-app transition-colors duration-200 overflow-x-clip">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-app-muted">
              <Link href="/" className="hover:text-app transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-app font-semibold">Categories</span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-app">
              Shop by Category
            </h1>
            <p className="text-xs text-app-muted mt-0.5">
              Select any department to view all verified products in the marketplace
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-app-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category..."
              className="w-full rounded-lg border border-app bg-app-card py-2 pl-9 pr-8 text-xs text-app placeholder:text-app-muted/60 outline-none focus:border-app-hover transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-app-muted hover:text-app cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8 gap-3 text-app-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs font-medium">
                Loading categories...
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-app bg-app-card overflow-hidden animate-pulse flex flex-col justify-between shadow-xs"
                >
                  <div className="w-full aspect-square bg-black/5 dark:bg-white/5 border-b border-app" />
                  <div className="p-2 sm:p-2.5 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-black/10 dark:bg-white/10 rounded" />
                    <div className="h-2.5 w-1/2 bg-black/5 dark:bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
            {filteredCategories.map((category) => {
              const quadProducts = getQuadProducts(category.slug);
              const count = getCatCount(category);

              return (
                <Link
                  key={category.id}
                  href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                  className="group relative flex flex-col justify-between rounded-xl border border-app bg-app-card hover:border-app-hover hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer shadow-xs"
                >
                  {/* 2x2 Quad of 4 Distinct Slots - Starts Flush from the Card Outer Edges */}
                  <div className="grid grid-cols-2 gap-0 w-full aspect-square overflow-hidden bg-black/5 dark:bg-black/40 border-b border-app">
                    {quadProducts.map((prod, idx) => (
                      <div
                        key={`${category.id}-slot-${idx}`}
                        className="relative aspect-square w-full overflow-hidden bg-black/5 dark:bg-white/[0.02] border-b border-r border-app/40 [&:nth-child(2n)]:border-r-0 [&:nth-child(n+3)]:border-b-0"
                      >
                        {prod ? (
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="h-full w-full object-cover object-center group-hover:scale-106 transition-transform duration-300 ease-out"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.015]">
                            <Package className="h-3.5 w-3.5 text-app-muted/20 stroke-[1.2]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Title & Count Underneath Flush Image Grid */}
                  <div className="p-2 sm:p-2.5 flex items-center justify-between gap-1 bg-app-card">
                    <div className="min-w-0">
                      <h3 className="text-[11.5px] sm:text-xs font-semibold text-app group-hover:text-primary transition-colors truncate leading-tight">
                        {category.name}
                      </h3>
                      <p className="text-[10px] text-app-muted mt-0.5 truncate">
                        {count}+ items
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-app-muted/40 group-hover:text-app group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-app bg-app-card p-12 text-center space-y-3 shadow-xs">
            <Package className="h-10 w-10 text-app-muted/40 mx-auto" />
            <h3 className="text-sm font-semibold text-app">No categories found</h3>
            <p className="text-xs text-app-muted max-w-sm mx-auto">
              We couldn&apos;t find any departments matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="rounded-lg bg-app text-app-card px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              Clear Search
            </button>
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
