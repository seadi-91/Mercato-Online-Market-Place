"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#080b11] text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0d121f] p-7 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="mt-2 text-xs text-zinc-400">
          {error?.message || "An unexpected enterprise portal error occurred."}
        </p>
        <div className="mt-5 flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try Again
          </button>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
