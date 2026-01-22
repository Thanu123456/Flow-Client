import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { customerService } from "../../services/management/customerService";
import type {
  Customer,
  CustomerFormData,
  CustomerPaginationParams,
  CustomerSummary,
} from "../../types/entities/customer.types";

interface CustomerState {
  customers: Customer[];
  allCustomers: CustomerSummary[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getCustomers: (params: CustomerPaginationParams) => Promise<void>;
  getCustomerById: (id: string) => Promise<Customer>;
  createCustomer: (data: CustomerFormData) => Promise<void>;
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getAllCustomers: () => Promise<void>;
  searchCustomers: (query: string) => Promise<CustomerSummary[]>;
  setSelectedCustomer: (customer: Customer | null) => void;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set) => ({
      customers: [],
      allCustomers: [],
      selectedCustomer: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getCustomers: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await customerService.getCustomers(params);
          set({
            customers: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch customers",
            loading: false,
          });
        }
      },

      getCustomerById: async (id) => {
        set({ loading: true, error: null });
        try {
          const customer = await customerService.getCustomerById(id);
          set({ selectedCustomer: customer, loading: false });
          return customer;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch customer",
            loading: false,
          });
          throw error;
        }
      },

      createCustomer: async (data) => {
        set({ loading: true, error: null });
        try {
          await customerService.createCustomer(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create customer",
            loading: false,
          });
          throw error;
        }
      },

      updateCustomer: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await customerService.updateCustomer(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update customer",
            loading: false,
          });
          throw error;
        }
      },

      deleteCustomer: async (id) => {
        set({ loading: true, error: null });
        try {
          await customerService.deleteCustomer(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete customer",
            loading: false,
          });
          throw error;
        }
      },

      getAllCustomers: async () => {
        try {
          const customers = await customerService.getAllCustomers();
          set({ allCustomers: customers });
        } catch (error: any) {
          console.error("Failed to fetch all customers:", error);
        }
      },

      searchCustomers: async (query) => {
        try {
          return await customerService.searchCustomers(query);
        } catch (error: any) {
          console.error("Failed to search customers:", error);
          return [];
        }
      },

      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "customer-store",
    }
  )
);
