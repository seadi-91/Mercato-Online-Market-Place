"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingCart,
  Heart,
  Check,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useCartStore } from "@/store";
import { useTranslation } from "@/store/language-store";
import { toast } from "sonner";
import { getProductTradeInfo } from "@/lib/product-classification";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { t, tCategory, tZone } = useTranslation();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const isFavorite = useCartStore((state) => state.isFavorite);

  if (!isOpen || !product) return null;

  const fav = isFavorite(product.id);
  const tradeInfo = getProductTradeInfo(product);

  const allImages = [
    product.image,
    ...(product.gallery || []),
    ...(Array.isArray((product as any).images) ? (product as any).images : []),
  ].filter(Boolean);

  const uniqueImages = Array.from(new Set(allImages));
  const activeImage = uniqueImages[selectedImageIdx] || product.image || "/placeholder.jpg";

  const originalPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : undefined;

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : undefined;

  const isSoldOut = product.stock <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        shopName: product.shopName,
        marketZone: product.marketZone,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        sellerId: (product as any).sellerId,
      },
      quantity
    );

    setIsAdded(true);
    toast.success("Added to cart", {
      description: `${product.name} (x${quantity}) added.`,
    });
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleFav = () => {
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
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#11131c] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Quick View"
          className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#0c0e17] flex flex-col items-center justify-between gap-3">
            <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#11131c] border border-slate-200/80 dark:border-white/10 shadow-xs">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 350px"
                className="object-cover object-center"
              />

              {discountPercent && discountPercent > 0 && (
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-md bg-gradient-to-r from-rose-600 to-red-500 text-white text-[10px] font-black px-2 py-0.5 shadow-xs">
                  <Zap className="w-2.5 h-2.5 fill-white" />
                  <span>-{discountPercent}%</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {uniqueImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto w-full py-1">
                {uniqueImages.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative h-12 w-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tCategory(product.category || product.shopName)}
                </span>

                <button
                  type="button"
                  onClick={handleToggleFav}
                  aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      fav ? "fill-rose-500 text-rose-500" : "text-slate-400"
                    }`}
                  />
                  <span>{fav ? "Saved" : "Save"}</span>
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {product.name}
              </h2>

              {/* Rating & Review */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center text-amber-500">
                  <Star className="h-3 w-3 fill-amber-500" />
                  <span className="ml-1 font-bold text-foreground">
                    {(product.rating || 4.8).toFixed(1)}
                  </span>
                </div>
                <span>·</span>
                <span>{product.reviewCount || 18} reviews</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                  ETB {product.price.toLocaleString()}
                </span>
                {originalPrice && originalPrice > product.price && (
                  <span className="text-xs text-slate-400 line-through tabular-nums">
                    ETB {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="pt-1">
                {isSoldOut ? (
                  <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    {t("product.outOfStock")}
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    {product.stock} {t("product.onlyLeft")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    {t("product.inStock")}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed pt-1">
                  {product.description}
                </p>
              )}
            </div>

            {/* Delivery Promise */}
            <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.02] p-2.5 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{t("home.fastDelivery")}</span>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#11131c]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isSoldOut}
                    className="h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-l-xl transition-colors cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-xs font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={isSoldOut || (product.stock > 0 && quantity >= product.stock)}
                    className="h-9 w-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-r-xl transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer ${
                    isAdded
                      ? "bg-emerald-600 text-white shadow-emerald-600/30"
                      : isSoldOut
                      ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{t("product.addToCart")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t("product.addToCart")} · ETB {(product.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Full Product Details Link */}
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>{t("home.viewProduct")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

