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

