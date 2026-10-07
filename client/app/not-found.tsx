import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#080b11] text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0d121f] p-7 text-center shadow-xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Compass className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">404 - Page Not Found</h2>
        <p className="mt-2 text-xs text-zinc-400">
          The enterprise resource or route you requested could not be located.
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
