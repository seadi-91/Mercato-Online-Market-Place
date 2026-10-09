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
  const mergedOrders: CustomerOrder[] = [];

  // 1. Fetch orders from PostgreSQL Database via /api/orders
  try {
    const queryParams = new URLSearchParams();
    if (customerId) queryParams.set("customerId", customerId);

    const dbRes = await fetch(`/api/orders?${queryParams.toString()}`);
    if (dbRes.ok) {
      const data = await dbRes.json();
      if (data.success && Array.isArray(data.orders)) {
        for (const dbOrd of data.orders) {
          mergedOrders.push(dbOrd);
        }
      }
    }
  } catch (dbErr) {
    console.warn("Could not fetch orders from /api/orders database:", dbErr);
  }

  // 2. Try fetching live orders from NestJS API Gateway (orders microservice)
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
      console.warn("Could not fetch orders from backend gateway, falling back to local orders:", err);
    }
  }

  // 2. Read local completed orders from storage (such as from Chapa escrow payments)
  if (typeof window !== "undefined") {
    try {
      const completedRaw = localStorage.getItem("mercatox_completed_orders");
      if (completedRaw) {
        const localCompleted: CustomerOrder[] = JSON.parse(completedRaw);
        if (Array.isArray(localCompleted)) {
          for (const ord of localCompleted) {
            if (!mergedOrders.some((m) => m.id === ord.id || (m.txRef && m.txRef === ord.txRef))) {
              mergedOrders.push(ord);
            }
          }
        }
      }

      // Check last checkout order
      const lastRaw = localStorage.getItem("mercatox_last_checkout_order");
      if (lastRaw) {
        const last = JSON.parse(lastRaw);
        const existing = mergedOrders.some((m) => m.txRef === last.txRef);
        if (!existing && last.txRef) {
          mergedOrders.unshift({
            id: last.txRef,
            orderNumber: `MX-${last.txRef.slice(-6)}`,
            customerId: "current-customer",
            status: "CONFIRMED",
            paymentStatus: "PAID",
            paymentMethod: "Chapa Hosted Gateway (Telebirr / CBE / Card)",
            subtotalAmount: Number(last.amount) - (last.deliveryFee ?? 150),
            deliveryFee: last.deliveryFee ?? 150,
            totalAmount: Number(last.amount),
            deliveryAddress: {
              city: "Addis Ababa",
              subCity: last.subcity,
              specificLocation: last.specificAddress,
              recipientName: last.fullName,
              phone: last.phoneNumber,
              notes: last.deliveryNotes,
            },
            notes: last.deliveryNotes,
            items: (last.items || []).map((it: any) => ({
              id: it.id,
              productId: it.id,
              productTitle: it.name,
              unitPrice: it.price,
              quantity: it.quantity,
              totalPrice: it.price * it.quantity,
              image: it.image || getAccurateProductImage(it.name || it.productTitle),
              selectedSize: it.selectedSize,
              selectedColor: it.selectedColor,
            })),
            createdAt: last.createdAt || new Date().toISOString(),
            txRef: last.txRef,
          });
        }
      }
    } catch (storageErr) {
      console.warn("Failed to read local orders from storage:", storageErr);
    }
  }

  // 3. Fallback sample data if empty
  if (mergedOrders.length === 0) {
    mergedOrders.push(
      {
        id: "ord-sample-01",
        orderNumber: "MX-2026-892104",
        customerId: "customer-1",
        status: "IN_TRANSIT",
        paymentStatus: "PAID",
        paymentMethod: "Chapa (Telebirr SuperApp)",
        txRef: "MX-CHAPA-1790241513055-9174",
        subtotalAmount: 18500,
        deliveryFee: 150,
        totalAmount: 18650,
        deliveryAddress: {
          city: "Addis Ababa",
          subCity: "Bole (Medhanialem, Rwanda, Atlas, Bulbula)",
          specificLocation: "Near Atlas Hotel, Villa 204, Gate 2",
          recipientName: "Abebe Kebede",
          phone: "+251 91 122 3344",
          notes: "Please call 10 mins before arrival.",
        },
        notes: "Please call 10 mins before arrival.",
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            productTitle: "Dell XPS 15 Ultra HD InfinityEdge Touchscreen",
            unitPrice: 18500,
            quantity: 1,
            totalPrice: 18500,
            image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
          },
        ],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: "ord-sample-02",
        orderNumber: "MX-2026-784192",
        customerId: "customer-1",
        status: "DELIVERED",
        paymentStatus: "PAID",
        paymentMethod: "Chapa (CBE Birr / Awash)",
        txRef: "MX-CHAPA-1790240982210-4412",
        subtotalAmount: 7200,
        deliveryFee: 0,
        totalAmount: 7200,
        deliveryAddress: {
          city: "Addis Ababa",
          subCity: "Kirkos (Kazanchis, Meskel Flower, Olympia)",
          specificLocation: "Kazanchis, UNECA vicinity, Apartment 5B",
          recipientName: "Abebe Kebede",
          phone: "+251 91 122 3344",
          notes: "Drop off at reception if not home.",
        },
        items: [
          {
            id: "item-2",
            productId: "prod-2",
            productTitle: "Traditional Ethiopian Hand-Woven Habesha Kemis",
            unitPrice: 4800,
            quantity: 1,
            totalPrice: 4800,
            image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80",
          },
          {
            id: "item-3",
            productId: "prod-3",
            productTitle: "Organic Yirgacheffe Roasted Coffee Beans (1kg)",
            unitPrice: 1200,
            quantity: 2,
            totalPrice: 2400,
            image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&q=80",
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    );
  }

  // 4. Sort strictly based on order date (newest first)
  return mergedOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
