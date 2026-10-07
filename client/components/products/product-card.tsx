"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  MapPin,
  Check,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  const [mounted, setMounted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fav = mounted ? isFavorite(product.id) : false;

  const handleAddToCart = (e: React.MouseEvent) => {
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
    setIsAdded(true);
    toast.success("Added to cart", {
      description: `${product.name} added.`,
    });
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNow = toggleFavorite({
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
    if (isNow) {
      toast.success("Saved to wishlist", { description: product.name });
    } else {
      toast.info("Removed from wishlist", { description: product.name });
    }
  };

  return (
    <div
      onClick={() => onQuickView && onQuickView(product)}
      className="product-card-surface group relative flex flex-col justify-between rounded-xl border border-app bg-app-card text-app transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden h-full"
    >
      {/* Product Image: Ultra-compact aspect-square */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/5 dark:bg-black/40">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Small badge if present */}
        {product.badge && (
          <span className="absolute left-1.5 top-1.5 rounded bg-black/80 backdrop-blur-xs px-1.5 py-0.2 text-[8.5px] font-bold text-white shadow-xs pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* Quick Actions on Top Right - NO background, pure white icons with drop-shadow */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            title="Quick View"
            className="flex items-center justify-center p-1 text-white hover:scale-115 transition-transform cursor-pointer bg-transparent border-none outline-none"
          >
            <Eye className="h-3.5 w-3.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]" />
          </button>

          <button
            type="button"
            onClick={handleToggleFav}
            title="Wishlist"
            className="flex items-center justify-center p-1 text-white hover:scale-115 transition-transform cursor-pointer bg-transparent border-none outline-none"
          >
            <Heart
              className={`h-3.5 w-3.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] transition-colors ${
                fav ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Content with Ultra-Compact Spacing */}
      <div className="flex flex-col justify-between flex-1 p-2">
        <div className="space-y-0.5">
          {/* Category & Star Rating */}
          <div className="flex items-center justify-between gap-1 text-[9px]">
            <span className="uppercase tracking-wider font-semibold truncate text-app-muted">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0 font-bold">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title - High Contrast and 1-Line Clamped */}
          <Link
            href={`/products/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block text-[11.5px] sm:text-xs font-bold leading-snug line-clamp-1 transition-colors text-app hover:opacity-80"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Location & Shop */}
          <div className="flex items-center gap-1 text-[9.5px] text-app-muted truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0 opacity-70" />
            <span className="truncate">{product.marketZone || product.shopName}</span>
          </div>
        </div>

        {/* Price & Compact Cart Action */}
        <div className="mt-1.5 pt-1.5 border-t border-app flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-app">
              {product.price.toLocaleString()}{" "}
              <span className="text-[9px] font-bold opacity-80">
                ETB
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            title={isAdded ? "Added" : "Add to cart"}
            className={`flex h-6 w-6 items-center justify-center rounded-md transition-all active:scale-90 cursor-pointer shrink-0 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-app text-app-card border border-app hover:opacity-80 shadow-xs"
            }`}
          >
            {isAdded ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <ShoppingCart className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
