"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryItem, Product } from "@/constants/mock-data";

export interface CategoryCardProps {
  category: CategoryItem;
  itemCount?: number;
  products?: Product[];
  className?: string;
}

export function CategoryCard({
  category,
  itemCount = 0,
  products = [],
  className = "",
}: CategoryCardProps) {
  // Strictly match real products belonging to this exact category
  const matchingProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.categorySlug === category.slug ||
        (category.name &&
          p.category?.toLowerCase() === category.name.toLowerCase())
    );
  }, [category.slug, category.name, products]);

  // Extract ONLY real product images from this category; leave empty slots null (no fallback/default images)
  const quadSlots = useMemo<(string | null)[]>(() => {
    const list: string[] = [];

    for (const p of matchingProducts) {
      if (
        p.hasOwnImage !== false &&
        p.image &&
        p.image.trim() !== "" &&
        !list.includes(p.image)
      ) {
        list.push(p.image);
      }
      if (list.length >= 4) break;
    }

    return [0, 1, 2, 3].map((idx) => list[idx] ?? null);
  }, [matchingProducts]);

  const displayCount = itemCount > 0 ? itemCount : matchingProducts.length;

  return (
    <Link
      href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
      className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#11131c] shadow-xs hover:shadow-2xl hover:shadow-indigo-950/15 dark:hover:shadow-indigo-950/40 transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.985] overflow-hidden cursor-pointer ${className}`}
    >
      {/* Shimmer sweep light effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none z-30" />

      {/* 2x2 Quad of matching category product images (empty cells stay blank with zero default images) */}
      <div className="relative w-full aspect-[13/14] overflow-hidden bg-slate-100 dark:bg-slate-800/80 border-b border-slate-100 dark:border-white/5">
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-[2px] bg-slate-200/80 dark:bg-slate-800/80">
          {quadSlots.map((imgUrl, idx) => (
            <div
              key={`${category.id}-slot-${idx}`}
              className="relative h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900/50"
            >
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center group-hover:scale-110 active:scale-95 transition-transform duration-500 ease-out will-change-transform"
                  />
                  {/* Depth vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/15 pointer-events-none" />
                </>
              ) : (
                <div className="h-full w-full bg-slate-100/80 dark:bg-slate-900/40" />
              )}
            </div>
          ))}
        </div>

        {/* Top-left item count badge */}
        {displayCount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-20 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 px-2.5 py-0.5 text-[9.5px] sm:text-[10px] font-bold text-white shadow-md shadow-indigo-600/30 tracking-tight">
            {displayCount}+ items
          </span>
        )}

        {/* Hover "Explore Collection" Overlay (ZiiMarket signature interactive reveal) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col items-center justify-end pb-3 sm:pb-3.5 px-2">
          <div className="text-center text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold shadow-lg">
              <span>Explore Collection</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[10px] font-medium opacity-85 truncate max-w-[140px] mx-auto text-zinc-200">
              {category.name}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Category Name & Circular Arrow Button */}
      <div className="px-3.5 py-3.5 sm:py-4 flex items-center justify-between gap-2 bg-white/95 dark:bg-[#11131c]/95 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {category.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
            Explore verified collection
          </p>
        </div>

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-md group-hover:shadow-indigo-600/30 transition-all duration-300 shrink-0">
          <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
