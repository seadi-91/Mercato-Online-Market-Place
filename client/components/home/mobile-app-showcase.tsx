"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Search,
  Star,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Wifi,
  Battery,
  MapPin,
  ChevronRight,
  ExternalLink,
  Zap,
  Filter,
  Flame,
} from "lucide-react";
import { Product } from "@/constants/mock-data";
import { useThemeStore } from "@/store/theme-store";

interface MobileAppShowcaseProps {
  variant?: "sidebar" | "full";
  products?: Product[];
}

export function MobileAppShowcase({ variant = "sidebar", products }: MobileAppShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.8);
  const [activeScreenTab, setActiveScreenTab] = useState<"market" | "home" | "escrow">("market");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState(2);
  const [toastMessage, setToastMessage] = useState<{
    id: number;
    title: string;
    subtitle: string;
    type: "cart" | "escrow" | "courier";
  } | null>({
    id: 1,
    title: "Marketplace Live",
    subtitle: "Verified Ethiopian Commercial Items",
    type: "courier",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useThemeStore();
  const isDarkPhoneTheme = resolvedTheme !== "light";

  const phoneBorderClass = isDarkPhoneTheme
    ? "border-[#f3f4f6]"
    : "border-[#050505]";

  const phoneTheme = {
    shell: "bg-[#0c0f17] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_-5px_rgba(99,102,241,0.25)]",
    screen: "bg-[#070a12] border-white/10",
    header: "border-white/10 bg-[#070a12]/95",
    panel: "bg-white/5 border-white/10",
    chip: "bg-zinc-200/80 border-zinc-300 text-zinc-700",
    card: "border-white/10 bg-[#0c1020] text-white",
    text: "text-white",
    muted: "text-zinc-400",
    accent: "text-cyan-400",
    accentStrong: "text-indigo-400",
    toast: "border-cyan-400/40 bg-[#081329]/95 text-white",
  };

  const sourceProducts = products || [];

  // Filter products for the mini marketplace view inside the phone
  const filteredProducts = sourceProducts.filter((p) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Tech") return p.categorySlug?.includes("electronic") || p.categorySlug?.includes("computer");
    if (activeCategory === "Phones") return p.categorySlug?.includes("smartphone") || p.categorySlug?.includes("mobile");
    if (activeCategory === "Fashion") return p.categorySlug?.includes("fashion") || p.categorySlug?.includes("apparel");
    if (activeCategory === "Kitchen") return p.categorySlug?.includes("kitchen") || p.categorySlug?.includes("home");
    return true;
  });

  // Fast auto-scroll simulation inside the phone ("animation feten feten sil betam endayzegey")
  useEffect(() => {
    if (!isPlaying) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollDirection = 1;
    let animationFrameId: number;

    const scrollStep = () => {
      if (!isPlaying || !container) return;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 0) return;

      // Speedy, snappy scrolling (1.8 - 2.8px per frame)
      container.scrollTop += speedMultiplier * scrollDirection;

      if (container.scrollTop >= maxScroll - 4) {
        scrollDirection = -1;
      } else if (container.scrollTop <= 4) {
        scrollDirection = 1;
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, activeScreenTab, speedMultiplier, activeCategory]);

  // Dynamic live action toasts cycling quickly (every 2.8s) to show active marketplace activity
  useEffect(() => {
    if (!isPlaying) return;

    const firstItem = sourceProducts[0]?.name ? `${sourceProducts[0].name.slice(0, 26)}...` : "Verified Marketplace Item";
    const secondItem = sourceProducts[1]?.name ? `${sourceProducts[1].name.slice(0, 26)}...` : "Direct Importer Catalog";

    const toastScenarios: Array<{
      title: string;
      subtitle: string;
      type: "cart" | "escrow" | "courier";
    }> = [
      {
        title: "Added to Cart 🛒",
        subtitle: firstItem,
        type: "cart",
      },
      {
        title: "Escrow Locked 🔒",
        subtitle: "100% Buyer protection in escrow vault",
        type: "escrow",
      },
      {
        title: "Courier En Route 🚚",
        subtitle: "Express Addis Ababa delivery active",
        type: "courier",
      },
      {
        title: "Verified Product ✨",
        subtitle: secondItem,
        type: "escrow",
      },
      {
        title: "OTP Handover Arrived ⚡",
        subtitle: "4-Digit OTP code ready for inspection",
        type: "courier",
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % toastScenarios.length;
      const nextToast = toastScenarios[index];
      setToastMessage({
        id: Date.now(),
        ...nextToast,
      });

      if (nextToast.type === "cart") {
        setCartCount((c) => (c >= 6 ? 1 : c + 1));
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full flex flex-col items-start">
      {/* Sidebar Top Header & Control Bar */}
      <div className="w-full max-w-[310px] mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
            <span>Mobile Marketplace</span>
          </span>
        </div>

        {/* Speed & Play Controls */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-0.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === 1.8 ? 3.0 : 1.8))}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
              speedMultiplier > 2
                ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
            title="Toggle Fast / Ultra-Fast Animation Speed"
          >
            {speedMultiplier > 2 ? "2x Fast" : "1x"}
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={isPlaying ? "Pause Tour" : "Resume Tour"}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3 text-cyan-400" />
            ) : (
              <Play className="h-3 w-3 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Hardware Mockup ("krtsu endesu yhunna") */}
      <div className="relative group w-full max-w-[310px] select-none">
        {/* Ambient Halo Glow */}
        <div className="absolute -inset-2 rounded-[52px] bg-gradient-to-tr from-indigo-500/25 via-cyan-500/20 to-purple-500/20 blur-xl opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Hardware Volume Rocker Buttons on Left Edge */}
        <div className="absolute -left-[8px] top-24 w-[3px] h-9 bg-zinc-700 rounded-l-md shadow-md" />
        <div className="absolute -left-[8px] top-36 w-[3px] h-9 bg-zinc-700 rounded-l-md shadow-md" />

        {/* Hardware Power Button on Right Edge */}
        <div className={`absolute -right-[8px] top-28 w-[3px] h-12 rounded-r-md shadow-md ${phoneBorderClass}`} />

        {/* Smartphone Chassis Frame */}
        <div className={`relative w-full h-[620px] rounded-[48px] p-2.5 sm:p-3 border-[7px] flex flex-col justify-between overflow-hidden ${phoneTheme.shell}`}>
          {/* Dynamic Island Notch Pill */}
          <div className={`absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between px-2 h-4 w-22 rounded-full border shadow-lg ${isDarkPhoneTheme ? "bg-black border-white/10" : "bg-black border-white/10"}`}>
            <div className="h-2 w-2 rounded-full bg-[#111827] border border-white/20 flex items-center justify-center">
              <div className="h-0.5 w-0.5 rounded-full bg-blue-500/80" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[7.5px] font-bold text-cyan-400 tracking-tighter">LIVE</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Top Mobile Status Bar */}
          <div className={`relative z-30 flex items-center justify-between px-3 pt-0.5 pb-1 text-[10px] font-semibold ${isDarkPhoneTheme ? "text-white/90" : "text-white/90"}`}>
            <span className="font-mono text-[10px]">09:41</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <span className="text-[8.5px] font-bold text-cyan-400">5G</span>
              <Wifi className="h-2.5 w-2.5" />
              <Battery className="h-3 w-3 text-emerald-400" />
            </div>
          </div>

          {/* Inner Phone Screen Canvas */}
          <div className={`flex-1 rounded-[36px] border flex flex-col overflow-hidden relative ${phoneTheme.screen} ${phoneTheme.text}`}>
            {/* Mini Phone App Header */}
            <div className={`shrink-0 z-20 border-b backdrop-blur-md px-3 py-2 space-y-1.5 ${phoneTheme.header}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-md bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-[10px] text-white shadow-sm">
                    M
                  </div>
                  <div>
                    <span className={`text-[11px] font-bold leading-none block ${phoneTheme.text}`}>
                      Mercato<span className={phoneTheme.accent}>X</span>
                    </span>
                    <span className={`text-[7.5px] flex items-center gap-0.5 leading-none mt-0.5 ${phoneTheme.muted}`}>
                      <MapPin className={`h-2 w-2 ${phoneTheme.accentStrong}`} /> Addis Ababa Protected
                    </span>
                  </div>
                </div>

                {/* Cart Badge in Phone (Text only, no background) */}
                <Link
                  href="/cart"
                  className={`flex items-center gap-1 font-bold transition-colors bg-transparent border-none ${phoneTheme.accentStrong} hover:text-cyan-300`}
                >
                  <ShoppingCart className={`h-3 w-3 ${phoneTheme.accentStrong}`} />
                  <span className="text-[9.5px]">({cartCount})</span>
                </Link>
              </div>

              {/* In-Phone Screen Switcher Tabs ("wede marketplace sihed") */}
              <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-lg text-[9px] font-bold ${phoneTheme.panel}`}>
                <button
                  type="button"
                  onClick={() => setActiveScreenTab("market")}
                  className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                    activeScreenTab === "market"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Marketplace ({sourceProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScreenTab("home")}
                  className={`py-1 rounded-md text-center transition-all cursor-pointer ${
                    activeScreenTab === "home"
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Orders Hub
                </button>
              </div>

              {/* Quick Search & Filter Bar */}
              <div className={`flex items-center gap-1.5 rounded-xl px-2 py-1 text-[9.5px] ${phoneTheme.panel}`}>
                <Search className="h-3 w-3 shrink-0 text-zinc-400" />
                <span className="truncate text-zinc-400">Search catalog items...</span>
              </div>

              {/* Quick Filter Categories in Phone */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
                {["All", "Tech", "Phones", "Fashion", "Kitchen"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-cyan-500 text-black font-extrabold shadow-sm"
                        : `${phoneTheme.chip} hover:text-white`
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Auto-Scrolling Body with Full Products ("mulu productoch sitay") */}
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsPlaying(false)}
              onMouseLeave={() => setIsPlaying(true)}
              className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-2 relative"
              style={{ scrollBehavior: "smooth" }}
            >
              {activeScreenTab === "home" ? (
                /* Mini Home View */
                <div className="space-y-2 pb-14">
                  {/* Hero Card */}
                  <div className="rounded-xl p-2.5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-700 text-white shadow-md">
                    <span className="text-[7.5px] font-bold uppercase bg-black/40 px-1.5 py-0.5 rounded text-cyan-200">
                      OTP Protected
                    </span>
                    <h4 className="text-[11px] font-bold mt-1 leading-tight">
                      Addis Ababa Protected Market
                    </h4>
                    <p className="text-[8.5px] text-white/80 mt-0.5">
                      Funds safely locked until physical doorstep inspection.
                    </p>
                  </div>

                  {/* Commercial Zones */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-bold text-white px-0.5">
                      <span>Addis Commercial Hubs</span>
                      <span className="text-cyan-400 text-[8px]">6 Zones</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: "Bole Medhanialem", tag: "Tech" },
                        { name: "Mercato Wholesale", tag: "Imports" },
                        { name: "Shiro Meda", tag: "Tibeb" },
                        { name: "Piazza Heritage", tag: "Gold" },
                      ].map((zone) => (
                        <div
                          key={zone.name}
                          className={`rounded-lg border p-1.5 text-center ${phoneTheme.panel}`}
                        >
                          <div className="text-[8.5px] font-bold text-white truncate">{zone.name}</div>
                          <div className="text-[7px] text-zinc-400">{zone.tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Full Marketplace View Showing All Products ("mulu productoch sitay") */
                <div className="space-y-2 pb-14">
                  <div className="flex items-center justify-between text-[9px] font-bold text-white px-0.5">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Flame className="h-2.5 w-2.5 text-amber-400" />
                      Trending Catalog
                    </span>
                    <span className="text-[8px] text-zinc-400">
                      {filteredProducts.length} Items
                    </span>
                  </div>

                  {/* Products Grid inside Smartphone */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`group/mini relative rounded-xl border p-1.5 space-y-1 hover:border-indigo-500/60 transition-all flex flex-col justify-between ${phoneTheme.card}`}
                      >
                        {/* Image */}
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/40">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-full w-full object-cover group-hover/mini:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {p.badge && (
                            <span className="absolute top-1 left-1 rounded bg-black/75 px-1 py-0.2 text-[7px] font-bold text-cyan-300 border border-white/10">
                              {p.badge}
                            </span>
                          )}
                        </div>

                        {/* Title & Seller */}
                        <div>
                          <h5 className="text-[8.5px] font-bold truncate leading-tight text-white">
                            {p.name}
                          </h5>
                          <p className="text-[7.5px] truncate mt-0.5 flex items-center gap-0.5 text-zinc-400">
                            <span className="text-indigo-400 font-semibold">{p.marketZone?.split(" ")[0]}</span>
                            <span>•</span>
                            <span className="truncate">{p.shopName}</span>
                          </p>
                        </div>

                        {/* Price & Mini Add Action (Text only, no background) */}
                        <div className="pt-0.5 flex items-center justify-between border-t border-white/5">
                          <span className="text-[8.5px] font-bold font-mono text-emerald-400">
                            {p.price.toLocaleString()} ETB
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCartCount((c) => c + 1);
                              setToastMessage({
                                id: Date.now(),
                                title: "Added to Cart 🛒",
                                subtitle: `${p.name.slice(0, 22)}...`,
                                type: "cart",
                              });
                            }}
                            className="text-[8px] font-bold flex items-center gap-0.5 active:scale-90 transition-transform cursor-pointer bg-transparent border-none p-0 text-indigo-400 hover:text-cyan-300"
                          >
                            <span>+</span>
                            <span>Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Protected Footer Note */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-1.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-emerald-300">
                      <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                      <span>100% Protected Delivery in Addis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fast Floating Live Toast Notification inside Phone */}
            {toastMessage && (
              <div
                key={toastMessage.id}
                className={`absolute bottom-3 left-2.5 right-2.5 z-40 rounded-xl border backdrop-blur-xl p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 ${phoneTheme.toast}`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    {toastMessage.type === "cart" ? (
                      <ShoppingCart className="h-3 w-3 text-cyan-400" />
                    ) : toastMessage.type === "courier" ? (
                      <Truck className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[8.5px] font-bold truncate text-white">
                      {toastMessage.title}
                    </div>
                    <div className="text-[7.5px] truncate text-zinc-300">
                      {toastMessage.subtitle}
                    </div>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Gesture Bar Indicator */}
          <div className="py-1 flex justify-center">
            <div className="h-1 w-20 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

    </div>
  );
}
