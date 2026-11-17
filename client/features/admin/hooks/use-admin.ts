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
  deleteLog: (id: string) => Promise<boolean>;
  deleteLogs: (payload: { ids?: string[]; all?: boolean }) => Promise<boolean>;
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

  const deleteLog = useCallback(async (id: string): Promise<boolean> => {
    try {
      await adminAuditService.deleteAuditLog(id);
      setState((s) => ({
        ...s,
        logs: s.logs.filter((l) => l.id !== id),
        total: Math.max(0, s.total - 1),
      }));
      toast.success('Audit log record permanently deleted');
      return true;
    } catch (err: any) {
      toast.error('Failed to delete audit log', {
        description: err.message || 'Unable to delete audit record from database',
      });
      return false;
    }
  }, []);

  const deleteLogs = useCallback(async (payload: { ids?: string[]; all?: boolean }): Promise<boolean> => {
    try {
      const res = await adminAuditService.deleteAuditLogs(payload);
      if (payload.all) {
        setState((s) => ({
          ...s,
          logs: [],
          total: 0,
          totalPages: 1,
          page: 1,
        }));
        toast.success('All audit logs have been permanently deleted');
      } else if (payload.ids && payload.ids.length > 0) {
        const idSet = new Set(payload.ids);
        setState((s) => ({
          ...s,
          logs: s.logs.filter((l) => !idSet.has(l.id)),
          total: Math.max(0, s.total - payload.ids!.length),
        }));
        toast.success(`Permanently deleted ${payload.ids.length} audit logs`);
      }
      return true;
    } catch (err: any) {
      toast.error('Delete failed', {
        description: err.message || 'Unable to permanently delete audit logs',
      });
      return false;
    }
  }, []);

  return { ...state, fetchLogs, refresh, deleteLog, deleteLogs };
}
