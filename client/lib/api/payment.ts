export interface ChapaCheckoutRequest {
  amount: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  subcity: string;
  specificAddress: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  cardNumber?: string;
  cardPassword?: string;
  customerId?: string;
  sellerId?: string;
  returnUrl?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    sellerId?: string;
    image?: string;
  }>;
}

export interface ChapaCheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  txRef?: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  error?: string;
}

export async function initializeChapaCheckout(
  data: ChapaCheckoutRequest
): Promise<ChapaCheckoutResponse> {
  try {
    const res = await fetch("/api/payments/chapa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    return result;
  } catch (err: any) {
    console.warn("Failed to call /api/payments/chapa:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Network error communicating with payment service",
    };
  }
}
