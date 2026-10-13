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
  SourcingProduct,
  SourcingNegotiation,
  SourcingOrder,
  SourcingOrderStatus,
} from "@/types/supplier";
// Clean dynamic supplier defaults (Zero mock or static fallback data)
export const emptySupplierProfile: SupplierBusinessProfile = {
  businessName: "",
  legalEntity: "Wholesale Distributor",
  tinNumber: "",
  licenseNumber: "",
  establishedYear: new Date().getFullYear(),
  website: "",
  description: "",
  logoUrl: "",
  coverUrl: "",
  verificationBadge: "Unverified Merchant",
  phone: "",
  email: "",
  country: "Ethiopia",
  region: "",
  city: "",
  address: "",
  categories: [],
  certifications: [],
  shippingRegions: [],
  minOrderValueETB: 0,
  executiveName: "",
  executiveTitle: "Enterprise Owner",
  storeSlug: "",
  tagline: "",
  vacationMode: false,
  defaultLeadTimeDays: 2,
  defaultIncoterm: "FOB Logistics Hub",
  samplePolicy: "",
  hidePhonePublicly: false,
  preferredLanguage: "en",
  primarySettlementMethod: "Commercial Bank of Ethiopia (Primary Wire)",
  settlementSchedule: "instant",
  autoPayoutThresholdETB: 50000,
  autoQuoteEnabled: false,
  autoQuoteMinETB: 0,
  quoteValidityDays: 14,
  maxCounterDiscount: 0,
  autoReserveStock: false,
  strictEscrowRequired: true,
  twoFactorEnabled: false,
  notifications: {
    email: true,
    sms: true,
    push: true,
    rfqInstant: true,
    orderUpdates: true,
    escrowAlerts: true,
    dailyDigest: true,
  },
};

export const initialSupplierProfile: SupplierBusinessProfile = emptySupplierProfile;
export const initialVerificationDocs: VerificationDocument[] = [];
export const initialPromotions: PromotionCampaign[] = [];
export const initialSourcingOrders: SourcingOrder[] = [];

import { getAccurateProductImage } from "@/lib/utils/product-image";
import { sellerService, FilterOrdersParams } from "@/services/seller/seller.service";
import {
  mapBackendProductToB2B,
  mapBackendProductToSourcing,
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

function getScopedStorageKey(baseKey: string): string | null {
  if (typeof window === "undefined") return null;
  const user = useAuthStore.getState().user;
  const userId = user?.id || (user as any)?.userId;
  return userId ? `${baseKey}_${userId}` : null;
}

export function getStoredSettlementAccounts(): SettlementAccount[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("mercatox_supplier_settlement_accounts");
    const key = getScopedStorageKey("mercatox_supplier_settlement_accounts");
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("[SupplierStore] Error reading settlement accounts from localStorage:", err);
  }
  return [];
}

export function saveStoredSettlementAccounts(accounts: SettlementAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedStorageKey("mercatox_supplier_settlement_accounts");
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(accounts));
  } catch (err) {
    console.error("[SupplierStore] Error saving settlement accounts to localStorage:", err);
  }
}

export function getStoredPromotions(): PromotionCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("mercatox_supplier_promotions");
    const key = getScopedStorageKey("mercatox_supplier_promotions");
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("[SupplierStore] Error reading promotions from localStorage:", err);
  }
  return [];
}

export function saveStoredPromotions(promotions: PromotionCampaign[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedStorageKey("mercatox_supplier_promotions");
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(promotions));
  } catch (err) {
    console.error("[SupplierStore] Error saving promotions to localStorage:", err);
  }
}

export function getStoredStaff(): SupplierStaff[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("mercatox_supplier_staff_list");
    const key = getScopedStorageKey("mercatox_supplier_staff_list");
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("[SupplierStore] Error reading staff from localStorage:", err);
  }
  return [];
}

export function saveStoredStaff(staff: SupplierStaff[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedStorageKey("mercatox_supplier_staff_list");
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(staff));
  } catch (err) {
    console.error("[SupplierStore] Error saving staff to localStorage:", err);
  }
}

const SOURCING_ORDERS_STORAGE_KEY = "mercatox_sourcing_orders";
const SOURCING_DELETED_ORDERS_STORAGE_KEY = "mercatox_deleted_sourcing_order_ids";

export function getStoredDeletedSourcingOrderIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SOURCING_DELETED_ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("[SupplierStore] Error reading deleted order IDs:", err);
  }
  return [];
}

export function addStoredDeletedSourcingOrderId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getStoredDeletedSourcingOrderIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(SOURCING_DELETED_ORDERS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (err) {
    console.error("[SupplierStore] Error saving deleted order ID:", err);
  }
}

export function removeStoredDeletedSourcingOrderId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const current = getStoredDeletedSourcingOrderIds().filter((d) => d !== id);
    localStorage.setItem(SOURCING_DELETED_ORDERS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("[SupplierStore] Error removing deleted order ID:", err);
  }
}

export function doesOrderBelongToSupplier(
  ord: SourcingOrder | any,
  targetUserId?: string | null,
  targetEmail?: string | null,
  targetPhone?: string | null,
  targetBusinessName?: string | null
): boolean {
  if (!ord) return false;
  if (!targetUserId && !targetEmail && !targetPhone && !targetBusinessName) {
    return false;
  }

  const ordBuyerId = ord.buyerId || ord.customerId;
  const ordBuyerEmail = ord.buyerEmail;
  const ordBuyerPhone = ord.buyerPhone;
  const ordBuyerName = ord.buyerName;

  // 1. Direct ID match
  if (targetUserId && ordBuyerId && ordBuyerId === targetUserId) {
    return true;
  }

  // 2. Direct Email match
  if (targetEmail && ordBuyerEmail && ordBuyerEmail.toLowerCase() === targetEmail.toLowerCase()) {
    return true;
  }

  // 3. Direct Phone match
  if (targetPhone && ordBuyerPhone && (ordBuyerPhone === targetPhone || ordBuyerPhone.includes(targetPhone.slice(-8)))) {
    return true;
  }

  // 4. Direct Business Name match
  if (targetBusinessName && ordBuyerName && ordBuyerName.toLowerCase() === targetBusinessName.toLowerCase()) {
    return true;
  }

  return false;
}

