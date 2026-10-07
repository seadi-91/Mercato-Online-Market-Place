// ─── Enums (mirror server-side) ─────────────────────────────────────────────

export enum AuditAction {
  // Auth
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // Admin: User Management
  USER_APPROVED = 'USER_APPROVED',
  USER_REJECTED = 'USER_REJECTED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DELETED = 'USER_DELETED',

  // KYC
  KYC_SUBMITTED = 'KYC_SUBMITTED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',

  // Profile
  PROFILE_UPDATED = 'PROFILE_UPDATED',

  // Product
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  PRODUCT_AVAILABILITY_TOGGLED = 'PRODUCT_AVAILABILITY_TOGGLED',
  STOCK_UPDATED = 'STOCK_UPDATED',

  // Category
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',

  // Order
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_DELIVERY_CLAIMED = 'ORDER_DELIVERY_CLAIMED',

  // Payment
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BANK_SLIP_UPLOADED = 'BANK_SLIP_UPLOADED',
  BANK_SLIP_APPROVED = 'BANK_SLIP_APPROVED',
  BANK_SLIP_REJECTED = 'BANK_SLIP_REJECTED',
  PAYOUT_RELEASED = 'PAYOUT_RELEASED',
  REFUND_ISSUED = 'REFUND_ISSUED',

  // Settings
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN',
}

// ─── Core Model ──────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  action: AuditAction;
  targetEntity: string;
  targetId: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// ─── API Params & Response ───────────────────────────────────────────────────

