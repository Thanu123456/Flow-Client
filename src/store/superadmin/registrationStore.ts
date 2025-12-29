import { create } from 'zustand';
import { superAdminService } from '../../services/superadmin/superAdminService';
import type { Registration } from '../../types/auth/superadmin.types';

interface RegistrationFilters {
  page: number;
  perPage: number;
  searchQuery?: string;
  dateRange?: [string, string];
}

interface RegistrationState {
  // Data
  registrations: Registration[];
  selectedRegistration: Registration | null;
  total: number;

  // Filters
  filters: RegistrationFilters;

  // UI State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchRegistrations: () => Promise<void>;
  fetchRegistration: (id: string) => Promise<void>;
  approveRegistration: (id: string) => Promise<boolean>;
  rejectRegistration: (id: string, reason: string) => Promise<boolean>;
  setFilters: (filters: Partial<RegistrationFilters>) => void;
  setSelectedRegistration: (registration: Registration | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialFilters: RegistrationFilters = {
  page: 1,
  perPage: 10,
};

const initialState = {
  registrations: [],
  selectedRegistration: null,
  total: 0,
  filters: initialFilters,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  ...initialState,

  fetchRegistrations: async () => {
    const { filters } = get();
    set({ isLoading: true, error: null });

    try {
      const result = await superAdminService.listPendingRegistrations(
        filters.page,
        filters.perPage
      );
      set({
        registrations: result.registrations,
        total: result.total,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to fetch registrations',
        isLoading: false,
      });
    }
  },

  fetchRegistration: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const registration = await superAdminService.getRegistration(id);
      set({
        selectedRegistration: registration,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to fetch registration details',
        isLoading: false,
      });
    }
  },

  approveRegistration: async (id: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null });

    try {
      await superAdminService.approveRegistration(id);

      // Remove from list and update total
      const { registrations, total } = get();
      set({
        registrations: registrations.filter((r) => r.id !== id),
        total: total - 1,
        selectedRegistration: null,
        isSubmitting: false,
      });

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to approve registration',
        isSubmitting: false,
      });
      return false;
    }
  },

  rejectRegistration: async (id: string, reason: string): Promise<boolean> => {
    set({ isSubmitting: true, error: null });

    try {
      await superAdminService.rejectRegistration(id, reason);

      // Remove from list and update total
      const { registrations, total } = get();
      set({
        registrations: registrations.filter((r) => r.id !== id),
        total: total - 1,
        selectedRegistration: null,
        isSubmitting: false,
      });

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      set({
        error: error.response?.data?.message || 'Failed to reject registration',
        isSubmitting: false,
      });
      return false;
    }
  },

  setFilters: (newFilters: Partial<RegistrationFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  setSelectedRegistration: (registration: Registration | null) => {
    set({ selectedRegistration: registration });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectRegistrations = (state: RegistrationState) => state.registrations;
export const selectSelectedRegistration = (state: RegistrationState) => state.selectedRegistration;
export const selectTotal = (state: RegistrationState) => state.total;
export const selectFilters = (state: RegistrationState) => state.filters;
export const selectIsLoading = (state: RegistrationState) => state.isLoading;
export const selectIsSubmitting = (state: RegistrationState) => state.isSubmitting;
export const selectError = (state: RegistrationState) => state.error;

// Computed selectors
export const selectPendingCount = (state: RegistrationState) =>
  state.registrations.filter((r) => r.status === 'pending').length;

export const selectTotalPages = (state: RegistrationState) =>
  Math.ceil(state.total / state.filters.perPage);

export default useRegistrationStore;