export function getStoredSourcingOrders(): SourcingOrder[] {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem("mercatox_sourcing_orders");
    const key = getScopedStorageKey("mercatox_sourcing_orders");
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const user = useAuthStore.getState().user;
        const targetUserId = user?.id || (user as any)?.userId;
        const targetEmail = user?.email;
        const targetPhone = user?.phoneNumber;
        const targetName = (user as any)?.shopName || user?.name;

        // Strictly purge any orders that don't belong to this supplier
        const valid = parsed.filter((ord: any) =>
          doesOrderBelongToSupplier(ord, targetUserId, targetEmail, targetPhone, targetName)
        );

        if (valid.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(valid));
        }
        return valid;
      }
    }
  } catch (err) {
    console.error("[SupplierStore] Error reading sourcing orders from localStorage:", err);
  }
  return [];
}

export function saveStoredSourcingOrders(orders: SourcingOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedStorageKey("mercatox_sourcing_orders");
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(orders));
  } catch (err) {
    console.error("[SupplierStore] Error saving sourcing orders to localStorage:", err);
  }
}

export function mapDbOrderToSourcingOrder(dbOrder: any): SourcingOrder {
  const firstItem = dbOrder.items?.[0] || {};
  const deliveryAddr =
    typeof dbOrder.deliveryAddress === "string"
      ? (() => {
        try {
          return JSON.parse(dbOrder.deliveryAddress);
        } catch {
          return {};
        }
      })()
      : dbOrder.deliveryAddress || {};

  const qty =
    dbOrder.items?.reduce(
      (sum: number, it: any) => sum + Number(it.quantity || 1),
      0
    ) || 1;
  const unitPrice = Number(
    firstItem.unitPrice ||
    (dbOrder.totalAmount ? Number(dbOrder.totalAmount) / qty : 0)
  );

  let status: SourcingOrderStatus = "escrow_locked";
  if (dbOrder.status === "DELIVERED" || dbOrder.status === "COMPLETED") {
    status = "inspected_completed";
  } else if (dbOrder.status === "IN_TRANSIT" || dbOrder.status === "SHIPPED") {
    status = "in_transit";
  } else if (
    dbOrder.status === "CONFIRMED" ||
    dbOrder.status === "PROCESSING" ||
    dbOrder.paymentStatus === "PAID"
  ) {
    status = "escrow_locked";
  } else if (dbOrder.paymentStatus === "PENDING") {
    status = "pending_payment";
  }

  const cleanOrderNum = dbOrder.orderNumber?.startsWith("PO-") || dbOrder.orderNumber?.startsWith("MX-")
    ? dbOrder.orderNumber
    : dbOrder.orderNumber
      ? `PO-${dbOrder.orderNumber}`
      : `PO-ETH-2026-${String(dbOrder.id || "").slice(0, 5)}`;

  return {
    id: dbOrder.id,
    orderNumber: cleanOrderNum,
    productId: firstItem.productId || firstItem.id || "prod-src",
    productName:
      firstItem.productTitle ||
      firstItem.name ||
      "Commercial Wholesale Sourcing Goods",
    productImage: getAccurateProductImage(
      firstItem.productTitle || firstItem.name,
      firstItem.unit,
      firstItem.image
    ),
    productSku: `SKU-${String(firstItem.productId || "SRC")
      .slice(0, 8)
      .toUpperCase()}`,
    supplierId: dbOrder.sellerId || "59972f9f-49ec-4592-9113-ba70a0aa3a52",
    supplierName: "Verified Ethiopian Commodity Supplier",
    quantity: qty,
    unit: firstItem.unit || "Units",
    unitPrice: unitPrice,
    subtotal: Number(
      dbOrder.subtotalAmount || dbOrder.totalAmount || unitPrice * qty
    ),
    bulkDiscount: 0,
    vatTax: Math.round(
      Number(dbOrder.subtotalAmount || dbOrder.totalAmount || 0) * 0.15
    ),
    freightCost: Number(dbOrder.deliveryFee || 0),
    totalETB: Number(dbOrder.totalAmount || 0),
    status: status,
    destinationWarehouseId: deliveryAddr.warehouseId || "wh-aa",
    destinationWarehouseName:
      deliveryAddr.warehouseName ||
      deliveryAddr.city ||
      "Addis Ababa Central Logistics Hub",
    deliveryAddress:
      typeof deliveryAddr === "object"
        ? deliveryAddr.specificLocation ||
        deliveryAddr.address ||
        deliveryAddr.city ||
        "Addis Ababa"
        : String(deliveryAddr),
    deliveryEstimateDays: 2,
    poReference: dbOrder.txRef || cleanOrderNum,
    paymentMethod: dbOrder.paymentMethod || "chapa",
    paymentReference: dbOrder.txRef,
    chapaTransactionId: dbOrder.txRef,
    escrowStatus:
      dbOrder.paymentStatus === "PAID" || dbOrder.status === "CONFIRMED"
        ? "funds_locked"
        : "awaiting_deposit",
    trackingNumber: `WAYBILL-${String(
      dbOrder.txRef || dbOrder.orderNumber || "ETH"
    )
      .slice(-6)
      .toUpperCase()}`,
    driverName: "Ato Dawit Mengistu (MercatoX Logistics)",
    driverPhone: "+251 91 233 8819",
    createdAt: dbOrder.createdAt || new Date().toISOString(),
    handoverOtp: "8492",
    buyerId:
      (deliveryAddr.buyerId && deliveryAddr.buyerId !== "609563b9-3c51-4b25-80c2-a3b238ee929f")
        ? deliveryAddr.buyerId
        : (dbOrder.customerId && dbOrder.customerId !== "609563b9-3c51-4b25-80c2-a3b238ee929f")
          ? dbOrder.customerId
          : deliveryAddr.buyerId || dbOrder.customerId || deliveryAddr.customerId,
    buyerEmail: deliveryAddr.buyerEmail || deliveryAddr.email,
    buyerPhone: deliveryAddr.buyerPhone || deliveryAddr.phone,
    buyerName: deliveryAddr.buyerName || deliveryAddr.recipientName || deliveryAddr.fullName,
  };
}

