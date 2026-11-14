"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Check,
  Star,
  Zap,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { toast } from "sonner";
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface HorizontalProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onClick?: (product: Product) => void;
  tradeView?: TradeType;
  hideBadges?: boolean;
  transparentCartButton?: boolean;
}

export function HorizontalProductCard({
  product,
  onQuickView,
  onClick,
  tradeView = "ALL",
  hideBadges = false,
}: HorizontalProductCardProps) {
  const router = useRouter();
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
    if (product.stock <= 0) return;

    const qty = tradeView === "WHOLESALE" && tradeInfo.moq > 1 ? tradeInfo.moq : 1;
    const priceToCharge =
      tradeView === "WHOLESALE" && tradeInfo.wholesalePrice
        ? tradeInfo.wholesalePrice
        : product.price;

    addItem(
      {
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
      },
      qty
    );

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
    if (onClick) {
      onClick(product);
      return;
    }
    router.push(`/products/${product.id}`);
  };

  const primaryImage = product.image || (product as any).images?.[0] || "/placeholder.jpg";
  const secondaryImage =
    product.gallery && product.gallery.length > 1 && product.gallery[1] && product.gallery[1] !== primaryImage
      ? product.gallery[1]
      : Array.isArray((product as any).images) && (product as any).images.length > 1 && (product as any).images[1] && (product as any).images[1] !== primaryImage
      ? (product as any).images[1]
      : null;

  const displayPrice =
    tradeView === "WHOLESALE" && tradeInfo.wholesalePrice
      ? tradeInfo.wholesalePrice
      : product.price;

  const originalPrice =
    product.originalPrice && product.originalPrice > displayPrice
      ? product.originalPrice
      : tradeView === "WHOLESALE" && product.price > displayPrice
      ? product.price
      : undefined;

  const discountPercent =
    originalPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : undefined;

  const isSoldOut = product.stock <= 0;

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={product.name}
      className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl sm:rounded-2xl border border-slate-200/85 dark:border-white/10 bg-white dark:bg-[#11131c] text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-white/30 hover:shadow-lg transition-all duration-250 p-2 sm:p-3 gap-2.5 sm:gap-3 cursor-pointer overflow-hidden w-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50"
    >
      {/* Left: Product Image Thumbnail */}
      <div className="relative w-full sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 aspect-square sm:aspect-auto rounded-lg sm:rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0c0e17]">
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-transform duration-500 ease-out ${
            secondaryImage ? "group-hover:opacity-0 group-hover:scale-106" : "group-hover:scale-106"
          }`}
          loading="lazy"
        />

        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-106"
            loading="lazy"
          />
        )}

        {/* Wishlist Button */}
        <div className="absolute right-1 top-1 z-10">
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
            title={fav ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center h-6 w-6 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:text-rose-500 hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
          >
            <Heart
              className={`h-3 w-3 ${
                fav ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-15">
            <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Center: Metadata, Product Name & Rating */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">
          {product.brand || product.category || product.shopName}
        </p>

        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-xs sm:text-sm font-semibold text-card-foreground hover:text-slate-900 dark:hover:text-white hover:underline transition-colors line-clamp-2 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
          <div className="flex items-center text-amber-500">
            <Star className="h-2.5 w-2.5 fill-amber-500" />
          </div>
          <span className="font-bold text-foreground">
            {(product.rating || 4.8).toFixed(1)}
          </span>
          <span className="text-[8.5px] opacity-75">
            ({product.reviewCount || 18})
          </span>
        </div>
      </div>

      {/* Right: Price & Add Button */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 sm:border-l sm:border-border/40 sm:pl-3 sm:min-w-[130px] pt-1.5 sm:pt-0 border-t border-border/30 sm:border-t-0">
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-[13px] font-black tracking-tight text-card-foreground tabular-nums">
            ETB {displayPrice.toLocaleString()}
          </div>
          {originalPrice && originalPrice > displayPrice && (
            <div className="text-[9px] line-through text-muted-foreground/80 tabular-nums">
              ETB {originalPrice.toLocaleString()}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isSoldOut}
          aria-label={`Add ${product.name} to cart`}
          className={`h-6 sm:h-6.5 px-2.5 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
            isAdded
              ? "bg-emerald-600 text-white shadow-emerald-600/30"
              : isSoldOut
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-2.5 h-2.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-2.5 h-2.5" />
              <span>+Add</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

