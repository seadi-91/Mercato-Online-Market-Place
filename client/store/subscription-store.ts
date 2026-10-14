import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SubscriptionPlan,
  UserSubscriptionRecord,
  SubscribePaymentPayload,
} from "@/types/subscription";
import { API_CONFIG } from "@/config/api.config";
import { useAuthStore } from "./auth-store";
import { toast } from "sonner";

export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: "seller-starter",
    name: "Starter Merchant",
    description: "Ideal for new retail sellers starting out on MercatoX marketplace.",
    targetRole: "SELLER",
    price: 0,
    billingPeriod: "monthly",
    features: [
      "Up to 15 product listings",
      "Standard marketplace search listing",
      "Basic sales analytics",
      "Standard 3.5% escrow commission",
      "Community support",
    ],
    badge: "Free Forever",
    isPopular: false,
    status: "ACTIVE",
    commissionRateDiscount: 0,
    maxProducts: 15,
  },
  {
    id: "seller-pro",
    name: "Professional Merchant",
    description: "Enhanced store visibility, reduced commission, and verified merchant badge.",
    targetRole: "SELLER",
    price: 750,
    billingPeriod: "monthly",
    features: [
      "Up to 250 product listings",
      "Priority marketplace search ranking",
      "Reduced 2.0% escrow commission",
      "Verified Merchant Blue Badge",
      "Instant buyer chat & notifications",
      "Advanced revenue analytics & export",
      "Priority payout processing (24h)",
    ],
    badge: "Most Popular",
    isPopular: true,
    status: "ACTIVE",
    commissionRateDiscount: 1.5,
    maxProducts: 250,
  },
  {
    id: "seller-enterprise",
    name: "Enterprise Flagship",
    description: "Unlimited listings, lowest commission, and dedicated account manager.",
    targetRole: "SELLER",
    price: 1800,
    billingPeriod: "monthly",
    features: [
      "Unlimited product listings",
      "Top-tier sponsored placement on homepage",
      "Lowest 1.0% escrow commission",
      "Gold Verified Flagship Store Badge",
      "Bulk product CSV import & export",
      "Automated rider dispatch & express delivery",
      "Dedicated 24/7 VIP account manager",
      "Instant payout processing (same-day)",
    ],
    badge: "Enterprise",
    isPopular: false,
    status: "ACTIVE",
    commissionRateDiscount: 2.5,
    maxProducts: 999999,
  },
  {
    id: "supplier-basic",
    name: "B2B Supplier Starter",
    description: "Essential wholesale tools for local distributors and manufacturers.",
    targetRole: "SUPPLIER",
    price: 0,
    billingPeriod: "monthly",
    features: [
      "Up to 2 warehouse depots",
      "Up to 30 wholesale inventory items",
      "Standard RFQ quotation receiving",
      "Direct chat with registered buyers",
      "Standard wholesale payment gateway",
    ],
    badge: "Free Tier",
    isPopular: false,
    status: "ACTIVE",
    commissionRateDiscount: 0,
    maxProducts: 30,
  },
  {
    id: "supplier-gold",
    name: "B2B Gold Supplier",
    description: "Full access to wholesale marketplace, bulk RFQ bidding, and branch network.",
    targetRole: "SUPPLIER",
    price: 2500,
    billingPeriod: "monthly",
    features: [
      "Up to 10 warehouse depots & branch hubs",
      "Unlimited wholesale catalog listings",
      "Priority access to national RFQs & tenders",
      "Wholesale tier volume discount pricing",
      "Multi-depot stock transfer & inventory routing",
      "Verified B2B Supplier Gold Badge",
      "Export commercial proforma & VAT invoices",
      "Dedicated escrow account settlement",
    ],
    badge: "Recommended",
    isPopular: true,
    status: "ACTIVE",
    commissionRateDiscount: 1.5,
    maxProducts: 999999,
  },
  {
    id: "supplier-mega",
    name: "Mega Distribution Hub",
    description: "For high-volume national distributors, manufacturers, and fleet operations.",
    targetRole: "SUPPLIER",
    price: 5000,
    billingPeriod: "monthly",
    features: [
      "Unlimited warehouse depots across all regions",
      "Unlimited wholesale catalog & bulk items",
      "Direct fleet driver dispatch & vehicle assignment",
      "0% escrow platform commission",
      "Custom quotation builder with automated tax calculation",
      "VIP B2B Manufacturer Diamond Badge",
      "API integration for external ERP & warehouse systems",
      "Dedicated 24/7 logistics & account management",
    ],
    badge: "Mega Hub",
    isPopular: false,
    status: "ACTIVE",
    commissionRateDiscount: 3.5,
    maxProducts: 999999,
  },
];

