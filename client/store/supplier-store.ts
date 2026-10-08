import { create } from "zustand";
import { toast } from "sonner";
import {
  SupplierTab,
  B2BProduct,
  InventoryMovement,
  RFQItem,
  RFQStatus,
  Quotation,
  NegotiationSession,
  B2BOrder,
  CustomerCRM,
  Warehouse,
  WarehouseTransfer,
  Shipment,
  ShipmentStatus,
  Invoice,
  PaymentTransaction,
  PromotionCampaign,
  ReturnCase,
  DisputeCase,
  ChatThread,
  VerificationDocument,
  SupplierBusinessProfile,
  ProductStatus,
  SupplierStaff,
  StaffRole,
  SettlementAccount,
} from "@/types/supplier";
import {
  initialSupplierProfile,
  initialVerificationDocs,
  initialPromotions,
} from "@/data/supplier-mock-data";
import { sellerService, FilterOrdersParams } from "@/services/seller/seller.service";
import {
  mapBackendProductToB2B,
  mapB2BToCreateInput,
  mapB2BToUpdateInput,
} from "@/services/supplier/supplier-product-adapter";
import { mapBackendOrderToB2B } from "@/services/supplier/supplier-order-adapter";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";

export interface SupplierNotification {
  id: string;
  type: "rfq" | "order" | "payment" | "stock" | "dispute" | "verification" | "message";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  linkTab: SupplierTab;
  priority?: "urgent" | "high" | "normal" | "low";
  entityId?: string;
  amountETB?: number;
  counterpartName?: string;
  actionLabel?: string;
  category?: "orders" | "rfqs" | "payments" | "logistics" | "compliance" | "messages";
}

export function getBankShortCode(name: string): string {
  if (!name || !name.trim()) return "BNK";
  const upper = name.toUpperCase().trim();
  if (upper.includes("COMMERCIAL BANK OF ETHIOPIA") || upper.includes("CBE")) return "CBE";
  if (upper.includes("TELEBIRR")) return "TB";
  if (upper.includes("AWASH")) return "AIB";
  if (upper.includes("DASHEN")) return "DB";
  if (upper.includes("ABYSSINIA") || upper.includes("BOA")) return "BOA";
  if (upper.includes("WEGAGEN")) return "WB";
  if (upper.includes("NIB")) return "NIB";
  if (upper.includes("OROMIA") || upper.includes("COOP")) return "COOP";
  if (upper.includes("SIINQEE") || upper.includes("SINQEE")) return "SIINQEE";
  if (upper.includes("ZEMEN")) return "ZBNK";
  if (upper.includes("BERHAN")) return "BER";
  if (upper.includes("BUNNA")) return "BNNA";
  if (upper.includes("ENAT")) return "ENAT";
  if (upper.includes("ABAY")) return "ABAY";
  if (upper.includes("HIJRA")) return "HIJ";
  if (upper.includes("ZAMZAM")) return "ZAM";
  if (upper.includes("GLOBAL")) return "GLB";
  const words = name.trim().split(/\s+/).filter((w) => !["of", "and", "&", "the", "bank"].includes(w.toLowerCase()));
  if (words.length > 1) {
    return words.slice(0, 4).map((w) => w[0]).join("").toUpperCase();
  }
  return name.trim().slice(0, 4).toUpperCase();
}

export function getBankAccentColor(name: string): string {
  const upper = (name || "").toUpperCase();
  if (upper.includes("CBE") || upper.includes("COMMERCIAL BANK")) return "#9333ea";
  if (upper.includes("TELEBIRR")) return "#0284c7";
  if (upper.includes("AWASH")) return "#d97706";
  if (upper.includes("DASHEN")) return "#2563eb";
  if (upper.includes("ABYSSINIA")) return "#dc2626";
  if (upper.includes("WEGAGEN")) return "#ea580c";
  if (upper.includes("OROMIA") || upper.includes("COOP")) return "#16a34a";
  if (upper.includes("NIB")) return "#0891b2";
  if (upper.includes("SIINQEE")) return "#ca8a04";
  const palette = ["#10b981", "#6366f1", "#ec4899", "#8b5cf6", "#14b8a6", "#f59e0b", "#06b6d4", "#059669"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const SETTLEMENT_ACCOUNTS_STORAGE_KEY = "mercatox_supplier_settlement_accounts";

export function getStoredSettlementAccounts(): SettlementAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SETTLEMENT_ACCOUNTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("[SupplierStore] Error reading settlement accounts from localStorage:", err);
  }
  return [];
}

export function saveStoredSettlementAccounts(accounts: SettlementAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTLEMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("[SupplierStore] Error saving settlement accounts to localStorage:", err);
  }
}

const PROMOTIONS_STORAGE_KEY = "mercatox_supplier_promotions";

export function getStoredPromotions(): PromotionCampaign[] {
  if (typeof window === "undefined") return initialPromotions;
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("[SupplierStore] Error reading promotions from localStorage:", err);
  }
  return initialPromotions;
}

export function saveStoredPromotions(promotions: PromotionCampaign[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
  } catch (err) {
    console.error("[SupplierStore] Error saving promotions to localStorage:", err);
  }
}

const STAFF_STORAGE_KEY = "mercatox_supplier_staff_list";

export function getStoredStaff(): SupplierStaff[] {
  if (typeof window === "undefined") return initialStaffList;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("[SupplierStore] Error reading staff from localStorage:", err);
  }
  return initialStaffList;
}

export function saveStoredStaff(staff: SupplierStaff[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
  } catch (err) {
    console.error("[SupplierStore] Error saving staff to localStorage:", err);
  }
}

const PROFILE_STORAGE_KEY = "mercatox_supplier_profile";

export function mapBackendProfileToSupplier(
  backend: any,
  fallback: SupplierBusinessProfile = initialSupplierProfile
): SupplierBusinessProfile {
  if (!backend) return fallback;

  const fullName = backend.fullName || fallback.executiveName || "Enterprise Director";
  const shopName = backend.shopName || backend.businessName || fallback.businessName || "My Enterprise";
  const tinNumber = backend.tinNumber || fallback.tinNumber || "";
  const licenseNumber = backend.tradeLicenseNumber || fallback.licenseNumber || "";
  const businessType = backend.businessType || fallback.legalEntity || "Private Limited Company (PLC)";
  const city = backend.city || fallback.city || "Addis Ababa";
  const subCity = backend.subCity || fallback.region || "Addis Ababa";
  const address = backend.specificLocation || backend.marketZone || fallback.address || "Mercato Commercial District";
  const phone = backend.alternatePhone || backend.phone || fallback.phone || "";
  const email = backend.email || fallback.email || "";
  const isVerified = Boolean(backend.isVerifiedMerchant);
  const kycStatus = backend.merchantKycStatus;

  return {
    ...fallback,
    businessName: shopName,
    legalEntity: businessType,
    tinNumber: tinNumber,
    licenseNumber: licenseNumber,
    phone: phone,
    email: email,
    city: city,
    region: subCity,
    address: address,
    executiveName: fullName,
    executiveTitle: backend.role ? `${backend.role.replace(/_/g, " ")} Director` : fallback.executiveTitle,
    tagline: backend.tagline || `${shopName} — Verified Supplier on MercatoX`,
    description: backend.description || fallback.description,
    website: backend.website || fallback.website,
    logoUrl: backend.logoUrl || fallback.logoUrl,
    coverUrl: backend.coverUrl || fallback.coverUrl,
    verificationBadge: isVerified
      ? "Gold Verified B2B Supplier"
      : kycStatus === "PENDING"
        ? "Pending Review"
        : fallback.verificationBadge,
  };
}

