"use client";

import React from "react";
import {
  Star,
  ShieldCheck,
  Quote,
  MapPin,
  CheckCircle2,
  Lock,
  Truck,
  Building2,
  Sparkles,
} from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  rating: number;
  verifiedItem: string;
  text: string;
  avatar: string;
  avatarBg: string;
  timeAgo: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Yohannes Bekele",
    role: "Verified Corporate Buyer",
    location: "Bole Medhanialem",
    rating: 5,
    verifiedItem: "Sony WH-1000XM5 ANC Headset",
    text: "Ordered a genuine Sony ANC headset. Courier arrived at my office within 2 hours. Inspected the box, tested audio, then entered my 4-digit OTP. 100% peace of mind!",
    avatar: "YB",
    avatarBg: "from-blue-600 to-cyan-500",
    timeAgo: "Verified Buyer • Bole Medhanialem",
  },
  {
    id: 2,
    name: "Tigist Haile",
    role: "Cultural Fashion Client",
    location: "Shiro Meda Artisan Client",
    rating: 5,
    verifiedItem: "Handwoven Habesha Kemis (Gold Tilf)",
    text: "Purchased a handwoven Habesha dress for an upcoming wedding. The four-layer cotton embroidery quality was top notch. Safe escrow payment is revolutionary for Addis!",
    avatar: "TH",
    avatarBg: "from-rose-500 to-amber-500",
    timeAgo: "Verified Buyer • Shiro Meda",
  },
  {
    id: 3,
    name: "Abel Mulugeta",
    role: "Merchant & Electronics Importer",
    location: "Mercato Commercial Wholesale",
    rating: 5,
    verifiedItem: "Flagship Smartphones & Laptops",
    text: "As an importer in Mercato, selling online used to have too many fake bank receipt issues. With MercatoX Escrow, funds are confirmed upfront before dispatch.",
    avatar: "AM",
    avatarBg: "from-emerald-600 to-teal-500",
    timeAgo: "Certified Merchant • Mercato Block 3",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Section Header with Trust Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-app pb-3.5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Escrow Protected Reviews</span>
          </div>
          <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-app">
            Verified Addis Community Voices
          </h2>
          <p className="text-xs text-app-muted">
            Authentic experiences from buyers and merchants across Bole, Mercato, Piazza, and Shiro Meda
          </p>
        </div>

        {/* Rating Score Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto rounded-xl border border-app bg-app-card px-3 py-1.5 shadow-xs">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-right">
            <div className="text-xs font-black font-mono text-app">4.95 / 5.0</div>
            <div className="text-[9.5px] text-app-muted">1,200+ Verified Handoves</div>
          </div>
        </div>
      </div>

      {/* Modern 3-Card Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="group relative rounded-2xl border border-app bg-app-card p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-app-hover hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Top Bar: Stars + OTP Verified Pill */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[9.5px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>OTP Verified</span>
                </span>
              </div>

              {/* Verified Product Purchased Pill */}
              <div className="rounded-lg bg-black/5 dark:bg-white/[0.03] border border-app px-2.5 py-1 text-[10.5px] font-medium text-app-muted truncate flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                <span className="truncate">{t.verifiedItem}</span>
              </div>

              {/* Testimonial Quote */}
              <div className="relative pt-1">
                <p className="text-xs sm:text-[12.5px] leading-relaxed text-app opacity-95">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
            </div>

            {/* Author Profile Footer */}
            <div className="mt-4 pt-3 border-t border-app flex items-center gap-2.5">
              <div
                className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.avatarBg} text-white font-black text-xs shadow-xs`}
              >
                {t.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold truncate text-app">{t.name}</h4>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-app-muted truncate">
                  <MapPin className="h-2.5 w-2.5 opacity-70 shrink-0" />
                  <span className="truncate">{t.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 rounded-2xl border border-app bg-app-card p-3 sm:p-4 text-center">
        <div className="flex items-center gap-2 p-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="h-4 w-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-app truncate">100% Escrow Lock</div>
            <div className="text-[10px] text-app-muted truncate">Zero upfront vendor payout</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-app truncate">4-Digit Inspection OTP</div>
            <div className="text-[10px] text-app-muted truncate">Approve only after test</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Truck className="h-4 w-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-app truncate">Addis Express Courier</div>
            <div className="text-[10px] text-app-muted truncate">Same-day across all sub-cities</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-app truncate">KYC Verified Stores</div>
            <div className="text-[10px] text-app-muted truncate">Direct Mercato & Bole stock</div>
          </div>
        </div>
      </div>
    </section>
  );
}
