"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  tradeView?: TradeType;
  hideBadges?: boolean;
  transparentCartButton?: boolean;
}

export function ProductCard({
  product,
  onQuickView,
  tradeView = "ALL",
  hideBadges = false,
  transparentCartButton = false,
}: ProductCardProps) {
  const router = useRouter();
  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isSystem = theme === "system";

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

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      router.push(`/products/${product.id}`);
    }
  };

  const primaryImage = product.image || (product as any).images?.[0] || "/placeholder.jpg";
  const secondaryImage =
    (product.gallery && product.gallery.length > 1 && product.gallery[1] && product.gallery[1] !== primaryImage)
      ? product.gallery[1]
      : (Array.isArray((product as any).images) && (product as any).images.length > 1 && (product as any).images[1] && (product as any).images[1] !== primaryImage)
        ? (product as any).images[1]
        : null;

  return (
    <div
      onClick={handleCardClick}
      className="product-card-surface group relative flex flex-col justify-between rounded-xl border border-app bg-app-card text-app transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer overflow-hidden h-full"
    >
      {/* Product Image: Ultra-compact aspect-square */}
      <div className={`relative aspect-square w-full overflow-hidden transition-colors ${
        isLight ? "bg-slate-100/90" : isDark ? "bg-[#101014]" : "bg-[#0a0f1d]"
      }`}>
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-all duration-300 ${
            secondaryImage
              ? "group-hover:opacity-0 group-hover:scale-105"
              : "group-hover:scale-105"
          }`}
          loading="lazy"
        />

        {/* Secondary Image on Hover (if available) */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Optional product-specific badge */}
        {!hideBadges && (
          <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.badge && (
              <span
                className={`rounded px-1.5 py-0.5 text-[8px] font-bold border backdrop-blur-xs shadow-xs transition-colors ${
                  isLight
                    ? product.badge === "Verified Merchant" || product.badge === "Escrow Verified"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300/80"
                      : product.badge === "Trending" || product.badge === "Best Seller"
                        ? "bg-amber-50 text-amber-900 border-amber-300/80"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200/90"
                    : isDark
                      ? product.badge === "Verified Merchant" || product.badge === "Escrow Verified"
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/30"
                        : product.badge === "Trending" || product.badge === "Best Seller"
                          ? "bg-amber-950/80 text-amber-300 border-amber-500/30"
                          : "bg-[#18181c]/90 text-indigo-300 border-white/10"
                      : product.badge === "Verified Merchant" || product.badge === "Escrow Verified"
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/30"
                        : product.badge === "Trending" || product.badge === "Best Seller"
                          ? "bg-amber-950/70 text-amber-300 border-amber-500/30"
                          : "bg-[#0d1222]/90 text-cyan-300 border-blue-500/30"
                }`}
              >
                {product.badge}
              </span>
            )}
          </div>
        )}

        {/* Centered Quick View Button (Visible ONLY on Hover, hidden when not hovering) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-xl text-[11px] font-bold tracking-wide transform scale-90 group-hover:scale-100 transition-all duration-200 cursor-pointer active:scale-95 ${
              isLight
                ? "bg-white/95 hover:bg-white text-slate-800 hover:text-indigo-600 border border-slate-200/90 shadow-md hover:border-indigo-400"
                : isDark
                  ? "bg-[#141418]/90 hover:bg-black text-white hover:text-cyan-300 border border-white/20 hover:border-cyan-400"
                  : "bg-[#0d1222]/90 hover:bg-[#070d1e] text-white hover:text-cyan-300 border border-blue-500/30 hover:border-cyan-400"
            }`}
          >
            <Eye className={`h-3.5 w-3.5 ${isLight ? "text-indigo-600" : "text-cyan-400"}`} />
            <span>Quick View</span>
          </button>
        </div>

        {/* Wishlist Button on Top Right (Eye icon removed from here so no Eye icon appears when not hovered) */}
        <div className="absolute right-1.5 top-1.5 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={handleToggleFav}
            title={fav ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex items-center justify-center p-1.5 rounded-full backdrop-blur-xs hover:scale-110 transition-transform cursor-pointer border outline-none ${
              isLight
                ? "bg-white/90 hover:bg-white text-slate-700 border-slate-200/90 shadow-xs hover:border-rose-300"
                : isDark
                  ? "bg-black/40 hover:bg-black/60 text-white border-white/10"
                  : "bg-[#0d1222]/80 hover:bg-[#070d1e] text-white border-blue-500/25"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                fav
                  ? "fill-rose-500 text-rose-500"
                  : isLight
                    ? "text-slate-600 hover:text-rose-500"
                    : "text-white hover:text-rose-400"
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
            {/* Show the selected trade-view price when available */}
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
              </div>
            ) : tradeInfo.wholesalePrice && tradeInfo.classification === "dual" ? (
              <div className="flex flex-col">
                <div className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-app">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-[9px] font-bold opacity-80">ETB</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="text-xs sm:text-[12.5px] font-black tracking-tight font-mono truncate text-app">
                  {product.price.toLocaleString()}{" "}
                  <span className="text-[9px] font-bold opacity-80">ETB</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            title={isAdded ? "Added" : "Add to cart"}
            className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer shrink-0 ${transparentCartButton
                ? "bg-transparent text-white shadow-none hover:scale-105"
                : isAdded
                  ? "bg-transparent text-emerald-600 shadow-none"
                  : "bg-transparent text-indigo-600 shadow-none hover:text-indigo-500 hover:scale-105"
              }`}
          >
            {isAdded ? (
              <Check className={`h-3.5 w-3.5 ${transparentCartButton ? "text-white" : ""}`} />
            ) : (
              <ShoppingCart className={`h-3.5 w-3.5 ${transparentCartButton ? "text-white" : ""}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