export function getStoredProfile(): SupplierBusinessProfile {
  if (typeof window === "undefined") return initialSupplierProfile;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("[SupplierStore] Error reading profile from localStorage:", err);
  }
  return initialSupplierProfile;
}

export function saveStoredProfile(profile: SupplierBusinessProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("[SupplierStore] Error saving profile to localStorage:", err);
  }
}

interface SupplierState {
  // Navigation
  activeTab: SupplierTab;
  setActiveTab: (tab: SupplierTab) => void;
  subView: "default" | "create-product" | "verification" | "onboarding";
  setSubView: (view: "default" | "create-product" | "verification" | "onboarding") => void;

  // Sidebar & Layout
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  isQuickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;

  // Modals
  activeModal:
  | null
  | "order-action"
  | "create-quotation"
  | "adjust-stock"
  | "transfer-stock"
  | "counter-offer"
  | "request-payout"
  | "new-campaign"
  | "help-support";
  modalData: any;
  openModal: (modal: SupplierState["activeModal"], data?: any) => void;
  closeModal: () => void;

  // Data States
  profile: SupplierBusinessProfile;
  isLoadingProfile: boolean;
  profileError: string | null;
  hydrateStore: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updated: Partial<SupplierBusinessProfile>) => Promise<void>;
  products: B2BProduct[];
  isLoadingProducts: boolean;
  productsError: string | null;
  editingProduct: B2BProduct | null;
  setEditingProduct: (product: B2BProduct | null) => void;
  fetchProducts: (branchFilter?: string) => Promise<void>;
  inventoryMovements: InventoryMovement[];
  rfqs: RFQItem[];
  isLoadingRFQs: boolean;
  rfqsError: string | null;
  fetchRFQs: () => Promise<void>;
  updateRFQStatus: (id: string, status: RFQStatus) => Promise<void>;

  quotations: Quotation[];
  isLoadingQuotations: boolean;
  quotationsError: string | null;
  fetchQuotations: () => Promise<void>;

  negotiations: NegotiationSession[];
  isLoadingNegotiations: boolean;
  negotiationsError: string | null;
  fetchNegotiations: () => Promise<void>;
  orders: B2BOrder[];
  isLoadingOrders: boolean;
  ordersError: string | null;
  fetchOrders: (params?: FilterOrdersParams) => Promise<void>;
  customers: CustomerCRM[];
  warehouses: Warehouse[];
  transfers: WarehouseTransfer[];
  shipments: Shipment[];
  invoices: Invoice[];
  transactions: PaymentTransaction[];
  promotions: PromotionCampaign[];
  addPromotion: (promoData: Omit<PromotionCampaign, "id" | "views" | "conversions" | "generatedRevenue" | "usageCount">) => PromotionCampaign;
  updatePromotion: (id: string, updates: Partial<PromotionCampaign>) => void;
  deletePromotion: (id: string) => void;
  togglePromotionStatus: (id: string) => void;
  duplicatePromotion: (id: string) => PromotionCampaign;
  returns: ReturnCase[];
  disputes: DisputeCase[];
  chatThreads: ChatThread[];
  activeChatThreadId: string;
  verificationDocs: VerificationDocument[];
  notifications: SupplierNotification[];
  settlementAccounts: SettlementAccount[];

  // Staff & Fleet Management (Employees & Drivers)
  staffList: SupplierStaff[];
  isLoadingStaff: boolean;
  staffError: string | null;
  fetchStaff: () => Promise<void>;
  currentStaffUser: SupplierStaff | null; // null = Supplier Owner/Admin (Full view)
  setCurrentStaffUser: (staff: SupplierStaff | null) => void;
  loginAsStaff: (email: string, password?: string) => boolean;
  addStaff: (staff: Omit<SupplierStaff, "id">) => Promise<SupplierStaff | null>;
  updateStaff: (id: string, updated: Partial<SupplierStaff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  updateDriverShipmentStatus: (shipmentId: string, status: ShipmentStatus, note?: string) => void;
  assignDriverToOrder: (
    orderId: string,
    driver: {
      id: string;
      fullName: string;
      phone: string;
      assignedVehiclePlate?: string;
      assignedVehicleType?: string;
    }
  ) => void;
  updateOrderDeliveryStatus: (
    orderId: string,
    deliveryStatus: "processing" | "ready_for_pickup" | "in_transit" | "arrived" | "delivered" | "delayed",
    note?: string
  ) => void;

  // Mutating Actions
  acceptOrder: (orderId: string, sellerNote?: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  deleteOrder: (orderId: string) => void;
  deleteCustomer: (customerId: string) => void;
  requestOrderModification: (orderId: string, newDeliveryDate: string, sellerNote: string) => void;
  addProduct: (
    product: Omit<B2BProduct, "id" | "views" | "salesCount" | "rating" | "ratingCount" | "createdAt">,
    categoryId?: string
  ) => Promise<B2BProduct | null>;
  updateProduct: (
    id: string,
    updated: Partial<B2BProduct>,
    categoryId?: string
  ) => Promise<B2BProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateProductStatus: (productId: string, status: ProductStatus) => Promise<void>;
  adjustStock: (
    productId: string,
    deltaQty: number,
    reason: string,
    warehouse: string
  ) => Promise<void>;
  isLoadingWarehouses: boolean;
  warehousesError: string | null;
  fetchWarehouses: () => Promise<void>;
  fetchTransfers: () => Promise<void>;
  addWarehouse: (warehouse: Partial<Warehouse>) => Promise<Warehouse | null>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<boolean>;
  transferStock: (fromWarehouse: string, toWarehouse: string, productName: string, quantity: number, unit: string) => Promise<void>;
  completeTransfer: (transferId: string) => Promise<void>;
  deleteTransfer: (transferId: string) => void;
  createShipment: (shipment: Shipment) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, note?: string) => void;
  updateShipmentDeliveryDate: (shipmentId: string, newDate: string, reason?: string) => void;
  deleteShipment: (shipmentId: string) => void;
  createQuotation: (quotation: Omit<Quotation, "id" | "createdAt">) => Promise<void>;
  sendCounterOffer: (
    sessionId: string,
    newPrice: number,
    message?: string,
    options?: {
      attachmentName?: string;
      incoterm?: string;
      deliveryLeadTimeDays?: number;
      paymentTerms?: string;
    }
  ) => Promise<void>;
  acceptNegotiationOffer: (sessionId: string) => Promise<void>;
  declineNegotiationOffer: (sessionId: string, reason?: string) => Promise<void>;
  sendNegotiationMessage: (sessionId: string, message: string) => Promise<void>;
  markInvoicePaid: (invoiceId: string) => void;
  createInvoice: (invoice: Omit<Invoice, "id">) => void;
  sendChatMessage: (threadId: string, text: string) => void;
  setActiveChatThreadId: (id: string) => void;
  uploadVerificationDocument: (docId: string, fileName: string) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationAsUnread: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestWithdrawal: (amount: number, destination: string, note?: string) => void;
  releaseEscrow: (transactionId: string) => void;
  addSettlementAccount: (account: Omit<SettlementAccount, "id">) => SettlementAccount;
  deleteSettlementAccount: (id: string) => void;
  setDefaultSettlementAccount: (id: string) => void;
}

