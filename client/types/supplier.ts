export type SupplierTab =
  | "dashboard"
  | "products"
  | "inventory"
  | "pricing"
  | "rfqs"
  | "quotations"
  | "negotiations"
  | "orders"
  | "customers"
  | "warehouse"
  | "shipments"
  | "invoices"
  | "payments"
  | "promotions"
  | "disputes"
  | "messages"
  | "analytics"
  | "profile"
  | "settings"
  | "verification"
  | "onboarding"
  | "notifications"
  | "team";

export type ProductStatus =
  | "published"
  | "draft"
  | "pending_approval"
  | "rejected"
  | "archived"
  | "out_of_stock";

export interface TierPrice {
  id: string;
  minQty: number;
  maxQty: number | null; // null = or more
  unitPrice: number;
  discountPercentage?: number;
}

export interface B2BProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  origin: string;
  grade: string;
  unit: string;
  basePrice: number;
  currency: string;
  moq: number;
  stock: number;
  reservedStock: number;
  status: ProductStatus;
  images: string[];
  views: number;
  salesCount: number;
  rating: number;
  ratingCount: number;
  createdAt: string;
  tierPricing: TierPrice[];
  description: string;
  certifications: string[];
  warehouseLocation: string;
  leadTimeDays: number;
  branchId?: string;
  branchName?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "received" | "sold" | "transferred" | "damaged" | "adjusted";
  quantity: number; // positive or negative
  unit: string;
  date: string;
  reference: string;
  warehouse: string;
  actor: string;
}

export type RFQStatus =
  | "new"
  | "viewed"
  | "responded"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "expired";

export interface RFQItem {
  id: string;
  rfqNumber: string;
  buyerName: string;
  buyerCompany: string;
  buyerLocation: string;
  productId: string;
  productName: string;
  requestedQty: number;
  unit: string;
  targetPrice: number;
  deliveryLocation: string;
  requiredDate: string;
  expirationDate: string;
  status: RFQStatus;
  notes: string;
  createdAt: string;
  specifications: Record<string, string>;
}

export type QuotationStatus =
  | "draft"
  | "sent"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired";

export interface Quotation {
  id: string;
  quoteNumber: string;
  rfqId?: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail: string;
  buyerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number; // 15% VAT in Ethiopia
  shippingCost: number;
  total: number;
  paymentTerms: string; // e.g., "50% Advance via Escrow, 50% upon Inspection"
  deliveryTerms: string; // e.g., "FOB Addis Ababa Logistics Hub"
  validUntil: string;
  status: QuotationStatus;
  createdAt: string;
  notes: string;
}

export interface NegotiationMessage {
  id: string;
  sender: "buyer" | "supplier";
  senderName: string;
  message: string;
  timestamp: string;
  proposedPrice?: number;
  proposedQty?: number;
  unit?: string;
  attachmentName?: string;
}

export interface NegotiationSession {
  id: string;
  rfqNumber: string;
  buyerCompany: string;
  contactPerson: string;
  productName: string;
  targetQty: number;
  unit: string;
  originalBuyerTarget: number;
  supplierCurrentOffer: number;
  status: "active" | "buyer_turn" | "supplier_turn" | "agreed" | "declined";
  expiresAt: string;
  messages: NegotiationMessage[];
  // Enterprise commercial & logistics terms
  incoterm?: string;
  deliveryLeadTimeDays?: number;
  paymentTerms?: string;
  destinationLocation?: string;
  estimatedUnitCost?: number;
  qualityGrade?: string;
  packagingType?: string;
  buyerRating?: number;
  buyerTinNumber?: string;
  buyerVerified?: boolean;
  totalHistoricalVolumeETB?: number;
  cbeEscrowStatus?: "secured" | "in_review" | "funded" | "pending";
}

export type B2BOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned"
  | "disputed";

