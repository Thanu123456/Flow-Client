import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supplierCreditService } from '../../services/management/supplierCreditService';
import type {
  CreditSupplier,
  CreateSupplierPaymentRequest,
  BalanceFilter,
} from '../../types/entities/supplierCredit.types';

interface SupplierCreditState {
  suppliers: CreditSupplier[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchCreditSuppliers: (search?: string, balanceType?: BalanceFilter) => Promise<void>;
  createPayment: (supplierId: string, req: CreateSupplierPaymentRequest) => Promise<void>;
  clearError: () => void;
}

export const useSupplierCreditStore = create<SupplierCreditState>()(
  devtools(
    (set) => ({
      suppliers: [],
      loading: false,
      submitting: false,
      error: null,

      fetchCreditSuppliers: async (search, balanceType) => {
        set({ loading: true, error: null });
        try {
          const suppliers = await supplierCreditService.listCreditSuppliers(search, balanceType);
          set({ suppliers, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Failed to fetch credit suppliers',
            loading: false,
          });
        }
      },

      createPayment: async (supplierId, req) => {
        set({ submitting: true, error: null });
        try {
          await supplierCreditService.createPayment(supplierId, req);
          set({ submitting: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Failed to record payment',
            submitting: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'supplier-credit-store' }
  )
);
