"use client";

import React from "react";
import { RoleAuthGuard } from "@/components/auth/role-auth-guard";

interface DriverAuthGuardProps {
  children: React.ReactNode;
}

export function DriverAuthGuard({ children }: DriverAuthGuardProps) {
  return (
    <RoleAuthGuard
      allowedRoles={["DRIVER", "DELIVERY"]}
      loginRedirectPath="/dashboard/driver"
      portalName="Driver & Delivery Console"
      loadingMessage="Verifying courier security clearance..."
    >
      {children}
    </RoleAuthGuard>
  );
}