export interface B2BOrder {
  id: string;
  orderNumber: string;
  buyerCompany: string;
  contactPerson: string;
  buyerLocation: string;
  buyerEmail: string;
  buyerPhone: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  paymentStatus: "pending" | "escrow_secured" | "released" | "refunded" | "failed";
  fulfillmentStatus: "unfulfilled" | "partially_fulfilled" | "fulfilled";
  deliveryStatus: "processing" | "ready_for_pickup" | "in_transit" | "arrived" | "delivered" | "delayed";
  orderStatus: B2BOrderStatus;
  paymentTerms: string;
  orderDate: string;
  expectedDelivery: string;
  sellerNotes?: string;
  rejectionReason?: string;
  // Product extended details & images
  productId?: string;
  productImage?: string;
  productImages?: string[];
  productSku?: string;
  productCategory?: string;
  productGrade?: string;
  productOrigin?: string;
  productPackaging?: string;
  productBrand?: string;
  specifications?: Record<string, string>;
  certifications?: string[];
  // Buyer profile extended details
  buyerTinNumber?: string;
  buyerRating?: number;
  buyerTotalOrders?: number;
  buyerTotalSpend?: number;
  buyerVerified?: boolean;
  buyerRepresentativeTitle?: string;
  // Logistics & Escrow
  trackingNumber?: string;
  carrierName?: string;
  escrowReferenceNumber?: string;
  // Branch & Assigned Driver Dispatch
  branchId?: string;
  branchName?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedVehiclePlate?: string;
  assignedVehicleType?: string;
}

export interface CustomerCRM {
  id: string;
  companyName: string;
  tinNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  outstandingBalance: number;
  creditLimit: number;
  status: "active" | "vip" | "pending_credit" | "flagged";
  tags: string[];

  // Profile Picture & Corporate Branding
  avatarUrl?: string; // High-resolution portrait of authorized representative
  companyLogoUrl?: string; // Official company logo/icon

  // Corporate Profile Information
  legalName?: string;
  businessType?: string; // e.g. "Private Limited Company (PLC)", "Share Company (S.C.)"
  paidUpCapitalETB?: number; // e.g. 120,000,000 ETB
  employeeCount?: string; // e.g. "750+ Full-time Employees"
  website?: string; // e.g. "https://www.midroc-construction.et"
  establishedYear?: string; // e.g. "1993"
  industrySector?: string; // e.g. "Mega Infrastructure & Civil Engineering"
  facilityAddress?: string; // Full physical warehouse/depot address
  region?: string; // e.g. "Addis Ababa"
  subCity?: string; // e.g. "Kirkos Sub-City, Woreda 03"
  houseNumber?: string; // e.g. "Plot 104, Industrial Zone"
  gpsCoordinates?: string; // e.g. "8.9954° N, 38.7612° E"

  // Identification Documents & Legal Credentials
  tradeLicenseNumber?: string;
  tradeLicenseExpiry?: string;
  businessRegistrationNumber?: string; // የንግድ ምዝገባ ቁጥር
  vatNumber?: string;
  vatRegistrationDate?: string;
  taxClearanceCertificateNo?: string;
  faydaNationalId?: string; // Ethiopian National Digital ID (Fayda)
  representativePassportOrIdNo?: string;

  // Verification & Compliance
  kycLevel?: "Tier 1 Basic" | "Tier 2 Institutional" | "Tier 3 Enterprise Full KYC";
  kycVerificationDate?: string;
  verifiedBy?: string; // e.g. "Ministry of Innovation & Technology (MInT) & CBE"
  siteAuditStatus?: string; // e.g. "Verified On-Ground Physical Depot Audit"
  cbeEscrowAccountNumber?: string; // e.g. "CBE-ESC-1000-4829-1920"
  cbeBankBranch?: string; // e.g. "Commercial Bank of Ethiopia - Finfine Branch"
  certifications?: string[]; // e.g. ["ISO 9001:2015", "CES 101 Standard", "Grade 1 Contractor License"]

  // Representative Info
  authorizedSignatory?: string;
  authorizedSignatoryTitle?: string;
  alternateContactPerson?: string;
  alternatePhone?: string;
  buyerRating?: number;
  buyerTier?: string;

  // Direct Relationship With THIS Supplier ("ምን ያህል ኦርደር እንዳደረገ ከዛ ሰፕላየር")
  supplierSpecificOrdersCount?: number;
  supplierSpecificTotalSpend?: number;
  firstOrderWithSupplierDate?: string;
  averageOrderValueWithSupplier?: number;
  topOrderedCommoditiesFromSupplier?: { commodity: string; volume: string; totalSpend: number }[];
  supplierCreditTerms?: string;
  cbeEscrowSettlementRate?: string;
  creditUtilizationPercentage?: number;
  accountManager?: string;
  preferredPaymentTerms?: string;
  notes?: string;
}



