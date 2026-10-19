"use client";

import React from "react";
import { CustomerHeader } from "@/components/layout/customer-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-app text-app transition-colors duration-200 relative overflow-x-clip selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[700px] rounded-full bg-gradient-to-b from-indigo-500/12 via-cyan-500/8 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Fixed Home Page Customer Header - Stays pinned at top and never scrolls away */}
      <CustomerHeader fixed />

      {/* Main Content with top padding so fixed header never covers form card */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3 sm:px-4 pt-20 pb-8 sm:pt-24 sm:pb-12">
        <div className="w-full max-w-[560px] transition-all duration-300">
          {children}
        </div>
      </main>

      {/* Strictly NO footer: reused only header per requirement */}
    </div>
  );
}