export const initialStaffList: SupplierStaff[] = [
  {
    id: "stf-mgr-101",
    fullName: "Abebe Wolde",
    email: "abebe.w@abyssiniasupply.et",
    phone: "+251 91 144 2200",
    password: "manager123",
    role: "branch_manager",
    branchId: "wh-aa",
    branchName: "Kality Primary Logistics Hub",
    employeeId: "EMP-MGR-101",
    status: "active",
    hireDate: "2023-01-15",
    nationalIdOrFayda: "FYD-9812-4412-01",
    notes: "Chief Branch Operations Director for Addis Ababa & Oromia logistics hub.",
  },
  {
    id: "stf-drv-201",
    fullName: "Mulugeta Tadesse",
    email: "mulugeta.t@abyssiniasupply.et",
    phone: "+251 92 255 3311",
    password: "driver123",
    role: "driver",
    branchId: "wh-aa",
    branchName: "Kality Primary Logistics Hub",
    employeeId: "EMP-DRV-201",
    status: "active",
    hireDate: "2023-04-10",
    nationalIdOrFayda: "FYD-8821-3319-02",
    assignedVehiclePlate: "Plate AA-3-98210",
    assignedVehicleType: "Mercedes Actros 40-Ton Heavy Trailer",
    driverLicenseNumber: "ETH-DL-COMM-8921",
    driverLicenseGrade: "Grade 4 Commercial Heavy Vehicle",
    currentDriverStatus: "available",
    notes: "Assigned to bulk agro-commodity dry freight runs.",
  },
  {
    id: "stf-mgr-102",
    fullName: "Dawit Haile",
    email: "dawit.h@abyssiniasupply.et",
    phone: "+251 93 366 4422",
    password: "manager123",
    role: "branch_manager",
    branchId: "wh-mdj",
    branchName: "Modjo Dry Port Transit Hub",
    employeeId: "EMP-MGR-102",
    status: "active",
    hireDate: "2023-06-01",
    nationalIdOrFayda: "FYD-7731-2290-03",
    notes: "Oversees Mojo multimodal freight and customs clearance.",
  },
  {
    id: "stf-drv-202",
    fullName: "Almaz Bekele",
    email: "almaz.b@abyssiniasupply.et",
    phone: "+251 94 477 5533",
    password: "driver123",
    role: "driver",
    branchId: "wh-mdj",
    branchName: "Modjo Dry Port Transit Hub",
    employeeId: "EMP-DRV-202",
    status: "active",
    hireDate: "2023-08-20",
    nationalIdOrFayda: "FYD-6642-1188-04",
    assignedVehiclePlate: "Plate ETH-4-44109",
    assignedVehicleType: "Isuzu FSR 10-Ton Medium Cargo",
    driverLicenseNumber: "ETH-DL-COMM-7731",
    driverLicenseGrade: "Grade 3 Commercial Medium Truck",
    currentDriverStatus: "available",
    notes: "Specialized in Mojo to Addis Ababa corridor transfers.",
  },
];

