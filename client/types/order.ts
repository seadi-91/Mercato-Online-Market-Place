export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "HELD_IN_ESCROW";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productTitle?: string;
  productSku?: string;
}

export interface DeliveryAddress {
  recipientName: string;
  recipientPhone: string;
  city: string;
  subCity: string;
  specificLocation: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  sellerId: string;
  carrierId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  notes?: string;
  cancelReason?: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusInput {
  newStatus: OrderStatus;
  carrierId?: string;
  cancelReason?: string;
}
