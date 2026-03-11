import { create } from "zustand";
import { devtools } from "zustand/middleware";
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
        const cached = get().allWarehouses;
        try {
          const warehouses = await warehouseService.getAllWarehouses();
          set({ allWarehouses: warehouses });  // ← separate field, never touches paginated table data
          return warehouses;
        } catch (error: any) {
          if (cached.length > 0) return cached;
          set({ error: error.response?.data?.message || error.message || "Failed to fetch warehouses" });
          return [];
        }
      },

      createWarehouse: async (data) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.createWarehouse(data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to create warehouse", loading: false });
          throw error;
        }
      },

      updateWarehouse: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.updateWarehouse(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to update warehouse", loading: false });
          throw error;
        }
      },

      deleteWarehouse: async (id) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.deleteWarehouse(id);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to delete warehouse", loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "warehouse-store" }
  )
);
