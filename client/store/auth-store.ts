import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "ADMIN" | "SELLER" | "SUPPLIER" | "DELIVERY" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  avatar?: string;
  isVerified?: boolean;
  branchId?: string;
  branchName?: string;
  staffRole?: "branch_manager" | "driver" | "warehouse_lead" | "supplier_owner" | "sales_officer";
  assignedVehiclePlate?: string;
  assignedVehicleType?: string;
  driverLicenseNumber?: string;
  businessType?: string;
  shopName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token?: string) => {
        const validToken = token || "jwt-session-token-" + Date.now();
        set({
          user,
          token: validToken,
          isAuthenticated: true,
        });
      },
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      setUser: (user: User) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),
    }),
    {
      name: "mercatox-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (
          state &&
          (state.token === "mock-jwt-token" || state.token === "oauth-token")
        ) {
          state.token = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
