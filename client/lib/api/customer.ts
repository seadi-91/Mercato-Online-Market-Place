import { API_CONFIG } from "@/config/api.config";

export interface CustomerProfile {
  id?: string;
  userId?: string;
  fullName: string;
  email?: string;
  alternatePhone?: string;
  phoneNumber?: string;
  city?: string;
  subCity?: string;
  specificLocation?: string;
}

export interface CustomerAddressUpdate {
  fullName?: string;
  email?: string;
  alternatePhone?: string;
  city?: string;
  subCity?: string;
  specificLocation?: string;
}

/**
 * Fetch customer profile from the backend database (via /users/me)
 */
export async function fetchCustomerProfile(
  token: string
): Promise<CustomerProfile | null> {
  if (!token) return null;

  try {
    const res = await fetch(`${API_CONFIG.baseURL}/users/me`, {
      method: "GET",
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 404) return null;
      console.warn("fetchCustomerProfile non-ok status:", res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchCustomerProfile network error:", err);
    return null;
  }
}

/**
 * Save / update customer address and profile in the backend database (via PATCH /users/me)
 */
export async function updateCustomerAddress(
  token: string,
  address: CustomerAddressUpdate
): Promise<{ success: boolean; data?: CustomerProfile; error?: string }> {
  if (!token) {
    return { success: false, error: "Authentication token required" };
  }

  try {
    const res = await fetch(`${API_CONFIG.baseURL}/users/me`, {
      method: "PATCH",
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const msg = errData?.message || `Failed to update profile: ${res.statusText}`;
      return { success: false, error: msg };
    }

    const updatedProfile = await res.json();
    return { success: true, data: updatedProfile };
  } catch (err: any) {
    console.error("updateCustomerAddress error:", err);
    return { success: false, error: err.message || "Network error" };
  }
}
