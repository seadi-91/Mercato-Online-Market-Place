"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Check,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { toast } from "sonner";
import { getProductTradeInfo, TradeType } from "@/lib/product-classification";

interface HorizontalProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  tradeView?: TradeType;
  hideBadges?: boolean;
  transparentCartButton?: boolean;
}

export function HorizontalProductCard({
  product,
  onQuickView,
  tradeView = "ALL",
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

  const displayPrice =
    tradeView === "WHOLESALE" && tradeInfo.wholesalePrice
      ? tradeInfo.wholesalePrice
      : product.price;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#11131c] text-slate-900 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-200 p-2 sm:p-3 gap-2 sm:gap-3 cursor-pointer overflow-hidden w-full touch-manipulation"
    >
      {/* Left: Product Image Thumbnail */}
      <div className="relative w-full sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 aspect-square sm:aspect-auto rounded-lg overflow-hidden bg-slate-50 dark:bg-[#0c0e17]">
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-all duration-300 ${
            secondaryImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
          }`}
          loading="lazy"
        />

        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        <div className="absolute right-1 top-1 z-10">
          <button
            type="button"
            onClick={handleToggleFav}
            title={fav ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center p-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:scale-110 active:scale-95 transition-transform cursor-pointer touch-manipulation"
          >
            <Heart
              className={`h-3 w-3 ${
                fav ? "fill-indigo-600 text-indigo-600" : "hover:text-indigo-600"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Center: ONLY Product Name */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-xs sm:text-sm font-semibold sm:font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>
      </div>

      {/* Right: Price & Transparent Cart Action */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 sm:gap-2 shrink-0 sm:border-l sm:border-slate-100 dark:sm:border-white/10 sm:pl-3 sm:min-w-[120px] pt-1.5 sm:pt-0 border-t border-slate-100 dark:border-white/10 sm:border-t-0">
        <div className="text-left sm:text-right">
          <div className="text-sm sm:text-base font-black tracking-tight font-mono text-indigo-600 dark:text-indigo-400">
            {displayPrice.toLocaleString()}{" "}
            <span className="text-[9px] font-bold">ETB</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          title={isAdded ? "Added to cart" : "Add to cart"}
          className="flex items-center justify-center p-1 rounded-lg bg-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all active:scale-90 cursor-pointer shadow-none touch-manipulation"
        >
          {isAdded ? (
            <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <ShoppingCart className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          )}
        </button>
      </div>
    </div>
  );
}
