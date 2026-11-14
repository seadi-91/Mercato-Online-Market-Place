"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronLeft,
  Package,
  ArrowRight,
  Baby,
  Sparkles,
  Shirt,
  Laptop,
  Wheat,
  Home,
  Smartphone,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/products/product-card";
import { QuickViewModal } from "@/components/products/quick-view-modal";
import { CategoryCard } from "@/components/categories/category-card";
import { useRouter } from "next/navigation";
import { MercatoXCardPromo } from "@/components/home/mercatox-card-promo";
import type { Product, CategoryItem } from "@/constants/mock-data";

interface HomeProductSection {
  id: string;
  categorySlug: string;
  order: number;
  title: string;
  viewAllLink: string;
  products: Product[];
}

interface HomePageClientProps {
  initialProducts: Product[];
  initialCategories: CategoryItem[];
}

interface HorizontalProductRowProps {
  section: HomeProductSection;
  onQuickView?: (product: Product) => void;
}

// Explicitly excluded from the home page per user request:
const EXCLUDED_HOME_SLUGS = new Set([
  "construction-industrial-materials",
  "grains-cereals-groceries",
  "grains-cereals-teff",
  "packaging-logistics",
]);

// Allowed categories on the home page: Agriculture, Kids/Children, Cosmetics, Electronics, Home & Kitchen
function isAllowedHomeCategory(slug: string): boolean {
  const s = slug.toLowerCase();
  if (EXCLUDED_HOME_SLUGS.has(s)) return false;
  return (
    s.includes("agri") ||
    s.includes("kid") ||
    s.includes("baby") ||
    s.includes("children") ||
    s.includes("cosmetic") ||
    s.includes("electronic") ||
    s.includes("smartphone") ||
    s.includes("mobile") ||
    s.includes("home-kitchen")
  );
}

function getHomeCategoryPriority(slug: string): number {
  const s = slug.toLowerCase();
  if (s.includes("agri")) return 1;
  if (s.includes("kid") || s.includes("baby") || s.includes("children")) return 2;
  if (s.includes("cosmetic")) return 3;
  if (s.includes("electronic")) return 4;
  if (s.includes("smartphone") || s.includes("mobile")) return 5;
  if (s.includes("home-kitchen")) return 6;
  return 99;
}