export interface Warehouse {
  id: string;
  name: string;
  code: string;
  region: string;
  city: string;
  address: string;
  managerName: string;
  phone: string;
  totalCapacityM2: number;
  usedCapacityM2: number;
  totalStockUnits: number;
  stockDistribution: {
    productName: string;
    quantity: number;
    unit: string;
    image?: string;
    category?: string;
    lotNumber?: string;
    bayLocation?: string;
    estimatedValueETB?: number;
    reorderLevel?: number;
  }[];
  // Modern Enterprise Logistics Fields
  facilityType?: "Central Logistics Hub" | "Bonded Dry Port Terminal" | "Agro-Processing Depot" | "Free Trade Zone Yard";
  temperatureControlled?: boolean;
  temperatureReading?: string;
  humidityReading?: string;
  securityLevel?: string; // e.g. "24/7 Biometric Guarded & CCTV"
  activeLoadingDocks?: number;
  totalLoadingDocks?: number;
  fleetBaysCount?: number;
  operatingHours?: string;
  gpsCoordinates?: string;
  managerEmail?: string;
  certificationStatus?: string; // e.g. "ECAE & Customs Bonded #CUS-ETH-891"
  fireSafetyRating?: string;
}

export interface WarehouseTransfer {
  id: string;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  productName: string;
  quantity: number;
  unit: string;
  status: "pending" | "in_transit" | "received" | "cancelled";
  requestedDate: string;
  completedDate?: string;
  initiatedBy: string;
  carrierVehicle?: string; // e.g. "Mercedes Actros 40-Ton (Plate AA-3-98210)"
  driverName?: string; // e.g. "Mulugeta Tadesse (+251 91 144 2200)"
  estimatedArrival?: string;
  waybillNumber?: string;
  notes?: string;
}

export type ShipmentStatus =
  | "pending"
  | "preparing"
  | "ready_for_dispatch"
  | "dispatched"
  | "picked_up"
  | "in_transit"
  | "arrived"
  | "out_for_delivery"
  | "delivered"
  | "delayed"
  | "cancelled"
  | "returned";

export interface ShipmentItem {
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  description?: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderNumber: string;
  purchaseOrderNumber?: string;
  buyerCompany: string;
  carrier: string;
  trackingNumber: string;
  origin: string;
  originWarehouse?: string;
  destination: string;
  destinationLocation?: string;
  departureDate: string;
  dispatchDate?: string;
  estimatedDelivery: string;
  actualDeliveryDate?: string;
  status: ShipmentStatus;
  vehicleType: string;
  driverName?: string;
  driverPhone?: string;
  shippingMethod?: string;
  itemsSummary?: string;
  items?: ShipmentItem[];
  // Contact details
  senderContact?: {
    warehouseName: string;
    location: string;
    contactPerson: string;
    phone: string;
  };
  receiverContact?: {
    companyName: string;
    address: string;
    contactPerson: string;
    phone: string;
    email?: string;
  };
  // Milestones & Timeline
  milestones: {
    stage: ShipmentStatus;
    label: string;
    timestamp?: string;
    completed: boolean;
    location?: string;
  }[];
  trackingEvents?: TrackingEvent[];
  // Proof of Delivery
  deliveredDate?: string;
  receivedBy?: string;
  receiverPhone?: string;
  proofOfDeliveryNotes?: string;
  proofOfDeliveryUrl?: string;
  // Delay Management
  isDelayed?: boolean;
  delayReason?: string;
  revisedDeliveryDate?: string;
  delayNotes?: string;
  // Shipping Cost Breakdown
  shippingCostETB?: number;
  handlingCostETB?: number;
  insuranceCostETB?: number;
  totalCostETB?: number;
  // Metadata
  createdDate?: string;
  notes?: string;
}

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  buyerCompany: string;
  buyerTIN: string;
  issuedDate: string;
  dueDate: string;
  subtotal: number;
  vatRate: number; // 15%
  vatAmount: number;
  shipping: number;
  total: number;
  status: InvoiceStatus;
  paidAmount: number;
}

export interface PaymentTransaction {
  id: string;
  transactionNumber: string;
  buyerCompany: string;
  buyerTIN?: string;
  orderNumber: string;
  amount: number;
  feeETB?: number;
  netAmountETB?: number;
  paymentMethod: "Telebirr Business" | "CBE Birr" | "Commercial Bank of Ethiopia" | "Awash Bank" | "MercatoX Escrow" | "Bank Transfer (RTGS)";
  status: "completed" | "escrow_held" | "pending" | "failed" | "refunded";
  date: string;
  referenceNumber: string;
  payoutDate?: string;
  settlementAccount?: string;
  notes?: string;
  escrowMilestone?: "deposit_confirmed" | "goods_in_transit" | "inspection_pending" | "funds_released";
}

