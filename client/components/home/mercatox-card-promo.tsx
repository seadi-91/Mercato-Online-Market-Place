"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  Gift,
  Percent,
  Phone,
  Mail,
  User,
  Wifi,
  Layers,
  CheckCircle2,
  X,
  Copy,
  Crown,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformStore } from "@/store/platform-store";
import { toast } from "sonner";

export function MercatoXCardPromo() {
  const { user, isAuthenticated } = useAuthStore();
  const { settings: platformSettings } = usePlatformStore();
  const [copiedId, setCopiedId] = useState(false);
  const [hasCard, setHasCard] = useState(false);
  const [ownedCard, setOwnedCard] = useState<any>(null);
  const cardHref = isAuthenticated && user ? "/card" : "/login?redirect=%2Fcard";

  useEffect(() => {
    if (isAuthenticated && user && (user?.email || user?.id || user?.phoneNumber)) {
      try {
        if (typeof window !== "undefined") {
          const storageKey = `mercatox_card_${(user.email || user.id || "current").toLowerCase().trim()}`;
          const cached = localStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.cardNumber) {
              setHasCard(true);
              setOwnedCard(parsed);
            }
          }
        }
      } catch {}

      const emailParam = encodeURIComponent(user.email || "");
      const customerIdParam = encodeURIComponent(user.id || "");
      const phoneParam = encodeURIComponent(user.phoneNumber || "");
      fetch(
        `/api/card/my-cards?email=${emailParam}&customerId=${customerIdParam}&phoneNumber=${phoneParam}`
      )
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.cards) && d.cards.length > 0) {
            setHasCard(true);
            const userCard = d.cards.find((c: any) => c.status === "ACTIVE") || d.cards[0];
            if (userCard) {
              setOwnedCard(userCard);
            }
          } else {
            setHasCard(false);
            setOwnedCard(null);
          }
        })
        .catch(() => { });
    } else {
      setHasCard(false);
      setOwnedCard(null);
    }
  }, [isAuthenticated, user?.email, user?.id, user?.phoneNumber]);

  // Cardholder visual details
  const cardHolderName = ownedCard?.cardholderName || (user && user.name) || "MERCATOX MEMBER";
  const cardHolderEmail = ownedCard?.email || (user && user.email) || "customer@mercatox.com";
  const cardHolderPhone = ownedCard?.phoneNumber || (user && user.phoneNumber) || "+251 9...";
  const cardId = ownedCard?.cardNumber || "4892 7104 8942 0192";
  const expiryDate = ownedCard?.expiryDate || "10/29";
  const defaultBalance = ownedCard?.balance != null ? Number(ownedCard.balance).toFixed(2) : (platformSettings?.minCardLoadAmount || "500.00");
  const adminCardPrice = platformSettings?.cardIssuanceFee || "150";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(cardId);
    setCopiedId(true);
    toast.success("Card ID copied: " + cardId);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <section className="relative w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
      {/* Parent Card Container with Full Width & Reduced Compact Height */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-app bg-app-card text-app p-4 sm:p-5 lg:p-6 shadow-xs dark:shadow-xl transition-colors duration-200">
        {/* Subtle Ambient Decorative Glow that adapts smoothly */}
        <div className="absolute top-0 right-1/4 w-96 h-40 bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
          {/* Left Column: Title, Benefits, and Buy Button (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              <span>MercatoX Privilege & Gift Cards</span>
            </div>

            {/* Headline */}
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-app">
                Get the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-500 to-cyan-500 dark:from-indigo-400 dark:via-sky-400 dark:to-cyan-400">
                  MercatoX Card
                </span>{" "}
                & Earn Cashback on Every Order
              </h2>
              <p className="text-xs sm:text-[13px] text-app-muted mt-1 max-w-xl leading-relaxed">
                Send instant digital gift cards to friends or activate your loyalty card with ETB {defaultBalance} default balance (Issuance fee: ETB {adminCardPrice}) to earn up to 5% automated cashback with 0% escrow handling fees across Addis Ababa and countrywide.
              </p>
            </div>

            {/* Compact Perks & Action Button Row */}
            <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href={cardHref}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
              >
                <CreditCard className="h-4 w-4" />
                <span>{hasCard ? "View Card" : "Buy Card"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {/* 3 Quick Bullet Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-app-muted">
                <div className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                  <span>Instant SMS/Email Delivery</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span>5% Automated Cashback</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                  <span>0% Escrow Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Realistic ATM Cards with Updated Logo & ETB 500 */}
          <div className="lg:col-span-5 flex items-center justify-center">
            {/* Cards Showcase Stack */}
            <Link
              href={cardHref}
              title="Click to customize and buy your MercatoX Card"
              className="relative w-full max-w-[420px] h-[180px] sm:h-[195px] flex items-center justify-center group cursor-pointer"
            >
              {/* Back Card 1: Left Tilted Emerald Card */}
              <div className="absolute left-1/2 -translate-x-[68%] sm:-translate-x-[64%] top-1.5 w-[250px] sm:w-[290px] aspect-[85.6/53.98] rounded-[10px] -rotate-[9deg] bg-gradient-to-br from-[#064e3b] via-[#042f2e] to-[#022c22] border border-emerald-400/30 shadow-lg opacity-85 group-hover:opacity-100 group-hover:-rotate-[12deg] transition-all duration-300 p-2.5 text-white z-10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Compact Real MercatoX Logo */}
                    <div className="relative w-[32px] h-[22px] rounded-[3px] bg-[#090d16] border border-white/20 flex items-center justify-center overflow-hidden p-0 m-0 shrink-0">
                      {platformSettings?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={platformSettings.logoUrl}
                          alt="MercatoX"
                          className="w-full h-full object-cover p-0 m-0 block"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
                          <svg className="w-full h-full p-0.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="white" fillOpacity="0.3" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-tight leading-none text-white">MercatoX</p>
                      <p className="text-[7px] font-mono text-emerald-300 uppercase">Emerald Card</p>
                    </div>
                  </div>
                  {/* Default 500 Amount with ETB abbreviation */}
                  <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    ETB 500.00
                  </span>
                </div>
                <div className="text-[8px] font-mono tracking-widest text-emerald-200/80">
                  4892 •••• •••• 8821
                </div>
              </div>

              {/* Back Card 2: Right Tilted Royal Indigo VIP Card */}
              <div className="absolute left-1/2 -translate-x-[32%] sm:-translate-x-[36%] top-1.5 w-[250px] sm:w-[290px] aspect-[85.6/53.98] rounded-[10px] rotate-[9deg] bg-gradient-to-br from-[#312e81] via-[#1e1b4b] to-[#0f172a] border border-indigo-400/30 shadow-lg opacity-85 group-hover:opacity-100 group-hover:rotate-[12deg] transition-all duration-300 p-2.5 text-white z-10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Compact Real MercatoX Logo */}
                    <div className="relative w-[32px] h-[22px] rounded-[3px] bg-[#090d16] border border-white/20 flex items-center justify-center overflow-hidden p-0 m-0 shrink-0">
                      {platformSettings?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={platformSettings.logoUrl}
                          alt="MercatoX"
                          className="w-full h-full object-cover p-0 m-0 block"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center">
                          <svg className="w-full h-full p-0.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" fill="white" fillOpacity="0.3" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-tight leading-none text-white">MercatoX</p>
                      <p className="text-[7px] font-mono text-indigo-300 uppercase">Sapphire Card</p>
                    </div>
                  </div>
                  {/* Default 500 Amount with ETB abbreviation */}
                  <span className="text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                    ETB 500.00
                  </span>
                </div>
                <div className="text-[8px] font-mono tracking-widest text-indigo-200/80">
                  4892 •••• •••• 4091
                </div>
              </div>

              {/* Front Card: Featured Real MercatoX Card with Exact Real Logo & ETB 500 */}
              <div className="relative z-20 w-[275px] sm:w-[320px] aspect-[85.6/53.98] rounded-[12px] p-3 sm:p-3.5 bg-gradient-to-br from-[#070b19] via-[#0f1738] to-[#042137] border border-cyan-400/40 shadow-2xl shadow-black/60 text-white transition-transform duration-300 group-hover:scale-[1.03] flex flex-col justify-between overflow-hidden">
                {/* Holographic Sheen Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />

                {/* Top Header: Compact Real MercatoX Rectangular Logo + Brand Color Text + Hologram Seal */}
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {/* Compact Real MercatoX Rectangular Logo */}
                    <div className="relative w-[38px] h-[26px] sm:w-[44px] sm:h-[28px] rounded-[4px] bg-[#090d16] border border-white/20 flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0 overflow-hidden p-0 m-0">
                      {platformSettings?.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={platformSettings.logoUrl}
                          alt={platformSettings.platformName || "MercatoX"}
                          className="w-full h-full object-cover p-0 m-0 block"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 flex items-center justify-center p-0 m-0 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                          <svg
                            className="w-full h-full block"
                            viewBox="0 0 48 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient id="promoHomeCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ffffff" />
                                <stop offset="100%" stopColor="#93c5fd" />
                              </linearGradient>
                            </defs>
                            <polygon points="24 3 43 12 24 20 5 12" fill="url(#promoHomeCubeTop)" />
                            <polygon points="5 12 24 20 24 29 5 20" fill="#312e81" />
                            <polygon points="24 20 43 12 43 20 24 29" fill="#0891b2" />
                            <polyline points="5 12 24 20 43 12" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="24" y1="20" x2="24" y2="29" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                            <polyline points="5 20 24 29 43 20" stroke="white" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* "MercatoX Card" written in Brand Color */}
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-xs sm:text-[13px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-white drop-shadow-[0_1px_8px_rgba(79,70,229,0.3)]">
                          Mercato<span className="text-cyan-400">X</span>
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-white/95 uppercase tracking-wider font-mono">
                          Card
                        </span>
                      </div>
                      <p className="text-[7px] sm:text-[7.5px] font-mono tracking-widest text-cyan-300/80 uppercase mt-0.5">
                        Signature Brand
                      </p>
                    </div>
                  </div>

                  {/* Iridescent Hologram Foil Seal & Status */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="relative h-5 w-5 sm:h-5.5 sm:w-5.5 rounded-full bg-gradient-to-tr from-amber-300/30 via-cyan-300/40 to-indigo-400/40 border border-white/30 backdrop-blur-md flex items-center justify-center overflow-hidden"
                      title="Security Hologram"
                    >
                      <ShieldCheck className="h-3 w-3 text-cyan-200" />
                    </div>
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[7.5px] font-bold text-cyan-300 font-mono tracking-wider backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>OFFICIAL</span>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Gold EMV Chip + Contactless + Live Amount Display (ETB 500) */}
                <div className="relative z-10 my-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Realistic Golden EMV Chip */}
                    <div className="w-7 h-5 sm:w-8 sm:h-5.5 rounded-[3px] bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-[1px] shadow-sm relative overflow-hidden flex items-center justify-center shrink-0 border border-amber-300/40">
                      <div className="w-full h-full rounded-[2px] bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 relative opacity-95">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-amber-700/60" />
                        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-700/60" />
                        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-700/60" />
                      </div>
                    </div>

                    {/* Contactless Wave */}
                    <Wifi className="h-3.5 w-3.5 text-cyan-300/80 rotate-90" />
                  </div>

                  {/* DEFAULT 500 AMOUNT IN ETHIOPIAN BIRR ABBREVIATION (ETB) */}
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] sm:text-[7.5px] font-mono uppercase tracking-wider text-cyan-200/75 font-medium leading-none">
                      Available Balance
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[8.5px] sm:text-[9.5px] font-bold font-mono text-cyan-400 leading-none">
                        ETB
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-indigo-200 drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)] leading-none">
                        {defaultBalance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card ID (Monospace Style with High Contrast Text) */}
                <div className="relative z-10 flex items-center justify-between py-0.5">
                  <span className="font-mono text-xs sm:text-[13px] font-bold text-white tracking-[0.2em] select-all">
                    {cardId}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyId(e);
                    }}
                    className="text-zinc-300 hover:text-cyan-300 transition-colors cursor-pointer p-0.5"
                    title="Copy Card ID"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 text-cyan-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                {/* Bottom Row: Customer Info & Expiry - Strictly English */}
                <div className="relative z-10 pt-1 border-t border-white/10 flex items-end justify-between text-xs">
                  <div className="space-y-0.2 min-w-0 pr-1.5">
                    <p className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
                      Cardholder
                    </p>
                    <p className="font-bold text-white text-[10.5px] sm:text-[11.5px] tracking-wide uppercase font-mono truncate">
                      {cardHolderName}
                    </p>
                    <div className="flex items-center gap-1 text-[8px] sm:text-[8.5px] text-zinc-300 font-mono leading-none">
                      <span className="truncate max-w-[100px] sm:max-w-[130px]">{cardHolderEmail}</span>
                      <span>•</span>
                      <span className="truncate">{cardHolderPhone}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-400 leading-none">
                      Valid Thru
                    </p>
                    <p className="font-mono font-bold text-white text-[10.5px] sm:text-[11.5px]">
                      {expiryDate}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
