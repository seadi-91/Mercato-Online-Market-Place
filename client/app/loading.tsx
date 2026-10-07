import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080b11] text-zinc-300">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <span className="text-xs font-medium tracking-wide text-zinc-400">
          Loading MercatoX Console...
        </span>
      </div>
    </div>
  );
}
