import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MercatoX | Enterprise B2B Supplier Dashboard & Workspace",
  description:
    "Enterprise management portal for Ethiopian suppliers, commodity aggregators, and manufacturers. Manage products, wholesale tier pricing, RFQs, quotations, purchase orders, escrow payments, and warehouse logistics.",
};

export default function SupplierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen app-layout-canvas bg-[#070a10] text-zinc-100 flex flex-row font-sans selection:bg-indigo-600/30 selection:text-indigo-600 dark:text-indigo-400">
      {children}
    </div>
  );
}
