export enum AuditAction {
  // ── Auth ──────────────────────────────────────────────────────────────────
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',

  // ── Admin: User Management ─────────────────────────────────────────────────
  USER_APPROVED = 'USER_APPROVED',
  USER_REJECTED = 'USER_REJECTED',
  USER_SUSPENDED = 'USER_SUSPENDED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DELETED = 'USER_DELETED',

  // ── KYC ───────────────────────────────────────────────────────────────────
  KYC_SUBMITTED = 'KYC_SUBMITTED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',

  // ── Profile ───────────────────────────────────────────────────────────────
  PROFILE_UPDATED = 'PROFILE_UPDATED',

  // ── Product ───────────────────────────────────────────────────────────────
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  PRODUCT_AVAILABILITY_TOGGLED = 'PRODUCT_AVAILABILITY_TOGGLED',
  STOCK_UPDATED = 'STOCK_UPDATED',

  // ── Category ──────────────────────────────────────────────────────────────
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',

  // ── Order ─────────────────────────────────────────────────────────────────
  ORDER_PLACED = 'ORDER_PLACED',
  ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_DELIVERY_CLAIMED = 'ORDER_DELIVERY_CLAIMED',

  // ── Payment ───────────────────────────────────────────────────────────────
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_VERIFIED = 'PAYMENT_VERIFIED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BANK_SLIP_UPLOADED = 'BANK_SLIP_UPLOADED',
  BANK_SLIP_APPROVED = 'BANK_SLIP_APPROVED',
  BANK_SLIP_REJECTED = 'BANK_SLIP_REJECTED',
  PAYOUT_RELEASED = 'PAYOUT_RELEASED',
  REFUND_ISSUED = 'REFUND_ISSUED',

  // ── Platform Settings ──────────────────────────────────────────────────────
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
}
