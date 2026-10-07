import { create } from "zustand";

export type AdminTab =
  | "overview"
  | "catalog"
  | "categories"
  | "users"
  | "orders"
  | "slips"
  | "delivery"
  | "disputes"
  | "audit"
  | "settings";

interface AdminUIState {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  pendingSlipsCount: number;
  pendingKycCount: number;
  pendingDisputesCount: number;
  pendingProductsCount: number;
  setPendingCounts: (counts: {
    slips?: number;
    kyc?: number;
    disputes?: number;
    products?: number;
  }) => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab, isMobileSidebarOpen: false }),
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  pendingSlipsCount: 0,
  pendingKycCount: 0,
  pendingDisputesCount: 0,
  pendingProductsCount: 0,
  setPendingCounts: (counts) =>
    set((state) => ({
      pendingSlipsCount:
        counts.slips !== undefined ? counts.slips : state.pendingSlipsCount,
      pendingKycCount:
        counts.kyc !== undefined ? counts.kyc : state.pendingKycCount,
      pendingDisputesCount:
        counts.disputes !== undefined
          ? counts.disputes
          : state.pendingDisputesCount,
      pendingProductsCount:
        counts.products !== undefined
          ? counts.products
          : state.pendingProductsCount,
    })),
}));

export type SellerTab =
  | "overview"
  | "products"
  | "add-product"
  | "orders"
  | "payouts"
  | "reviews"
  | "settings";

interface SellerUIState {
  activeTab: SellerTab;
  setActiveTab: (tab: SellerTab) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  totalProductsCount: number;
  unreadOrdersCount: number;
  lowStockCount: number;
  availablePayout: number;
  pendingEscrow: number;
  setStats: (stats: {
    totalProducts?: number;
    unreadOrders?: number;
    lowStock?: number;
    availablePayout?: number;
    pendingEscrow?: number;
  }) => void;
}

export const useSellerUIStore = create<SellerUIState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab, isMobileSidebarOpen: false }),
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isMobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  totalProductsCount: 0,
  unreadOrdersCount: 0,
  lowStockCount: 0,
  availablePayout: 0,
  pendingEscrow: 0,
  setStats: (stats) =>
    set((state) => ({
      totalProductsCount:
        stats.totalProducts !== undefined
          ? stats.totalProducts
          : state.totalProductsCount,
      unreadOrdersCount:
        stats.unreadOrders !== undefined
          ? stats.unreadOrders
          : state.unreadOrdersCount,
      lowStockCount:
        stats.lowStock !== undefined ? stats.lowStock : state.lowStockCount,
      availablePayout:
        stats.availablePayout !== undefined
          ? stats.availablePayout
          : state.availablePayout,
      pendingEscrow:
        stats.pendingEscrow !== undefined
          ? stats.pendingEscrow
          : state.pendingEscrow,
    })),
}));