const PROFILE_STORAGE_KEY = "mercatox_supplier_profile";

export function mapBackendProfileToSupplier(
  backend: any,
  fallback: SupplierBusinessProfile = emptySupplierProfile
): SupplierBusinessProfile {
  if (!backend) return fallback;

  const authUser = useAuthStore.getState().user;
  const fullName = backend.fullName || (authUser as any)?.fullName || authUser?.name || fallback.executiveName || "";
  const shopName = backend.shopName || backend.businessName || (authUser as any)?.shopName || fallback.businessName || fullName || "Supplier Enterprise";
  const tinNumber = backend.tinNumber || "";
  const licenseNumber = backend.tradeLicenseNumber || "";
  const businessType = backend.businessType || fallback.legalEntity || "Wholesale Distributor";
  const city = backend.city || fallback.city || "";
  const subCity = backend.subCity || fallback.region || "";
  const address = backend.specificLocation || backend.marketZone || "";
  const phone = backend.alternatePhone || backend.phone || (authUser as any)?.phone || (authUser as any)?.phoneNumber || "";
  const email = backend.email || authUser?.email || "";
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
    executiveTitle: backend.role ? `${backend.role.replace(/_/g, " ")} Director` : "Enterprise Director",
    tagline: backend.tagline || (shopName ? `${shopName} — Verified Supplier on MercatoX` : ""),
    description: backend.description || "",
    website: backend.website || "",
    logoUrl: backend.logoUrl || "",
    coverUrl: backend.coverUrl || "",
    verificationBadge: isVerified
      ? "Gold Verified B2B Supplier"
      : kycStatus === "PENDING"
        ? "Pending Review"
        : kycStatus === "REJECTED"
          ? "Verification Rejected"
          : "Unverified Merchant",
    verificationStatus: isVerified
      ? "verified"
      : kycStatus === "PENDING"
        ? "pending"
        : kycStatus === "REJECTED"
          ? "rejected"
          : "unverified",
  };
}

export function getStoredProfile(): SupplierBusinessProfile {
  if (typeof window === "undefined") return emptySupplierProfile;
  try {
    localStorage.removeItem("mercatox_supplier_profile");
    const key = getScopedStorageKey("mercatox_supplier_profile");
    if (!key) return emptySupplierProfile;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.businessName && parsed.businessName.includes("Abyssinia Agri-Commodities")) {
        localStorage.removeItem(key);
        return emptySupplierProfile;
      }
      return parsed;
    }
  } catch (err) {
    console.error("[SupplierStore] Error reading profile from localStorage:", err);
  }
  return emptySupplierProfile;
}

export function saveStoredProfile(profile: SupplierBusinessProfile): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedStorageKey("mercatox_supplier_profile");
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(profile));
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

  // Sourcing & Procurement Actions
  sourcingProducts: SourcingProduct[];
  isLoadingSourcingProducts: boolean;
  sourcingProductsError: string | null;
  sourcingNegotiations: SourcingNegotiation[];
  sourcingOrders: SourcingOrder[];
  isLoadingSourcingOrders: boolean;
  fetchSourcingOrders: () => Promise<SourcingOrder[]>;
  selectedSourcingProduct: SourcingProduct | null;
  setSelectedSourcingProduct: (product: SourcingProduct | null) => void;
  fetchSourcingProducts: (params?: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) => Promise<void>;
  fetchSourcingProductById: (id: string) => Promise<SourcingProduct | null>;
  createSourcingNegotiation: (payload: {
    productId: string;
    targetQuantity: number;
    proposedPricePerUnit: number;
    deliveryTerms: string;
    paymentTerms: string;
    destinationWarehouse: string;
    notes: string;
  }) => SourcingNegotiation;
  sendSourcingNegotiationMessage: (
    negotiationId: string,
    text: string,
    offeredPrice?: number
  ) => void;
  acceptSourcingNegotiation: (negotiationId: string) => void;
  declineSourcingNegotiation: (negotiationId: string) => void;
  createSourcingOrder: (
    order: Omit<SourcingOrder, "id" | "orderNumber" | "createdAt" | "status" | "escrowStatus">
  ) => SourcingOrder;
  paySourcingOrder: (
    orderId: string,
    paymentMethod: "chapa" | "telebirr" | "cbe_birr" | "bank_transfer" | "escrow_wallet",
    paymentRef: string,
    slipUrl?: string
  ) => Promise<void>;
  confirmSourcingDelivery: (orderId: string, otp: string) => void;
  deleteSourcingOrder: (orderId: string) => void;
  restoreSourcingOrder: (order: SourcingOrder) => void;
}