export interface PromotionCampaign {
  id: string;
  title: string;
  type: "bulk_volume_discount" | "seasonal_flash" | "featured_catalog" | "category_special";
  productName: string;
  discountPercentage: number;
  minOrderQuantity: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  views: number;
  conversions: number;
  generatedRevenue: number;
}

export interface ReturnCase {
  id: string;
  returnNumber: string;
  orderNumber: string;
  buyerCompany: string;
  productName: string;
  quantity: number;
  unit: string;
  reason: "quality_deviation" | "damaged_in_transit" | "wrong_grade" | "moisture_content_excess";
  status: "requested" | "approved" | "rejected" | "in_transit" | "received" | "refunded" | "completed";
  refundAmount: number;
  requestedDate: string;
  notes: string;
}

export interface DisputeCase {
  id: string;
  disputeNumber: string;
  orderNumber: string;
  buyerCompany: string;
  reason: string;
  claimedAmount: number;
  status: "open" | "under_review" | "evidence_submitted" | "resolved" | "escalated";
  openedDate: string;
  lastUpdate: string;
  evidenceFiles: string[];
  history: {
    author: string;
    message: string;
    date: string;
  }[];
}

export interface ChatThread {
  id: string;
  buyerCompany: string;
  contactPerson: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  online: boolean;
  avatarText: string;
  pinnedContext?: {
    type: "rfq" | "order" | "quote";
    reference: string;
    summary: string;
  };
}

export interface VerificationDocument {
  id: string;
  type: "tin_cert" | "business_license" | "registration_cert" | "owner_id" | "export_license";
  label: string;
  status: "not_uploaded" | "uploaded" | "under_review" | "verified" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  reviewerNotes?: string;
}

export interface SupplierBusinessProfile {
  businessName: string;
  legalEntity: string;
  tinNumber: string;
  licenseNumber: string;
  establishedYear: number;
  website: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  verificationBadge: "Gold Verified B2B Supplier" | "Verified Exporter" | "Pending Review";
  phone: string;
  email: string;
  country: string;
  region: string;
  city: string;
  address: string;
  categories: string[];
  certifications: string[];
  shippingRegions: string[];
  minOrderValueETB: number;
  // Extended Supplier Configuration & Portal Settings
  executiveName?: string;
  executiveTitle?: string;
  storeSlug?: string;
  tagline?: string;
  vacationMode?: boolean;
  defaultLeadTimeDays?: number;
  defaultIncoterm?: string;
  samplePolicy?: string;
  hidePhonePublicly?: boolean;
  preferredLanguage?: "en" | "am" | "om" | "ti";
  primarySettlementMethod?: string;
  settlementSchedule?: "instant" | "daily" | "weekly";
  autoPayoutThresholdETB?: number;
  autoQuoteEnabled?: boolean;
  autoQuoteMinETB?: number;
  quoteValidityDays?: number;
  maxCounterDiscount?: number;
  autoReserveStock?: boolean;
  strictEscrowRequired?: boolean;
  twoFactorEnabled?: boolean;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    rfqInstant: boolean;
    orderUpdates: boolean;
    escrowAlerts: boolean;
    dailyDigest: boolean;
  };
}

export type StaffRole =
  | "branch_manager"
  | "driver"
  | "warehouse_lead"
  | "sales_officer"
  | "supplier_owner";

export interface SupplierStaff {
  id: string;
  fullName: string; // ሙሉ ስም
  email: string;
  password?: string; // e.g. for login simulation
  phone: string; // Ethiopian mobile number
  role: StaffRole;
  branchId: string; // e.g. "wh-aa", "wh-mj", "wh-hw"
  branchName: string; // e.g. "Addis Ababa Central Logistics Hub"
  status: "active" | "on_leave" | "suspended";
  avatarUrl?: string;
  nationalIdOrFayda?: string; // Fayda / National ID
  employeeId: string; // e.g. "EMP-ETH-0102"
  hireDate: string;
  notes?: string;

  // Specific Driver & Vehicle Fleet Fields
  assignedVehiclePlate?: string; // e.g. "Plate AA-3-98210"
  assignedVehicleType?: string; // e.g. "Mercedes Actros 40-Ton Heavy Trailer"
  driverLicenseNumber?: string; // e.g. "ETH-DL-COMM-8921"
  driverLicenseGrade?: string; // e.g. "Grade 4 Commercial Heavy Vehicle"
  currentDriverStatus?: "available" | "on_route" | "loading" | "off_duty";
  currentShipmentId?: string; // Associated active shipment e.g. "shp-01"
}

