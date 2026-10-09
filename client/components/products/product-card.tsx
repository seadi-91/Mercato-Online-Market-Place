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
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  tradeView?: TradeType;
}

export function ProductCard({ product, onQuickView, tradeView = "ALL" }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  const [mounted, setMounted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fav = mounted ? isFavorite(product.id) : false;
  const tradeInfo = getProductTradeInfo(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const qty = tradeView === "WHOLESALE" && tradeInfo.moq > 1 ? tradeInfo.moq : 1;
    const priceToCharge =
      tradeView === "WHOLESALE" && tradeInfo.wholesalePrice
        ? tradeInfo.wholesalePrice
        : product.price;

    addItem({
      id: product.id,
      name: product.name,
      price: priceToCharge,
      image: product.image,
      shopName: product.shopName,
      marketZone: product.marketZone,
      category: product.category,
      stock: product.stock,
      rating: product.rating,
      sellerId: (product as any).sellerId,
    }, qty);

    setIsAdded(true);
    toast.success("Added to cart", {
      description: `${product.name} (${qty} ${tradeInfo.unit}) added.`,
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

        {/* Trade Badges: Wholesale vs Retail */}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 z-10 pointer-events-none">
          {tradeInfo.classification === "wholesale_only" && (
            <span className="rounded bg-gradient-to-r from-amber-500 to-orange-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <span>Wholesale</span>
            </span>
          )}
          {tradeInfo.classification === "dual" && (
            <span className="rounded bg-gradient-to-r from-amber-500 to-indigo-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <span>Bulk & Retail</span>
            </span>
          )}
          {tradeInfo.classification === "retail_only" && (
            <span className="rounded bg-gradient-to-r from-indigo-600 to-cyan-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <span>Retail</span>
            </span>
          )}

          {product.badge && (
            <span className="rounded bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Quick Actions on Top Right */}
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

      {/* Card Content */}
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

          {/* Title */}
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
            {/* Show wholesale price if viewing wholesale and available */}
            {tradeView === "WHOLESALE" && tradeInfo.wholesalePrice ? (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-amber-500">
                    {tradeInfo.wholesalePrice.toLocaleString()}{" "}
                    <span className="text-[9px] font-bold opacity-80">ETB</span>
                  </span>
                  {tradeInfo.savingsPercent > 0 && (
                    <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded shrink-0">
                      -{tradeInfo.savingsPercent}%
                    </span>
                  )}
                </div>
                <div className="text-[8.5px] text-app-muted truncate font-mono">
                  MOQ: {tradeInfo.moq} {tradeInfo.unit}
                </div>
              </div>
            ) : tradeInfo.wholesalePrice && tradeInfo.classification === "dual" ? (
              <div className="flex flex-col">
                <div className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-app">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-[9px] font-bold opacity-80">ETB</span>
                </div>
                <div className="text-[8.5px] text-amber-500 truncate font-mono">
                  Wholesale: {tradeInfo.wholesalePrice.toLocaleString()} ETB
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-app">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-[9px] font-bold opacity-80">ETB</span>
                </div>
                <div className="text-[8.5px] text-app-muted truncate">
                  {tradeInfo.moq > 1 ? `MOQ: ${tradeInfo.moq} ${tradeInfo.unit}` : "1 Unit • Retail"}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            title={isAdded ? "Added" : "Add to cart"}
            className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer shrink-0 shadow-xs ${
              isAdded
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105"
            }`}
          >
            {isAdded ? (
              <Check className="h-3.5 w-3.5 text-white" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
