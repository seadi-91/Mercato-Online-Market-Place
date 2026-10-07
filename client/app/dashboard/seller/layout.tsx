import React from "react";
import { SellerSidebar } from "@/components/layout/seller-sidebar";
import { SellerTopbar } from "@/components/layout/seller-topbar";
import { SellerBottomNav } from "@/components/layout/seller-bottom-nav";
import { SellerAuthGuard } from "@/components/auth/seller-auth-guard";

export const metadata = {
  title: "MercatoX | Merchant Portal & Seller Console",
  description: "Manage Ethiopian store catalog, incoming orders, courier pickup OTPs, and instant escrow settlements.",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen app-layout-canvas bg-[#070a10] text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Reusable Left Merchant Sidebar */}
      <SellerSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Reusable Top Merchant Bar */}
        <SellerTopbar />

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            <SellerAuthGuard>
              {children}
            </SellerAuthGuard>
          </div>
        </main>

        {/* Floating Mobile Bottom Navigation Dock */}
        <SellerBottomNav />
      </div>
    </div>
  );
}