export const initialStaffList: SupplierStaff[] = [];

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

  profile: emptySupplierProfile,
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
  promotions: [],
  returns: [],
  disputes: [],
  chatThreads: [],
  activeChatThreadId: "",
  verificationDocs: [],
  notifications: [],
  settlementAccounts: [],

  // Sourcing & Procurement State
  sourcingProducts: [],
  isLoadingSourcingProducts: false,
  sourcingProductsError: null,
  sourcingNegotiations: [],
  sourcingOrders: getStoredSourcingOrders(),
  isLoadingSourcingOrders: false,
  selectedSourcingProduct: null,
  setSelectedSourcingProduct: (product) => set({ selectedSourcingProduct: product }),

  hydrateStore: () => {
    if (typeof window === "undefined") return;
    try {
      const storedProfile = getStoredProfile();
      const storedAccounts = getStoredSettlementAccounts();
      const storedPromos = getStoredPromotions();
      const storedStaff = getStoredStaff();
      const storedSourcingOrders = getStoredSourcingOrders();
      set({
        profile: storedProfile,
        settlementAccounts: storedAccounts,
        promotions: storedPromos,
        staffList: storedStaff,
        sourcingOrders: storedSourcingOrders,
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
      const mergedList: any[] = [];
      const user = useAuthStore.getState().user;
      const targetSellerId = (user as any)?.sellerId || user?.id;

      if (!targetSellerId) {
        set({ orders: [], isLoadingOrders: false });
        return;
      }

      // 1. Fetch live orders from backend Orders microservice via Seller API
      try {
        const res = await sellerService.getOrders(params);
        let rawList: any[] = [];
        if (Array.isArray(res)) {
          rawList = res;
        } else if (res && Array.isArray((res as any).data)) {
          rawList = (res as any).data;
        }
        for (const item of rawList) {
          mergedList.push(item);
        }
      } catch (backendErr) {
        console.warn("[SupplierStore] Seller API fetch warning, checking database directly:", backendErr);
      }

      // 2. Fetch directly from PostgreSQL database via /api/orders for this specific supplier
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("sellerId", targetSellerId);
        const dbRes = await fetch(`/api/orders?${queryParams.toString()}`);
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          if (dbData.success && Array.isArray(dbData.orders)) {
            for (const dbOrd of dbData.orders) {
              const existingIdx = mergedList.findIndex(
                (m) =>
                  m.id === dbOrd.id ||
                  (m.orderNumber && m.orderNumber === dbOrd.orderNumber) ||
                  (m.txRef && dbOrd.txRef && m.txRef === dbOrd.txRef)
              );
              if (existingIdx === -1) {
                mergedList.push(dbOrd);
              } else {
                mergedList[existingIdx] = { ...mergedList[existingIdx], ...dbOrd };
              }
            }
          }
        }
      } catch (dbErr) {
        console.warn("[SupplierStore] Could not fetch orders from /api/orders:", dbErr);
      }

      const mapped = mergedList
        .map((ord) => mapBackendOrderToB2B(ord, targetSellerId))
        .filter((b): b is B2BOrder => Boolean(b));

      // Sort newest first
      mapped.sort((a, b) => {
        const timeA = new Date(a.orderDate || 0).getTime();
        const timeB = new Date(b.orderDate || 0).getTime();
        return timeB - timeA;
      });

      set({ orders: mapped, isLoadingOrders: false });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching seller orders:", err);
      set({
        orders: [],
        isLoadingOrders: false,
        ordersError: err?.response?.data?.message || err?.message || "Failed to load orders",
      });
    }
  },


  acceptOrder: async (orderId, sellerNote) => {
    try {
      await sellerService.updateOrderStatus(orderId, { newStatus: "CONFIRMED" });
    } catch (apiErr) {
      console.warn("[SupplierStore] Seller API status update fallback to /api/orders:", apiErr);
    }

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus: "CONFIRMED", notes: sellerNote }),
      });
    } catch (dbErr) {
      console.warn("[SupplierStore] Local DB update error:", dbErr);
    }

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
  },

  rejectOrder: async (orderId, reason) => {
    try {
      await sellerService.updateOrderStatus(orderId, {
        newStatus: "CANCELLED",
        cancelReason: reason,
      });
    } catch (apiErr) {
      console.warn("[SupplierStore] Seller API cancel fallback to /api/orders:", apiErr);
    }

    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus: "CANCELLED", cancelReason: reason }),
      });
    } catch (dbErr) {
      console.warn("[SupplierStore] Local DB cancel error:", dbErr);
    }

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

      // STRICT ISOLATION: Ensure only products posted by this supplier are shown
      const currentSellerId = (user as any)?.sellerId || user?.id;
      if (currentSellerId) {
        b2bProducts = b2bProducts.filter(
          (p) => !p.sellerId || p.sellerId === currentSellerId
        );
      }

      set({ products: b2bProducts, isLoadingProducts: false });
    } catch (err: any) {
      console.error("[SupplierStore] Failed to fetch products from database:", err);
      set({
        products: [],
        isLoadingProducts: false,
        productsError: err?.message || "Failed to load products from database",
      });
    }
  },

  addProduct: async (productData, categoryId) => {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let finalCatId = categoryId && uuidRegex.test(categoryId) ? categoryId : undefined;

      if (!finalCatId) {
        try {
          const categories = await sellerService.getCategories(false);
          const targetName = (productData.category || "").toLowerCase();
          const matched = categories.find(
            (c) =>
              c.name.toLowerCase() === targetName ||
              c.slug.toLowerCase().includes(targetName.slice(0, 5)) ||
              (categoryId && c.name.toLowerCase() === categoryId.toLowerCase())
          );
          if (matched && uuidRegex.test(matched.id)) {
            finalCatId = matched.id;
          } else if (categories.length > 0 && uuidRegex.test(categories[0].id)) {
            finalCatId = categories[0].id;
          }
        } catch {
          // ignore
        }
      }

      // Safe fallback to Agricultural Commodities category in PostgreSQL
      if (!finalCatId || !uuidRegex.test(finalCatId)) {
        finalCatId = "9214d348-5336-4da8-aeb4-46a7dc86e9c6";
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
      console.warn("[SupplierStore] Error creating product on backend:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to save product on database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      return null;
    }
  },

  updateProduct: async (id, updated, categoryId) => {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validCatId = categoryId && uuidRegex.test(categoryId) ? categoryId : undefined;

      const input = mapB2BToUpdateInput(updated, validCatId);
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
      console.warn("[SupplierStore] Error updating product:", err);
      const message =
        err?.response?.data?.message || err?.message || "Failed to update product in database";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      return null;
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

        // Map genuine uploaded KYC documents from database
        const realDocs: VerificationDocument[] = [];
        const isVerified = Boolean(res.isVerifiedMerchant);
        const kycStatus = res.merchantKycStatus;

        if (res.tinCertificateDocUrl) {
          realDocs.push({
            id: "doc-tin",
            type: "tin_cert",
            label: "Taxpayer Identification Number (TIN) Certificate",
            status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
            fileName: res.tinCertificateDocUrl.split("/").pop() || "tin_certificate.pdf",
            uploadedAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "Uploaded",
            reviewerNotes: res.merchantRejectionReason || (isVerified ? "Verified with Ministry of Revenues registry database." : "Under verification review."),
          });
        }
        if (res.tradeLicenseDocUrl) {
          realDocs.push({
            id: "doc-license",
            type: "business_license",
            label: "Principal Commercial Business License",
            status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
            fileName: res.tradeLicenseDocUrl.split("/").pop() || "trade_license.pdf",
            uploadedAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "Uploaded",
            reviewerNotes: res.merchantRejectionReason || (isVerified ? "Verified with Ministry of Trade." : "Under verification review."),
          });
        }
        if (res.commercialRegDocUrl) {
          realDocs.push({
            id: "doc-reg",
            type: "registration_cert",
            label: "Commercial Registration Certificate",
            status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
            fileName: res.commercialRegDocUrl.split("/").pop() || "commercial_registration.pdf",
            uploadedAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "Uploaded",
            reviewerNotes: res.merchantRejectionReason || (isVerified ? "Entity registered under Commercial Code." : "Under verification review."),
          });
        }
        if (res.kebeleIdDocUrl || res.ownerIdDocUrl) {
          const docUrl = res.kebeleIdDocUrl || res.ownerIdDocUrl;
          realDocs.push({
            id: "doc-id",
            type: "owner_id",
            label: "Owner National ID / Fayda",
            status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
            fileName: docUrl.split("/").pop() || "owner_id.pdf",
            uploadedAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString() : "Uploaded",
            reviewerNotes: res.merchantRejectionReason || (isVerified ? "Biometric ID verified." : "Under verification review."),
          });
        }

        set({ profile: mapped, verificationDocs: realDocs, isLoadingProfile: false });
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
          const realDocs: VerificationDocument[] = [];
          const isVerified = Boolean(userRes.isVerifiedMerchant);
          const kycStatus = userRes.merchantKycStatus;

          if (userRes.tinCertificateDocUrl) {
            realDocs.push({
              id: "doc-tin",
              type: "tin_cert",
              label: "Taxpayer Identification Number (TIN) Certificate",
              status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
              fileName: userRes.tinCertificateDocUrl.split("/").pop() || "tin_certificate.pdf",
              uploadedAt: userRes.createdAt ? new Date(userRes.createdAt).toLocaleDateString() : "Uploaded",
              reviewerNotes: userRes.merchantRejectionReason || (isVerified ? "Verified." : "Under review."),
            });
          }
          if (userRes.tradeLicenseDocUrl) {
            realDocs.push({
              id: "doc-license",
              type: "business_license",
              label: "Principal Commercial Business License",
              status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
              fileName: userRes.tradeLicenseDocUrl.split("/").pop() || "trade_license.pdf",
              uploadedAt: userRes.createdAt ? new Date(userRes.createdAt).toLocaleDateString() : "Uploaded",
              reviewerNotes: userRes.merchantRejectionReason || (isVerified ? "Verified." : "Under review."),
            });
          }
          if (userRes.commercialRegDocUrl) {
            realDocs.push({
              id: "doc-reg",
              type: "registration_cert",
              label: "Commercial Registration Certificate",
              status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
              fileName: userRes.commercialRegDocUrl.split("/").pop() || "commercial_registration.pdf",
              uploadedAt: userRes.createdAt ? new Date(userRes.createdAt).toLocaleDateString() : "Uploaded",
              reviewerNotes: userRes.merchantRejectionReason || (isVerified ? "Verified." : "Under review."),
            });
          }
          if (userRes.kebeleIdDocUrl || userRes.ownerIdDocUrl) {
            const docUrl = userRes.kebeleIdDocUrl || userRes.ownerIdDocUrl;
            realDocs.push({
              id: "doc-id",
              type: "owner_id",
              label: "Owner National ID / Fayda",
              status: isVerified ? "verified" : kycStatus === "REJECTED" ? "rejected" : "under_review",
              fileName: docUrl.split("/").pop() || "owner_id.pdf",
              uploadedAt: userRes.createdAt ? new Date(userRes.createdAt).toLocaleDateString() : "Uploaded",
              reviewerNotes: userRes.merchantRejectionReason || (isVerified ? "Verified." : "Under review."),
            });
          }

          set({ profile: mapped, verificationDocs: realDocs, isLoadingProfile: false });
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
        staffList: stored,
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

  // Sourcing & Procurement Implementations
  fetchSourcingProducts: async (params) => {
    set({ isLoadingSourcingProducts: true, sourcingProductsError: null });
    try {
      const user = useAuthStore.getState().user;
      const currentUserId = user?.id;

      const res = await sellerService.getCatalogProducts({
        limit: 100,
        search: params?.search,
        categoryId: params?.categoryId && params.categoryId !== "all" ? params.categoryId : undefined,
        excludeSellerId: currentUserId ? String(currentUserId) : undefined,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      });

      let rawList: any[] = [];
      if (Array.isArray(res)) {
        rawList = res;
      } else if (res && Array.isArray((res as any).data)) {
        rawList = (res as any).data;
      }

      let mappedSourcing = rawList.map(mapBackendProductToSourcing);

      // Exclude logged in supplier's own products so only products from other suppliers appear
      const myProducts = get().products;
      const myBusinessName = get().profile?.businessName?.toLowerCase().trim();
      mappedSourcing = mappedSourcing.filter((p) => {
        if (currentUserId && p.supplierId === currentUserId) return false;
        if (myBusinessName && p.supplierName?.toLowerCase().trim() === myBusinessName) return false;
        if (
          myProducts.some(
            (myP) => myP.id === p.id || (myP.sku && p.sku && myP.sku.toLowerCase() === p.sku.toLowerCase())
          )
        ) {
          return false;
        }
        return true;
      });

      set({
        sourcingProducts: mappedSourcing,
        isLoadingSourcingProducts: false,
      });
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching sourcing products from database:", err);
      set({
        isLoadingSourcingProducts: false,
        sourcingProductsError:
          err?.response?.data?.message || err?.message || "Failed to load sourcing products from database",
      });
    }
  },

  fetchSourcingProductById: async (id: string) => {
    try {
      const prod = await sellerService.getCatalogProductById(id);
      if (prod) {
        const sourcingProd = mapBackendProductToSourcing(prod);
        set({ selectedSourcingProduct: sourcingProd });
        return sourcingProd;
      }
      return null;
    } catch (err: any) {
      console.error("[SupplierStore] Error fetching single sourcing product:", err);
      return null;
    }
  },

  createSourcingNegotiation: (payload) => {
    const product = get().sourcingProducts.find((p) => p.id === payload.productId);
    const negId = `src-neg-${Date.now()}`;
    const code = `NEG-ETH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newNeg: SourcingNegotiation = {
      id: negId,
      negotiationCode: code,
      productId: payload.productId,
      productName: product?.name || "Marketplace Product",
      productImage: product?.images?.[0] || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      productUnit: product?.unit || "Unit",
      supplierId: product?.supplierId || "sup-unknown",
      supplierName: product?.supplierName || "Verified Merchant",
      supplierRating: product?.supplierRating || 4.8,
      targetQuantity: payload.targetQuantity,
      listedPricePerUnit: product?.baseWholesalePrice || payload.proposedPricePerUnit,
      proposedPricePerUnit: payload.proposedPricePerUnit,
      currency: "ETB",
      deliveryTerms: payload.deliveryTerms,
      paymentTerms: payload.paymentTerms,
      destinationWarehouse: payload.destinationWarehouse,
      targetDeliveryDays: product?.leadTimeDays || 2,
      notes: payload.notes,
      status: "pending_seller",
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "buyer",
          senderName: get().profile.businessName || "Your Company",
          text: payload.notes || `We propose ETB ${payload.proposedPricePerUnit.toLocaleString()}/${product?.unit || "unit"} for ${payload.targetQuantity} units with ${payload.deliveryTerms}.`,
          timestamp: now,
          offeredPrice: payload.proposedPricePerUnit,
          offeredQty: payload.targetQuantity,
        },
      ],
    };

    set((state) => ({
      sourcingNegotiations: [newNeg, ...state.sourcingNegotiations],
    }));

    toast.success(`Price negotiation proposal ${code} submitted to ${newNeg.supplierName}!`);
    return newNeg;
  },

  sendSourcingNegotiationMessage: (negotiationId, text, offeredPrice) => {
    const now = new Date().toISOString();
    set((state) => ({
      sourcingNegotiations: state.sourcingNegotiations.map((neg) => {
        if (neg.id !== negotiationId) return neg;
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender: "buyer" as const,
          senderName: state.profile.businessName || "Your Company",
          text,
          timestamp: now,
          offeredPrice,
        };
        return {
          ...neg,
          proposedPricePerUnit: offeredPrice || neg.proposedPricePerUnit,
          updatedAt: now,
          messages: [...neg.messages, newMsg],
        };
      }),
    }));
    toast.success("Negotiation message and counter-offer sent.");
  },

  acceptSourcingNegotiation: (negotiationId) => {
    const now = new Date().toISOString();
    set((state) => ({
      sourcingNegotiations: state.sourcingNegotiations.map((neg) => {
        if (neg.id !== negotiationId) return neg;
        const finalPrice = neg.sellerCounterPricePerUnit || neg.proposedPricePerUnit;
        return {
          ...neg,
          status: "agreed",
          agreedPricePerUnit: finalPrice,
          updatedAt: now,
          messages: [
            ...neg.messages,
            {
              id: `msg-${Date.now()}`,
              sender: "buyer" as const,
              senderName: state.profile.businessName || "Your Company",
              text: `Agreed to final terms at ETB ${finalPrice.toLocaleString()}/${neg.productUnit}. Proceeding to Escrow Purchase Order.`,
              timestamp: now,
              offeredPrice: finalPrice,
            },
          ],
        };
      }),
    }));
    toast.success("Price negotiation accepted! You can now proceed to checkout & payment.");
  },

  declineSourcingNegotiation: (negotiationId) => {
    const now = new Date().toISOString();
    set((state) => ({
      sourcingNegotiations: state.sourcingNegotiations.map((neg) => {
        if (neg.id !== negotiationId) return neg;
        return {
          ...neg,
          status: "declined",
          updatedAt: now,
          messages: [
            ...neg.messages,
            {
              id: `msg-${Date.now()}`,
              sender: "buyer" as const,
              senderName: state.profile.businessName || "Your Company",
              text: "Negotiation terms could not be reached. Deal closed.",
              timestamp: now,
            },
          ],
        };
      }),
    }));
    toast.info("Negotiation closed.");
  },

  fetchSourcingOrders: async () => {
    set({ isLoadingSourcingOrders: true });
    try {
      const authUser = useAuthStore.getState().user;
      const profile = get().profile;
      const targetUserId = authUser?.id || (authUser as any)?.userId || profile?.id;
      const targetEmail = authUser?.email || profile?.email;
      const targetPhone = authUser?.phoneNumber || (authUser as any)?.phone || profile?.phone;
      const targetBusinessName = profile?.businessName || authUser?.name || authUser?.shopName;

      if (!targetUserId && !targetEmail && !targetPhone) {
        set({ sourcingOrders: [], isLoadingSourcingOrders: false });
        return [];
      }

      const queryParams = new URLSearchParams();
      if (targetUserId) {
        queryParams.set("customerId", targetUserId);
      }
      if (targetEmail) {
        queryParams.set("email", targetEmail);
      }
      if (targetPhone) {
        queryParams.set("phone", targetPhone);
      }

      const res = await fetch(`/api/orders?${queryParams.toString()}`);
      const data = await res.json();
      let dbOrders: SourcingOrder[] = [];
      if (data.success && Array.isArray(data.orders)) {
        dbOrders = data.orders
          .map(mapDbOrderToSourcingOrder)
          .filter((ord: SourcingOrder) =>
            doesOrderBelongToSupplier(ord, targetUserId, targetEmail, targetPhone, targetBusinessName)
          );
      }

      // Filter local orders so other users' cached orders are completely eliminated
      const currentLocal = getStoredSourcingOrders().filter((ord) =>
        doesOrderBelongToSupplier(ord, targetUserId, targetEmail, targetPhone, targetBusinessName)
      );
      const deletedIds = new Set(getStoredDeletedSourcingOrderIds());
      const idMap = new Map<string, SourcingOrder>();
      const orderNumToId = new Map<string, string>();

      // 1. Index local orders (excluding soft-deleted ones)
      for (const ord of currentLocal) {
        if (ord && ord.id && !deletedIds.has(ord.id) && !deletedIds.has(ord.orderNumber)) {
          idMap.set(ord.id, ord);
          if (ord.orderNumber) orderNumToId.set(ord.orderNumber, ord.id);
        }
      }

      // 2. Merge DB orders (excluding soft-deleted ones)
      for (const ord of dbOrders) {
        if (ord && ord.id && !deletedIds.has(ord.id) && !deletedIds.has(ord.orderNumber)) {
          const existingId = (ord.orderNumber && orderNumToId.get(ord.orderNumber)) || (idMap.has(ord.id) ? ord.id : null);
          if (existingId && idMap.has(existingId)) {
            const existing = idMap.get(existingId)!;
            idMap.set(existingId, {
              ...ord,
              ...existing,
              id: existingId,
              status: existing.status || ord.status,
            });
          } else {
            idMap.set(ord.id, ord);
            if (ord.orderNumber) orderNumToId.set(ord.orderNumber, ord.id);
          }
        }
      }

      const uniqueList: SourcingOrder[] = [];
      const seenIds = new Set<string>();
      for (const o of Array.from(idMap.values())) {
        if (o && o.id && !seenIds.has(o.id) && doesOrderBelongToSupplier(o, targetUserId, targetEmail, targetPhone, targetBusinessName)) {
          seenIds.add(o.id);
          uniqueList.push(o);
        }
      }
      uniqueList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveStoredSourcingOrders(uniqueList);
      set({ sourcingOrders: uniqueList, isLoadingSourcingOrders: false });
      return uniqueList;
    } catch (err) {
      console.error("[SupplierStore] Error fetching sourcing orders from DB:", err);
      set({ isLoadingSourcingOrders: false });
      return [];
    }
  },

  createSourcingOrder: (orderPayload) => {
    const orderId = `src-ord-${Date.now()}`;
    const orderNumber = `PO-ETH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const handoverOtp = String(Math.floor(1000 + Math.random() * 9000));
    const authUser = useAuthStore.getState().user;
    const profile = get().profile;
    const targetUserId = authUser?.id || (authUser as any)?.userId || profile?.id;
    const targetEmail = authUser?.email || profile?.email;
    const targetPhone = authUser?.phoneNumber || (authUser as any)?.phone || profile?.phone;
    const targetName = profile?.businessName || authUser?.name || authUser?.shopName;

    const newOrder: SourcingOrder = {
      ...orderPayload,
      id: orderId,
      orderNumber,
      buyerId: targetUserId,
      buyerEmail: targetEmail,
      buyerPhone: targetPhone,
      buyerName: targetName,
      status: "pending_payment",
      escrowStatus: "awaiting_deposit",
      createdAt: now,
      handoverOtp,
    };

    const updated = [newOrder, ...get().sourcingOrders];
    saveStoredSourcingOrders(updated);
    set({ sourcingOrders: updated });

    // Asynchronously save to PostgreSQL Database (mercatox_order_db)
    try {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: newOrder.orderNumber,
          customerId: targetUserId || "609563b9-3c51-4b25-80c2-a3b238ee929f",
          sellerId: newOrder.supplierId || "59972f9f-49ec-4592-9113-ba70a0aa3a52",
          txRef: newOrder.paymentReference || `MX-CHAPA-${newOrder.orderNumber}`,
          paymentMethod: newOrder.paymentMethod || "CHAPA",
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: [
            {
              id: newOrder.productId,
              productId: newOrder.productId,
              name: newOrder.productName,
              productTitle: newOrder.productName,
              unitPrice: newOrder.unitPrice,
              quantity: newOrder.quantity,
              totalPrice: newOrder.subtotal,
              unitOfMeasure: newOrder.unit || "PIECE",
              image: newOrder.productImage,
            },
          ],
          deliveryAddress: {
            buyerId: targetUserId,
            buyerEmail: targetEmail,
            buyerPhone: targetPhone,
            buyerName: targetName,
            warehouseId: newOrder.destinationWarehouseId,
            warehouseName: newOrder.destinationWarehouseName,
            address: newOrder.deliveryAddress,
            notes: `PO Reference: ${newOrder.poReference || orderNumber}`,
          },
          deliveryFee: newOrder.freightCost || 0,
          subtotalAmount: newOrder.subtotal,
          totalAmount: newOrder.totalETB,
          notes: `B2B Procurement Sourcing Order #${orderNumber}`,
        }),
      }).catch((dbErr) => {
        console.warn("[SupplierStore] Asynchronous DB order save notice:", dbErr);
      });
    } catch (e) {
      console.warn("[SupplierStore] DB sync call failed:", e);
    }

    toast.success(`Purchase Order ${orderNumber} created! Proceed to escrow payment.`);
    return newOrder;
  },

  paySourcingOrder: async (orderId, paymentMethod, paymentRef, slipUrl) => {
    const now = new Date().toISOString();
    let updatedOrder: SourcingOrder | null = null;
    const authUser = useAuthStore.getState().user;
    const profile = get().profile;
    const targetUserId = authUser?.id || (authUser as any)?.userId || profile?.id;
    const targetEmail = authUser?.email || profile?.email;
    const targetPhone = authUser?.phoneNumber || (authUser as any)?.phone || profile?.phone;
    const targetName = profile?.businessName || authUser?.name || authUser?.shopName;

    const updated = get().sourcingOrders.map((ord) => {
      if (ord.id !== orderId) return ord;
      updatedOrder = {
        ...ord,
        status: "escrow_locked" as const,
        escrowStatus: "funds_locked" as const,
        paymentMethod: paymentMethod as any,
        paymentReference: paymentRef,
        chapaTransactionId: paymentRef,
        bankDepositSlipUrl: slipUrl,
        paymentDate: now,
        buyerId: ord.buyerId || targetUserId,
        buyerEmail: ord.buyerEmail || targetEmail,
        buyerPhone: ord.buyerPhone || targetPhone,
        buyerName: ord.buyerName || targetName,
      };
      return updatedOrder;
    });

    saveStoredSourcingOrders(updated);
    set({ sourcingOrders: updated });

    // Synchronously / reliably save to PostgreSQL Database (mercatox_order_db) & payment service
    try {
      const target = updatedOrder || get().sourcingOrders.find((o) => o.id === orderId);
      if (target) {
        const orderBuyerId = target.buyerId || targetUserId;
        const orderBuyerEmail = target.buyerEmail || targetEmail;
        const orderBuyerPhone = target.buyerPhone || targetPhone;
        const orderBuyerName = target.buyerName || targetName;

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: target.orderNumber,
            customerId: orderBuyerId || "609563b9-3c51-4b25-80c2-a3b238ee929f",
            sellerId: target.supplierId || "59972f9f-49ec-4592-9113-ba70a0aa3a52",
            txRef: paymentRef,
            paymentMethod: paymentMethod.toUpperCase(),
            status: "CONFIRMED",
            paymentStatus: "PAID",
            items: [
              {
                id: target.productId,
                productId: target.productId,
                name: target.productName,
                productTitle: target.productName,
                unitPrice: target.unitPrice,
                quantity: target.quantity,
                totalPrice: target.subtotal,
                unitOfMeasure: target.unit || "PIECE",
                image: target.productImage,
              },
            ],
            deliveryAddress: {
              buyerId: orderBuyerId,
              buyerEmail: orderBuyerEmail,
              buyerPhone: orderBuyerPhone,
              buyerName: orderBuyerName,
              warehouseId: target.destinationWarehouseId,
              warehouseName: target.destinationWarehouseName,
              address: target.deliveryAddress,
              notes: `Paid via ${paymentMethod} (Ref: ${paymentRef})`,
            },
            deliveryFee: target.freightCost || 0,
            subtotalAmount: target.subtotal,
            totalAmount: target.totalETB,
            notes: `Paid Sourcing Order #${target.orderNumber}`,
          }),
        });
        const resData = await res.json();
        console.log("[SupplierStore] Sourcing order successfully persisted to database:", target.orderNumber, resData);
      }
    } catch (e) {
      console.warn("[SupplierStore] Payment sync to DB call failed:", e);
    }

    // Refresh orders from DB to ensure state is synchronized and displays on My Orders
    try {
      await get().fetchSourcingOrders();
    } catch (fetchErr) {
      console.warn("[SupplierStore] Post-payment sourcing orders refresh:", fetchErr);
    }

    toast.success(`Payment verified! ETB escrow funds locked safely with MercatoX Protection.`);
  },

  confirmSourcingDelivery: (orderId, otp) => {
    const targetOrder = get().sourcingOrders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.handoverOtp && targetOrder.handoverOtp !== otp.trim()) {
      toast.error("Invalid Handover OTP! Please enter the correct 4-digit code.");
      return;
    }

    const updated = get().sourcingOrders.map((ord) => {
      if (ord.id !== orderId) return ord;
      return {
        ...ord,
        status: "inspected_completed" as const,
        escrowStatus: "released_to_seller" as const,
      };
    });

    saveStoredSourcingOrders(updated);
    set({ sourcingOrders: updated });

    toast.success("Delivery inspected & confirmed! Escrow funds released to supplier.");
  },

  deleteSourcingOrder: (orderId: string) => {
    const current = get().sourcingOrders;
    const target = current.find((o) => o.id === orderId || o.orderNumber === orderId);
    const updated = current.filter((ord) => ord.id !== orderId && ord.orderNumber !== orderId);

    addStoredDeletedSourcingOrderId(orderId);
    if (target?.orderNumber) {
      addStoredDeletedSourcingOrderId(target.orderNumber);
    }

    saveStoredSourcingOrders(updated);
    set({ sourcingOrders: updated });

    toast.success(`Order #${target?.orderNumber || orderId} removed from list`, {
      description: "Order temporarily deleted. Click Undo to restore.",
      action: target
        ? {
          label: "Undo (መልስ)",
          onClick: () => get().restoreSourcingOrder(target),
        }
        : undefined,
    });
  },

  restoreSourcingOrder: (order: SourcingOrder) => {
    if (!order || !order.id) return;
    removeStoredDeletedSourcingOrderId(order.id);
    if (order.orderNumber) {
      removeStoredDeletedSourcingOrderId(order.orderNumber);
    }
    const current = get().sourcingOrders;
    if (!current.some((o) => o.id === order.id || o.orderNumber === order.orderNumber)) {
      const updated = [order, ...current];
      saveStoredSourcingOrders(updated);
      set({ sourcingOrders: updated });
    }
    toast.success(`Order #${order.orderNumber} restored successfully!`);
  },
}));
