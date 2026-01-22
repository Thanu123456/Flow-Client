import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { supplierService } from "../../services/management/supplierService";
import type {
  Supplier,
  SupplierFormData,
  SupplierPaginationParams,
  SupplierSummary,
} from "../../types/entities/supplier.types";

interface SupplierState {
  suppliers: Supplier[];
  allSuppliers: SupplierSummary[];
  selectedSupplier: Supplier | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getSuppliers: (params: SupplierPaginationParams) => Promise<void>;
  getSupplierById: (id: string) => Promise<Supplier>;
  createSupplier: (data: SupplierFormData) => Promise<void>;
  updateSupplier: (id: string, data: Partial<SupplierFormData>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  getAllSuppliers: () => Promise<void>;
  searchSuppliers: (query: string) => Promise<SupplierSummary[]>;
  setSelectedSupplier: (supplier: Supplier | null) => void;
  clearError: () => void;
}

export const useSupplierStore = create<SupplierState>()(
  devtools(
    (set) => ({
      suppliers: [],
      allSuppliers: [],
      selectedSupplier: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getSuppliers: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await supplierService.getSuppliers(params);
          set({
            suppliers: response.data,
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
            error: error.response?.data?.message || "Failed to fetch suppliers",
            loading: false,
          });
        }
      },

      getSupplierById: async (id) => {
        set({ loading: true, error: null });
        try {
          const supplier = await supplierService.getSupplierById(id);
          set({ selectedSupplier: supplier, loading: false });
          return supplier;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch supplier",
            loading: false,
          });
          throw error;
        }
      },

      createSupplier: async (data) => {
        set({ loading: true, error: null });
        try {
          await supplierService.createSupplier(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create supplier",
            loading: false,
          });
          throw error;
        }
      },

      updateSupplier: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await supplierService.updateSupplier(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update supplier",
            loading: false,
          });
          throw error;
        }
      },

      deleteSupplier: async (id) => {
        set({ loading: true, error: null });
        try {
          await supplierService.deleteSupplier(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete supplier",
            loading: false,
          });
          throw error;
        }
      },

      getAllSuppliers: async () => {
        try {
          const suppliers = await supplierService.getAllSuppliers();
          set({ allSuppliers: suppliers });
        } catch (error: any) {
          console.error("Failed to fetch all suppliers:", error);
        }
      },

      searchSuppliers: async (query) => {
        try {
          return await supplierService.searchSuppliers(query);
        } catch (error: any) {
          console.error("Failed to search suppliers:", error);
          return [];
        }
      },

      setSelectedSupplier: (supplier) => set({ selectedSupplier: supplier }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "supplier-store",
    }
  )
);
