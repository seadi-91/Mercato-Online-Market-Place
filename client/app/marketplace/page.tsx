import React, { Suspense } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api/catalog";
import { MarketplaceClient } from "./marketplace-client";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [prodResult, catResult] = await Promise.all([
    fetchProducts({ limit: 50, sortBy: "createdAt", sortOrder: "DESC" }),
    fetchCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] flex items-center justify-center text-zinc-400">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-sm">Loading live marketplace...</span>
          </div>
        </div>
      }
    >
      <MarketplaceClient
        initialProducts={prodResult.products}
        initialCategories={catResult}
      />
    </Suspense>
  );
}
