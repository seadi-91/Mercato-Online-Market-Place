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
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface HorizontalProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  tradeView?: TradeType;
}

export function HorizontalProductCard({
  product,
  onQuickView,
  tradeView = "ALL",
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
      description: `${product.name} (${qty} ${tradeInfo.unit}) added to cart.`,
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
      className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl sm:rounded-2xl border border-app bg-app-card text-app hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 p-2.5 sm:p-3.5 gap-3 sm:gap-4 cursor-pointer overflow-hidden w-full"
    >
      {/* Left: Product Image Thumbnail */}
      <div className="relative w-full sm:w-28 sm:h-28 md:w-36 md:h-36 shrink-0 aspect-square sm:aspect-auto rounded-lg sm:rounded-xl overflow-hidden bg-black/5 dark:bg-black/40">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Trade Badge */}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 z-10 pointer-events-none">
          {tradeInfo.classification === "wholesale_only" && (
            <span className="rounded bg-gradient-to-r from-amber-500 to-orange-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs uppercase tracking-wider">
              Wholesale
            </span>
          )}
          {tradeInfo.classification === "dual" && (
            <span className="rounded bg-gradient-to-r from-amber-500 to-indigo-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs uppercase tracking-wider">
              Bulk & Retail
            </span>
          )}
          {tradeInfo.classification === "retail_only" && (
            <span className="rounded bg-gradient-to-r from-indigo-600 to-cyan-600 backdrop-blur-xs px-1.5 py-0.5 text-[8.5px] font-extrabold text-white shadow-xs uppercase tracking-wider">
              Retail
            </span>
          )}

          {product.badge && (
            <span className="rounded bg-black/85 backdrop-blur-xs px-1.5 py-0.5 text-[8px] font-bold text-white shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

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
          <span className="uppercase tracking-wider font-semibold text-indigo-500 truncate">
            {product.category}
          </span>
          <span className="text-app-muted opacity-50 hidden sm:inline">•</span>
          <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span>{product.rating}</span>
            <span className="text-app-muted font-normal">({product.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-sm sm:text-base font-bold text-app hover:text-indigo-500 transition-colors line-clamp-1 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Description / Summary */}
        <p className="text-xs text-app-muted line-clamp-1 sm:line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Location & Merchant Info */}
        <div className="flex items-center gap-3 pt-1 text-[11px] text-app-muted flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
            <span className="truncate">{product.marketZone || product.shopName}</span>
          </div>
          {product.isVerifiedSeller && (
            <div className="flex items-center gap-1 text-emerald-500 font-medium">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span>Verified Merchant</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-app-muted shrink-0" />
            <span className={product.stock > 0 ? "text-emerald-500 font-medium" : "text-rose-500"}>
              {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Pricing & Cart Action */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-2.5 shrink-0 sm:border-l sm:border-app sm:pl-4 sm:min-w-[150px] pt-2 sm:pt-0 border-t border-app sm:border-t-0">
        <div className="text-left sm:text-right">
          {tradeView === "WHOLESALE" && tradeInfo.wholesalePrice ? (
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight font-mono text-amber-500">
                {tradeInfo.wholesalePrice.toLocaleString()}{" "}
                <span className="text-[10px] font-bold opacity-85">ETB</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start sm:justify-end text-[10px] text-app-muted font-mono">
                <span className="line-through">{tradeInfo.retailPrice.toLocaleString()} ETB</span>
                {tradeInfo.savingsPercent > 0 && (
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded">
                    -{tradeInfo.savingsPercent}%
                  </span>
                )}
              </div>
              <div className="text-[10px] text-app-muted font-medium">
                MOQ: {tradeInfo.moq} {tradeInfo.unit}
              </div>
            </div>
          ) : tradeInfo.wholesalePrice && tradeInfo.classification === "dual" ? (
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight font-mono text-app">
                {product.price.toLocaleString()}{" "}
                <span className="text-[10px] font-bold text-indigo-500">ETB</span>
              </div>
              <div className="text-[10.5px] text-amber-500 font-medium">
                Wholesale: {tradeInfo.wholesalePrice.toLocaleString()} ETB
              </div>
              <div className="text-[9.5px] text-app-muted">
                MOQ: {tradeInfo.moq} {tradeInfo.unit}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight font-mono text-app">
                {product.price.toLocaleString()}{" "}
                <span className="text-[10px] font-bold text-indigo-500">ETB</span>
              </div>
              <div className="text-[10px] text-app-muted">
                {tradeInfo.moq > 1 ? `MOQ: ${tradeInfo.moq} ${tradeInfo.unit}` : "1 Unit • Retail Direct"}
              </div>
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
