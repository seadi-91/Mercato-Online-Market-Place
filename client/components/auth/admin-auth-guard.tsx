"use client";

import React from "react";
import { RoleAuthGuard } from "@/components/auth/role-auth-guard";
import { useTranslation } from "@/store/language-store";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { t } = useTranslation();

  return (
    <RoleAuthGuard
      allowedRoles={["ADMIN"]}
      loginRedirectPath="/dashboard/admin"
      portalName={t("admin.nav.adminConsole", "Enterprise Admin Console")}
      loadingMessage={t("admin.nav.verifyingClearance", "Initializing administrator security clearance...")}
    >
      {children}
    </RoleAuthGuard>
  );
}
