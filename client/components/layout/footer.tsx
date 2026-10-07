"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "@/store/theme-store";
import { usePlatformStore } from "@/store";

export function CustomerFooter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useThemeStore();
  const { settings: platformSettings } = usePlatformStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light"));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribed(true);
    toast.success("Successfully Subscribed!", {
      description: `Marketplace updates will be sent to ${email}`,
    });
    setTimeout(() => {
      setEmail("");
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <footer
      className={`w-full border-t transition-colors mt-auto pb-16 sm:pb-0 ${
        isLight
          ? "border-slate-200 bg-slate-50 text-slate-600"
          : "border-white/10 bg-[#060910] text-zinc-400"
      }`}
    >
      {/* Newsletter & Subscription Section */}
      <div
        className={`border-b transition-colors py-8 ${
          isLight
            ? "border-slate-200 bg-gradient-to-r from-indigo-50/90 via-slate-100 to-cyan-50/80"
            : "border-white/10 bg-gradient-to-r from-indigo-950/30 via-[#0a1024] to-[#070b18]"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-semibold transition-colors ${
                  isLight
                    ? "border-cyan-600/30 bg-cyan-100/80 text-cyan-800"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`} />
                <span>Weekly Addis Ababa Deals & Flash Sales</span>
              </div>
              <h3
                className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Subscribe to {platformSettings.platformName} Marketplace Deals
              </h3>
              <p
                className={`text-xs max-w-xl transition-colors ${
                  isLight ? "text-slate-600" : "text-zinc-400"
                }`}
              >
                Get notified of exclusive Bole tech discounts, Shiro Meda cultural drops, and verified merchant promotions.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              className="flex w-full sm:w-auto items-center gap-2 max-w-md"
            >
              <div className="relative flex-1 sm:w-72">
                <Mail
                  className={`absolute left-3.5 top-3 h-4 w-4 pointer-events-none transition-colors ${
                    isLight ? "text-slate-400" : "text-zinc-400"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-xs outline-none transition-colors ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-600 shadow-sm"
                      : "border-white/15 bg-white/5 text-white placeholder-zinc-500 focus:border-cyan-400"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubscribed}
                className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isSubscribed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              {platformSettings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={platformSettings.logoUrl}
                  alt={platformSettings.platformName}
                  className="h-8 w-8 object-contain rounded-lg"
                />
              ) : (
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30">
                  {platformSettings.platformName.charAt(0) || "M"}
                </div>
              )}
              <span
                className={`text-lg font-bold tracking-tight transition-colors ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                {platformSettings.platformName}
              </span>
            </Link>
            <p
              className={`text-xs leading-relaxed max-w-sm transition-colors ${
                isLight ? "text-slate-600" : "text-zinc-400"
              }`}
            >
              {platformSettings.heroSectionDescription || platformSettings.platformDescription}
            </p>
            <div
              className={`pt-2 flex flex-col gap-1 text-xs transition-colors ${
                isLight ? "text-slate-500" : "text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>{platformSettings.headquartersAddress}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-cyan-500 shrink-0" />
                  <span>{platformSettings.footerEmail}</span>
                </div>
                {platformSettings.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>{platformSettings.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h5
              className={`font-semibold uppercase tracking-wider text-[11px] transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Marketplace
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Product Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Catalog Categories */}
          <div className="space-y-3 text-xs">
            <h5
              className={`font-semibold uppercase tracking-wider text-[11px] transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Departments
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace?category=kids-children"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Kids & Children
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=cosmetics-skincare"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Cosmetics & Skincare
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=fashion-apparel-shoes"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Fashion, Apparel & Shoes
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace?category=computers-electronics"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Electronics & Smart Devices
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Escrow */}
          <div className="space-y-3 text-xs">
            <h5
              className={`font-semibold uppercase tracking-wider text-[11px] transition-colors ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Customer Care
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/profile"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Account Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className={`transition-colors ${
                    isLight ? "text-slate-600 hover:text-slate-900" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-colors ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}
        >
          <p className={isLight ? "text-slate-500" : "text-zinc-500"}>
            {platformSettings.copyrightText ||
              `© ${new Date().getFullYear()} ${platformSettings.platformName} Inc. All rights reserved. Ethiopian Protected Commerce.`}
          </p>

          <div
            className={`flex items-center gap-4 transition-colors ${
              isLight ? "text-slate-600" : "text-zinc-400"
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Payments: Telebirr • Chapa • CBE Birr</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CustomerFooter;
