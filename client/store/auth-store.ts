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
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  login: (user: User, token?: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
  setTokens: (token: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      login: (user: User, token?: string, refreshToken?: string) => {
        const validToken = token || "jwt-session-token-" + Date.now();
        set({
          user,
          token: validToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          hasHydrated: true,
        });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("mercatox-auth-storage");
            sessionStorage.removeItem("mercatox-auth-storage");
            localStorage.removeItem("mercatox_token");
            localStorage.removeItem("token");
          } catch {
            // ignore storage access errors
          }
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          hasHydrated: true,
        });
      },
      setUser: (user: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : (user as User),
          isAuthenticated: true,
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
          if (state.user && state.token) {
            state.isAuthenticated = true;
          } else if (state.user && !state.token) {
            state.token = "jwt-session-token-" + Date.now();
            state.isAuthenticated = true;
          } else {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
          }
          state.hasHydrated = true;
        } else {
          useAuthStore.setState({
            hasHydrated: true,
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },
    }
  )
);

if (typeof window !== "undefined") {
  if (useAuthStore.persist?.hasHydrated?.()) {
    useAuthStore.setState({ hasHydrated: true });
  }
  useAuthStore.persist?.onFinishHydration?.(() => {
    useAuthStore.setState({ hasHydrated: true });
  });
}