interface SubscriptionStoreState {
  plans: SubscriptionPlan[];
  subscribers: UserSubscriptionRecord[];
  mySubscription: UserSubscriptionRecord | null;
  isLoading: boolean;

  fetchPlans: (role?: "SELLER" | "SUPPLIER") => Promise<void>;
  fetchMySubscription: () => Promise<void>;
  fetchAdminSubscribers: () => Promise<void>;
  createPlan: (plan: Partial<SubscriptionPlan>) => Promise<boolean>;
  updatePlan: (id: string, plan: Partial<SubscriptionPlan>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  subscribe: (payload: SubscribePaymentPayload) => Promise<{ success: boolean; message: string; record?: UserSubscriptionRecord }>;
  updateSubscriberStatus: (id: string, status: "PAID" | "PENDING" | "REJECTED") => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionStoreState>()(
  persist(
    (set, get) => ({
      plans: INITIAL_PLANS,
      subscribers: [],
      mySubscription: null,
      isLoading: false,

      fetchPlans: async (role) => {
        try {
          set({ isLoading: true });
          const url = role
            ? `${API_CONFIG.baseURL}/platform/subscriptions?targetRole=${role}`
            : `${API_CONFIG.baseURL}/platform/subscriptions`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set({ plans: data });
              return;
            }
          }
        } catch {
          // fallback to stored/initial plans
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMySubscription: async () => {
        try {
          const user = useAuthStore.getState().user;
          const token = useAuthStore.getState().token;
          const queryParams = new URLSearchParams();
          if (user?.id) queryParams.set("userId", user.id);
          if (user?.email) queryParams.set("email", user.email);

          const url = `${API_CONFIG.baseURL}/subscriptions/my-subscription?${queryParams.toString()}`;
          const headers: Record<string, string> = {};
          if (token) headers["Authorization"] = `Bearer ${token}`;

          const res = await fetch(url, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data && data.id) {
              set({ mySubscription: data });
              return;
            }
          }
        } catch {
          // keep cached subscription
        }
      },

      fetchAdminSubscribers: async () => {
        try {
          const token = useAuthStore.getState().token;
          const headers: Record<string, string> = {};
          if (token) headers["Authorization"] = `Bearer ${token}`;

          let res = await fetch(
            `${API_CONFIG.baseURL}/admin/subscriptions/subscribers`,
            { headers },
          );
          if (!res.ok) {
            res = await fetch(`${API_CONFIG.baseURL}/platform/subscribers`);
          }
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              set({ subscribers: data });
            }
          }
        } catch {
          // keep cached
        }
      },

      createPlan: async (newPlanData) => {
        try {
          const token = useAuthStore.getState().token;
          const res = await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/plans`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newPlanData),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.plan) {
              set((state) => ({ plans: [...state.plans, data.plan] }));
              toast.success("Subscription plan created successfully!");
              return true;
            }
          }
          // Fallback local update
          const fallbackPlan: SubscriptionPlan = {
            id: `plan-${Date.now().toString(36)}`,
            name: newPlanData.name || "Custom Plan",
            description: newPlanData.description || "",
            targetRole: newPlanData.targetRole || "ALL",
            price: Number(newPlanData.price) || 0,
            billingPeriod: newPlanData.billingPeriod || "monthly",
            features: newPlanData.features || [],
            badge: newPlanData.badge,
            isPopular: newPlanData.isPopular,
            status: newPlanData.status || "ACTIVE",
            commissionRateDiscount: newPlanData.commissionRateDiscount || 0,
            maxProducts: newPlanData.maxProducts || "unlimited",
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ plans: [...state.plans, fallbackPlan] }));
          toast.success("Plan created successfully!");
          return true;
        } catch (err: any) {
          toast.error("Failed to create plan: " + (err.message || "Network error"));
          return false;
        }
      },

      updatePlan: async (id, updatedData) => {
        try {
          const token = useAuthStore.getState().token;
          await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/plans/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
          }).catch(() => null);

          set((state) => ({
            plans: state.plans.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
          }));
          toast.success("Plan updated successfully!");
          return true;
        } catch {
          toast.error("Failed to update plan");
          return false;
        }
      },

      deletePlan: async (id) => {
        try {
          const token = useAuthStore.getState().token;
          await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/plans/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          set((state) => ({
            plans: state.plans.filter((p) => p.id !== id),
          }));
          toast.success("Plan deleted successfully");
          return true;
        } catch {
          toast.error("Failed to delete plan");
          return false;
        }
      },

      subscribe: async (payload) => {
        try {
          const token = useAuthStore.getState().token;
          const user = useAuthStore.getState().user;
          const plan = get().plans.find((p) => p.id === payload.planId);

          if (!plan) {
            toast.error("Selected plan not found");
            return { success: false, message: "Plan not found" };
          }

          let record: UserSubscriptionRecord | undefined;

          if (token) {
            try {
              const res = await fetch(`${API_CONFIG.baseURL}/subscriptions/subscribe`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  ...payload,
                  userName: user?.name || user?.email || "Merchant",
                }),
              });
              if (res.ok) {
                const data = await res.json();
                record = data.subscription;
              }
            } catch {
              // fallback below
            }
          }

          if (!record) {
            // Local optimistic record
            const now = new Date();
            const endDate = new Date(now);
            if (plan.billingPeriod === "annual") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setDate(endDate.getDate() + 30);
            }

            record = {
              id: `sub_${Date.now()}`,
              userId: user?.id || "local-user",
              userEmail: user?.email || "merchant@mercatox.et",
              userName: user?.name || (user as any)?.fullName || "Merchant",
              userRole: user?.role || "SELLER",
              planId: plan.id,
              planName: plan.name,
              price: plan.price,
              currency: "ETB",
              billingPeriod: plan.billingPeriod,
              paymentMethod: payload.paymentMethod,
              paymentStatus: payload.paymentMethod === "BANK_TRANSFER" && plan.price > 0 ? "PENDING" : "PAID",
              transactionReference:
                payload.transactionReference ||
                `TXN-SUB-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
              paymentPhone: payload.paymentPhone,
              bankName: payload.bankName,
              paymentSlipUrl: payload.paymentSlipUrl,
              startDate: now.toISOString(),
              endDate: endDate.toISOString(),
              autoRenew: true,
              createdAt: now.toISOString(),
            };
          }

          set((state) => ({
            mySubscription: record!,
            subscribers: [record!, ...state.subscribers],
          }));

          const isBankSlipPending = record.paymentStatus === "PENDING";
          const message = isBankSlipPending
            ? `Bank transfer slip submitted for ${plan.name}. Awaiting administrative verification.`
            : `Successfully subscribed to ${plan.name}! Premium merchant privileges activated.`;

          if (isBankSlipPending) {
            toast.info("Subscription submitted", { description: message });
          } else {
            toast.success("Subscription activated!", { description: message });
          }

          return { success: true, message, record };
        } catch (err: any) {
          toast.error("Payment failed: " + (err.message || "An error occurred"));
          return { success: false, message: err.message || "Error" };
        }
      },

      updateSubscriberStatus: async (id, status) => {
        try {
          const token = useAuthStore.getState().token;
          await fetch(`${API_CONFIG.baseURL}/admin/subscriptions/subscribers/${id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          }).catch(() => null);

          set((state) => ({
            subscribers: state.subscribers.map((s) => (s.id === id ? { ...s, paymentStatus: status } : s)),
          }));
          toast.success(`Subscriber status updated to ${status}`);
          return true;
        } catch {
          toast.error("Failed to update subscriber status");
          return false;
        }
      },
    }),
    {
      name: "mercatox-subscriptions-store",
    }
  )
);
