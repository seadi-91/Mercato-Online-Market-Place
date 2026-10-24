"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SellerAuthGuard } from "@/components/auth/seller-auth-guard";
import SellerWholesaleCheckoutPage from "@/app/dashboard/seller/wholesale-checkout/page";

export default function WholesaleCheckoutAliasPage() {
  return (
    <SellerAuthGuard>
      <div className="min-h-screen bg-[#070a10] text-zinc-100 p-4 sm:p-6 md:p-8">
        <SellerWholesaleCheckoutPage />
      </div>
    </SellerAuthGuard>
  );
}
