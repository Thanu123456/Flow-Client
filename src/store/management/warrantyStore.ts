import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import { apiErrorMessage } from "../../utils/apiError";
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
  // state of the dropdown list (GET /warranties/all), independent of the table
  allLoading: boolean;
  allError: string | null;
  // true while a create/update/delete is in flight (kept apart from `loading` so the table doesn't flash)
  submitting: boolean;
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
    (set, get) => ({
      warranties: [],
      allWarranties: [],
      loading: false,
      allLoading: false,
      allError: null,
      submitting: false,
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
        set({ allLoading: true, allError: null });
        let lastError: any;
        // One quick retry for a transient blip; anything beyond that is surfaced, not hidden.
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const data = await warrantyService.getAllWarranties();
            set({ allWarranties: data, allLoading: false });
            return;
          } catch (err: any) {
            lastError = err;
            if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
          }
        }
        const msg = apiErrorMessage(lastError, "Failed to load warranties");
        set({ allLoading: false, allError: msg });
        if (get().allWarranties.length === 0) message.error(`${msg}. Please refresh and try again.`);
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
        set({ submitting: true });
        try {
          await warrantyService.createWarranty(data);
          set({ submitting: false });
        } catch (error: any) {
          set({ submitting: false, error: error.message });
          throw error;
        }
      },

      updateWarranty: async (id, data) => {
        set({ submitting: true });
        try {
          await warrantyService.updateWarranty(id, data);
          set({ submitting: false });
        } catch (error: any) {
          set({ submitting: false, error: error.message });
          throw error;
        }
      },

      deleteWarranty: async (id) => {
        set({ submitting: true });
        try {
          await warrantyService.deleteWarranty(id);
          set({ submitting: false });
        } catch (error: any) {
          set({ submitting: false, error: error.message });
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
