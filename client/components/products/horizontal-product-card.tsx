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
  ShieldCheck,
  Package,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { toast } from "sonner";

interface HorizontalProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function HorizontalProductCard({
  product,
  onQuickView,
}: HorizontalProductCardProps) {
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
      description: `${product.name} added to cart.`,
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
      className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-[#0d1222]/90 hover:border-indigo-500/40 hover:bg-[#0f172d] transition-all duration-200 p-2.5 sm:p-3.5 gap-3 sm:gap-4 cursor-pointer overflow-hidden shadow-xs hover:shadow-md w-full"
    >
      {/* Left: Product Image Thumbnail */}
      <div className="relative w-full sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 aspect-square sm:aspect-auto rounded-lg sm:rounded-xl overflow-hidden bg-black/20">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute left-1.5 top-1.5 rounded bg-black/85 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-bold text-white shadow-xs pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* Quick View & Wishlist Overlay */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            title="Quick View"
            className="flex items-center justify-center p-1 text-white hover:scale-115 transition-transform cursor-pointer bg-black/40 rounded-md backdrop-blur-xs border border-white/10"
          >
            <Eye className="h-3.5 w-3.5 text-white" />
          </button>
          <button
            type="button"
            onClick={handleToggleFav}
            title="Wishlist"
            className="flex items-center justify-center p-1 text-white hover:scale-115 transition-transform cursor-pointer bg-black/40 rounded-md backdrop-blur-xs border border-white/10"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                fav ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Center: Details & Information */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between sm:justify-start gap-2 text-[10px]">
          <span className="uppercase tracking-wider font-semibold text-indigo-400 truncate">
            {product.category}
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-zinc-500 font-normal">({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Description / Summary */}
        <p className="text-xs text-zinc-400 line-clamp-1 sm:line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Location & Merchant Info */}
        <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
            <span className="truncate">{product.marketZone || product.shopName}</span>
          </div>
          {product.isVerifiedSeller && (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span>Verified Merchant</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-zinc-500 shrink-0" />
            <span className={product.stock > 0 ? "text-emerald-400" : "text-rose-400"}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Pricing & Cart Action */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-2.5 shrink-0 sm:border-l sm:border-white/10 sm:pl-4 sm:min-w-[140px] pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
        <div className="text-left sm:text-right">
          <div className="text-base sm:text-lg font-black tracking-tight font-mono text-white">
            {product.price.toLocaleString()}{" "}
            <span className="text-[10px] font-bold text-indigo-400">ETB</span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-[10px] text-zinc-500 line-through font-mono">
              {product.originalPrice.toLocaleString()} ETB
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
