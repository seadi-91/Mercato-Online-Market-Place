"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminUIStore, type AdminTab } from "@/store/ui-store";
import { AdminStats } from "./components/admin-stats";
import { AdminCatalog } from "./components/admin-catalog";
import { AdminCategories } from "./components/admin-categories";
import { AdminUsersTable } from "./components/admin-users-table";
import { AdminSellersSuppliers } from "./components/admin-sellers-suppliers";
import { AdminSuppliers } from "./components/admin-suppliers";
import { AdminOrdersEscrow } from "./components/admin-orders-escrow";
import { AdminSlipsVerification } from "./components/admin-slips-verification";
import { AdminDelivery } from "./components/admin-delivery";
import { AdminDisputes } from "./components/admin-disputes";
import { AdminAuditLogs } from "./components/admin-audit-logs";
import { AdminSettings } from "./components/admin-settings";
import { AdminSubscriptions } from "./components/admin-subscriptions";

function TabUrlSync() {
  const searchParams = useSearchParams();
  const { setActiveTab } = useAdminUIStore();

  useEffect(() => {
    let tab = searchParams?.get("tab") as AdminTab | null;
    let payoutAction = searchParams?.get("payout_action");
    let hasTxRef = Boolean(searchParams?.get("tx_ref") || searchParams?.get("trx_ref") || searchParams?.get("reference"));

    if (typeof window !== "undefined") {
      const href = window.location.href;
      if (
        href.includes("sellers-suppliers") ||
        href.includes("payout_action=verify") ||
        href.match(/[?&](?:tx_ref|trx_ref|reference)=TX-PAYOUT-/i) ||
        sessionStorage.getItem("active_payout_tx_ref")
      ) {
        setActiveTab("sellers-suppliers");
        return;
      }
    }

    if (payoutAction === "verify" || hasTxRef || tab === "sellers-suppliers") {
      setActiveTab("sellers-suppliers");
    } else if (tab) {
      const validTabs: AdminTab[] = [
        "overview",
        "catalog",
        "categories",
        "users",
        "sellers-suppliers",
        "suppliers",
        "orders",
        "slips",
        "delivery",
        "disputes",
        "audit",
        "subscriptions",
        "settings",
      ];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [searchParams, setActiveTab]);

  return null;
}

export default function AdminDashboardPage() {
  const { activeTab, setActiveTab } = useAdminUIStore();

  return (
    <div className="w-full transition-all duration-150 pb-16 md:pb-0">
      <Suspense fallback={null}>
        <TabUrlSync />
      </Suspense>

      {activeTab === "overview" && (
        <AdminStats onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />
      )}

      {activeTab === "catalog" && <AdminCatalog />}

      {activeTab === "categories" && <AdminCategories />}

      {activeTab === "users" && <AdminUsersTable />}

      {activeTab === "sellers-suppliers" && <AdminSellersSuppliers />}

      {activeTab === "suppliers" && <AdminSuppliers />}

      {activeTab === "orders" && <AdminOrdersEscrow />}

      {activeTab === "slips" && <AdminSlipsVerification />}

      {activeTab === "delivery" && <AdminDelivery />}

      {activeTab === "disputes" && <AdminDisputes />}

      {activeTab === "audit" && <AdminAuditLogs />}

      {activeTab === "subscriptions" && <AdminSubscriptions />}

      {activeTab === "settings" && <AdminSettings />}
    </div>
  );
}
