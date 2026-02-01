import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { warrantyService } from "../../services/management/warrantyService";
import type {
  Warranty,
  WarrantyFormData,
  WarrantyPaginationParams,
  WarrantySummary,
} from "../../types/entities/warranty.types";

interface WarrantyState {
  warranties: Warranty[];
  allWarranties: WarrantySummary[];
  selectedWarranty: Warranty | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getWarranties: (params: WarrantyPaginationParams) => Promise<void>;
  getWarrantyById: (id: string) => Promise<Warranty>;
  createWarranty: (data: WarrantyFormData) => Promise<void>;
  updateWarranty: (id: string, data: Partial<WarrantyFormData>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  getAllWarranties: () => Promise<void>;
  setSelectedWarranty: (warranty: Warranty | null) => void;
  clearError: () => void;
}

export const useWarrantyStore = create<WarrantyState>()(
  devtools(
    (set) => ({
      warranties: [],
      allWarranties: [],
      selectedWarranty: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getWarranties: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await warrantyService.getWarranties(params);
          set({
            warranties: response.data,
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
            error: error.response?.data?.message || "Failed to fetch warranties",
            loading: false,
          });
        }
      },

      getWarrantyById: async (id) => {
        set({ loading: true, error: null });
        try {
          const warranty = await warrantyService.getWarrantyById(id);
          set({ selectedWarranty: warranty, loading: false });
          return warranty;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch warranty",
            loading: false,
          });
          throw error;
        }
      },

      createWarranty: async (data) => {
        set({ loading: true, error: null });
        try {
          await warrantyService.createWarranty(data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create warranty",
            loading: false,
          });
          throw error;
        }
      },

      updateWarranty: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await warrantyService.updateWarranty(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update warranty",
            loading: false,
          });
          throw error;
        }
      },

      deleteWarranty: async (id) => {
        set({ loading: true, error: null });
        try {
          await warrantyService.deleteWarranty(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete warranty",
            loading: false,
          });
          throw error;
        }
      },

      getAllWarranties: async () => {
        try {
          const warranties = await warrantyService.getAllWarranties();
          set({ allWarranties: warranties });
        } catch (error: any) {
          console.error("Failed to fetch all warranties:", error);
        }
      },

      setSelectedWarranty: (warranty) => set({ selectedWarranty: warranty }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "warranty-store",
    }
  )
);
