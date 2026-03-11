import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { warrantyService } from "../../services/management/warrantyService";
import type {
  Warranty,
  WarrantyFormData,
  WarrantyPaginationParams,
} from "../../types/entities/warranty.types";

interface WarrantyState {
  warranties: Warranty[];
  // Separate field for dropdowns so paginated table data is never overwritten
  allWarranties: Warranty[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  getWarranties: (params: WarrantyPaginationParams) => Promise<void>;
  getAllWarranties: () => Promise<void>;
  getWarrantyById: (id: string) => Promise<Warranty | null>;
  createWarranty: (data: WarrantyFormData) => Promise<void>;
  updateWarranty: (id: string, data: Partial<WarrantyFormData>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWarrantyStore = create<WarrantyState>()(
  devtools(
    (set) => ({
      warranties: [],
      allWarranties: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

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

      getAllWarranties: async () => {
        // Populates dropdown list — writes to allWarranties, NOT warranties (table data)
        try {
          const data = await warrantyService.getAllWarranties();
          set({ allWarranties: data });
        } catch (error: any) {
          console.error(error);
        }
      },

      getWarrantyById: async (id) => {
        try {
          return await warrantyService.getWarrantyById(id);
        } catch (error: any) {
          set({ error: error.message });
          return null;
        }
      },

      createWarranty: async (data) => {
        set({ loading: true });
        try {
          await warrantyService.createWarranty(data);
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      updateWarranty: async (id, data) => {
        set({ loading: true });
        try {
          await warrantyService.updateWarranty(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      deleteWarranty: async (id) => {
        set({ loading: true });
        try {
          await warrantyService.deleteWarranty(id);
          set({ loading: false });
        } catch (error: any) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "warranty-store",
    }
  )
);
