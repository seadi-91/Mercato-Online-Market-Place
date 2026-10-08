import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { B2BOrder, B2BOrderStatus } from "@/types/supplier";

/**
 * Maps backend OrderStatus enum to B2BOrderStatus.
 */
export function mapBackendStatusToB2B(status: OrderStatus): B2BOrderStatus {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "PROCESSING":
      return "processing";
    case "READY_FOR_PICKUP":
      return "packed";
    case "IN_TRANSIT":
      return "shipped";
    case "DELIVERED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}

/**
 * Maps backend PaymentStatus enum to B2BOrder paymentStatus.
 */
export function mapBackendPaymentStatusToB2B(
  status: PaymentStatus
): "pending" | "escrow_secured" | "released" | "refunded" | "failed" {
  switch (status) {
    case "HELD_IN_ESCROW":
      return "escrow_secured";
    case "PAID":
      return "released";
    case "REFUNDED":
      return "refunded";
    case "UNPAID":
    default:
      return "pending";
  }
}

/**
 * Maps backend Order status to deliveryStatus.
 */
export function mapBackendStatusToDelivery(
  status: OrderStatus
): "processing" | "ready_for_pickup" | "in_transit" | "arrived" | "delivered" | "delayed" {
  switch (status) {
    case "IN_TRANSIT":
      return "in_transit";
    case "READY_FOR_PICKUP":
      return "ready_for_pickup";
    case "DELIVERED":
      return "delivered";
    default:
      return "processing";
  }
}

/**
 * Converts a backend Order (from PostgreSQL Orders microservice) to a frontend B2BOrder.
 */
export function mapBackendOrderToB2B(order: Order): B2BOrder {
  const items = Array.isArray(order.items) ? order.items : [];
  const primaryItem = items[0];

  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 1;
  const primaryTitle = primaryItem?.productTitle || "Assorted Commercial Goods";
  const productName =
    items.length > 1
      ? `${primaryTitle} (+${items.length - 1} more items)`
      : primaryTitle;

  const unit = primaryItem?.unitOfMeasure || "KG";
  const unitPrice = Number(primaryItem?.unitPrice) || 0;

  const subtotal = Number(order.subtotalAmount) || Number(order.totalAmount) || 0;
  const shipping = Number(order.deliveryFee) || 0;
  const total = Number(order.totalAmount) || subtotal + shipping;
  const vat = Math.round(subtotal * 0.15);

  const recipientName = order.deliveryAddress?.recipientName || "Commercial Purchasing Enterprise";
  const recipientPhone = order.deliveryAddress?.recipientPhone || "+251 91 000 0000";
  const city = order.deliveryAddress?.city || "Addis Ababa";
  const subCity = order.deliveryAddress?.subCity || "";
  const specificLoc = order.deliveryAddress?.specificLocation || "";
  const buyerLocation = [specificLoc, subCity, city].filter(Boolean).join(", ") || city;

  const orderDate = order.createdAt
    ? order.createdAt.split("T")[0]
    : new Date().toISOString().split("T")[0];

  const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const expectedDelivery = new Date(createdMs + 5 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const orderStatus = mapBackendStatusToB2B(order.status);
  const paymentStatus = mapBackendPaymentStatusToB2B(order.paymentStatus);
  const deliveryStatus = mapBackendStatusToDelivery(order.status);

  const fulfillmentStatus: "unfulfilled" | "partially_fulfilled" | "fulfilled" =
    order.status === "DELIVERED"
      ? "fulfilled"
      : ["IN_TRANSIT", "READY_FOR_PICKUP", "PROCESSING"].includes(order.status)
      ? "partially_fulfilled"
      : "unfulfilled";

  const orderItems = items.map((it) => ({
    id: it.id,
    productId: it.productId,
    productName: it.productTitle || "Commodity",
    sku: it.productSku,
    quantity: Number(it.quantity) || 1,
    unit: it.unitOfMeasure || "KG",
    unitPrice: Number(it.unitPrice) || 0,
    total: Number(it.totalPrice) || 0,
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    buyerCompany: recipientName,
    contactPerson: recipientName,
    buyerLocation,
    buyerEmail: (order as any).customer?.email || "buyer@enterprise.et",
    buyerPhone: recipientPhone,
    productName,
    quantity: totalQty,
    unit,
    unitPrice,
    subtotal,
    vat,
    shipping,
    total,
    paymentStatus,
    fulfillmentStatus,
    deliveryStatus,
    orderStatus,
    paymentTerms:
      order.paymentStatus === "HELD_IN_ESCROW"
        ? "CBE Escrow 100% Secured"
        : "Commercial Wire Transfer / RTGS",
    orderDate,
    expectedDelivery,
    sellerNotes: order.notes,
    rejectionReason: order.cancelReason,
    productId: primaryItem?.productId,
    productSku: primaryItem?.productSku || `SKU-${order.id.slice(0, 6).toUpperCase()}`,
    productImage: (primaryItem as any)?.image || "/images/placeholder-product.jpg",
    buyerTinNumber: (order as any).buyerTinNumber || "",
    buyerRepresentativeTitle: "Procurement Officer",
    escrowReferenceNumber: order.txRef || `CBE-ESC-${order.id.slice(0, 8).toUpperCase()}`,
    branchId: (order as any).branchId || "",
    branchName: (order as any).branchName || "Central Logistics Hub",
    orderItems,
  };
}
