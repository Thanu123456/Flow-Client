import { create } from 'zustand';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { Tenant } from '../../types/auth/superadmin.types';

type TenantStatus = 'all' | 'active' | 'suspended' | 'inactive';

interface TenantFilters {
  page: number;
  perPage: number;
  status: TenantStatus;
  searchQuery?: string;
}

interface TenantState {
  // Data
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  total: number;

  // Filters
  filters: TenantFilters;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchTenants: () => Promise<void>;
  suspendTenant: (id: string, reason: string) => Promise<boolean>;
  activateTenant: (id: string) => Promise<boolean>;
  deleteTenant: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<TenantFilters>) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: TenantFilters = {
  page: 1,
  perPage: 10,
  status: 'all',
};

const initialState = {
  tenants: [],
  selectedTenant: null,
  total: 0,
  filters: initialFilters,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useTenantStore = create<TenantState>((set, get) => ({
  ...initialState,

  fetchTenants: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const statusParam = filters.status === 'all' ? undefined : filters.status;
      const result = await superAdminService.listTenants(
        filters.page,
        filters.perPage,
        statusParam
      );
      set({
        tenants: result.tenants,
        total: result.total,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to fetch tenants',
        isLoading: false,
      });
    }
  },

  suspendTenant: async (id: string, reason: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null });

    try {
      await superAdminService.suspendTenant(id, reason);

      // Update tenant status in list
      const { tenants } = get();
      set({
        tenants: tenants.map((t) =>
          t.id === id ? { ...t, status: 'suspended' as const } : t
        ),
        selectedTenant: null,
        isSubmitting: false,
      });

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to suspend tenant',
        isSubmitting: false,
      });
      return false;
    }
  },

  activateTenant: async (id: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null });

    try {
      await superAdminService.activateTenant(id);

      // Update tenant status in list
      const { tenants } = get();
      set({
        tenants: tenants.map((t) =>
          t.id === id ? { ...t, status: 'active' as const } : t
        ),
        selectedTenant: null,
        isSubmitting: false,
      });

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to activate tenant',
        isSubmitting: false,
      });
      return false;
    }
  },

  deleteTenant: async (id: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null });

    try {
      await superAdminService.deleteTenant(id);

      // Remove from list
      const { tenants, total } = get();
      set({
        tenants: tenants.filter((t) => t.id !== id),
        total: total - 1,
        selectedTenant: null,
        isSubmitting: false,
      });

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to delete tenant',
        isSubmitting: false,
      });
      return false;
    }
  },

  setFilters: (newFilters: Partial<TenantFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setSelectedTenant: (tenant: Tenant | null) => {
    set({ selectedTenant: tenant });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectTenants = (state: TenantState) => state.tenants;
export const selectSelectedTenant = (state: TenantState) => state.selectedTenant;
export const selectTotal = (state: TenantState) => state.total;
export const selectFilters = (state: TenantState) => state.filters;
export const selectIsLoading = (state: TenantState) => state.isLoading;
export const selectIsSubmitting = (state: TenantState) => state.isSubmitting;
export const selectError = (state: TenantState) => state.error;

// Computed selectors
export const selectActiveTenants = (state: TenantState) =>
  state.tenants.filter((t) => t.status === 'active');

export const selectSuspendedTenants = (state: TenantState) =>
  state.tenants.filter((t) => t.status === 'suspended');

export const selectTotalPages = (state: TenantState) =>
  Math.ceil(state.total / state.filters.perPage);

export default useTenantStore;
