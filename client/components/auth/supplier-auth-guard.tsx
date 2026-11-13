"use client";

import React from "react";
import { RoleAuthGuard } from "@/components/auth/role-auth-guard";

interface SupplierAuthGuardProps {
  children: React.ReactNode;
}

export function SupplierAuthGuard({ children }: SupplierAuthGuardProps) {
  return (
    <RoleAuthGuard
      allowedRoles={["SUPPLIER"]}
      loginRedirectPath="/dashboard/supplier"
      portalName="Supplier Enterprise Portal"
      loadingMessage="Verifying supplier credentials..."
    >
      {children}
    </RoleAuthGuard>
  );
}
