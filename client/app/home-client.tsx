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
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCard } from "@/components/products/product-card";
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
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
  onQuickView: (product: Product) => void;
}

function HorizontalProductRow({ section, onQuickView }: HorizontalProductRowProps) {
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
    const scrollAmount = container.clientWidth * 0.65;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    "kids-children": <Baby className="h-3.5 w-3.5 text-app-muted" />,
    "cosmetics-skincare": <Sparkles className="h-3.5 w-3.5 text-app-muted" />,
    "fashion-apparel-shoes": <Shirt className="h-3.5 w-3.5 text-app-muted" />,
    "computers-electronics": <Laptop className="h-3.5 w-3.5 text-app-muted" />,
  };

  return (
    <div className="space-y-2.5">
      {/* Row Header */}
      <div className="flex items-center justify-between gap-2 border-b border-app pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-app text-[10px] font-black text-app-card shrink-0">
              {section.order}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              {categoryIcons[section.categorySlug] || (
                <Package className="h-3.5 w-3.5 text-app-muted" />
              )}
              <h3 className="text-xs sm:text-sm md:text-base font-bold truncate text-app">
                {section.title}
              </h3>
            </div>
            <span className="text-[10px] font-mono hidden md:inline text-app-muted">
              ({section.products.length} items)
            </span>
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={section.viewAllLink}
            className="text-[11px] font-semibold text-app hover:underline flex items-center gap-0.5 mr-1"
          >
            <span>See All</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`h-6.5 w-6.5 rounded border border-app bg-app-card flex items-center justify-center transition-all cursor-pointer ${canScrollLeft
                ? "text-app hover:border-app-hover shadow-xs"
                : "opacity-25 cursor-not-allowed text-app-muted"
              }`}
            title="Scroll Left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`h-6.5 w-6.5 rounded border border-app bg-app-card flex items-center justify-center transition-all cursor-pointer ${canScrollRight
                ? "text-app hover:border-app-hover shadow-xs"
                : "opacity-25 cursor-not-allowed text-app-muted"
              }`}
            title="Scroll Right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Horizontal Scroll Track */}
      <div
        ref={rowRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-2.5 scroll-smooth no-scrollbar pb-1 -mx-3 px-3 sm:mx-0 sm:px-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {section.products.map((product) => (
          <div
            key={product.id}
            className="w-[130px] xs:w-[145px] sm:w-[160px] md:w-[175px] lg:w-[185px] xl:w-[195px] shrink-0 snap-start h-full"
          >
            <ProductCard product={product} onQuickView={onQuickView} />
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const curatedSections = useMemo(() => {
    return initialCategories
      .filter((category) => category.isActive !== false)
      .map((category, index): HomeProductSection => ({
        id: category.id,
        categorySlug: category.slug,
        order: index + 1,
        title: category.name,
        viewAllLink: `/marketplace?category=${encodeURIComponent(category.slug)}`,
        products: initialProducts.filter(
          (product) => product.categorySlug === category.slug,
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [initialCategories, initialProducts]);

  const categories = useMemo(
    () => initialCategories.filter((category) => category.isActive !== false),
    [initialCategories],
  );

  const getQuadProducts = (catSlug: string): (Product | null)[] => {
    const matchingProducts = initialProducts
      .filter((product) => product.categorySlug === catSlug)
      .slice(0, 4);
    return [0, 1, 2, 3].map((index) => matchingProducts[index] || null);
  };

  const getCatCount = (slug: string) => {
    return initialProducts.filter((product) => product.categorySlug === slug).length;
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
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
          <HeroCarousel products={initialProducts} />
        </section>

        <div className="space-y-7 sm:space-y-10 pt-7 sm:pt-10">
          {/* Departments are loaded from active backend categories */}
          <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-2.5">
            <div className="flex items-center justify-between border-b border-app pb-2">
              <div>
                <h2 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-app">
                  Shop by Department
                </h2>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 text-xs font-semibold text-app hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                {categories.map((category) => {
                const count = getCatCount(category.slug);
                const quadProducts = getQuadProducts(category.slug);

                return (
                  <Link
                    key={category.id}
                    href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                    className="group relative flex flex-col justify-between rounded-xl border border-app bg-app-card hover:border-app-hover transition-all duration-200 overflow-hidden cursor-pointer shadow-xs"
                  >
                    {/* 2x2 Quad of 4 Distinct Slots */}
                    <div className="grid grid-cols-2 gap-0 w-full aspect-square overflow-hidden bg-black/5 dark:bg-black/40 border-b border-app">
                      {quadProducts.map((prod, idx) => (
                        <div
                          key={`${category.id}-slot-${idx}`}
                          className="relative aspect-square w-full overflow-hidden bg-black/5 dark:bg-white/[0.02] border-b border-r border-app/40 [&:nth-child(2n)]:border-r-0 [&:nth-child(n+3)]:border-b-0"
                        >
                          {prod ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              className="object-cover object-center group-hover:scale-106 transition-transform duration-300 ease-out"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.015]">
                              <Package className="h-3.5 w-3.5 text-app-muted/20 stroke-[1.2]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Category Name Underneath */}
                    <div className="p-2 sm:p-2.5 flex items-center justify-between gap-1 bg-app-card">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-[12.5px] font-bold text-app group-hover:opacity-80 transition-colors truncate">
                          {category.name}
                        </h3>
                        <p className="text-[9.5px] text-app-muted mt-0.5 truncate">
                          {count} shown
                        </p>
                      </div>

                      <div className="h-5.5 w-5.5 rounded border border-app flex items-center justify-center text-app group-hover:translate-x-0.5 transition-transform shrink-0">
                        <ChevronRight className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </Link>
                );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-app bg-app-card p-6 text-center text-sm text-app-muted">
                No departments are available right now.
              </p>
            )}
          </section>

          {/* Live products grouped by backend category */}
          <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
            {/* Section Toolbar */}
            <div className="flex items-center justify-between border-b border-app pb-2.5">
              <div>
                <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-app">
                  Latest Products
                </h2>
              </div>

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-app hover:underline"
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
                    onQuickView={handleQuickView}
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-app bg-app-card hover:bg-app text-app px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
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

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Footer */}
      <CustomerFooter />
    </div>
  );
}
