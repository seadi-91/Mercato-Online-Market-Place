import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { B2BOrder, B2BOrderStatus } from "@/types/supplier";
import { getAccurateProductImage } from "@/lib/utils/product-image";

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
 * Converts a backend or database Order to a frontend B2BOrder with complete information,
 * strictly isolating and displaying only products purchased from the current supplier/seller.
 */
export function mapBackendOrderToB2B(order: any, filterSellerId?: string): B2BOrder | null {
  const allItems = Array.isArray(order.items) ? order.items : [];

  // Filter items strictly to this seller's products if filterSellerId is provided
  let items = allItems;
  if (filterSellerId) {
    const matchingItems = allItems.filter((it: any) => {
      if (it.sellerId) {
        return it.sellerId === filterSellerId;
      }
      return order.sellerId === filterSellerId;
    });

    // If order has items but none belong to this seller, exclude this order
    if (matchingItems.length === 0 && allItems.length > 0 && order.sellerId && order.sellerId !== filterSellerId) {
      return null;
    }
    if (matchingItems.length > 0) {
      items = matchingItems;
    }
  }

  const primaryItem = items[0] || {};

  const totalQty = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) || 1;
  const primaryTitle = primaryItem.productTitle || primaryItem.name || "Commercial Goods & Supplies";
  const productName =
    items.length > 1
      ? `${primaryTitle} (+${items.length - 1} more items)`
      : primaryTitle;

  const unit = primaryItem.unitOfMeasure || primaryItem.unit || "PIECE";
  const unitPrice = Number(primaryItem.unitPrice || primaryItem.price) || 0;

  // Calculate financial figures strictly for this seller's items
  const calculatedSubtotal = items.reduce(
    (sum: number, it: any) =>
      sum + (Number(it.totalPrice) || Number(it.unitPrice || it.price || 0) * Number(it.quantity || 1)),
    0
  );

  const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (Number(order.subtotalAmount) || Number(order.totalAmount) || 0);
  const shipping = Number(order.deliveryFee) || 0;
  const total = subtotal + shipping;
  const vat = Math.round(subtotal * 0.15);

  const deliveryAddr = order.deliveryAddress || {};
  const recipientName =
    deliveryAddr.recipientName ||
    deliveryAddr.fullName ||
    order.recipientName ||
    "Commercial Purchasing Enterprise";
  const recipientPhone =
    deliveryAddr.recipientPhone ||
    deliveryAddr.phone ||
    deliveryAddr.phoneNumber ||
    order.phone ||
    "+251 91 122 3344";
  const city = deliveryAddr.city || "Addis Ababa";
  const subCity = deliveryAddr.subCity || deliveryAddr.subcity || "";
  const specificLoc =
    deliveryAddr.specificLocation || deliveryAddr.specificAddress || "";
  const buyerLocation =
    [specificLoc, subCity, city].filter(Boolean).join(", ") || city;

  const orderDate = order.createdAt
    ? typeof order.createdAt === "string"
      ? order.createdAt.split("T")[0]
      : new Date(order.createdAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const createdMs = order.createdAt ? new Date(order.createdAt).getTime() : Date.now();
  const expectedDelivery = new Date(createdMs + 3 * 24 * 60 * 60 * 1000)
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

  const orderItems = items.map((it: any) => {
    const itTitle = it.productTitle || it.name || "Commodity";
    const itUnit = it.unitOfMeasure || it.unit || "PIECE";
    const itPrice = Number(it.unitPrice || it.price) || 0;
    const itQty = Number(it.quantity) || 1;
    const itTotal = Number(it.totalPrice) || itPrice * itQty;
    const itImg = it.image || primaryItem.image || getAccurateProductImage(itTitle, itUnit);

    return {
      id: it.id || String(Math.random()),
      productId: it.productId || it.id,
      productName: itTitle,
      sku: it.productSku || it.sku || `SKU-${String(it.productId || it.id || "MX").slice(0, 6).toUpperCase()}`,
      quantity: itQty,
      unit: itUnit,
      unitPrice: itPrice,
      total: itTotal,
      image: itImg,
    };
  });

  const allImages = orderItems
    .map((it: any) => it.image)
    .filter((img: string | undefined): img is string => Boolean(img));

  const primaryImage =
    primaryItem.image ||
    order.productImage ||
    allImages[0] ||
    getAccurateProductImage(primaryTitle, unit);

  return {
    id: String(order.id),
    orderNumber: order.orderNumber || `MX-${String(order.id).slice(0, 8).toUpperCase()}`,
    buyerCompany: recipientName,
    contactPerson: recipientName,
    buyerLocation,
    buyerEmail:
      order.customer?.email ||
      order.buyerEmail ||
      deliveryAddr.email ||
      `${recipientName.toLowerCase().replace(/[^a-z0-9]/g, "") || "buyer"}@mercatox.et`,
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
      order.paymentStatus === "HELD_IN_ESCROW" || order.paymentStatus === "PAID"
        ? "CBE Escrow 100% Secured (Telebirr / CBE / Card)"
        : "Commercial Wire Transfer / RTGS",
    orderDate,
    expectedDelivery,
    sellerNotes: order.notes || deliveryAddr.notes,
    rejectionReason: order.cancelReason,
    productId: primaryItem.productId || primaryItem.id,
    productSku:
      primaryItem.productSku ||
      primaryItem.sku ||
      `SKU-${String(order.id).slice(0, 6).toUpperCase()}`,
    productImage: primaryImage,
    productImages: allImages.length > 0 ? allImages : [primaryImage],
    buyerTinNumber: order.buyerTinNumber || "0084920194",
    buyerRepresentativeTitle: "Authorized Purchasing Agent",
    escrowReferenceNumber:
      order.txRef || `CBE-ESC-${String(order.orderNumber || order.id).slice(0, 8).toUpperCase()}`,
    branchId: order.branchId || "",
    branchName: order.branchName || "Central Logistics Hub",
    orderItems,
  };
}
