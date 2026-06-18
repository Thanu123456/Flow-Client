import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { customerCreditService } from '../../services/management/customerCreditService';
import type {
  CreditCustomer,
  CreateCustomerPaymentRequest,
  BalanceFilter,
} from '../../types/entities/customerCredit.types';

interface CustomerCreditState {
  customers: CreditCustomer[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fetchCreditCustomers: (search?: string, balanceType?: BalanceFilter) => Promise<void>;
  createPayment: (customerId: string, req: CreateCustomerPaymentRequest) => Promise<void>;
  clearError: () => void;
}

export const useCustomerCreditStore = create<CustomerCreditState>()(
  devtools(
    (set) => ({
      customers: [],
      loading: false,
      submitting: false,
      error: null,

      fetchCreditCustomers: async (search, balanceType) => {
        set({ loading: true, error: null });
        try {
          const customers = await customerCreditService.listCreditCustomers(search, balanceType);
          set({ customers, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error?.message || 'Failed to fetch credit customers',
            loading: false,
          });
        }
      },

      createPayment: async (customerId, req) => {
        set({ submitting: true, error: null });
        try {
          await customerCreditService.createPayment(customerId, req);
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
    { name: 'customer-credit-store' }
  )
);
