import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import { apiErrorMessage } from "../../utils/apiError";
import { warehouseService } from "../../services/management/warehouseService";
import type {
  Warehouse,
  WarehouseFormData,
  WarehousePaginationParams,
} from "../../types/entities/warehouse.types";

interface WarehouseState {
  // Paginated table data
  warehouses: Warehouse[];
  // Full list for dropdowns — separate so table data is never overwritten
  allWarehouses: Warehouse[];
  loading: boolean;
  // state of the dropdown list (GET /warehouses/all), independent of the table
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

  getWarehouses: (params: WarehousePaginationParams) => Promise<void>;
  getWarehouseById: (id: string) => Promise<Warehouse | null>;
  getAllWarehouses: () => Promise<Warehouse[]>;
  createWarehouse: (data: WarehouseFormData) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<WarehouseFormData>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  devtools(
    (set, get) => ({
      warehouses: [],
      allWarehouses: [],
      loading: false,
      allLoading: false,
      allError: null,
      submitting: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getWarehouses: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await warehouseService.getWarehouses(params);
          const data = response.data ?? [];
          const total = response.total ?? data.length;
          
          if (params.limit === 1) {
            set(state => ({
              pagination: { ...state.pagination, total },
              loading: false
            }));
          } else {
            set({
              warehouses: data,
              pagination: {
                total: total,
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || Math.ceil(total / (response.limit || 10)),
              },
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || "Failed to fetch warehouses",
            loading: false,
          });
        }
      },

      getWarehouseById: async (id) => {
        try {
          return await warehouseService.getWarehouseById(id);
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to fetch warehouse" });
          return null;
        }
      },

      getAllWarehouses: async () => {
        set({ allLoading: true, allError: null });
        let lastError: any;
        // One quick retry for a transient blip; anything beyond that is surfaced, not hidden.
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const warehouses = await warehouseService.getAllWarehouses();
            set({ allWarehouses: warehouses, allLoading: false });
            return warehouses;
          } catch (err: any) {
            lastError = err;
            if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
          }
        }
        const msg = apiErrorMessage(lastError, "Failed to load warehouses");
        const cached = get().allWarehouses;
        set({ allLoading: false, allError: msg });
        // With nothing cached the dropdown would just look empty — tell the user why.
        if (cached.length === 0) message.error(`${msg}. Please refresh and try again.`);
        return cached;
      },

      createWarehouse: async (data) => {
        set({ submitting: true, error: null });
        try {
          await warehouseService.createWarehouse(data);
          set({ submitting: false });
        } catch (error: any) {
          set({ error: apiErrorMessage(error, "Failed to create warehouse"), submitting: false });
          throw error;
        }
      },

      updateWarehouse: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          await warehouseService.updateWarehouse(id, data);
          set({ submitting: false });
        } catch (error: any) {
          set({ error: apiErrorMessage(error, "Failed to update warehouse"), submitting: false });
          throw error;
        }
      },

      deleteWarehouse: async (id) => {
        set({ submitting: true, error: null });
        try {
          await warehouseService.deleteWarehouse(id);
          set({ submitting: false });
        } catch (error: any) {
          set({ error: apiErrorMessage(error, "Failed to delete warehouse"), submitting: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "warehouse-store" }
  )
);
