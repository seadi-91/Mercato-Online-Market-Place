"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  QrCode,
  Download,
  MapPin,
  KeyRound,
  Zap,
  ArrowRight,
} from "lucide-react";
import { MobileAppShowcase } from "./mobile-app-showcase";
import { Product } from "@/constants/mock-data";
import { toast } from "sonner";

interface MobileAppDownloadSectionProps {
  products: Product[];
}

export function MobileAppDownloadSection({ products }: MobileAppDownloadSectionProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const handleInstallPwa = () => {
    toast.success("MercatoX PWA Ready", {
      description: "Tap 'Add to Home Screen' in your mobile browser to install.",
    });
  };

  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-app bg-app-card text-app p-5 sm:p-7 lg:p-9 shadow-xs">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Column: App Benefits & Download CTAs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-black/5 dark:bg-white/10 px-2 py-0.5 text-[11px] font-bold text-app">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Next-Gen Mobile Shopping</span>
              </div>

              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-app">
                Shop Addis Ababa Deals Anywhere
              </h2>

              <p className="text-xs sm:text-sm text-app-muted max-w-xl leading-relaxed">
                Experience fast mobile ordering, live motorcycle courier GPS tracking, and instant SMS OTP handover directly on your smartphone.
              </p>
            </div>

            {/* 3 Key Mobile Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="rounded-xl border border-app bg-app p-3">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-app mb-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold mb-0.5 text-app">Live Addis GPS</h4>
                <p className="text-[10px] text-app-muted leading-snug">
                  Real-time driver location from shop to your doorstep.
                </p>
              </div>

              <div className="rounded-xl border border-app bg-app p-3">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-app mb-1.5">
                  <KeyRound className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold mb-0.5 text-app">Instant OTP Auth</h4>
                <p className="text-[10px] text-app-muted leading-snug">
                  4-digit secure release code sent straight to your phone.
                </p>
              </div>

              <div className="rounded-xl border border-app bg-app p-3">
                <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-app mb-1.5">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-xs font-bold mb-0.5 text-app">Offline Wishlist</h4>
                <p className="text-[10px] text-app-muted leading-snug">
                  Save favorite items even with low mobile connectivity.
                </p>
              </div>
            </div>

            {/* CTAs and QR Code */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleInstallPwa}
                className="inline-flex items-center gap-1.5 rounded-xl bg-app text-app-card border border-app hover:opacity-85 px-4 py-2.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Install MercatoX PWA</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-app bg-app text-app hover:border-app-hover px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5 opacity-80" />
                <span>{showQrModal ? "Hide QR Code" : "Scan to Open on Mobile"}</span>
              </button>

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-xs font-semibold text-app hover:underline ml-1"
              >
                <span>Browse Store</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* QR Code Reveal Panel */}
            {showQrModal && (
              <div className="flex items-center gap-3.5 rounded-xl border border-app bg-app p-3 max-w-sm">
                <div className="h-16 w-16 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect width="100" height="100" fill="#ffffff" />
                    <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                    <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                    <rect x="20" y="20" width="10" height="10" fill="#0f172a" />
                    <rect x="60" y="10" width="30" height="30" fill="#0f172a" />
                    <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
                    <rect x="70" y="20" width="10" height="10" fill="#0f172a" />
                    <rect x="10" y="60" width="30" height="30" fill="#0f172a" />
                    <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
                    <rect x="20" y="70" width="10" height="10" fill="#0f172a" />
                    <rect x="45" y="15" width="10" height="10" fill="#0f172a" />
                    <rect x="45" y="45" width="10" height="20" fill="#0f172a" />
                    <rect x="60" y="60" width="15" height="15" fill="#0f172a" />
                    <rect x="80" y="75" width="10" height="15" fill="#0f172a" />
                  </svg>
                </div>
                <div className="text-xs">
                  <h5 className="font-bold text-app">Scan with Camera</h5>
                  <p className="text-[10px] text-app-muted mt-0.5">
                    Instantly opens MercatoX on your smartphone.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Smartphone Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[300px]">
              <MobileAppShowcase variant="sidebar" products={products} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
