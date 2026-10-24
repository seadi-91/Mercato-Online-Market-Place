"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  MapPin,
  Star,
  ArrowRight,
  Eye,
  Sparkles,
  MoveRight,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useCartStore } from "@/store";
import { useThemeStore } from "@/store/theme-store";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/constants/mock-data";
import { fetchProducts } from "@/lib/api/catalog";
import { toast } from "sonner";

export default function FavoritesPage() {
  const router = useRouter();
  const favorites = useCartStore((state) => state.favorites);
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const removeFavorite = useCartStore((state) => state.removeFavorite);
  const clearFavorites = useCartStore((state) => state.clearFavorites);
  const addAllFavoritesToCart = useCartStore((state) => state.addAllFavoritesToCart);
  const addItem = useCartStore((state) => state.addItem);

  const [mounted, setMounted] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchProducts({ limit: 6 }).then((res) => {
      setRecommendedProducts(res.products);
    }).catch(() => {});
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
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
    removeFavorite(product.id);
    toast.success("Moved to cart", {
      description: `${product.name} removed from favorites and added to cart.`,
    });
    router.push("/cart");
  };

  const handleRemove = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    removeFavorite(product.id);
    toast.info("Removed from favorites", { description: product.name });
  };

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    clearFavorites();
    toast.info("Wishlist cleared", {
      description: "All products have been removed from your favorites.",
    });
  };

  const handleAddAllToCart = () => {
    if (favorites.length === 0) return;
    const count = favorites.length;
    addAllFavoritesToCart();
    toast.success("All favorites moved to cart", {
      description: `${count} item${count > 1 ? "s" : ""} added to your cart for checkout.`,
    });
    router.push("/cart");
  };

  const handleQuickView = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/products/${product.id}`);
  };

  const handleSeedWishlist = () => {
    const demoItems = recommendedProducts.slice(0, 4);
    demoItems.forEach((item) => {
      if (!favorites.some((f) => f.id === item.id)) {
        toggleFavorite({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          shopName: item.shopName,
          marketZone: item.marketZone,
          category: item.category,
          stock: item.stock,
          rating: item.rating,
        });
      }
    });
    toast.success("Loaded 6 sample items to Wishlist!");
  };

  const { theme } = useThemeStore();
  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isSystem = theme === "system";

  const themePageBg = isLight
    ? "bg-[#fafbfe] text-slate-900"
    : isDark
      ? "bg-[#09090b] text-white"
      : "bg-[#070a12] text-zinc-100";

  const themeBorder = isLight
    ? "border-slate-200"
    : isDark
      ? "border-white/10"
      : "border-blue-500/20";

  const themeText = isLight ? "text-slate-900" : "text-white";
  const themeTextMuted = isLight ? "text-slate-500" : isDark ? "text-zinc-400" : "text-slate-400";

  const displayedList = favorites.length > 0 ? favorites : [];

  return (
    <div className={`min-h-screen flex flex-col ${themePageBg}`}>
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-24 sm:pb-12">
        {/* Page Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${themeBorder}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-500 dark:text-rose-300">
                Personal Wishlist
              </span>
              <span className={`text-xs ${themeTextMuted}`}>
                {mounted ? favorites.length : 0} saved items
              </span>
            </div>
            <h1 className={`mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 ${themeText}`}>
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
              <span>Saved Favorite Products</span>
            </h1>
            <p className={`text-xs mt-0.5 ${themeTextMuted}`}>
              Items you have marked as favorites across all categories
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {mounted && favorites.length === 0 && (
              <button
                type="button"
                onClick={handleSeedWishlist}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isLight
                    ? "border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700"
                    : "border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load 6 Demo Items</span>
              </button>
            )}

            <Link
              href="/marketplace"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-colors ${
                isLight
                  ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white"
              }`}
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Wishlist Quick Action Bar (Single display location) */}
        {mounted && displayedList.length > 0 && (
          <div className={`flex flex-wrap items-center justify-between gap-3 border rounded-xl px-4 py-3 backdrop-blur-md ${
            isLight
              ? "bg-white border-slate-200 shadow-xs"
              : isDark
                ? "bg-[#141418] border-white/10"
                : "bg-[#0d1222]/80 border-blue-500/20"
          }`}>
            <div className={`flex items-center gap-2 text-xs ${themeTextMuted}`}>
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>
                Showing <strong className={`font-bold ${themeText}`}>{displayedList.length}</strong> favorite {displayedList.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" style={{ stroke: "#ef4444" }} />
                <span>Clear All</span>
              </button>
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-950/40 hover:shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-white" />
                <span>Add All to Cart</span>
              </button>
            </div>
          </div>
        )}

        {/* Responsive Grid on Mobile & Desktop */}
        {mounted && displayedList.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {displayedList.map((product) => (
              <div
                key={product.id}
                onClick={() => handleQuickView(product as Product)}
                className={`w-full group relative flex flex-col justify-between rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden h-full ${
                  isLight
                    ? "bg-white border-slate-200 hover:border-indigo-400 shadow-xs"
                    : isDark
                      ? "bg-[#141418] border-white/10 hover:border-indigo-500/50 shadow-md"
                      : "bg-[#0d1222]/90 border-blue-500/20 hover:border-indigo-500/50 shadow-md"
                }`}
              >
                {/* Product Image: Edge-to-edge / Full bleed */}
                <div className={`relative aspect-square w-full overflow-hidden transition-colors ${
                  isLight ? "bg-slate-100/90" : isDark ? "bg-[#101014]" : "bg-[#090d18]"
                }`}>
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Centered Quick View Button (Visible ONLY on Hover, hidden when not hovering) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-20">
                    <button
                      type="button"
                      onClick={(e) => handleQuickView(product as Product, e)}
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

                  {/* Remove Trash Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, product)}
                    title="Remove from favorites"
                    className={`favorite-trash-btn absolute left-2 top-2 p-1.5 rounded-lg hover:scale-115 transition-all cursor-pointer z-10 border ${
                      isLight
                        ? "bg-white/90 hover:bg-red-50 border-slate-200 shadow-xs text-red-600"
                        : isDark
                          ? "bg-black/60 hover:bg-red-500/20 text-red-400 border-white/10"
                          : "bg-[#0d1222]/80 hover:bg-red-500/20 text-red-400 border-blue-500/20"
                    }`}
                  >
                    <Trash2
                      className="h-4 w-4 text-red-500 stroke-red-500"
                      style={{ color: "#ef4444", stroke: "#ef4444" }}
                    />
                  </button>
                </div>

                <div className="flex flex-col justify-between flex-1 p-3 sm:p-3.5">
                  <div>
                    {/* Category & Title */}
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 truncate block">
                        {product.category || "General Item"}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`block text-xs sm:text-[13px] font-bold transition-colors line-clamp-2 leading-snug min-h-[32px] ${
                          isLight
                            ? "text-slate-900 group-hover:text-indigo-600"
                            : "text-white group-hover:text-cyan-300"
                        }`}
                      >
                        {product.name}
                      </Link>
                    </div>

                    {/* Merchant & Zone */}
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] truncate">
                      <MapPin className="h-3 w-3 text-cyan-500 shrink-0" />
                      <span className={`truncate font-medium ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                        {product.shopName || "Verified Shop"}
                      </span>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className={`font-bold ${themeText}`}>{product.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Move to Cart */}
                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between gap-1.5 ${themeBorder}`}>
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-black tracking-tight font-mono truncate ${themeText}`}>
                        {product.price.toLocaleString()}{" "}
                        <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">ETB</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      title="Move to Cart"
                      className="cart-action-text flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all active:scale-95 cursor-pointer shrink-0 bg-transparent border-none"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-2xl border p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xl ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 shadow-sm"
              : isDark
                ? "bg-[#141418] border-white/10 text-white"
                : "bg-[#0d1222]/90 border-blue-500/20 text-white"
          }`}>
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
              <Heart className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className={`text-lg font-bold ${themeText}`}>Your wishlist is empty</h3>
            <p className={`text-xs leading-relaxed ${themeTextMuted}`}>
              Save products while browsing the marketplace to track prices and buy later with 100% buyer protection.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleSeedWishlist}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:brightness-110 px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load 6 Demo Wishlist Items</span>
              </button>
              <Link
                href="/marketplace"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                  isLight
                    ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
                }`}
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Suggested Section */}
        <section className={`pt-6 border-t space-y-4 ${themeBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Recommended For You
              </span>
              <h2 className={`mt-0.5 text-lg sm:text-xl font-bold ${themeText}`}>
                Trending Items to Add to Wishlist
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}
