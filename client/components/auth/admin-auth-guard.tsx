"use client";

import React from "react";
import { RoleAuthGuard } from "@/components/auth/role-auth-guard";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  return (
    <RoleAuthGuard
      allowedRoles={["ADMIN"]}
      loginRedirectPath="/dashboard/admin"
      portalName="Admin Governance Console"
      loadingMessage="Initializing administrator security clearance..."
    >
      {children}
    </RoleAuthGuard>
  );
}
