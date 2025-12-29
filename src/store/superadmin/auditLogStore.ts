import { create } from 'zustand';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { AuditLog } from '../../types/auth/superadmin.types';

type ActionType = 'all' | 'registration_approved' | 'registration_rejected' | 'tenant_suspended' |
  'tenant_activated' | 'tenant_deleted' | 'user_login' | 'user_logout' | 'user_login_failed' |
  'password_changed' | 'schema_created' | 'migration_executed';

interface AuditLogFilters {
  page: number;
  perPage: number;
  actionType: ActionType;
  tenantId?: string;
  userId?: string;
  dateRange?: [string, string];
  searchQuery?: string;
}

interface AuditLogState {
  // Data
  logs: AuditLog[];
  total: number;

  // Filters
  filters: AuditLogFilters;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLogs: () => Promise<void>;
  setFilters: (filters: Partial<AuditLogFilters>) => void;
  clearError: () => void;
  reset: () => void;
  exportLogs: (format: 'csv' | 'excel') => Promise<void>;
}

const initialFilters: AuditLogFilters = {
  page: 1,
  perPage: 20,
  actionType: 'all',
};

const initialState = {
  logs: [],
  total: 0,
  filters: initialFilters,
  isLoading: false,
  error: null,
};

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  ...initialState,

  fetchLogs: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const result = await superAdminService.listAuditLogs(
        filters.page,
        filters.perPage
      );
      set({
        logs: result.logs,
        total: result.total,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to fetch audit logs',
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters: Partial<AuditLogFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },

  exportLogs: async (format: 'csv' | 'excel') => {
    const { logs } = get();

    if (logs.length === 0) {
      set({ error: 'No logs to export' });
      return;
    }

    try {
      // Convert logs to CSV format
      const headers = ['Timestamp', 'Action Type', 'User Email', 'Description', 'IP Address', 'Status', 'Tenant ID'];
      const rows = logs.map((log) => [
        log.timestamp,
        log.action_type,
        log.user_email,
        log.description,
        log.ip_address,
        log.status,
        log.tenant_id || '',
      ]);

      if (format === 'csv') {
        const csvContent = [
          headers.join(','),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        // For Excel, we'd typically use a library like xlsx
        // For now, export as CSV with .xlsx extension (basic approach)
        const csvContent = [
          headers.join('\t'),
          ...rows.map((row) => row.join('\t')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch {
      set({ error: 'Failed to export logs' });
    }
  },
}));

// Selectors
export const selectLogs = (state: AuditLogState) => state.logs;
export const selectTotal = (state: AuditLogState) => state.total;
export const selectFilters = (state: AuditLogState) => state.filters;
export const selectIsLoading = (state: AuditLogState) => state.isLoading;
export const selectError = (state: AuditLogState) => state.error;

// Computed selectors
export const selectTotalPages = (state: AuditLogState) =>
  Math.ceil(state.total / state.filters.perPage);

export const selectLogsByActionType = (state: AuditLogState, actionType: string) =>
  state.logs.filter((log) => log.action_type === actionType);

export const selectSuccessfulLogs = (state: AuditLogState) =>
  state.logs.filter((log) => log.status === 'success');

export const selectFailedLogs = (state: AuditLogState) =>
  state.logs.filter((log) => log.status === 'failure');

// Action type labels for UI
export const actionTypeLabels: Record<ActionType, string> = {
  all: 'All Actions',
  registration_approved: 'Registration Approved',
  registration_rejected: 'Registration Rejected',
  tenant_suspended: 'Tenant Suspended',
  tenant_activated: 'Tenant Activated',
  tenant_deleted: 'Tenant Deleted',
  user_login: 'User Login',
  user_logout: 'User Logout',
  user_login_failed: 'Login Failed',
  password_changed: 'Password Changed',
  schema_created: 'Schema Created',
  migration_executed: 'Migration Executed',
};

export default useAuditLogStore;
