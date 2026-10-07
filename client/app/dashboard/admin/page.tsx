"use client";

import React from "react";
import { useAdminUIStore, type AdminTab } from "@/store/ui-store";
import { AdminStats } from "./components/admin-stats";
import { AdminCatalog } from "./components/admin-catalog";
import { AdminCategories } from "./components/admin-categories";
import { AdminUsersTable } from "./components/admin-users-table";
import { AdminOrdersEscrow } from "./components/admin-orders-escrow";
import { AdminSlipsVerification } from "./components/admin-slips-verification";
import { AdminDelivery } from "./components/admin-delivery";
import { AdminDisputes } from "./components/admin-disputes";
import { AdminAuditLogs } from "./components/admin-audit-logs";
import { AdminSettings } from "./components/admin-settings";

export default function AdminDashboardPage() {
  const { activeTab, setActiveTab } = useAdminUIStore();

  return (
    <div className="w-full transition-all duration-150">
      {activeTab === "overview" && (
        <AdminStats onNavigateTab={(tab) => setActiveTab(tab as AdminTab)} />
      )}

      {activeTab === "catalog" && <AdminCatalog />}

      {activeTab === "categories" && <AdminCategories />}

      {activeTab === "users" && <AdminUsersTable />}

      {activeTab === "orders" && <AdminOrdersEscrow />}

      {activeTab === "slips" && <AdminSlipsVerification />}

      {activeTab === "delivery" && <AdminDelivery />}

      {activeTab === "disputes" && <AdminDisputes />}

      {activeTab === "audit" && <AdminAuditLogs />}

      {activeTab === "settings" && <AdminSettings />}
    </div>
  );
}
