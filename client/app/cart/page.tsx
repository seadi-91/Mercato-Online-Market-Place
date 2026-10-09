"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Lock,
  RotateCcw,
  Palette,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { CustomerHeader } from "@/components/layout/customer-header";
import { CustomerFooter } from "@/components/layout/footer";
import { CustomerBottomNav } from "@/components/layout/customer-bottom-nav";
import { useCartStore, useAuthStore } from "@/store";
import { Product } from "@/constants/mock-data";
import { fetchProducts } from "@/lib/api/catalog";
import { fetchCustomerProfile, CustomerProfile } from "@/lib/api/customer";
import { getAccurateProductImage } from "@/lib/utils/product-image";
import { toast } from "sonner";

// Helper to determine size and color options based on product category & attributes
function getProductOptions(category?: string, name?: string) {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();

  // Footwear / Shoes / Chelsea Boots
  if (n.includes("boot") || n.includes("shoe") || cat.includes("shoe")) {
    return {
      sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
      colors: ["Vintage Tan", "Dark Brown", "Midnight Black"],
      sizeLabel: "Size",
    };
  }

  // Fashion / Apparel / Traditional Habesha Tibeb
  if (
    cat.includes("fashion") ||
    cat.includes("apparel") ||
    n.includes("kemis") ||
    n.includes("gabi") ||
    n.includes("kuta") ||
    n.includes("netela") ||
    n.includes("dress") ||
    n.includes("shawl") ||
    n.includes("shirt")
  ) {
    return {
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["White / Gold Tibeb", "Pure White", "Royal Blue", "Emerald Green"],
      sizeLabel: "Size",
    };
  }

  // Tech / Mobile / Headphones / Electronics / Laptops
  if (
    cat.includes("electronic") ||
    cat.includes("mobile") ||
    cat.includes("tech") ||
    n.includes("iphone") ||
    n.includes("galaxy") ||
    n.includes("macbook") ||
    n.includes("ipad") ||
    n.includes("headphone") ||
    n.includes("sony") ||
    n.includes("dell")
  ) {
    return {
      sizes: n.includes("headphone") ? [] : ["128GB", "256GB", "512GB", "1TB"],
      colors: ["Natural Titanium", "Space Black", "Silver", "Midnight Blue"],
      sizeLabel: "Storage",
    };
  }

  // Leather Goods (Duffles, Briefcases, Bags, Wallets)
  if (
    cat.includes("leather") ||
    n.includes("duffle") ||
    n.includes("briefcase") ||
    n.includes("wallet") ||
    n.includes("bag")
  ) {
    return {
      sizes: ["Standard", "Large"],
      colors: ["Vintage Tan", "Espresso Brown", "Classic Black"],
      sizeLabel: "Size",
    };
  }

  // Groceries / Specialty Coffee / Honey / Spices
  if (
    cat.includes("grocer") ||
    cat.includes("grain") ||
    n.includes("coffee") ||
    n.includes("honey") ||
    n.includes("spice") ||
    n.includes("berbere")
  ) {
    return {
      sizes: ["500g", "1kg", "2kg"],
      colors: [],
      sizeLabel: "Weight",
    };
  }

  return null;
}

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const updateItemOptions = useCartStore((state) => state.updateItemOptions);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const token = useAuthStore((state) => state.token);

  const [mounted, setMounted] = useState(false);
  const [visibleSummaryCount, setVisibleSummaryCount] = useState(2);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [savedCustomerAddress, setSavedCustomerAddress] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchProducts({ limit: 8 })
      .then((res) => {
        setCatalogProducts(res.products);
      })
      .catch(console.error);

    if (token) {
      fetchCustomerProfile(token)
        .then((profile) => {
          if (profile) setSavedCustomerAddress(profile);
        })
        .catch(console.error);
    }
  }, [token]);

  const subtotal = mounted ? getTotalPrice() : 0;
  const deliveryFee = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const total = subtotal + deliveryFee;
  const displayedSummaryItems = items.slice(0, visibleSummaryCount);

  // Recommendations: products from catalog not yet in the cart
  const cartItemIds = new Set(items.map((i) => i.id));
  const recommendedProducts = catalogProducts
    .filter((p) => !cartItemIds.has(p.id))
    .slice(0, 4);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <CustomerHeader />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              <span>Your Shopping Cart</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              All purchases on MercatoX are protected by 100% buyer protection guarantee.
            </p>
          </div>

          {mounted && items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                toast.info("Cart cleared");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {/* Content */}
        {!mounted ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="mt-4 text-xs text-zinc-400">Loading your cart items...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="w-full lg:col-span-7 xl:col-span-7 space-y-3.5">
              {items.map((item) => {
                const options = getProductOptions(item.category, item.name);

                return (
                  <div
                    key={`${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                    className="rounded-2xl border border-white/10 bg-[#0b101f]/90 p-3.5 sm:p-4 backdrop-blur-md flex flex-col gap-3 hover:border-indigo-500/30 transition-all w-full shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Item Thumbnail */}
                      {item.image && (
                        <Link
                          href={`/products/${item.id}`}
                          className="relative h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 hover:border-indigo-500/50 transition-colors block"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </Link>
                      )}

                      {/* Main Details */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <Link
                          href={`/products/${item.id}`}
                          className="block text-xs sm:text-sm font-semibold text-white hover:text-cyan-300 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{item.shopName}</span>
                          <span>•</span>
                          <span className="text-zinc-500 truncate">{item.marketZone}</span>
                        </div>
                        <div className="text-[11px] font-mono text-cyan-300">
                          Unit: {item.price.toLocaleString()} ETB
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.id);
                          toast.info(`Removed ${item.name} from cart`);
                        }}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Size and Color Selectors if Required */}
                    {options && (
                      <div className="pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-3 text-xs bg-white/[0.02] -mx-3.5 sm:-mx-4 -mb-1 px-3.5 sm:px-4 py-2 rounded-b-xl">
                        {/* Size / Storage / Weight Selector */}
                        {options.sizes.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] text-zinc-400 font-medium">
                              {options.sizeLabel}:
                            </span>
                            <select
                              value={item.selectedSize || options.sizes[0]}
                              onChange={(e) => {
                                updateItemOptions(item.id, { size: e.target.value });
                                toast.success(`Selected ${options.sizeLabel}: ${e.target.value}`);
                              }}
                              className="rounded-lg border border-white/15 bg-[#0b101f] px-2 py-0.5 text-[10.5px] text-white outline-none focus:border-cyan-400 cursor-pointer"
                            >
                              {options.sizes.map((sz) => (
                                <option key={sz} value={sz} className="bg-[#0b101f] text-white">
                                  {sz}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Color Selector */}
                        {options.colors.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Palette className="h-3 w-3 text-zinc-400" />
                            <span className="text-[10.5px] text-zinc-400 font-medium">Color:</span>
                            <select
                              value={item.selectedColor || options.colors[0]}
                              onChange={(e) => {
                                updateItemOptions(item.id, { color: e.target.value });
                                toast.success(`Selected Color: ${e.target.value}`);
                              }}
                              className="rounded-lg border border-white/15 bg-[#0b101f] px-2 py-0.5 text-[10.5px] text-white outline-none focus:border-cyan-400 cursor-pointer"
                            >
                              {options.colors.map((col) => (
                                <option key={col} value={col} className="bg-[#0b101f] text-white">
                                  {col}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity Stepper & Subtotal Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      {/* Stepper with comfortable touch targets */}
                      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-white font-mono">
                          {(item.price * item.quantity).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary & Escrow Checkout */}
            <div className="w-full lg:col-span-5 xl:col-span-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/95 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Order Summary
                  </h2>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Cart Products List with Image and Quantity x Price = Answer */}
                {items.length > 0 && (
                  <div className="space-y-2.5 pb-3 border-b border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                      <span>Products in Order</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {Math.min(visibleSummaryCount, items.length)} of {items.length} shown
                      </span>
                    </div>

                    <div className="space-y-2">
                      {displayedSummaryItems.map((item) => {
                        const itemSubtotal = item.quantity * item.price;
                        return (
                          <div
                            key={`summary-${item.id}-${item.selectedSize || ""}-${item.selectedColor || ""}`}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                              <img
                                src={getAccurateProductImage(item.name, undefined, item.image)}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = getAccurateProductImage(item.name);
                                }}
                              />
                              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[9px] font-bold text-white font-mono">
                                x{item.quantity}
                              </span>
                            </div>

                            {/* Details and Calculation */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate" title={item.name}>
                                {item.name}
                              </h4>
                              {(item.selectedSize || item.selectedColor) && (
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                                  {item.selectedSize && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                      {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Quantity x Price = Total */}
                              <div className="mt-1 text-[11px] font-mono">
                                <span className="text-zinc-400">
                                  {item.quantity} × {item.price.toLocaleString()} ETB ={" "}
                                </span>
                                <span className="text-cyan-300 font-bold">
                                  {itemSubtotal.toLocaleString()} ETB
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-step View More (+2) / View Less (-2) Controls */}
                    {items.length > 2 && (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {visibleSummaryCount < items.length ? (
                          <button
                            type="button"
                            onClick={() => setVisibleSummaryCount((prev) => prev + 2)}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                            <span>View More (+2)</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {visibleSummaryCount > 2 && (
                          <button
                            type="button"
                            onClick={() => setVisibleSummaryCount((prev) => Math.max(2, prev - 2))}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer active:scale-98 ml-auto"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                            <span>View Less (-2)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Costs Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Items Subtotal</span>
                    <span className="text-white font-mono font-semibold">
                      {subtotal.toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>Doorstep Courier Delivery</span>
                    <span className="text-white font-mono font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE (Over 5,000 ETB)</span>
                      ) : (
                        `${deliveryFee} ETB`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span>100% Buyer Protection</span>
                    <span className="text-emerald-400 font-bold">Covered (0 ETB)</span>
                  </div>

                  <div className="pt-2.5 border-t border-white/10 flex justify-between text-sm sm:text-base font-bold text-white">
                    <span>Total Amount</span>
                    <span className="font-mono text-cyan-300">
                      {total.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                {/* Saved Delivery Destination Preview (Loaded from Backend Database) */}
                {savedCustomerAddress && (savedCustomerAddress.subCity || savedCustomerAddress.specificLocation) ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-start gap-2.5 text-xs">
                    <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-white truncate">
                          Delivering to {savedCustomerAddress.fullName || "Your Account"}
                        </span>
                        <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9.5px] font-mono text-cyan-300">
                          Saved in DB
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        {savedCustomerAddress.subCity ? `${savedCustomerAddress.subCity}, ` : ""}
                        {savedCustomerAddress.specificLocation || "Addis Ababa"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Escrow Guarantee Notice */}
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 flex items-start gap-2.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    Funds remain securely locked until you inspect the parcel and share your 4-digit SMS OTP with courier.
                  </p>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  <span>Process to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Delivery Speed Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0b101f]/60 p-3.5 backdrop-blur-sm space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold">Doorstep Dispatch Available</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Instant courier fulfillment across Bole, Mercato, Shiro Meda, Kazanchis, and all Addis Ababa districts.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="rounded-3xl border border-white/10 bg-[#0b101f]/80 p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Your cart is empty</h2>
              <p className="text-xs text-zinc-400">
                Looks like you haven&apos;t added any protected items yet.
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <span>Browse Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
        {/* You May Also Like Section */}
        {mounted && recommendedProducts.length > 0 && (
          <section className="pt-8 border-t border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Curated Marketplace Picks</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Browse all marketplace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {recommendedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0b101f]/90 p-2.5 sm:p-3 backdrop-blur-md hover:border-indigo-500/40 transition-all hover:shadow-xl hover:shadow-indigo-950/30"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-black/40">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <span className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-300 border border-white/10">
                        {prod.category}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <MapPin className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{prod.marketZone}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1" title={prod.name}>
                        {prod.name}
                      </h3>
                      <div className="text-xs font-bold text-white font-mono">
                        {prod.price.toLocaleString()} ETB
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => {
                      addItem({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.image,
                        shopName: prod.shopName,
                        marketZone: prod.marketZone,
                        category: prod.category,
                        stock: prod.stock,
                        rating: prod.rating,
                      });
                      toast.success("Added to cart", {
                        description: `${prod.name} added to your cart.`,
                      });
                    }}
                    className="mt-2.5 w-full rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 py-1.5 text-[11px] font-semibold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Floating Sticky Checkout Bar */}
      {mounted && items.length > 0 && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-white/10 bg-[#090d18]/95 backdrop-blur-2xl px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Total ({items.length} items)</span>
            <span className="text-sm font-black text-cyan-300 font-mono">
              {total.toLocaleString()} ETB
            </span>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Checkout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Floating Mobile Bottom Navigation Bar */}
      <CustomerBottomNav />

      <CustomerFooter />
    </div>
  );
}
