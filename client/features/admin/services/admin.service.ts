import { api } from '@/services/api/client';
import type { FilterAuditLogsParams, PaginatedAuditLogs } from '../types/admin.types';

const BASE = '/admin';

export const adminAuditService = {
  /**
   * Fetch paginated audit logs with optional filters.
   */
  getAuditLogs: (params: FilterAuditLogsParams = {}): Promise<PaginatedAuditLogs> => {
    const qs = new URLSearchParams();

    if (params.actorId)     qs.set('actorId', params.actorId);
    if (params.actorRole)   qs.set('actorRole', params.actorRole);
    if (params.action)      qs.set('action', params.action);
    if (params.targetEntity) qs.set('targetEntity', params.targetEntity);
    if (params.targetId)    qs.set('targetId', params.targetId);
    if (params.startDate)   qs.set('startDate', params.startDate);
    if (params.endDate)     qs.set('endDate', params.endDate);
    qs.set('page', String(params.page ?? 1));
    qs.set('limit', String(params.limit ?? 30));

    const query = qs.toString();
    return api.get<PaginatedAuditLogs>(`${BASE}/audit-logs${query ? `?${query}` : ''}`);
  },
};

export const adminSettingsService = {
  /**
   * Fetch platform configuration from server.
   * Uses the PUBLIC /platform/settings endpoint — no auth required.
   * This allows customers, guests, and sellers to load branding too.
   */
  getSettings: (): Promise<Record<string, any>> => {
    return api.get<Record<string, any>>(`/platform/settings`);
  },

  /**
   * Update platform configuration and emit audit log.
   * Protected: requires admin JWT.
   */
  updateSettings: (dto: Record<string, any>): Promise<Record<string, any>> => {
    return api.patch<Record<string, any>>(`${BASE}/settings`, dto);
  },
};

export const adminAnalyticsService = {
  getOverview: (): Promise<any> => {
    return api.get(`${BASE}/analytics/overview`);
  },
  getSalesTrends: (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    return api.get(`${BASE}/analytics/sales-trends?period=${period}`);
  },
  getPaymentProviders: (): Promise<any> => {
    return api.get(`${BASE}/analytics/payment-providers`);
  },
  getCategoryDistribution: (): Promise<any> => {
    return api.get(`${BASE}/analytics/category-distribution`);
  },
  getTopProducts: (limit = 10): Promise<any> => {
    return api.get(`${BASE}/analytics/top-products?limit=${limit}`);
  },
};

export interface SupplierStaff {
  id: string;
  sellerId: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'branch_manager' | 'driver' | string;
  branchId?: string;
  branchName?: string;
  employeeId?: string;
  status: 'active' | 'suspended';
  hireDate?: string;
  nationalIdOrFayda?: string;
  assignedVehicleType?: string;
  assignedVehiclePlate?: string;
  driverLicenseNumber?: string;
  driverLicenseGrade?: string;
  currentDriverStatus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  alternatePhone?: string;
  shopName: string;
  businessType?: string;
  marketZone?: string;
  city: string;
  subCity?: string;
  specificLocation?: string;
  tradeLicenseNumber?: string;
  tinNumber?: string;
  isVerifiedMerchant: boolean;
  merchantKycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED';
  merchantRejectionReason?: string;
  isActive: boolean;
  createdAt: string;
  staffStats?: {
    totalStaff: number;
    managersCount: number;
    driversCount: number;
    activeStaff: number;
  };
}

export const adminSupplierService = {
  getSuppliers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean | string;
    kycStatus?: string;
  } = {}): Promise<{ data: SupplierItem[]; total: number; page: number; limit: number; totalPages: number }> => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.isActive !== undefined && params.isActive !== 'ALL') qs.set('isActive', String(params.isActive));
    if (params.kycStatus && params.kycStatus !== 'ALL') qs.set('kycStatus', params.kycStatus);
    const query = qs.toString();
    return api.get(`${BASE}/suppliers${query ? `?${query}` : ''}`);
  },

  getSupplierStaff: (sellerId: string): Promise<SupplierStaff[]> => {
    return api.get(`${BASE}/suppliers/${sellerId}/staff`);
  },

  updateSupplierStaff: (sellerId: string, staffId: string, dto: Partial<SupplierStaff>): Promise<SupplierStaff> => {
    return api.patch(`${BASE}/suppliers/${sellerId}/staff/${staffId}`, dto);
  },

  createSupplierStaff: (sellerId: string, dto: Partial<SupplierStaff>): Promise<SupplierStaff> => {
    return api.post(`${BASE}/suppliers/${sellerId}/staff`, dto);
  },

  deleteSupplierStaff: (sellerId: string, staffId: string): Promise<{ success: boolean; id: string }> => {
    return api.delete(`${BASE}/suppliers/${sellerId}/staff/${staffId}`);
  },

  verifyMerchant: (userId: string, isVerified: boolean, rejectionReason?: string): Promise<any> => {
    return api.patch(`${BASE}/merchants/${userId}/verify`, { isVerified, rejectionReason });
  },

  setUserStatus: (userId: string, isActive: boolean, reason?: string): Promise<any> => {
    return api.patch(`${BASE}/users/${userId}/status`, { isActive, reason });
  },

  getSupplierDetails: (userId: string): Promise<any> => {
    return api.get(`${BASE}/users/${userId}/details`);
  },
};

export interface AdminNotification {
  id: string;
  type: 'SUPPLIER_REGISTRATION' | 'BANK_SLIP' | 'DISPUTE';
  title: string;
  message: string;
  supplierId: string;
  shopName: string;
  fullName: string;
  email?: string;
  phone?: string;
  tradeLicense?: string;
  tin?: string;
  marketZone?: string;
  businessType?: string;
  kycStatus?: string;
  createdAt: string;
  timestamp: string;
  read?: boolean;
}

export const adminNotificationService = {
  getNotifications: (): Promise<{
    notifications: AdminNotification[];
    pendingKycCount: number;
    pendingSlipsCount: number;
    totalUnread: number;
  }> => {
    return api.get(`${BASE}/notifications`);
  },
};


