import { getAccurateProductImage } from "@/lib/utils/product-image";

export interface CustomerOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  sellerId?: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "READY_FOR_PICKUP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod: string;
  txRef: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: {
    city?: string;
    subCity?: string;
    specificLocation?: string;
    recipientName?: string;
    phone?: string;
    notes?: string;
    customerHidden?: boolean | string;
  };
  notes?: string;
  items: CustomerOrderItem[];
  createdAt: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function saveOrderToDatabase(orderData: {
  customerId?: string;
  sellerId?: string;
  orderId?: string;
  txRef: string;
  items: any[];
  deliveryAddress: any;
  deliveryFee?: number;
  subtotalAmount?: number;
  totalAmount?: number;
  notes?: string;
  paymentMethod?: string;
}) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    return await res.json();
  } catch (err: any) {
    console.error("Error saving order to database:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchCustomerOrders(
  token?: string | null,
  customerId?: string | null
): Promise<CustomerOrder[]> {
  // Never fetch or return orders if there is no authenticated customer identity
  if (!customerId && !token) {
    return [];
  }

  const mergedOrders: CustomerOrder[] = [];

  const belongsToCurrentCustomer = (ord: any): boolean => {
    if (!customerId) return true; // If relying strictly on JWT /orders/my-orders
    const deliv = ord?.deliveryAddress || {};
    return (
      ord?.customerId === customerId ||
      deliv?.buyerId === customerId ||
      deliv?.customerId === customerId
    );
  };

  // 1. Fetch orders belonging strictly to this customer from PostgreSQL via /api/orders
  if (customerId) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("customerId", customerId);

      const dbRes = await fetch(`/api/orders?${queryParams.toString()}`, {
        cache: "no-store",
      });
      if (dbRes.ok) {
        const data = await dbRes.json();
        if (data.success && Array.isArray(data.orders)) {
          for (const dbOrd of data.orders) {
            if (!belongsToCurrentCustomer(dbOrd)) continue;
            mergedOrders.push(dbOrd);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Could not fetch orders from /api/orders database:", dbErr);
    }
  }

  // 2. Fetch live orders belonging strictly to the authenticated JWT user from API Gateway
  if (token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        const backendOrders = result.data || result || [];
        if (Array.isArray(backendOrders)) {
          for (const bOrder of backendOrders) {
            if (customerId && bOrder.customerId && bOrder.customerId !== customerId) {
              continue;
            }
            if (!mergedOrders.some((m) => m.id === bOrder.id || (m.txRef && m.txRef === bOrder.txRef))) {
              mergedOrders.push({
                id: bOrder.id,
                orderNumber: bOrder.orderNumber || `MX-${bOrder.id.slice(0, 8)}`,
                customerId: bOrder.customerId,
                sellerId: bOrder.sellerId,
                status: bOrder.status || "CONFIRMED",
                paymentStatus: bOrder.paymentStatus || "PAID",
                paymentMethod: "Chapa Hosted Gateway (Telebirr / CBE / Card)",
                txRef: bOrder.transactionReference || bOrder.txRef || `MX-CHAPA-${bOrder.orderNumber}`,
                subtotalAmount: Number(bOrder.subtotalAmount || bOrder.totalAmount),
                deliveryFee: Number(bOrder.deliveryFee || 0),
                totalAmount: Number(bOrder.totalAmount || 0),
                deliveryAddress: {
                  city: bOrder.deliveryAddress?.city || "Addis Ababa",
                  subCity: bOrder.deliveryAddress?.subCity || "Bole Subcity",
                  specificLocation: bOrder.deliveryAddress?.specificLocation || "Addis Ababa",
                  recipientName: bOrder.deliveryAddress?.recipientName || "Customer",
                  phone: bOrder.deliveryAddress?.phone || bOrder.deliveryAddress?.recipientPhone || "+251911000000",
                  notes: bOrder.notes,
                  customerHidden: bOrder.deliveryAddress?.customerHidden,
                },
                notes: bOrder.notes,
                items: (bOrder.items || []).map((it: any) => ({
                  id: it.id,
                  productId: it.productId,
                  productTitle: it.productTitle || "Mercato Product",
                  unitPrice: Number(it.unitPrice || 0),
                  quantity: Number(it.quantity || 1),
                  totalPrice: Number(it.totalPrice || it.unitPrice * it.quantity),
                  image: it.image || getAccurateProductImage(it.productTitle, it.unitOfMeasure),
                })),
                createdAt: bOrder.createdAt || new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch orders from backend gateway:", err);
    }
  }

  // Never include localStorage fallback/default orders — strictly return real PAID DB orders not hidden by the customer
  const realOrders = mergedOrders.filter((ord: any) => {
    const isPaid = String(ord?.paymentStatus || "").toUpperCase() === "PAID";
    const isHiddenByCustomer =
      ord?.deliveryAddress?.customerHidden === true ||
      ord?.deliveryAddress?.customerHidden === "true" ||
      ord?.customerHidden === true;
    return isPaid && !isHiddenByCustomer;
  });

  // Clean up any legacy local completed orders cache
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("mercatox_completed_orders");
    } catch {
      // ignore
    }
  }

  // 3. Strictly sort based on order date (newest first) — ZERO fallback/static data
  return realOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function hideOrderForCustomer(
  orderId: string,
  customerId?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        customerId: customerId || undefined,
        customerHidden: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || "Failed to remove order from customer view",
      };
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("mercatox_completed_orders");
      } catch {
        // ignore
      }
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Network error while deleting order",
    };
  }
}

export async function fetchCustomerReviews(): Promise<any[]> {
  try {
    const res = await fetch("/api/reviews");
    if (res.ok) {
      const data = await res.json();
      return data.reviews || [];
    }
  } catch (err) {
    console.warn("Failed fetching from /api/reviews, checking local storage:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const localReviewsRaw = localStorage.getItem("mercatox_customer_reviews");
      if (localReviewsRaw) {
        return JSON.parse(localReviewsRaw);
      }
    } catch (e) {}
  }

  return [];
}
