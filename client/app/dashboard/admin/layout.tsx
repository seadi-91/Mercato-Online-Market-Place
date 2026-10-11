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
    <div className="relative h-screen w-full app-layout-canvas bg-[#050811] text-zinc-100 flex flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
      {/* Ambient background glows for high-end modern aesthetic */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[128px]" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-cyan-600/8 blur-[128px]" />
        <div className="absolute -bottom-20 left-1/3 h-96 w-96 rounded-full bg-amber-600/5 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Reusable Left Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Reusable Top Admin Bar */}
        <AdminTopbar />

        {/* Page Content Container */}
        <main className="flex-1 p-2.5 sm:p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] transition-all">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
