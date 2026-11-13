/**
 * Shared role-based route resolution and access validation helpers.
 */

export function normalizeUserRole(role?: string | null): string {
  return String(role || "").trim().toUpperCase();
}

export function getRoleHomeRoute(role?: string | null): string {
  switch (normalizeUserRole(role)) {
    case "ADMIN":
      return "/dashboard/admin";
    case "SELLER":
      return "/dashboard/seller";
    case "SUPPLIER":
      return "/dashboard/supplier";
    case "DRIVER":
    case "DELIVERY":
      return "/dashboard/driver";
    case "CUSTOMER":
    default:
      return "/";
  }
}

export function isPathAllowedForRole(path: string, role?: string | null): boolean {
  const normalizedRole = normalizeUserRole(role);
  const cleanPath = path.split("?")[0].split("#")[0];

  if (cleanPath.startsWith("/dashboard/admin")) {
    return normalizedRole === "ADMIN";
  }
  if (cleanPath.startsWith("/dashboard/seller")) {
    return normalizedRole === "SELLER";
  }
  if (cleanPath.startsWith("/dashboard/supplier")) {
    return normalizedRole === "SUPPLIER";
  }
  if (cleanPath.startsWith("/dashboard/driver") || cleanPath.startsWith("/dashboard/delivery")) {
    return normalizedRole === "DRIVER" || normalizedRole === "DELIVERY";
  }

  return true;
}

export function resolvePostLoginRoute(
  candidatePath: string | null | undefined,
  role?: string | null,
): string {
  const roleHome = getRoleHomeRoute(role);
  const normalizedRole = normalizeUserRole(role);

  if (
    candidatePath &&
    candidatePath.startsWith("/") &&
    !candidatePath.startsWith("//") &&
    isPathAllowedForRole(candidatePath, normalizedRole)
  ) {
    if (normalizedRole !== "CUSTOMER" && candidatePath === "/") {
      return roleHome;
    }
    return candidatePath;
  }

  return roleHome;
}

