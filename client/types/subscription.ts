export type SubscriptionTargetRole = 'ALL' | 'SELLER' | 'SUPPLIER';
export type BillingPeriod = 'monthly' | 'quarterly' | 'annual';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';
export type SubscriptionPaymentMethod = 'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'BANK_TRANSFER';
export type SubscriptionPaymentStatus = 'PAID' | 'PENDING' | 'REJECTED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  targetRole: SubscriptionTargetRole;
  price: number; // in ETB
  billingPeriod: BillingPeriod;
  features: string[];
  badge?: string;
  isPopular?: boolean;
  status: SubscriptionStatus;
  commissionRateDiscount?: number;
  maxProducts?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userRole: 'SELLER' | 'SUPPLIER' | string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  paymentMethod: SubscriptionPaymentMethod;
  paymentStatus: SubscriptionPaymentStatus;
  transactionReference: string;
  paymentPhone?: string;
  bankName?: string;
  paymentSlipUrl?: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface SubscribePaymentPayload {
  planId: string;
  paymentMethod: SubscriptionPaymentMethod;
  transactionReference?: string;
  paymentPhone?: string;
  bankName?: string;
  paymentSlipUrl?: string;
  userName?: string;
}
