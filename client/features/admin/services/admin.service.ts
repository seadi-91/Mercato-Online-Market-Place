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
  phoneNumber?: string;
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

export interface DeliveryStaffItem {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'DELIVERY';
  vehicleType?: string;
  plateNumber?: string;
  drivingLicenseNumber?: string;
  marketZone?: string;
  nationalIdNumber?: string;
  isAvailable?: boolean;
  isVerifiedDelivery: boolean;
  deliveryKycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'VERIFIED' | 'REJECTED';
  deliveryRejectionReason?: string;
  isActive: boolean;
  city?: string;
  subCity?: string;
  specificLocation?: string;
  ownerIdUrl?: string;
  createdAt: string;
}

export const adminDeliveryService = {
  getDeliveryStaff: (params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean | string;
    kycStatus?: string;
  } = {}): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> => {
    const qs = new URLSearchParams();
    qs.set('role', 'DELIVERY');
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.isActive !== undefined && params.isActive !== 'ALL') qs.set('isActive', String(params.isActive));
    return api.get(`${BASE}/users?${qs.toString()}`);
  },

  verifyDelivery: (userId: string, isVerified: boolean, rejectionReason?: string): Promise<any> => {
    return api.patch(`${BASE}/delivery/${userId}/verify`, { isVerified, rejectionReason });
  },

  setUserStatus: (userId: string, isActive: boolean, reason?: string): Promise<any> => {
    return api.patch(`${BASE}/users/${userId}/status`, { isActive, reason });
  },

  deleteUser: (userId: string): Promise<any> => {
    return api.delete(`${BASE}/users/${userId}`);
  },

  deleteDeliveryStaff: (userId: string): Promise<any> => {
    return api.delete(`${BASE}/delivery/${userId}`);
  },

  getUserDetails: (userId: string): Promise<any> => {
    return api.get(`${BASE}/users/${userId}/details`);
  },

  createDeliveryStaff: (dto: {
    fullName: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    vehicleType?: string;
    vehicleModel?: string;
    plateNumber?: string;
    drivingLicenseNumber?: string;
    nationalIdNumber?: string;
    marketZone?: string;
    city?: string;
    subCity?: string;
  }): Promise<any> => {
    return api.post(`${BASE}/delivery`, dto);
  },

  updateDeliveryStaff: (
    userId: string,
    dto: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      vehicleType?: string;
      vehicleModel?: string;
      plateNumber?: string;
      drivingLicenseNumber?: string;
      nationalIdNumber?: string;
      marketZone?: string;
      isActive?: boolean;
    },
  ): Promise<any> => {
    return api.patch(`${BASE}/delivery/${userId}`, dto);
  },

  getDriverOrders: async (
    deliveryStaffId: string,
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> => {
    try {
      const qs = new URLSearchParams();
      if (params.page) qs.set('page', String(params.page));
      if (params.limit) qs.set('limit', String(params.limit));
      if (params.status && params.status !== 'ALL') qs.set('status', params.status);
      const query = qs.toString();
      return await api.get(`${BASE}/delivery/${deliveryStaffId}/orders${query ? `?${query}` : ''}`);
    } catch {
      // Fallback to Next.js API orders
      const fb = await fetch(`/api/orders`);
      if (fb.ok) {
        const json = await fb.json();
        const allOrders: any[] = json.orders || [];
        const filtered = allOrders.filter(
          (o) =>
            o.carrierId === deliveryStaffId ||
            o.deliveryAddress?.assignedDriver?.id === deliveryStaffId ||
            o.deliveryAddress?.assignedDriver?.userId === deliveryStaffId
        );
        return {
          data: filtered,
          total: filtered.length,
          page: 1,
          limit: 50,
          totalPages: 1,
        };
      }
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },

  assignOrderDriver: async (
    orderId: string,
    payload: {
      carrierId?: string | null;
      assignedDriver?: any;
      newStatus?: string;
    }
  ): Promise<any> => {
    try {
      return await api.patch(`${BASE}/orders/${orderId}/assign`, payload);
    } catch {
      // Fallback to Next.js API
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          carrierId: payload.carrierId,
          assignedDriver: payload.assignedDriver,
          newStatus: payload.newStatus,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to assign driver to order');
      }
      return await res.json();
    }
  },
};

export interface PendingPayoutItem {
  id: string;
  sellerId: string;
  orderId: string;
  paymentId: string;
  amount: number;
  platformFee: number;
  netPayoutAmount: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolderName: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  processedAt?: string;
  orderNumber?: string;
  sellerName?: string;
  shopName?: string;
}

export const adminEscrowService = {
  getPendingPayouts: (page = 1, limit = 50): Promise<{ data: PendingPayoutItem[]; total: number; page: number; limit: number; totalPages: number }> => {
    return api.get(`${BASE}/payments/pending-payouts?page=${page}&limit=${limit}`);
  },

  releasePayout: (dto: {
    paymentId: string;
    sellerId: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
  }): Promise<any> => {
    return api.post(`${BASE}/payments/release-payout`, dto);
  },

  refundPayment: (orderId: string, reason?: string): Promise<any> => {
    return api.post(`${BASE}/payments/refund`, { orderId, reason });
  },

  updateOrderStatus: (orderId: string, newStatus: string, reason?: string): Promise<any> => {
    return api.patch(`/orders/${orderId}/status`, { newStatus, cancelReason: reason });
  },
};

export interface DisputeItem {
  id: string;
  orderId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress?: string;
  merchantStore?: string;
  merchantId?: string;
  paymentId?: string;
  amount: number;
  reason: string;
  openedDate: string;
  paymentStatus?: string;
  escrowStatus?: string;
  status: 'OPEN' | 'RESOLVED_REFUND' | 'RESOLVED_RELEASED';
  items?: Array<{ id?: string; title?: string; name?: string; quantity?: number; unitPrice?: number; price?: number }>;
}

export const adminDisputesService = {
  getDisputes: (params: { page?: number; limit?: number; status?: string } = {}): Promise<{ data: any[]; total: number }> => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    return api.get(`${BASE}/disputes?${qs.toString()}`);
  },

  refundDispute: (orderId: string, reason?: string): Promise<any> => {
    return api.post(`${BASE}/payments/refund`, { orderId, reason });
  },

  releaseDispute: (dto: {
    paymentId: string;
    sellerId: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
  }): Promise<any> => {
    return api.post(`${BASE}/payments/release-payout`, dto);
  },
};

export interface AssignedDriverInfo {
  id: string;
  name: string;
  phone?: string;
  vehicleType?: string;
  vehicleModel?: string;
  plateNumber?: string;
  zone?: string;
  status?: string;
}

export const adminOrderService = {
  assignDriverToOrder: async (
    orderId: string,
    driver: AssignedDriverInfo | null,
    newStatus?: string,
  ): Promise<any> => {
    const payload = {
      orderId,
      carrierId: driver ? driver.id : null,
      assignedDriver: driver,
      ...(newStatus ? { newStatus } : {}),
    };

    try {
      return await api.patch(`${BASE}/orders/${orderId}/assign`, payload);
    } catch (apiErr) {
      console.warn("API gateway /admin/orders assign fallback to /api/orders:", apiErr);
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to assign driver in backend database');
      }
      return await res.json();
    }
  },
};



