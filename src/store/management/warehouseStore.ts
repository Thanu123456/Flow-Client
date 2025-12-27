import { create } from "zustand";
import { warehouseService } from "../../services/management/warehouseService";
import type {
  Warehouse,
  WarehouseFormData,
  WarehousePaginationParams,
  WarehouseStock,
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
  getWarehouses: (params: WarehousePaginationParams) => Promise<void>;
  getWarehouseById: (id: string) => Promise<Warehouse>;
  createWarehouse: (data: WarehouseFormData) => Promise<void>;
  updateWarehouse: (
    id: string,
    data: Partial<WarehouseFormData>
  ) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  generateWarehouseCode: () => Promise<string>;
  getWarehouseStock: (
    warehouseId: string,
    params?: any
  ) => Promise<WarehouseStock[]>;
  checkStockExists: (warehouseId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
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
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch warehouses",
        loading: false,
      });
    }
  },

  getWarehouseById: async (id) => {
    set({ loading: true, error: null });
    try {
      const warehouse = await warehouseService.getWarehouseById(id);
      set({ loading: false });
      return warehouse;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch warehouse",
        loading: false,
      });
      throw error;
    }
  },

  createWarehouse: async (data) => {
    set({ loading: true, error: null });
    try {
      await warehouseService.createWarehouse(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create warehouse",
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
      set({
        error: error.response?.data?.message || "Failed to update warehouse",
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
      set({
        error: error.response?.data?.message || "Failed to delete warehouse",
        loading: false,
      });
      throw error;
    }
  },

  generateWarehouseCode: async () => {
    try {
      const code = await warehouseService.generateWarehouseCode();
      return code;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to generate warehouse code",
      });
      throw error;
    }
  },

  getWarehouseStock: async (warehouseId, params) => {
    try {
      const response = await warehouseService.getWarehouseStock(
        warehouseId,
        params
      );
      return response.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch warehouse stock",
      });
      throw error;
    }
  },

  checkStockExists: async (warehouseId) => {
    try {
      const hasStock = await warehouseService.checkStockExists(warehouseId);
      return hasStock;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to check warehouse stock",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
