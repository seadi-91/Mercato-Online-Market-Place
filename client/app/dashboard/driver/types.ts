export interface DriverOrderItem {
  id?: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  sku?: string;
}

export interface DriverMission {
  id: string;
  waybillNumber: string;
  orderNumber: string;
  // Location Details
  origin: string;
  originHub: string;
  originContact?: string;
  destination: string;
  destinationCity: string;
  destinationSubCity: string;
  destinationSpecificLocation: string;
  // Buyer / Consignee Details
  buyerName: string;
  buyerPhone: string;
  buyerAlternatePhone?: string;
  buyerEmail?: string;
  buyerNotes?: string;
  // Order Details
  cargoDescription: string;
  weightSummary: string;
  items: DriverOrderItem[];
  subtotal: number;
  deliveryFee: number;
  amount: number;
  paymentStatus: string;
  paymentMethod: string;
  escrowStatus: string;
  // Status & Tracking
  status: "ready" | "in_transit" | "arrived" | "delivered" | "delayed";
  delayReason?: string;
  deliveryOtp: string;
  podNote?: string;
  podSignatureName?: string;
  createdAt: string;
  carrierId?: string;
  priority?: "urgent" | "express" | "standard";
}
