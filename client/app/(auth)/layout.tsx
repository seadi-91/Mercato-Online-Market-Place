"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { usePlatformStore } from "@/store";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = usePlatformStore();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080b11] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
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

      {/* Top Header */}
      <header className="relative z-10 w-full px-4 pt-5 pb-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/login"
            className="group flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
          >
            {/* Logo */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 overflow-hidden">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#0b0e17] overflow-hidden">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt={settings.platformName}
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <svg
                    className="h-4 w-4 text-indigo-400 group-hover:text-cyan-300 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                )}
              </div>
            </div>

            {/* Platform Name */}
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                {settings.platformName}
              </span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                Enterprise
              </span>
            </div>
          </Link>

          {/* System status pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 sm:px-3 py-1 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-zinc-300 hidden xs:inline">
              Systems Operational
            </span>
            <span className="text-[10px] font-medium text-emerald-400 xs:hidden">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3 sm:px-4 py-3 sm:py-6">
        <div className="w-full max-w-[480px] transition-all duration-300">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 py-4 border-t border-white/[0.04]">
        <div className="mx-auto flex max-w-4xl flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>256-bit Encryption</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="h-3 w-3 text-indigo-400" />
              <span>SOC2 Certified</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} {settings.platformName} Inc.</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
