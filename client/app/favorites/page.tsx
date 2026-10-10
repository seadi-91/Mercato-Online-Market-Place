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
import { ProductDetailModal } from "@/components/modals/product-detail-modal";
import { useCartStore } from "@/store";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchProducts({ limit: 6 }).then((res) => {
      setRecommendedProducts(res.products);
    }).catch(console.error);
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
    setSelectedProduct(product);
    setIsModalOpen(true);
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

  const displayedList = favorites.length > 0 ? favorites : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-[1600px] w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-24 sm:pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                Personal Wishlist
              </span>
              <span className="text-xs text-zinc-400">
                {mounted ? favorites.length : 0} saved items
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
              <span>Saved Favorite Products</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Items you have marked as favorites across all categories
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {mounted && favorites.length === 0 && (
              <button
                type="button"
                onClick={handleSeedWishlist}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 px-3.5 py-2 text-xs font-semibold text-rose-200 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Load 6 Demo Items</span>
              </button>
            )}

            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Wishlist Quick Action Bar (Single display location) */}
        {mounted && displayedList.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1222]/80 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>
                Showing <strong className="text-white font-bold">{displayedList.length}</strong> favorite {displayedList.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
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
                className="w-full group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1222]/90 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30 hover:-translate-y-1 cursor-pointer overflow-hidden h-full"
              >
                {/* Product Image: Edge-to-edge / Full bleed */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#090d18]">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Quick View Button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickView(product as Product, e)}
                    title="Quick View"
                    style={{ color: "#ffffff" }}
                    className="product-image-action-btn absolute right-2 top-2 p-1 text-white hover:scale-115 transition-transform cursor-pointer"
                  >
                    <Eye
                      className="h-4 w-4 stroke-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
                      color="#ffffff"
                      style={{ stroke: "#ffffff", color: "#ffffff" }}
                    />
                  </button>

                  {/* Remove Trash Button - explicitly red */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, product)}
                    title="Remove from favorites"
                    className="favorite-trash-btn absolute left-2 top-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-500/20 text-red-500 hover:text-red-400 hover:scale-115 transition-all cursor-pointer z-10"
                  >
                    <Trash2
                      className="h-4 w-4 text-red-500 stroke-red-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                      style={{ color: "#ef4444", stroke: "#ef4444" }}
                    />
                  </button>
                </div>

                <div className="flex flex-col justify-between flex-1 p-3 sm:p-3.5">
                  <div>
                    {/* Category & Title */}
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-400 truncate block">
                        {product.category || "General Item"}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug min-h-[32px]"
                      >
                        {product.name}
                      </Link>
                    </div>

                    {/* Merchant & Zone */}
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-400 truncate">
                      <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                      <span className="text-zinc-300 truncate font-medium">
                        {product.shopName || "Verified Shop"}
                      </span>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span className="font-bold text-white">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Move to Cart */}
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-white tracking-tight font-mono truncate">
                        {product.price.toLocaleString()}{" "}
                        <span className="text-[10px] font-semibold text-cyan-400">ETB</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      title="Move to Cart"
                      className="cart-action-text flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-all active:scale-95 cursor-pointer shrink-0 bg-transparent border-none"
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
          <div className="rounded-2xl border border-white/10 bg-[#0d1222]/90 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xl">
            <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="h-8 w-8 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Suggested Section: 6 Featured Items Displayed in the exact same 6-col / 2-card mobile scroll format */}
        <section className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Recommended For You
              </span>
              <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-white">
                Trending Items to Add to Wishlist
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="w-full h-full"
              >
                <div
                  onClick={() => handleQuickView(product)}
                  className="product-card-surface group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1222]/90 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden h-full"
                >
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden bg-[#090d18]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite({
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
                          toast.success("Saved to favorites", { description: product.name });
                        }}
                        title="Save to Wishlist"
                        className="absolute right-1.5 top-1.5 h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Heart
                          className="h-3.5 w-3.5 stroke-white"
                          color="#ffffff"
                          style={{ stroke: "#ffffff" }}
                        />
                      </button>
                    </div>

                    <div className="p-2.5 sm:p-3">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-400 truncate block">
                        {product.category}
                      </span>
                      <h3 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug min-h-[32px]">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mx-2.5 sm:mx-3 mt-auto py-2 border-t border-white/10 flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm font-black text-white font-mono truncate">
                      {product.price.toLocaleString()} <span className="text-[10px] text-cyan-400">ETB</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      title="Add to Cart"
                      aria-label={`Add ${product.name} to cart`}
                      className="flex h-7 w-7 items-center justify-center bg-transparent text-white transition-transform hover:scale-110"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}