function HorizontalProductRow({ section }: HorizontalProductRowProps) {
  const router = useRouter();
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(section.products.length > 4);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const container = rowRef.current;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    "agricultural-commodities": <Wheat className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
    "kids-children": <Baby className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
    "cosmetics-skincare": <Sparkles className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
    "computers-electronics": <Laptop className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
    "smartphones-mobile": <Smartphone className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
    "home-kitchen-appliances": <Home className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
  };

  return (
    <div className="space-y-3">
      {/* Row Header (ZiiMarket Style) */}
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-800 text-[10px] font-black text-white shrink-0 shadow-xs">
              {section.order}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              {categoryIcons[section.categorySlug] || (
                <Package className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              )}
              <h3 className="text-sm sm:text-base md:text-lg font-bold truncate text-foreground tracking-tight">
                {section.title}
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground hidden sm:inline">
              {section.products.length} items
            </span>
          </div>
        </div>

        {/* Action & Smooth Scroll Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={section.viewAllLink}
            className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white flex items-center gap-0.5 mr-1 transition-colors hover:underline"
          >
            <span>See All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={`h-7 w-7 rounded-full border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#11131c] flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              canScrollLeft
                ? "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
                : "opacity-30 cursor-not-allowed text-slate-400"
            }`}
            title="Scroll Left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={`h-7 w-7 rounded-full border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#11131c] flex items-center justify-center transition-all cursor-pointer shadow-xs ${
              canScrollRight
                ? "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
                : "opacity-30 cursor-not-allowed text-slate-400"
            }`}
            title="Scroll Right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-2.5 sm:gap-3 scroll-smooth no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {section.products.map((product) => (
          <div
            key={product.id}
            className="w-[136px] xs:w-[150px] sm:w-[165px] md:w-[180px] lg:w-[195px] shrink-0 snap-start h-full"
          >
            <ProductCard
              product={product}
              onClick={(p) => router.push(`/products/${p.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePageClient({
  initialProducts,
  initialCategories,
}: HomePageClientProps) {
  const router = useRouter();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products for the home page sections (strictly exclude products from excluded categories)
  const homeProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const slug = (product.categorySlug || "").toLowerCase();
      if (EXCLUDED_HOME_SLUGS.has(slug)) return false;
      return isAllowedHomeCategory(slug);
    });
  }, [initialProducts]);

  const getCatCount = (category: CategoryItem | string) => {
    const slug = typeof category === "string" ? category : category.slug;
    const name = typeof category === "object" ? category.name : undefined;
    return initialProducts.filter((p) => {
      if (
        p.categorySlug &&
        slug &&
        p.categorySlug.toLowerCase() === slug.toLowerCase()
      ) {
        return true;
      }
      if (
        name &&
        p.category &&
        p.category.toLowerCase() === name.toLowerCase()
      ) {
        return true;
      }
      if (
        p.category &&
        slug &&
        p.category.toLowerCase() === slug.toLowerCase()
      ) {
        return true;
      }
      return false;
    }).length;
  };

  // ONLY active categories with at least 1 product displayed in "Shop by Department" (no empty categories)
  const departments = useMemo(
    () =>
      initialCategories
        .filter((category) => category.isActive !== false)
        .filter((category) => getCatCount(category) > 0),
    [initialCategories, initialProducts],
  );

  // Allowed categories for the product sections, sorted by priority and capped at maximum 5
  const productSectionCategories = useMemo(() => {
    return initialCategories
      .filter((category) => category.isActive !== false && isAllowedHomeCategory(category.slug))
      .sort((a, b) => getHomeCategoryPriority(a.slug) - getHomeCategoryPriority(b.slug))
      .slice(0, 5); // Capped at 5 sections as requested
  }, [initialCategories]);

  // Curated product sections for the home page, capped at 5
  const curatedSections = useMemo(() => {
    return productSectionCategories
      .map((category, index): HomeProductSection => ({
        id: category.id,
        categorySlug: category.slug,
        order: index + 1,
        title: category.name,
        viewAllLink: `/marketplace?category=${encodeURIComponent(category.slug)}`,
        products: homeProducts.filter(
          (product) => product.categorySlug === category.slug,
        ),
      }))
      .filter((section) => section.products.length > 0)
      .slice(0, 5);
  }, [productSectionCategories, homeProducts]);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-app text-app transition-colors duration-200 overflow-x-hidden">
      {/* Customer Header - Overlay transparent at top, solid on scroll */}
      <CustomerHeader transparentOverlay={true} />

      <main className="flex-1 pb-20 sm:pb-14">
        {/* Fullscreen Hero Section - exactly 100vh / 100dvh on all OS and browsers */}
        <section
          className="w-full h-screen min-h-screen h-[100vh] min-h-[100vh] sm:h-[100dvh] sm:min-h-[100dvh] overflow-hidden"
          style={{ height: "100dvh", minHeight: "100vh" }}
        >
          <HeroCarousel products={homeProducts} />
        </section>

        <div className="space-y-7 sm:space-y-10 pt-5 sm:pt-8">
          {/* Value & Trust Features Strip (ZiiMarket Style) */}
          <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-200">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Fast Delivery</h4>
                    <span className="hidden sm:inline-block rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Express</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Across Addis Ababa & beyond</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-200">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">100% Authentic</h4>
                    <span className="hidden sm:inline-block rounded-md bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Verified</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Direct from vetted suppliers</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-200">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Local Payments</h4>
                    <span className="hidden sm:inline-block rounded-md bg-cyan-100 dark:bg-cyan-900/50 px-1.5 py-0.2 text-[9px] font-bold text-cyan-700 dark:text-cyan-300">Telebirr</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Telebirr, CBE & Cards</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#11131c]/80 backdrop-blur-sm p-2.5 sm:p-3.5 shadow-xs hover:shadow-md transition-all duration-200">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Dedicated Support</h4>
                    <span className="hidden sm:inline-block rounded-md bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:text-purple-300">24/7</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">Escrow & buyer guarantee</p>
                </div>
              </div>
            </div>
          </section>

          {/* Departments are loaded from active backend categories (ZiiMarket Category Card Style) */}
          <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground">
                  Shop by Department
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Explore top categories and direct marketplace departments
                </p>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:underline transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {departments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {departments.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    itemCount={getCatCount(category)}
                    products={initialProducts}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-app bg-app-card p-6 text-center text-sm text-app-muted">
                No departments with products are available right now.
              </p>
            )}
          </section>

          {/* Live products grouped by backend category (ZiiMarket Style) */}
          <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
            {/* Section Toolbar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-foreground">
                  Latest Products & Department Feeds
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Fresh arrivals, top sellers, and authentic products updated daily
                </p>
              </div>

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <span>Explore All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-6 sm:space-y-8 w-full">
              {curatedSections.length > 0 ? (
                curatedSections.map((section) => (
                  <HorizontalProductRow
                    key={section.id}
                    section={section}
                  />
                ))
              ) : (
                <p className="rounded-xl border border-app bg-app-card p-6 text-center text-sm text-app-muted">
                  No products are available right now.
                </p>
              )}
            </div>

            {/* Explore Link */}
            <div className="pt-2 flex justify-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#11131c] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Explore Marketplace Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Bottom Nav */}
      <CustomerBottomNav />

      {/* MercatoX Loyalty & Cashback Card Promo Section */}
      <MercatoXCardPromo />

      {/* Footer */}
      <CustomerFooter />
    </div>
  );
}
