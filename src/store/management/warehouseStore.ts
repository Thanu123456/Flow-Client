import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { warehouseService } from "../../services/management/warehouseService";
import type {
  Warehouse,
  WarehouseFormData,
  WarehousePaginationParams,
} from "../../types/entities/warehouse.types";

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Actions
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
    (set) => ({
      warehouses: [],
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getWarehouses: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await warehouseService.getWarehouses(params);
          set({
            warehouses: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch warehouses";
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      getWarehouseById: async (id) => {
        try {
          const warehouse = await warehouseService.getWarehouseById(id);
          return warehouse;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch warehouse";
          set({ error: errorMessage });
          return null;
        }
      },

      getAllWarehouses: async () => {
        try {
          const warehouses = await warehouseService.getAllWarehouses();
          return warehouses;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch warehouses";
          set({ error: errorMessage });
          return [];
        }
      },

      createWarehouse: async (data) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.createWarehouse(data);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to create warehouse";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      updateWarehouse: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.updateWarehouse(id, data);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to update warehouse";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      deleteWarehouse: async (id) => {
        set({ loading: true, error: null });
        try {
          await warehouseService.deleteWarehouse(id);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to delete warehouse";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "warehouse-store",
    }
  )
);
