import { create } from "zustand";
import { toast } from "sonner";
import {
  SupplierTab,
  B2BProduct,
  InventoryMovement,
  RFQItem,
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
} from "@/types/supplier";
import {
  initialSupplierProfile,
  initialProducts,
  initialInventoryMovements,
  initialRFQs,
  initialQuotations,
  initialNegotiations,
  initialOrders,
  initialCustomers,
  initialWarehouses,
  initialWarehouseTransfers,
  initialShipments,
  initialInvoices,
  initialTransactions,
  initialPromotions,
  initialReturns,
  initialDisputes,
  initialChatThreads,
  initialVerificationDocs,
} from "@/data/supplier-mock-data";

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
  products: B2BProduct[];
  inventoryMovements: InventoryMovement[];
  rfqs: RFQItem[];
  quotations: Quotation[];
  negotiations: NegotiationSession[];
  orders: B2BOrder[];
  customers: CustomerCRM[];
  warehouses: Warehouse[];
  transfers: WarehouseTransfer[];
  shipments: Shipment[];
  invoices: Invoice[];
  transactions: PaymentTransaction[];
  promotions: PromotionCampaign[];
  returns: ReturnCase[];
  disputes: DisputeCase[];
  chatThreads: ChatThread[];
  activeChatThreadId: string;
  verificationDocs: VerificationDocument[];
  notifications: SupplierNotification[];

  // Staff & Fleet Management (Employees & Drivers)
  staffList: SupplierStaff[];
  currentStaffUser: SupplierStaff | null; // null = Supplier Owner/Admin (Full view)
  setCurrentStaffUser: (staff: SupplierStaff | null) => void;
  loginAsStaff: (email: string, password?: string) => boolean;
  addStaff: (staff: Omit<SupplierStaff, "id">) => void;
  updateStaff: (id: string, updated: Partial<SupplierStaff>) => void;
  deleteStaff: (id: string) => void;
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
  addProduct: (product: Omit<B2BProduct, "id" | "views" | "salesCount" | "rating" | "ratingCount" | "createdAt">) => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  adjustStock: (productId: string, deltaQty: number, reason: string, warehouse: string) => void;
  transferStock: (fromWarehouse: string, toWarehouse: string, productName: string, quantity: number, unit: string) => void;
  completeTransfer: (transferId: string) => void;
  deleteTransfer: (transferId: string) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  createShipment: (shipment: Shipment) => void;
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, note?: string) => void;
  updateShipmentDeliveryDate: (shipmentId: string, newDate: string, reason?: string) => void;
  deleteShipment: (shipmentId: string) => void;
  createQuotation: (quotation: Omit<Quotation, "id" | "createdAt">) => void;
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
  ) => void;
  acceptNegotiationOffer: (sessionId: string) => void;
  declineNegotiationOffer: (sessionId: string, reason?: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
  createInvoice: (invoice: Omit<Invoice, "id">) => void;
  sendChatMessage: (threadId: string, text: string) => void;
  setActiveChatThreadId: (id: string) => void;
  updateProfile: (updated: Partial<SupplierBusinessProfile>) => void;
  uploadVerificationDocument: (docId: string, fileName: string) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationAsUnread: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestWithdrawal: (amount: number, destination: string, note?: string) => void;
  releaseEscrow: (transactionId: string) => void;
}

