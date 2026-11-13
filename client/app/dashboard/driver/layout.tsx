import React from "react";
import { DriverAuthGuard } from "@/components/auth/driver-auth-guard";

export default function DriverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DriverAuthGuard>{children}</DriverAuthGuard>;
}

