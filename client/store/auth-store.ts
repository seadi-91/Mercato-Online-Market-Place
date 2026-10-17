import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "ADMIN" | "SELLER" | "SUPPLIER" | "DELIVERY" | "DRIVER" | "CUSTOMER";

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
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user: User, token?: string, refreshToken?: string) => {
        const validToken = token || "jwt-session-token-" + Date.now();
        set({
          user,
          token: validToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("mercatox-auth-storage");
            sessionStorage.removeItem("mercatox-auth-storage");
          } catch {
            // ignore storage access errors
          }
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setUser: (user: User) =>
        set((state) => ({
          user: { ...state.user, ...user },
        })),
      setTokens: (token: string, refreshToken?: string) =>
        set((state) => ({
          token,
          refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
        })),
    }),
    {
      name: "mercatox-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token && state.user) {
            state.isAuthenticated = true;
          } else {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
