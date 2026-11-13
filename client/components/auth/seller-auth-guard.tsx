"use client";

import React from "react";
import { RoleAuthGuard } from "@/components/auth/role-auth-guard";

interface SellerAuthGuardProps {
  children: React.ReactNode;
}

export function SellerAuthGuard({ children }: SellerAuthGuardProps) {
  return (
    <RoleAuthGuard
      allowedRoles={["SELLER"]}
      loginRedirectPath="/dashboard/seller"
      portalName="Seller Dashboard"
      loadingMessage="Initializing merchant security context..."
    >
      {children}
    </RoleAuthGuard>
  );
}
