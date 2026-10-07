import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export const metadata = {
  title: "MercatoX | Enterprise Admin Console",
  description: "Unified commerce platform, escrow monitoring, and KYC governance portal.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen app-layout-canvas bg-[#070a10] text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Reusable Left Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Reusable Top Admin Bar */}
        <AdminTopbar />

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-4 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