export const useSupplierStore = create<SupplierState>((set, get) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      subView: tab === "verification" ? "verification" : tab === "onboarding" ? "onboarding" : "default",
      isMobileDrawerOpen: false,
    }),
  subView: "default",
  setSubView: (subView) => set({ subView, isMobileDrawerOpen: false }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  isNotificationsOpen: false,
  setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
  isQuickActionsOpen: false,
  setQuickActionsOpen: (open) => set({ isQuickActionsOpen: open }),

  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  profile: initialSupplierProfile,
  isLoadingProfile: false,
  profileError: null,
  products: [],
  isLoadingProducts: false,
  productsError: null,
  editingProduct: null,
  setEditingProduct: (product) => set({ editingProduct: product }),
  inventoryMovements: [],
  rfqs: [],
  isLoadingRFQs: false,
  rfqsError: null,
  quotations: [],
  isLoadingQuotations: false,
  quotationsError: null,
  negotiations: [],
  isLoadingNegotiations: false,
  negotiationsError: null,
  orders: [],
  isLoadingOrders: false,
  ordersError: null,
  customers: [],
  warehouses: [],
  isLoadingWarehouses: false,
  warehousesError: null,
  transfers: [],
  shipments: [],
  invoices: [],
  transactions: [],
  promotions: initialPromotions,
  returns: [],
  disputes: [],
  chatThreads: [],
  activeChatThreadId: "",
  verificationDocs: initialVerificationDocs,
  notifications: [],
  settlementAccounts: [],

  hydrateStore: () => {
    if (typeof window === "undefined") return;
    try {
      const storedProfile = getStoredProfile();
      const storedAccounts = getStoredSettlementAccounts();
      const storedPromos = getStoredPromotions();
      const storedStaff = getStoredStaff();
      set({
        profile: storedProfile,
        settlementAccounts: storedAccounts,
        promotions: storedPromos,
        staffList: storedStaff.length > 0 ? storedStaff : get().staffList,
      });
    } catch (err) {
      console.warn("[SupplierStore] Error during client hydration:", err);
    }
  },

  isLoadingStaff: false,
  staffError: null,

  // Actions
  fetchOrders: async (params) => {
    set({ isLoadingOrders: true, ordersError: null });
    try {
      const res = await sellerService.getOrders(params);
      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && Array.isArray((res as any).data)) {
        rawList = (res as any).data;
      }
      const mapped = rawList.map(mapBackendOrderToB2B);
      set({ orders: mapped, isLoadingOrders: false });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching seller orders from backend:", err);
      set({
        isLoadingOrders: false,
        ordersError: err?.response?.data?.message || err?.message || "Failed to load orders",
      });
    }
  },

  acceptOrder: async (orderId, sellerNote) => {
    try {
      await sellerService.updateOrderStatus(orderId, { newStatus: "CONFIRMED" });
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
              ...o,
              orderStatus: "confirmed",
              deliveryStatus: "processing",
              sellerNotes: sellerNote || o.sellerNotes,
            }
            : o
        ),
        activeModal: null,
        modalData: null,
      }));
      toast.success("Order confirmed successfully! Preparation initiated.");
    } catch (err: any) {
      console.error("[SupplierStore] Error accepting order:", err);
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
              ...o,
              orderStatus: "confirmed",
              deliveryStatus: "processing",
              sellerNotes: sellerNote || o.sellerNotes,
            }
            : o
        ),
        activeModal: null,
        modalData: null,
      }));
      toast.success("Order confirmed.");
    }
  },

  rejectOrder: async (orderId, reason) => {
    try {
      await sellerService.updateOrderStatus(orderId, {
        newStatus: "CANCELLED",
        cancelReason: reason,
      });
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
              ...o,
              orderStatus: "cancelled",
              rejectionReason: reason,
            }
            : o
        ),
        activeModal: null,
        modalData: null,
      }));
      toast.error("Order cancelled.");
    } catch (err: any) {
      console.error("[SupplierStore] Error rejecting order:", err);
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId
            ? {
              ...o,
              orderStatus: "cancelled",
              rejectionReason: reason,
            }
            : o
        ),
        activeModal: null,
        modalData: null,
      }));
      toast.error("Order cancelled.");
    }
  },

  deleteOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
      activeModal: null,
      modalData: null,
    }));
    toast.success("Order deleted successfully.");
  },

  deleteCustomer: (customerId) => {
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== customerId),
      activeModal: null,
      modalData: null,
    }));
    toast.success("Customer removed from CRM directory.");
  },

  requestOrderModification: (orderId, newDeliveryDate, sellerNote) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
            ...o,
            expectedDelivery: newDeliveryDate,
            sellerNotes: sellerNote,
          }
          : o
      ),
      activeModal: null,
      modalData: null,
    }));
    toast.info("Delivery modification request submitted to buyer.");
  },

  fetchProducts: async (branchFilter?: string) => {
    set({ isLoadingProducts: true, productsError: null });
    try {
      const user = useAuthStore.getState().user;
      const currentStaffUser = get().currentStaffUser;
      const isBranchManager =
        user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
      const branchId =
        branchFilter || user?.branchId || currentStaffUser?.branchId;
      const branchName =
        user?.branchName || currentStaffUser?.branchName;

      // 1. Fetch supplier products from backend database
      const res = await sellerService.getProducts({
        limit: 100,
        branchId: isBranchManager && branchId ? branchId : branchFilter,
      });
      let b2bProducts: B2BProduct[] = [];
      const productList = Array.isArray(res)
        ? res
        : res && Array.isArray(res.data)
          ? res.data
          : [];
      if (productList.length > 0) {
        b2bProducts = productList.map(mapBackendProductToB2B);
      } else {
        // Fallback: If supplier account is fresh, also check active catalog products from database
        try {
          const catRes = await api.get<any>(
            `${ENDPOINTS.CATEGORIES.replace("/categories", "/products")}?limit=50`
          );
          const catList = Array.isArray(catRes)
            ? catRes
            : catRes && Array.isArray(catRes.data)
              ? catRes.data
              : [];
          if (catList.length > 0) {
            b2bProducts = catList.map(mapBackendProductToB2B);
          }
        } catch {
          // ignore fallback
        }
      }

      // STRICT BRANCH SCOPING: If user is a Branch Manager, strictly filter to their branch
      if (isBranchManager && (branchId || branchName)) {
        const targetId = (branchId || "").toLowerCase().trim();
        const strippedId = targetId.replace("wh-", "");
        const targetName = (branchName || "").toLowerCase().trim();
        const firstKeyword = targetName.split(" ")[0];

        b2bProducts = b2bProducts.filter((p) => {
          const pBranchId = (p.branchId || "").toLowerCase().trim();
          const pWarehouse = (p.warehouseLocation || "").toLowerCase().trim();
          const pBranchName = (p.branchName || "").toLowerCase().trim();

          const matchId = targetId && (pBranchId === targetId || pBranchId.includes(strippedId));
          const matchWarehouse = strippedId && pWarehouse.includes(strippedId);
          const matchName =
            targetName &&
            (pWarehouse.includes(targetName) ||
              pBranchName.includes(targetName) ||
              (firstKeyword && pWarehouse.includes(firstKeyword)));

          return matchId || matchWarehouse || matchName;
        });
      }

      set({ products: b2bProducts, isLoadingProducts: false });
    } catch (err: any) {
      console.error("[SupplierStore] Failed to fetch products from database:", err);
      try {
        const catRes = await api.get<any>(`/catalog/products?limit=50`);
        if (catRes && Array.isArray(catRes.data) && catRes.data.length > 0) {
          let b2b = catRes.data.map(mapBackendProductToB2B);
          const user = useAuthStore.getState().user;
          const currentStaffUser = get().currentStaffUser;
          const isBranchManager =
            user?.staffRole === "branch_manager" || currentStaffUser?.role === "branch_manager";
          const branchId =
            branchFilter || user?.branchId || currentStaffUser?.branchId;
          const branchName =
            user?.branchName || currentStaffUser?.branchName;

          if (isBranchManager && (branchId || branchName)) {
            const targetId = (branchId || "").toLowerCase().trim();
            const strippedId = targetId.replace("wh-", "");
            const targetName = (branchName || "").toLowerCase().trim();
            const firstKeyword = targetName.split(" ")[0];

            b2b = b2b.filter((p: B2BProduct) => {
              const pBranchId = (p.branchId || "").toLowerCase().trim();
              const pWarehouse = (p.warehouseLocation || "").toLowerCase().trim();
              const pBranchName = (p.branchName || "").toLowerCase().trim();

              const matchId = targetId && (pBranchId === targetId || pBranchId.includes(strippedId));
              const matchWarehouse = strippedId && pWarehouse.includes(strippedId);
              const matchName =
                targetName &&
                (pWarehouse.includes(targetName) ||
                  pBranchName.includes(targetName) ||
                  (firstKeyword && pWarehouse.includes(firstKeyword)));

              return matchId || matchWarehouse || matchName;
            });
          }

          set({ products: b2b, isLoadingProducts: false });
          return;
        }
      } catch {
        // ignore
      }
      set({
        isLoadingProducts: false,
        productsError: err?.message || "Failed to load products from database",
      });
    }
  },

  addProduct: async (productData, categoryId) => {
    try {
      let finalCatId = categoryId;
      if (!finalCatId) {
        try {
          const categories = await sellerService.getCategories(false);
          const matched = categories.find(
            (c) =>
              c.name.toLowerCase() === productData.category.toLowerCase() ||
              c.slug.toLowerCase().includes(productData.category.toLowerCase().slice(0, 5))
          );
          if (matched) {
            finalCatId = matched.id;
          } else if (categories.length > 0) {
            finalCatId = categories[0].id;
          }
        } catch {
          // ignore
        }
      }

      if (!finalCatId) {
        finalCatId = "7900db4e-8aa5-4a14-8c3e-42be76cafd5f";
      }

      const input = mapB2BToCreateInput(productData, finalCatId);
      const created = await sellerService.createProduct(input);
      const b2bProduct = mapBackendProductToB2B(created);

      set((state) => ({
        products: [b2bProduct, ...state.products.filter((p) => p.id !== b2bProduct.id)],
        subView: "default",
        activeTab: "products",
        editingProduct: null,
      }));
      toast.success(`Product "${productData.name}" created successfully!`);
      return b2bProduct;
    } catch (err: any) {
      console.error("[SupplierStore] Error creating product on backend:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to save product on database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      throw err;
    }
  },

  updateProduct: async (id, updated, categoryId) => {
    try {
      const input = mapB2BToUpdateInput(updated, categoryId);
      const saved = await sellerService.updateProduct(id, input);
      const b2bProduct = mapBackendProductToB2B(saved);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? b2bProduct : p)),
        subView: "default",
        editingProduct: null,
      }));
      toast.success(`Product "${b2bProduct.name}" updated successfully!`);
      return b2bProduct;
    } catch (err: any) {
      console.error("[SupplierStore] Error updating product:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to update product in database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      throw err;
    }
  },

  deleteProduct: async (productId) => {
    try {
      await sellerService.deleteProduct(productId);
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      }));
      toast.success("Product deleted successfully.");
      return true;
    } catch (err: any) {
      console.error("[SupplierStore] Error deleting product:", err);
      toast.error("Failed to delete product from database.");
      return false;
    }
  },

  updateProductStatus: async (productId, status) => {
    try {
      const isAvailable = status === "published";
      const isActive = status !== "draft" && status !== "archived";
      await sellerService.updateProduct(productId, {
        status,
        isAvailable,
        isActive,
      });
      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? { ...p, status } : p)),
      }));
      toast.success(`Product status updated to ${status.replace("_", " ")}.`);
    } catch (err: any) {
      console.error("[SupplierStore] Failed to update status on backend:", err);
      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? { ...p, status } : p)),
      }));
      toast.success(`Product status updated to ${status.replace("_", " ")}.`);
    }
  },

  adjustStock: async (
    productId: string,
    deltaQty: number,
    reason: string,
    warehouse: string
  ) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + deltaQty);
    try {
      await sellerService.updateStock(
        productId,
        deltaQty > 0 ? "REPLENISH" : "DEDUCT",
        Math.abs(deltaQty)
      );
    } catch (err) {
      console.warn("[SupplierStore] Backend stock update note:", err);
    }

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: product.name,
      type: deltaQty > 0 ? "received" : deltaQty < 0 && reason.toLowerCase().includes("damage") ? "damaged" : "adjusted",
      quantity: deltaQty,
      unit: product.unit,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      reference: `ADJ-${Date.now().toString().slice(-4)} (${reason})`,
      warehouse,
      actor: "Authorized Warehouse Lead",
    };

    set((state) => ({
      products: state.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)),
      inventoryMovements: [newMovement, ...state.inventoryMovements],
      activeModal: null,
      modalData: null,
    }));
    get().fetchWarehouses();
    toast.success(`Stock adjusted by ${deltaQty > 0 ? "+" : ""}${deltaQty} ${product.unit}.`);
  },

  fetchWarehouses: async () => {
    set({ isLoadingWarehouses: true, warehousesError: null });
    try {
      const data = await sellerService.getWarehouses();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      set({ warehouses: list, isLoadingWarehouses: false });
    } catch (err: any) {
      console.error("[SupplierStore] Failed to fetch warehouses from database:", err);
      set({
        isLoadingWarehouses: false,
        warehousesError: err?.response?.data?.message || err?.message || "Failed to load warehouses from database",
      });
    }
  },

  fetchTransfers: async () => {
    try {
      const data = await sellerService.getWarehouseTransfers();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      set({ transfers: list });
    } catch (err: any) {
      console.error("[SupplierStore] Failed to fetch transfers from database:", err);
    }
  },

  addWarehouse: async (warehouseData) => {
    try {
      const created = await sellerService.createWarehouse(warehouseData);
      const safeWarehouse: Warehouse = {
        ...created,
        totalStockUnits: created.totalStockUnits ?? 0,
        stockDistribution: created.stockDistribution ?? [],
      };
      set((state) => ({
        warehouses: [safeWarehouse, ...state.warehouses.filter((w) => w.id !== safeWarehouse.id)],
      }));
      toast.success(`Warehouse "${safeWarehouse.name}" saved to database successfully!`);
      return safeWarehouse;
    } catch (err: any) {
      console.error("[SupplierStore] Error creating warehouse:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to save warehouse to database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      throw err;
    }
  },

  updateWarehouse: async (id, data) => {
    try {
      const updated = await sellerService.updateWarehouse(id, data);
      set((state) => ({
        warehouses: state.warehouses.map((w) => (w.id === id ? { ...w, ...updated } : w)),
      }));
      toast.success(`Warehouse "${updated.name || "details"}" updated successfully.`);
    } catch (err: any) {
      console.error("[SupplierStore] Error updating warehouse:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to update warehouse in database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      throw err;
    }
  },

  deleteWarehouse: async (id) => {
    try {
      await sellerService.deleteWarehouse(id);
      set((state) => ({
        warehouses: state.warehouses.filter((w) => w.id !== id),
      }));
      toast.success("Warehouse removed from depot network.");
      return true;
    } catch (err: any) {
      console.error("[SupplierStore] Error deleting warehouse:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to delete warehouse";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      return false;
    }
  },

  transferStock: async (fromWarehouse, toWarehouse, productName, quantity, unit) => {
    try {
      const payload: Partial<WarehouseTransfer> = {
        fromWarehouse,
        toWarehouse,
        productName,
        quantity,
        unit,
        status: "in_transit",
        initiatedBy: "Operations Planner",
      };
      const created = await sellerService.createWarehouseTransfer(payload);

      const newMovement: InventoryMovement = {
        id: `mov-trf-${Date.now()}`,
        productId: "prod-transfer",
        productName,
        type: "transferred",
        quantity: -quantity,
        unit,
        date: new Date().toISOString().replace("T", " ").substring(0, 16),
        reference: `${created.transferNumber} (${fromWarehouse} -> ${toWarehouse})`,
        warehouse: `${fromWarehouse} -> ${toWarehouse}`,
        actor: "Operations Planner",
      };

      set((state) => ({
        transfers: [created, ...state.transfers.filter((t) => t.id !== created.id)],
        inventoryMovements: [newMovement, ...state.inventoryMovements],
        activeModal: null,
        modalData: null,
      }));
      get().fetchWarehouses();
      toast.success(`Inter-warehouse transfer ${created.transferNumber} registered successfully!`);
    } catch (err: any) {
      console.error("[SupplierStore] Error initiating warehouse transfer:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to register transfer in database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      throw err;
    }
  },

  completeTransfer: async (transferId) => {
    try {
      const updated = await sellerService.updateWarehouseTransferStatus(transferId, "received");
      set((state) => ({
        transfers: state.transfers.map((t) =>
          t.id === transferId
            ? {
              ...t,
              ...updated,
              status: "received",
              completedDate: new Date().toISOString().split("T")[0],
            }
            : t
        ),
      }));
      toast.success("Transfer cargo received and verified!");
    } catch (err: any) {
      console.error("[SupplierStore] Error completing transfer:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to update transfer status";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  },

  deleteTransfer: (transferId) => {
    set((state) => ({
      transfers: state.transfers.filter((t) => t.id !== transferId),
    }));
    toast.success("Transfer manifest removed from operations log.");
  },

  createShipment: (shipment) => {
    set((state) => ({
      shipments: [shipment, ...state.shipments],
    }));
    toast.success(`Shipment ${shipment.shipmentNumber} created successfully!`);
  },

  updateShipmentStatus: (shipmentId, status, note) => {
    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (s.id !== shipmentId) return s;
        const now = new Date().toISOString().replace("T", " ").substring(0, 16);
        const updatedMilestones = s.milestones.map((m) =>
          m.stage === status ? { ...m, completed: true, timestamp: now } : m
        );
        const updatedTracking = note
          ? [
            {
              timestamp: now,
              status: status.replace(/_/g, " "),
              location: s.origin.split("(")[0].trim(),
              description: note,
            },
            ...(s.trackingEvents || []),
          ]
          : s.trackingEvents;
        return {
          ...s,
          status,
          milestones: updatedMilestones,
          trackingEvents: updatedTracking,
          ...(status === "delivered"
            ? {
              actualDeliveryDate: now,
              deliveredDate: now,
              receivedBy: s.receiverContact?.contactPerson || "Authorized Receiving Officer",
            }
            : {}),
        };
      }),
    }));
    toast.success(`Shipment status updated to "${status.replace(/_/g, " ")}"`);
  },

  updateShipmentDeliveryDate: (shipmentId, newDate, reason) => {
    set((state) => ({
      shipments: state.shipments.map((s) => {
        if (s.id !== shipmentId) return s;
        return {
          ...s,
          estimatedDelivery: newDate,
          isDelayed: true,
          status: "delayed",
          delayReason: reason || s.delayReason || "Vehicle problem / corridor delay",
          revisedDeliveryDate: newDate,
        };
      }),
    }));
    toast.success(`Delivery date revised to ${newDate}`);
  },

  deleteShipment: (shipmentId) => {
    set((state) => ({
      shipments: state.shipments.filter((s) => s.id !== shipmentId),
    }));
    toast.success("Shipment record deleted.");
  },

  // --- RFQs (Request for Quotations) ---
  fetchRFQs: async () => {
    set({ isLoadingRFQs: true, rfqsError: null });
    try {
      const rfqs = await sellerService.getRFQs();
      set({ rfqs: Array.isArray(rfqs) ? rfqs : [], isLoadingRFQs: false });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching RFQs:", err);
      set({
        rfqsError: err?.response?.data?.message || err?.message || "Failed to load RFQs",
        isLoadingRFQs: false,
      });
    }
  },

  updateRFQStatus: async (id, status) => {
    try {
      const updated = await sellerService.updateRFQStatus(id, status);
      set((state) => ({
        rfqs: state.rfqs.map((r) => (r.id === id ? { ...r, ...updated, status } : r)),
      }));
      toast.success(`RFQ status updated to "${status}"`);
    } catch (err: any) {
      console.error("[SupplierStore] Error updating RFQ status:", err);
      toast.error("Failed to update RFQ status");
    }
  },

  // --- Quotations ---
  fetchQuotations: async () => {
    set({ isLoadingQuotations: true, quotationsError: null });
    try {
      const quotations = await sellerService.getQuotations();
      set({
        quotations: Array.isArray(quotations) ? quotations : [],
        isLoadingQuotations: false,
      });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching quotations:", err);
      set({
        quotationsError: err?.response?.data?.message || err?.message || "Failed to load quotations",
        isLoadingQuotations: false,
      });
    }
  },

  createQuotation: async (quoteData) => {
    try {
      const created = await sellerService.createQuotation(quoteData);
      set((state) => ({
        quotations: [created, ...state.quotations.filter((q) => q.id !== created.id)],
        activeModal: null,
        modalData: null,
      }));
      if (quoteData.rfqId) {
        set((state) => ({
          rfqs: state.rfqs.map((r) =>
            r.id === quoteData.rfqId ? { ...r, status: "responded" } : r
          ),
        }));
      }
      toast.success(
        `Quotation ${created.quoteNumber || "QT"} issued and sent to ${quoteData.buyerCompany}!`
      );
    } catch (err: any) {
      console.error("[SupplierStore] Error creating quotation:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to issue quotation");
    }
  },

  // --- Negotiations ---
  fetchNegotiations: async () => {
    set({ isLoadingNegotiations: true, negotiationsError: null });
    try {
      const negotiations = await sellerService.getNegotiations();
      set({
        negotiations: Array.isArray(negotiations) ? negotiations : [],
        isLoadingNegotiations: false,
      });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching negotiations:", err);
      set({
        negotiationsError: err?.response?.data?.message || err?.message || "Failed to load negotiations",
        isLoadingNegotiations: false,
      });
    }
  },

  sendCounterOffer: async (sessionId, newPrice, message, options) => {
    try {
      const updated = await sellerService.sendCounterOffer(sessionId, {
        newPrice,
        message,
        attachmentName: options?.attachmentName,
        incoterm: options?.incoterm,
        deliveryLeadTimeDays: options?.deliveryLeadTimeDays,
        paymentTerms: options?.paymentTerms,
      });
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n.id === sessionId ? { ...n, ...updated } : n
        ),
        activeModal: null,
        modalData: null,
      }));
      toast.success(`Counter offer of ${newPrice.toLocaleString()} ETB transmitted to buyer.`);
    } catch (err: any) {
      console.error("[SupplierStore] Error sending counter offer:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to submit counter offer");
    }
  },

  acceptNegotiationOffer: async (sessionId) => {
    try {
      const updated = await sellerService.acceptNegotiation(sessionId);
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n.id === sessionId ? { ...n, ...updated } : n
        ),
      }));
      toast.success("Negotiation agreed! Binding sales contract finalized with 100% CBE Escrow protection.");
    } catch (err: any) {
      console.error("[SupplierStore] Error accepting negotiation:", err);
      toast.error("Failed to accept negotiation offer");
    }
  },

  declineNegotiationOffer: async (sessionId, reason) => {
    try {
      const updated = await sellerService.declineNegotiation(sessionId, reason);
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n.id === sessionId ? { ...n, ...updated } : n
        ),
      }));
      toast.error("Tender negotiation declined and archived.");
    } catch (err: any) {
      console.error("[SupplierStore] Error declining negotiation:", err);
      toast.error("Failed to decline negotiation");
    }
  },

  sendNegotiationMessage: async (sessionId, message) => {
    try {
      const updated = await sellerService.sendNegotiationMessage(sessionId, message);
      set((state) => ({
        negotiations: state.negotiations.map((n) =>
          n.id === sessionId ? { ...n, ...updated } : n
        ),
      }));
    } catch (err: any) {
      console.error("[SupplierStore] Error sending message:", err);
      toast.error("Failed to send message");
    }
  },

  markInvoicePaid: (invoiceId) => {
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId
          ? {
            ...inv,
            status: "paid",
            paidAmount: inv.total,
          }
          : inv
      ),
    }));
    toast.success("Invoice marked as fully settled.");
  },

  createInvoice: (invoiceData) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
    };
    set((state) => ({
      invoices: [newInvoice, ...state.invoices],
      activeModal: null,
      modalData: null,
    }));
    toast.success(`Tax Invoice ${newInvoice.invoiceNumber} generated.`);
  },

  sendChatMessage: (threadId, text) => {
    if (!text.trim()) return;
    set((state) => ({
      chatThreads: state.chatThreads.map((t) =>
        t.id === threadId
          ? {
            ...t,
            lastMessage: text,
            lastMessageTime: "Just now",
          }
          : t
      ),
    }));
  },

  setActiveChatThreadId: (id) => set({ activeChatThreadId: id }),

  fetchProfile: async () => {
    set({ isLoadingProfile: true, profileError: null });
    try {
      const res = await sellerService.getProfile();
      if (res) {
        const mapped = mapBackendProfileToSupplier(res, get().profile);
        set({ profile: mapped, isLoadingProfile: false });
        saveStoredProfile(mapped);
      } else {
        set({ isLoadingProfile: false });
      }
    } catch (err: any) {
      console.warn("[SupplierStore] Backend profile fetch notice:", err?.message || err);
      // Try fallback to /users/me
      try {
        const userRes = await api.get<any>("/users/me");
        if (userRes) {
          const mapped = mapBackendProfileToSupplier(userRes, get().profile);
          set({ profile: mapped, isLoadingProfile: false });
          saveStoredProfile(mapped);
          return;
        }
      } catch {
        // ignore
      }
      set({
        isLoadingProfile: false,
        profileError: err?.response?.data?.message || err?.message || "Failed to load profile",
      });
    }
  },

  updateProfile: async (updated) => {
    // Optimistic local update
    const merged = { ...get().profile, ...updated };
    set({ profile: merged });
    saveStoredProfile(merged);

    try {
      const payload: any = {
        shopName: updated.businessName,
        tinNumber: updated.tinNumber,
        tradeLicenseNumber: updated.licenseNumber,
        businessType: updated.legalEntity,
        alternatePhone: updated.phone,
        email: updated.email,
        city: updated.city,
        subCity: updated.region,
        specificLocation: updated.address,
        marketZone: updated.address,
        fullName: updated.executiveName,
      };

      // Clean undefined keys
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      await sellerService.updateProfile(payload);
      toast.success("Business profile saved and synchronized with database!");
    } catch (err: any) {
      console.warn("[SupplierStore] Backend profile update notice:", err?.message || err);
      try {
        await api.patch("/users/me", {
          shopName: updated.businessName,
          tinNumber: updated.tinNumber,
          tradeLicenseNumber: updated.licenseNumber,
          businessType: updated.legalEntity,
          alternatePhone: updated.phone,
          email: updated.email,
          city: updated.city,
          subCity: updated.region,
          specificLocation: updated.address,
          fullName: updated.executiveName,
        });
        toast.success("Business profile saved to database!");
      } catch (e) {
        toast.success("Business profile updated locally.");
      }
    }
  },

  uploadVerificationDocument: (docId, fileName) => {
    set((state) => ({
      verificationDocs: state.verificationDocs.map((doc) =>
        doc.id === docId
          ? {
            ...doc,
            fileName,
            status: "under_review",
            uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          }
          : doc
      ),
    }));
    toast.success(`Document "${fileName}" uploaded for compliance verification.`);
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markNotificationAsUnread: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
    }));
    toast.info("Notification marked as unread.");
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
    toast.success("All notifications marked as read.");
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    toast.success("Notification deleted.");
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
    toast.success("All notifications cleared.");
  },

  requestWithdrawal: (amount, destination, note) => {
    const txId = `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bankPart = destination.split("(")[0].trim();
    const cleanMethod =
      bankPart ||
      (destination.toLowerCase().includes("telebirr")
        ? "Telebirr Business"
        : "Bank Transfer (RTGS)");

    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: txId,
      buyerCompany: "Treasury Payout",
      buyerTIN: "0019283419",
      orderNumber: `PAYOUT-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: amount,
      feeETB: Math.round(amount * 0.0015),
      netAmountETB: Math.round(amount * 0.9985),
      paymentMethod: cleanMethod,
      status: "pending",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      referenceNumber: `RTGS-${Math.floor(10000000 + Math.random() * 90000000)}`,
      payoutDate: "Today (within 2-4 hrs)",
      settlementAccount: destination,
      notes: note || `Supplier balance withdrawal to ${destination}`,
    };
    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
    toast.success(`Withdrawal request of ETB ${amount.toLocaleString()} successfully queued for settlement.`);
  },

  addSettlementAccount: (accountData) => {
    const newAcc: SettlementAccount = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shortCode: accountData.shortCode || getBankShortCode(accountData.bankName),
      accentColor: accountData.accentColor || getBankAccentColor(accountData.bankName),
    };
    set((state) => {
      const isFirst = state.settlementAccounts.length === 0;
      const shouldBeDefault = isFirst || Boolean(newAcc.isDefault);
      const updated = shouldBeDefault
        ? [...state.settlementAccounts.map((a) => ({ ...a, isDefault: false })), { ...newAcc, isDefault: true }]
        : [...state.settlementAccounts, { ...newAcc, isDefault: false }];
      saveStoredSettlementAccounts(updated);
      return { settlementAccounts: updated };
    });
    return newAcc;
  },

  deleteSettlementAccount: (id) => {
    set((state) => {
      const remaining = state.settlementAccounts.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      saveStoredSettlementAccounts(remaining);
      return { settlementAccounts: remaining };
    });
    toast.success("Settlement account removed successfully.");
  },

  setDefaultSettlementAccount: (id) => {
    set((state) => {
      const updated = state.settlementAccounts.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      saveStoredSettlementAccounts(updated);
      return { settlementAccounts: updated };
    });
    toast.success("Default settlement account updated.");
  },

  // Promotions Engine Actions
  addPromotion: (promoData) => {
    const newPromo: PromotionCampaign = {
      ...promoData,
      id: `prm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      views: 0,
      conversions: 0,
      generatedRevenue: 0,
      usageCount: 0,
      status: promoData.status || "active",
      scope: promoData.scope || "all_products",
      discountType: promoData.discountType || "percentage",
    };
    set((state) => {
      const updated = [newPromo, ...state.promotions];
      saveStoredPromotions(updated);
      return { promotions: updated };
    });
    toast.success(`Promotional Campaign "${newPromo.title}" launched successfully!`);
    return newPromo;
  },

  updatePromotion: (id, updates) => {
    set((state) => {
      const updated = state.promotions.map((p) => (p.id === id ? { ...p, ...updates } : p));
      saveStoredPromotions(updated);
      return { promotions: updated };
    });
    toast.success("Promotion details updated.");
  },

  deletePromotion: (id) => {
    set((state) => {
      const updated = state.promotions.filter((p) => p.id !== id);
      saveStoredPromotions(updated);
      return { promotions: updated };
    });
    toast.success("Promotional campaign removed.");
  },

  togglePromotionStatus: (id) => {
    set((state) => {
      const target = state.promotions.find((p) => p.id === id);
      const newStatus: "active" | "paused" = target?.status === "active" ? "paused" : "active";
      const updated: PromotionCampaign[] = state.promotions.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      );
      saveStoredPromotions(updated);
      if (target) {
        toast.success(`Campaign "${target.title}" is now ${newStatus === "active" ? "Live on Marketplace" : "Paused"}.`);
      }
      return { promotions: updated };
    });
  },

  duplicatePromotion: (id) => {
    const target = get().promotions.find((p) => p.id === id);
    const duplicated: PromotionCampaign = target
      ? {
        ...target,
        id: `prm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: `${target.title} (Copy)`,
        promoCode: target.promoCode ? `${target.promoCode}2` : undefined,
        status: "paused",
        views: 0,
        conversions: 0,
        generatedRevenue: 0,
        usageCount: 0,
      }
      : {
        id: `prm-${Date.now()}`,
        title: "New Promotion Copy",
        type: "bulk_volume_discount",
        discountType: "percentage",
        productName: "Catalog Product",
        discountPercentage: 10,
        minOrderQuantity: 500,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        status: "paused",
        views: 0,
        conversions: 0,
        generatedRevenue: 0,
        usageCount: 0,
        scope: "all_products",
      };

    set((state) => {
      const updated = [duplicated, ...state.promotions];
      saveStoredPromotions(updated);
      return { promotions: updated };
    });
    toast.success(`Campaign duplicated as "${duplicated.title}".`);
    return duplicated;
  },

  releaseEscrow: (transactionId) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === transactionId
          ? {
            ...tx,
            status: "completed",
            escrowMilestone: "funds_released",
            notes: "Escrow released to available balance following proof of delivery signoff.",
          }
          : tx
      ),
    }));
    toast.success("CBE Escrow funds verified & released to available treasury balance.");
  },

  // Staff & Fleet Management Implementation
  staffList: initialStaffList,
  currentStaffUser: null,
  setCurrentStaffUser: (staff) => {
    set({ currentStaffUser: staff });
    if (staff) {
      toast.info(`Switched persona: ${staff.fullName} (${staff.role.replace(/_/g, " ")} • ${staff.branchName})`);
    } else {
      toast.info("Switched to Supplier Enterprise Owner (Full Admin Overview)");
    }
  },

  loginAsStaff: (email, password) => {
    const found = get().staffList.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      toast.error(`No employee registered with email "${email}"`);
      return false;
    }
    if (password && found.password && found.password !== password) {
      toast.error("Incorrect password for staff credentials.");
      return false;
    }
    set({ currentStaffUser: found });
    toast.success(`Welcome, ${found.fullName}! Logged in as ${found.role.replace(/_/g, " ")} (${found.branchName}).`);
    return true;
  },

  fetchStaff: async () => {
    set({ isLoadingStaff: true, staffError: null });
    try {
      const res = await sellerService.getStaff();
      const list = Array.isArray(res) ? res : [];
      set({ staffList: list, isLoadingStaff: false });
      saveStoredStaff(list);
    } catch (err: any) {
      console.warn("[SupplierStore] Backend staff fetch notice:", err?.message || err);
      const stored = getStoredStaff();
      set({
        staffList: stored.length > 0 ? stored : get().staffList,
        isLoadingStaff: false,
        staffError: err?.response?.data?.message || err?.message || "Failed to load staff",
      });
    }
  },

  addStaff: async (staffData) => {
    const tempId = `stf-${Date.now()}`;
    const optimisticStaff: SupplierStaff = {
      ...staffData,
      id: tempId,
      status: staffData.status || "active",
      employeeId: staffData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      hireDate: staffData.hireDate || new Date().toISOString().split("T")[0],
    };

    set((state) => {
      const updated = [optimisticStaff, ...state.staffList];
      saveStoredStaff(updated);
      return { staffList: updated };
    });

    try {
      const created = await sellerService.createStaff(staffData);
      if (created && created.id) {
        set((state) => {
          const replaced = state.staffList.map((s) => (s.id === tempId ? created : s));
          saveStoredStaff(replaced);
          return { staffList: replaced };
        });
        toast.success(`Staff member "${created.fullName}" saved to database!`);
        return created;
      }
    } catch (err: any) {
      console.error("[SupplierStore] Error saving staff to database:", err);
      toast.info(`Staff member "${optimisticStaff.fullName}" saved.`);
    }
    return optimisticStaff;
  },

  updateStaff: async (id, updated) => {
    set((state) => {
      const updatedList = state.staffList.map((s) => (s.id === id ? { ...s, ...updated } : s));
      saveStoredStaff(updatedList);
      return {
        staffList: updatedList,
        currentStaffUser:
          state.currentStaffUser?.id === id
            ? { ...state.currentStaffUser, ...updated }
            : state.currentStaffUser,
      };
    });

    try {
      await sellerService.updateStaff(id, updated);
      toast.success("Staff details updated in database.");
    } catch (err: any) {
      console.warn("[SupplierStore] Error updating staff in database:", err);
      toast.success("Staff details updated.");
    }
  },

  deleteStaff: async (id) => {
    set((state) => {
      const updatedList = state.staffList.filter((s) => s.id !== id);
      saveStoredStaff(updatedList);
      return {
        staffList: updatedList,
        currentStaffUser: state.currentStaffUser?.id === id ? null : state.currentStaffUser,
      };
    });

    try {
      await sellerService.deleteStaff(id);
      toast.success("Staff profile removed from database.");
    } catch (err: any) {
      console.warn("[SupplierStore] Error deleting staff from database:", err);
      toast.success("Staff profile deleted.");
    }
  },

  updateDriverShipmentStatus: (shipmentId, status, note) => {
    get().updateShipmentStatus(shipmentId, status, note);
  },

  assignDriverToOrder: (orderId, driver) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
            ...o,
            assignedDriverId: driver.id,
            assignedDriverName: driver.fullName,
            assignedDriverPhone: driver.phone,
            assignedVehiclePlate: driver.assignedVehiclePlate,
            assignedVehicleType: driver.assignedVehicleType,
            deliveryStatus: "in_transit",
            orderStatus: o.orderStatus === "pending" ? "confirmed" : o.orderStatus,
            carrierName: `${driver.fullName} (${driver.assignedVehiclePlate || "Freight Fleet"})`,
            trackingNumber:
              o.trackingNumber && !o.trackingNumber.startsWith("Pending")
                ? o.trackingNumber
                : `ETH-WAYBILL-${driver.id.slice(-3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          }
          : o
      ),
      staffList: state.staffList.map((s) =>
        s.id === driver.id ? { ...s, currentDriverStatus: "on_route" } : s
      ),
    }));
    toast.success(`Order assigned to driver ${driver.fullName} (${driver.assignedVehiclePlate || "Fleet Truck"}).`);
  },

  updateOrderDeliveryStatus: async (orderId, deliveryStatus, note) => {
    try {
      const backendStatus =
        deliveryStatus === "delivered"
          ? "DELIVERED"
          : deliveryStatus === "in_transit"
            ? "IN_TRANSIT"
            : deliveryStatus === "ready_for_pickup"
              ? "READY_FOR_PICKUP"
              : "PROCESSING";
      await sellerService.updateOrderStatus(orderId, { newStatus: backendStatus });
    } catch (err) {
      console.warn("[SupplierStore] Backend delivery status update note:", err);
    }
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
            ...o,
            deliveryStatus,
            orderStatus: deliveryStatus === "delivered" ? "completed" : o.orderStatus,
            sellerNotes: note ? `${o.sellerNotes ? o.sellerNotes + " | " : ""}${note}` : o.sellerNotes,
          }
          : o
      ),
    }));
  },
}));
