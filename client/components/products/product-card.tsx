"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Eye,
  Check,
  Star,
  Zap,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { useTranslation } from "@/store/language-store";
import { toast } from "sonner";
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onClick?: (product: Product) => void;
  tradeView?: TradeType;
  hideBadges?: boolean;
  transparentCartButton?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onQuickView,
  onClick,
  tradeView = "ALL",
  hideBadges = false,
  compact = false,
  className = "",
}: ProductCardProps) {
  const router = useRouter();
  const { t, tCategory } = useTranslation();
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
    if (product.stock === 0) return;

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

  const discountPercent = originalPrice && originalPrice > displayPrice
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
      className={`group relative flex flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-200/85 dark:border-white/10 bg-white dark:bg-[#11131c] text-slate-900 dark:text-slate-100 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 ease-out cursor-pointer overflow-hidden h-full touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 ${
        className || ""
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-[#0c0e17]">
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-transform duration-500 ease-out ${
            secondaryImage
              ? "group-hover:opacity-0 group-hover:scale-106"
              : "group-hover:scale-106"
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

        {/* Quick View Button Hover Bar */}
        <div className="absolute inset-x-1.5 bottom-1.5 z-15 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) {
                onQuickView(product);
              } else {
                handleCardClick();
              }
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-full h-6 rounded-md flex items-center justify-center gap-1 bg-white/95 dark:bg-[#151928]/95 backdrop-blur-sm text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-white/10 shadow-xs text-[9px] font-bold hover:bg-white dark:hover:bg-[#1a2033] transition-colors cursor-pointer"
          >
            <Eye className="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" aria-hidden="true" />
            <span>{t("product.quickView")}</span>
          </button>
        </div>

        {/* Wishlist Button (Top-Right) */}
        <div className="absolute top-1.5 right-1.5 z-10">
          <button
            type="button"
            onClick={handleToggleFav}
            aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
            title={fav ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/75 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-xs cursor-pointer touch-manipulation"
          >
            <Heart
              className={`h-3 w-3 transition-colors ${
                fav
                  ? "fill-rose-500 text-rose-500"
                  : "text-slate-600 dark:text-slate-300 hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-12"
          >
            <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              {t("product.soldOut")}
            </span>
          </div>
        )}
      </div>

      {/* Card Body: Category, Title, Rating, Urgency, Price & Add Button */}
      <div className="p-2 sm:p-2.5 space-y-1 sm:space-y-1.5 flex flex-col justify-between flex-1">
        <div>
          {/* Category or Brand eyebrow */}
          <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">
            {tCategory(product.category || product.brand || product.shopName)}
          </p>

          {/* Product Name */}
          <Link
            href={`/products/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block text-[11px] sm:text-xs font-semibold text-card-foreground line-clamp-2 leading-tight h-[28px] sm:h-[32px] mt-0.5 transition-colors hover:text-slate-900 dark:hover:text-white hover:underline"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Rating and review count */}
        <div className="flex items-center gap-1 text-[9.5px] text-muted-foreground">
          <div className="flex items-center text-amber-500">
            <Star className="h-2.5 w-2.5 fill-amber-500" aria-hidden="true" />
          </div>
          <span className="font-bold text-foreground">
            {(product.rating || 4.8).toFixed(1)}
          </span>
          <span className="text-[8.5px] opacity-75">
            ({product.reviewCount || 18})
          </span>
        </div>

        {/* Urgency indicator for low stock */}
        {!isSoldOut && product.stock > 0 && product.stock <= 5 && (
          <p className="text-[9px] text-destructive font-semibold flex items-center gap-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"
              aria-hidden="true"
            />
            {product.stock} {t("product.onlyLeft")}
          </p>
        )}

        {/* Price & Cart Action */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/40">
          <div className="min-w-0 flex-1">
            <span className="text-xs sm:text-[13px] font-black text-card-foreground tabular-nums truncate block">
              ETB {displayPrice.toLocaleString()}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-[9px] line-through text-muted-foreground/80 tabular-nums block -mt-0.5">
                ETB {originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            aria-label={`Add ${product.name} to cart`}
            className={`h-6 sm:h-6.5 px-2 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
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
                <span className="hidden xs:inline">{t("common.inStock")}</span>
              </>
            ) : isSoldOut ? (
              <span>{t("product.soldOut")}</span>
            ) : (
              <>
                <ShoppingCart className="w-2.5 h-2.5" />
                <span>{t("common.addToCart")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

