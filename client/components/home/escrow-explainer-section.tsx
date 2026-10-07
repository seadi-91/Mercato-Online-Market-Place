"use client";

import React from "react";
import {
  ShieldCheck,
  Lock,
  Truck,
  KeyRound,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building,
} from "lucide-react";

export function EscrowExplainerSection() {
  const steps = [
    {
      step: 1,
      tag: "Step 01",
      title: "Protected Escrow Deposit",
      description:
        "Deposit securely via Telebirr or CBE Birr. Funds are held in escrow, not released to the merchant until delivery.",
      icon: <Lock className="h-4.5 w-4.5 opacity-80" />,
    },
    {
      step: 2,
      tag: "Step 02",
      title: "Inspect at Doorstep",
      description:
        "Your courier delivers to your address in Addis Ababa. Inspect, unbox, and test your item in person before approving.",
      icon: <Truck className="h-4.5 w-4.5 opacity-80" />,
    },
    {
      step: 3,
      tag: "Step 03",
      title: "Release via 4-Digit OTP",
      description:
        "Only when fully satisfied, share your 4-digit SMS OTP code with the courier to complete payment release.",
      icon: <KeyRound className="h-4.5 w-4.5 opacity-80" />,
    },
  ];

  return (
    <section className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-app bg-app-card text-app p-4 sm:p-6 lg:p-7 shadow-xs">
        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-app pb-3.5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Protected Payment Guarantee</span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold tracking-tight text-app">
                How MercatoX Escrow Handover Works
              </h2>
            </div>

            {/* Verified Payment Partners Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-app-muted">
                Supported Payments:
              </span>
              <div className="flex items-center gap-1.5 rounded-lg border border-app bg-app px-2 py-1 text-xs font-semibold text-app">
                <Smartphone className="h-3 w-3 opacity-80" />
                <span>telebirr</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-app bg-app px-2 py-1 text-xs font-semibold text-app">
                <Building className="h-3 w-3 opacity-80" />
                <span>CBE Birr</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-app bg-app px-2 py-1 text-xs font-semibold text-app">
                <CreditCard className="h-3 w-3 opacity-80" />
                <span>Awash / Amole</span>
              </div>
            </div>
          </div>

          {/* 3 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-app bg-app p-3.5 sm:p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                    {s.tag}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10 text-app">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold tracking-tight mb-1 text-app">
                  {s.title}
                </h3>
                <p className="text-[11px] text-app-muted leading-relaxed">
                  {s.description}
                </p>

                <div className="mt-3 pt-2 border-t border-app flex items-center gap-1.5 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Guaranteed Handover Protection</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