export interface FilterAuditLogsParams {
  actorId?: string;
  actorRole?: UserRole | string;
  action?: AuditAction | string;
  targetEntity?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Severity mapping ────────────────────────────────────────────────────────

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

const CRITICAL_ACTIONS = new Set<string>([
  AuditAction.USER_DELETED,
  AuditAction.USER_SUSPENDED,
  AuditAction.USER_LOGIN_FAILED,
  AuditAction.PAYMENT_FAILED,
  AuditAction.BANK_SLIP_REJECTED,
  AuditAction.KYC_REJECTED,
  AuditAction.REFUND_ISSUED,
]);

const WARNING_ACTIONS = new Set<string>([
  AuditAction.USER_REJECTED,
  AuditAction.ORDER_CANCELLED,
  AuditAction.PRODUCT_DELETED,
  AuditAction.CATEGORY_DELETED,
]);

export function getAuditSeverity(action: AuditAction | string): AuditSeverity {
  if (CRITICAL_ACTIONS.has(action)) return 'CRITICAL';
  if (WARNING_ACTIONS.has(action)) return 'WARNING';
  return 'INFO';
}

// ─── Category mapping for display grouping ───────────────────────────────────

export type AuditCategory =
  | 'AUTH'
  | 'USER_MGMT'
  | 'KYC'
  | 'PROFILE'
  | 'PRODUCT'
  | 'CATEGORY'
  | 'ORDER'
  | 'PAYMENT'
  | 'OTHER';

const ACTION_CATEGORY_MAP: Record<string, AuditCategory> = {
  [AuditAction.USER_REGISTERED]: 'AUTH',
  [AuditAction.USER_LOGIN]: 'AUTH',
  [AuditAction.USER_LOGIN_FAILED]: 'AUTH',
  [AuditAction.USER_LOGOUT]: 'AUTH',
  [AuditAction.PASSWORD_CHANGED]: 'AUTH',
  [AuditAction.USER_APPROVED]: 'USER_MGMT',
  [AuditAction.USER_REJECTED]: 'USER_MGMT',
  [AuditAction.USER_SUSPENDED]: 'USER_MGMT',
  [AuditAction.USER_ACTIVATED]: 'USER_MGMT',
  [AuditAction.USER_DELETED]: 'USER_MGMT',
  [AuditAction.KYC_SUBMITTED]: 'KYC',
  [AuditAction.KYC_APPROVED]: 'KYC',
  [AuditAction.KYC_REJECTED]: 'KYC',
  [AuditAction.PROFILE_UPDATED]: 'PROFILE',
  [AuditAction.PRODUCT_CREATED]: 'PRODUCT',
  [AuditAction.PRODUCT_UPDATED]: 'PRODUCT',
  [AuditAction.PRODUCT_DELETED]: 'PRODUCT',
  [AuditAction.PRODUCT_AVAILABILITY_TOGGLED]: 'PRODUCT',
  [AuditAction.STOCK_UPDATED]: 'PRODUCT',
  [AuditAction.CATEGORY_CREATED]: 'CATEGORY',
  [AuditAction.CATEGORY_UPDATED]: 'CATEGORY',
  [AuditAction.CATEGORY_DELETED]: 'CATEGORY',
  [AuditAction.ORDER_PLACED]: 'ORDER',
  [AuditAction.ORDER_STATUS_UPDATED]: 'ORDER',
  [AuditAction.ORDER_CANCELLED]: 'ORDER',
  [AuditAction.ORDER_DELIVERY_CLAIMED]: 'ORDER',
  [AuditAction.PAYMENT_INITIATED]: 'PAYMENT',
  [AuditAction.PAYMENT_VERIFIED]: 'PAYMENT',
  [AuditAction.PAYMENT_FAILED]: 'PAYMENT',
  [AuditAction.BANK_SLIP_UPLOADED]: 'PAYMENT',
  [AuditAction.BANK_SLIP_APPROVED]: 'PAYMENT',
  [AuditAction.BANK_SLIP_REJECTED]: 'PAYMENT',
  [AuditAction.PAYOUT_RELEASED]: 'PAYMENT',
  [AuditAction.REFUND_ISSUED]: 'PAYMENT',
};

export function getAuditCategory(action: AuditAction | string): AuditCategory {
  return ACTION_CATEGORY_MAP[action] ?? 'OTHER';
}

// ─── Human readable label ────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  [AuditAction.USER_REGISTERED]: 'User Registered',
  [AuditAction.USER_LOGIN]: 'User Login',
  [AuditAction.USER_LOGIN_FAILED]: 'Login Failed',
  [AuditAction.USER_LOGOUT]: 'User Logout',
  [AuditAction.PASSWORD_CHANGED]: 'Password Changed',
  [AuditAction.USER_APPROVED]: 'User Approved',
  [AuditAction.USER_REJECTED]: 'User Rejected',
  [AuditAction.USER_SUSPENDED]: 'User Suspended',
  [AuditAction.USER_ACTIVATED]: 'User Activated',
  [AuditAction.USER_DELETED]: 'User Deleted',
  [AuditAction.KYC_SUBMITTED]: 'KYC Submitted',
  [AuditAction.KYC_APPROVED]: 'KYC Approved',
  [AuditAction.KYC_REJECTED]: 'KYC Rejected',
  [AuditAction.PROFILE_UPDATED]: 'Profile Updated',
  [AuditAction.PRODUCT_CREATED]: 'Product Created',
  [AuditAction.PRODUCT_UPDATED]: 'Product Updated',
  [AuditAction.PRODUCT_DELETED]: 'Product Deleted',
  [AuditAction.PRODUCT_AVAILABILITY_TOGGLED]: 'Availability Toggled',
  [AuditAction.STOCK_UPDATED]: 'Stock Updated',
  [AuditAction.CATEGORY_CREATED]: 'Category Created',
  [AuditAction.CATEGORY_UPDATED]: 'Category Updated',
  [AuditAction.CATEGORY_DELETED]: 'Category Deleted',
  [AuditAction.ORDER_PLACED]: 'Order Placed',
  [AuditAction.ORDER_STATUS_UPDATED]: 'Order Status Updated',
  [AuditAction.ORDER_CANCELLED]: 'Order Cancelled',
  [AuditAction.ORDER_DELIVERY_CLAIMED]: 'Delivery Claimed',
  [AuditAction.PAYMENT_INITIATED]: 'Payment Initiated',
  [AuditAction.PAYMENT_VERIFIED]: 'Payment Verified',
  [AuditAction.PAYMENT_FAILED]: 'Payment Failed',
  [AuditAction.BANK_SLIP_UPLOADED]: 'Bank Slip Uploaded',
  [AuditAction.BANK_SLIP_APPROVED]: 'Bank Slip Approved',
  [AuditAction.BANK_SLIP_REJECTED]: 'Bank Slip Rejected',
  [AuditAction.PAYOUT_RELEASED]: 'Payout Released',
  [AuditAction.REFUND_ISSUED]: 'Refund Issued',
  [AuditAction.SETTINGS_UPDATED]: 'Platform Settings Updated',
};

export function getAuditActionLabel(action: AuditAction | string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ');
}
