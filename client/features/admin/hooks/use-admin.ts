import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { adminAuditService } from '../services/admin.service';
import type { AuditLog, FilterAuditLogsParams, PaginatedAuditLogs } from '../types/admin.types';

interface UseAuditLogsState {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface UseAuditLogsReturn extends UseAuditLogsState {
  fetchLogs: (params?: FilterAuditLogsParams) => Promise<void>;
  refresh: () => void;
}

/**
 * Hook that fetches and manages audit log data from the backend.
 */
export function useAuditLogs(defaultParams: FilterAuditLogsParams = {}): UseAuditLogsReturn {
  const [state, setState] = useState<UseAuditLogsState>({
    logs: [],
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null,
  });

  // Keep last-used params so refresh() can replay them
  const lastParams = useRef<FilterAuditLogsParams>(defaultParams);

  const fetchLogs = useCallback(async (params: FilterAuditLogsParams = {}) => {
    const merged = { ...defaultParams, ...params };
    lastParams.current = merged;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const result: PaginatedAuditLogs = await adminAuditService.getAuditLogs(merged);
      setState({
        logs: result.data ?? [],
        total: result.total ?? 0,
        page: result.page ?? 1,
        totalPages: result.totalPages ?? 1,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load audit logs';
      setState((s) => ({ ...s, loading: false, error: message }));
      toast.error('Audit logs unavailable', { description: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => {
    fetchLogs(lastParams.current);
  }, [fetchLogs]);

  return { ...state, fetchLogs, refresh };
}
