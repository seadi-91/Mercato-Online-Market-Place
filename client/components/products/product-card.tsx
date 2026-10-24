"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  Eye,
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
  hideBadges?: boolean;
  transparentCartButton?: boolean;
}

export function ProductCard({
  product,
  onQuickView,
  tradeView = "ALL",
}: ProductCardProps) {
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
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#11131c] text-slate-900 dark:text-slate-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-pointer overflow-hidden h-full"
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-[#0c0e17]">
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

        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-md text-[10px] font-bold transform scale-95 group-hover:scale-100 transition-all active:scale-90 cursor-pointer"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Wishlist Button */}
        <div className="absolute right-1.5 top-1.5 z-10">
          <button
            type="button"
            onClick={handleToggleFav}
            title={fav ? "Remove from wishlist" : "Add to wishlist"}
            className="flex items-center justify-center p-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:scale-110 transition-all shadow-xs cursor-pointer"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                fav
                  ? "fill-indigo-600 text-indigo-600"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Card Body: ONLY Product Name & Price, with NO background color for cart */}
      <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1.5">
        {/* Product Name */}
        <Link
          href={`/products/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block text-xs font-bold leading-snug line-clamp-2 transition-colors text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price & Transparent Cart Action (NO background color on Cart button) */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 dark:border-white/10">
          <div className="text-xs sm:text-sm font-black tracking-tight font-mono text-indigo-600 dark:text-indigo-400">
            {displayPrice.toLocaleString()}{" "}
            <span className="text-[9px] font-bold">ETB</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            title={isAdded ? "Added to cart" : "Add to cart"}
            className="flex items-center justify-center p-1 rounded-lg bg-transparent text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all active:scale-90 cursor-pointer shadow-none"
          >
            {isAdded ? (
              <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