export const initialStaffList: SupplierStaff[] = [
  {
    id: "stf-01",
    fullName: "Abebe Worku",
    email: "abebe.w@abyssiniasupply.et",
    password: "manager123",
    phone: "+251 11 434 2210",
    role: "branch_manager",
    branchId: "wh-aa",
    branchName: "Addis Ababa Central Logistics Hub",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-9812-3910-82",
    employeeId: "EMP-MGR-001",
    hireDate: "2021-03-15",
    notes: "Central hub operations director with signing authority for Addis inventory manifests.",
  },
  {
    id: "stf-02",
    fullName: "Tewodros Lemma",
    email: "tewodros.l@abyssiniasupply.et",
    password: "manager123",
    phone: "+251 22 116 8890",
    role: "branch_manager",
    branchId: "wh-mj",
    branchName: "Modjo Dry Port Multi-Modal Terminal",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-4412-8821-09",
    employeeId: "EMP-MGR-002",
    hireDate: "2022-06-01",
    notes: "Multi-modal dry port terminal manager; leads customs bond and rail transit clearances.",
  },
  {
    id: "stf-03",
    fullName: "Birtukan Dagne",
    email: "birtukan.d@abyssiniasupply.et",
    password: "manager123",
    phone: "+251 46 220 8911",
    role: "branch_manager",
    branchId: "wh-hw",
    branchName: "Hawassa Agro-Processing Logistics Depot",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-1092-4912-33",
    employeeId: "EMP-MGR-003",
    hireDate: "2023-01-10",
    notes: "Southern corridor agro depot lead; manages coffee and grain aggregation sheds in Hawassa.",
  },
  {
    id: "stf-04",
    fullName: "Mulugeta Tadesse",
    email: "mulugeta.t@abyssiniasupply.et",
    password: "driver123",
    phone: "+251 91 144 2200",
    role: "driver",
    branchId: "wh-aa",
    branchName: "Addis Ababa Central Logistics Hub",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-7719-2041-55",
    employeeId: "EMP-DRV-101",
    hireDate: "2020-08-20",
    assignedVehiclePlate: "Plate AA-3-98210",
    assignedVehicleType: "Mercedes Actros 40-Ton Heavy Trailer",
    driverLicenseNumber: "ETH-DL-COMM-8921",
    driverLicenseGrade: "Grade 4 Commercial Heavy Vehicle",
    currentDriverStatus: "on_route",
    currentShipmentId: "shp-01",
    notes: "Senior interstate hauler; certified for Ethio-Djibouti corridor and heavy cargo transit.",
  },
  {
    id: "stf-05",
    fullName: "Abebe Kebede",
    email: "abebe.k@abyssiniasupply.et",
    password: "driver123",
    phone: "+251 91 190 2233",
    role: "driver",
    branchId: "wh-mj",
    branchName: "Modjo Dry Port Multi-Modal Terminal",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-3391-7712-44",
    employeeId: "EMP-DRV-102",
    hireDate: "2021-11-15",
    assignedVehiclePlate: "Plate ET-04-1928",
    assignedVehicleType: "Volvo FH16 40-Ton Curtain Trailer",
    driverLicenseNumber: "ETH-DL-COMM-7734",
    driverLicenseGrade: "Grade 4 Commercial Heavy Vehicle",
    currentDriverStatus: "on_route",
    currentShipmentId: "shp-01",
    notes: "Specialized in climate-controlled specialty coffee freight with sealed electronic GPS tags.",
  },
  {
    id: "stf-06",
    fullName: "Dawit Haile",
    email: "dawit.h@abyssiniasupply.et",
    password: "driver123",
    phone: "+251 92 334 1188",
    role: "driver",
    branchId: "wh-hw",
    branchName: "Hawassa Agro-Processing Logistics Depot",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-8891-1209-66",
    employeeId: "EMP-DRV-103",
    hireDate: "2022-09-05",
    assignedVehiclePlate: "Plate AA-2-88102",
    assignedVehicleType: "Isuzu FSR 12-Ton Box Truck",
    driverLicenseNumber: "ETH-DL-COMM-5521",
    driverLicenseGrade: "Grade 3 Commercial Medium Truck",
    currentDriverStatus: "available",
    notes: "Regional feeder driver handling Southern SNNPR and Adama express consignments.",
  },
  {
    id: "stf-07",
    fullName: "Eleni Hailu",
    email: "eleni.h@abyssiniasupply.et",
    password: "staff123",
    phone: "+251 11 434 2201",
    role: "warehouse_lead",
    branchId: "wh-aa",
    branchName: "Addis Ababa Central Logistics Hub",
    status: "active",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    nationalIdOrFayda: "FYD-6671-9921-12",
    employeeId: "EMP-WHL-201",
    hireDate: "2023-04-12",
    notes: "Lead receiving officer; oversees quality inspection, moisture verification, and lot coding.",
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
  products: initialProducts,
  inventoryMovements: initialInventoryMovements,
  rfqs: initialRFQs,
  quotations: initialQuotations,
  negotiations: initialNegotiations,
  orders: initialOrders,
  customers: initialCustomers,
  warehouses: initialWarehouses,
  transfers: initialWarehouseTransfers,
  shipments: initialShipments,
  invoices: initialInvoices,
  transactions: initialTransactions,
  promotions: initialPromotions,
  returns: initialReturns,
  disputes: initialDisputes,
  chatThreads: initialChatThreads,
  activeChatThreadId: "chat-01",
  verificationDocs: initialVerificationDocs,
  notifications: [
    {
      id: "nt-1",
      type: "rfq",
      title: "New High-Priority RFQ Received",
      description: "Addis Continental Hotels Group requested 2,500 KG Yirgacheffe Washed Grade 1 Coffee with CBE Escrow coverage.",
      timestamp: "10 mins ago",
      read: false,
      linkTab: "rfqs",
      priority: "urgent",
      entityId: "RFQ-2026-0921",
      counterpartName: "Addis Continental Hotels Group",
      amountETB: 3750000,
      category: "rfqs",
    },
    {
      id: "nt-2",
      type: "order",
      title: "Order #ORD-ETH-8921 Confirmed & Funded",
      description: "Midroc Construction 100% Escrow deposit confirmed by Commercial Bank of Ethiopia (CBE Finfine Branch).",
      timestamp: "1 hour ago",
      read: false,
      linkTab: "orders",
      priority: "urgent",
      entityId: "ORD-ETH-8921",
      counterpartName: "Midroc Construction PLC",
      actionLabel: "View Order & Prepare Depot Dispatch",
      amountETB: 8593000,
      category: "orders",
    },
    {
      id: "nt-3",
      type: "stock",
      title: "Warehouse Inventory Threshold Alert",
      description: "Deformed High-Tensile Steel Rebar stock in Dire Dawa Logistics Depot is nearing safety threshold (45 Tons remaining).",
      timestamp: "3 hours ago",
      read: false,
      linkTab: "inventory",
      priority: "high",
      entityId: "DEPOT-DD-01",
      counterpartName: "Dire Dawa Logistics Hub",
      actionLabel: "Adjust / Transfer Stock",
      category: "logistics",
    },
    {
      id: "nt-4",
      type: "payment",
      title: "Escrow Release Milestone Completed",
      description: "ETB 1,718,600 released to available treasury balance for Hawassa Textile delivery signoff.",
      timestamp: "Yesterday",
      read: true,
      linkTab: "payments",
      priority: "normal",
      entityId: "TX-2026-4491",
      counterpartName: "Hawassa Textile Industrial Park",
      actionLabel: "View Treasury Settlement",
      amountETB: 1718600,
      category: "payments",
    },
    {
      id: "nt-5",
      type: "verification",
      title: "TIN & Commercial License Verified",
      description: "Ministry of Revenues electronic cross-check successfully marked verified with Grade 1 Exporter badge.",
      timestamp: "2 days ago",
      read: true,
      linkTab: "verification",
      priority: "normal",
      entityId: "TIN-0019283419",
      counterpartName: "Ministry of Revenues & MInT",
      actionLabel: "Inspect Verified Credentials",
      category: "compliance",
    },
    {
      id: "nt-6",
      type: "message",
      title: "Urgent Counter-Offer Received on Coffee Consignment",
      description: "BGI Ethiopia Procurement Director submitted a revised tender offer of 1,480 ETB/kg FOB Addis Ababa.",
      timestamp: "3 days ago",
      read: true,
      linkTab: "negotiations",
      priority: "high",
      entityId: "NEG-ETH-0219",
      counterpartName: "BGI Ethiopia S.C.",
      actionLabel: "Review Negotiation Terms",
      amountETB: 2960000,
      category: "rfqs",
    },
    {
      id: "nt-7",
      type: "order",
      title: "Freight Dispatch Live - Plate AA-3-98210",
      description: "Freight driver Mulugeta Tadesse has departed Modjo Dry Port en route to Hawassa Industrial Park.",
      timestamp: "4 days ago",
      read: true,
      linkTab: "shipments",
      priority: "normal",
      entityId: "SHP-2026-8802",
      counterpartName: "Trans-Ethiopia Freight Logistics",
      actionLabel: "Track Freight Waybill",
      category: "logistics",
    },
    {
      id: "nt-8",
      type: "dispute",
      title: "Mediation Request Closed Favorably",
      description: "MercatoX Escrow Tribunal resolved moisture inspection variance for Lot #8801 with 100% funds released.",
      timestamp: "5 days ago",
      read: true,
      linkTab: "disputes",
      priority: "low",
      entityId: "DSP-2026-102",
      counterpartName: "MercatoX B2B Mediation Board",
      actionLabel: "View Settlement Dossier",
      amountETB: 450000,
      category: "compliance",
    },
  ],

  // Actions
  acceptOrder: (orderId, sellerNote) => {
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
    toast.success("Order accepted successfully! Goods preparation initiated in warehouse.");
  },

  rejectOrder: (orderId, reason) => {
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
    toast.error("Order rejected. Notification and reason transmitted to buyer.");
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

  addProduct: (productData) => {
    const newProduct: B2BProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      views: 0,
      salesCount: 0,
      rating: 5.0,
      ratingCount: 1,
      createdAt: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      products: [newProduct, ...state.products],
      subView: "default",
      activeTab: "products",
    }));
    toast.success(`Product "${productData.name}" created and published to MercatoX B2B catalog!`);
  },

  updateProductStatus: (productId, status) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === productId ? { ...p, status } : p)),
    }));
    toast.success(`Product status updated to ${status.replace("_", " ")}.`);
  },

  adjustStock: (productId, deltaQty, reason, warehouse) => {
    const product = get().products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + deltaQty);
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
    toast.success(`Stock adjusted by ${deltaQty > 0 ? "+" : ""}${deltaQty} ${product.unit}.`);
  },

  transferStock: (fromWarehouse, toWarehouse, productName, quantity, unit) => {
    const newTransfer: WarehouseTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-2026-${Math.floor(100 + Math.random() * 900)}`,
      fromWarehouse,
      toWarehouse,
      productName,
      quantity,
      unit,
      status: "in_transit",
      requestedDate: new Date().toISOString().split("T")[0],
      initiatedBy: "Operations Planner",
    };

    const newMovement: InventoryMovement = {
      id: `mov-trf-${Date.now()}`,
      productId: "prod-transfer",
      productName,
      type: "transferred",
      quantity: -quantity,
      unit,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      reference: `${newTransfer.transferNumber} (${fromWarehouse} -> ${toWarehouse})`,
      warehouse: `${fromWarehouse} -> ${toWarehouse}`,
      actor: "Operations Planner",
    };

    set((state) => ({
      transfers: [newTransfer, ...state.transfers],
      inventoryMovements: [newMovement, ...state.inventoryMovements],
      activeModal: null,
      modalData: null,
    }));
    toast.success(`Inter-warehouse transfer ${newTransfer.transferNumber} scheduled for transit!`);
  },

  completeTransfer: (transferId) => {
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: "received",
              completedDate: new Date().toISOString().split("T")[0],
            }
          : t
      ),
    }));
    toast.success("Transfer cargo received and verified at destination warehouse depot!");
  },

  deleteTransfer: (transferId) => {
    set((state) => ({
      transfers: state.transfers.filter((t) => t.id !== transferId),
    }));
    toast.success("Transfer manifest removed from operations log.");
  },

  addWarehouse: (warehouse) => {
    set((state) => ({
      warehouses: [warehouse, ...state.warehouses],
    }));
    toast.success(`Warehouse "${warehouse.name}" successfully added to depot network!`);
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

  createQuotation: (quoteData) => {
    const newQuote: Quotation = {
      ...quoteData,
      id: `quot-${Date.now()}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    set((state) => ({
      quotations: [newQuote, ...state.quotations],
      activeModal: null,
      modalData: null,
    }));
    toast.success(`Quotation ${newQuote.quoteNumber} issued and sent to ${newQuote.buyerCompany}!`);
  },

  sendCounterOffer: (sessionId, newPrice, message, options) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "supplier" as const,
      senderName: "Abyssinia Supply Desk",
      message: message || `We submit a revised counter offer of ${newPrice.toLocaleString()} ETB per unit.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      proposedPrice: newPrice,
      attachmentName: options?.attachmentName,
    };

    set((state) => ({
      negotiations: state.negotiations.map((n) =>
        n.id === sessionId
          ? {
              ...n,
              supplierCurrentOffer: newPrice,
              status: "buyer_turn",
              incoterm: options?.incoterm ?? n.incoterm,
              deliveryLeadTimeDays: options?.deliveryLeadTimeDays ?? n.deliveryLeadTimeDays,
              paymentTerms: options?.paymentTerms ?? n.paymentTerms,
              messages: [...n.messages, newMessage],
            }
          : n
      ),
      activeModal: null,
      modalData: null,
    }));
    toast.success(`Counter offer of ${newPrice.toLocaleString()} ETB transmitted to buyer.`);
  },

  acceptNegotiationOffer: (sessionId) => {
    set((state) => ({
      negotiations: state.negotiations.map((n) =>
        n.id === sessionId
          ? {
              ...n,
              status: "agreed",
              messages: [
                ...n.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: "supplier",
                  senderName: "Abyssinia Supply Desk",
                  message: "Deal officially accepted! Binding sales contract finalized with 100% CBE Escrow protection.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : n
      ),
    }));
    toast.success("Negotiation agreed! Buyer notified to execute Purchase Order.");
  },

  declineNegotiationOffer: (sessionId, reason) => {
    set((state) => ({
      negotiations: state.negotiations.map((n) =>
        n.id === sessionId
          ? {
              ...n,
              status: "declined",
              messages: [
                ...n.messages,
                {
                  id: `msg-${Date.now()}`,
                  sender: "supplier",
                  senderName: "Abyssinia Supply Desk",
                  message: `Negotiation discontinued. ${reason || "Price target is below our raw materials and manufacturing cost floor."}`,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : n
      ),
    }));
    toast.error("Tender negotiation declined and archived.");
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

  updateProfile: (updated) => {
    set((state) => ({
      profile: {
        ...state.profile,
        ...updated,
      },
    }));
    toast.success("Supplier enterprise profile updated successfully.");
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
    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: txId,
      buyerCompany: "Treasury Payout (Selam Agro)",
      buyerTIN: "0019283419",
      orderNumber: `PAYOUT-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: amount,
      feeETB: Math.round(amount * 0.0015),
      netAmountETB: Math.round(amount * 0.9985),
      paymentMethod: destination.includes("Telebirr")
        ? "Telebirr Business"
        : destination.includes("Awash")
        ? "Awash Bank"
        : "Bank Transfer (RTGS)",
      status: "pending",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      referenceNumber: `RTGS-${Math.floor(10000000 + Math.random() * 90000000)}`,
      payoutDate: "Today (within 2-4 hrs)",
      settlementAccount: destination,
      notes: note || "Supplier balance withdrawal to verified Ethiopian bank account",
    };
    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));
    toast.success(`Withdrawal request of ETB ${amount.toLocaleString()} successfully queued for settlement.`);
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

  addStaff: (staffData) => {
    const newStaff: SupplierStaff = {
      ...staffData,
      id: `stf-${Date.now()}`,
      status: staffData.status || "active",
      employeeId: staffData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      hireDate: staffData.hireDate || new Date().toISOString().split("T")[0],
    };
    set((state) => ({ staffList: [newStaff, ...state.staffList] }));
    toast.success(`Staff member "${newStaff.fullName}" registered successfully.`);
  },

  updateStaff: (id, updated) => {
    set((state) => ({
      staffList: state.staffList.map((s) => (s.id === id ? { ...s, ...updated } : s)),
      currentStaffUser:
        state.currentStaffUser?.id === id
          ? { ...state.currentStaffUser, ...updated }
          : state.currentStaffUser,
    }));
    toast.success("Staff details updated.");
  },

  deleteStaff: (id) => {
    set((state) => ({
      staffList: state.staffList.filter((s) => s.id !== id),
      currentStaffUser: state.currentStaffUser?.id === id ? null : state.currentStaffUser,
    }));
    toast.success("Staff profile deleted from roster.");
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

  updateOrderDeliveryStatus: (orderId, deliveryStatus, note) => {
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
