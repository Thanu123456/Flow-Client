// src/services/management/warehouseService.ts
import axios from "axios";
import type {
  Warehouse,
  WarehouseFormData,
  WarehousePaginationParams,
  WarehouseStock,
} from "../../types/entities/warehouse.types";

class WarehouseService {
  async getWarehouses(params: WarehousePaginationParams) {
    const response = await axios.get("/warehouses", { params });
    return response.data;
  }

  async getWarehouseById(id: string) {
    const response = await axios.get(`/warehouses/${id}`);
    return response.data;
  }

  async createWarehouse(data: WarehouseFormData) {
    const response = await axios.post("/warehouses", data);
    return response.data;
  }

  async updateWarehouse(id: string, data: Partial<WarehouseFormData>) {
    const response = await axios.put(`/warehouses/${id}`, data);
    return response.data;
  }

  async deleteWarehouse(id: string) {
    const response = await axios.delete(`/warehouses/${id}`);
    return response.data;
  }

  async exportToPDF(params: WarehousePaginationParams): Promise<Blob> {
    const response = await axios.get(`/warehouses/export/pdf`, {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async exportToExcel(params: WarehousePaginationParams): Promise<Blob> {
    const response = await axios.get(`/warehouses/export/excel`, {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async generateWarehouseCode(): Promise<string> {
    const response = await axios.get(`warehouses/generate-code`);
    return response.data.code;
  }

  async getWarehouseStock(warehouseId: string, params?: any) {
    const response = await axios.get(`/warehouses/${warehouseId}/stock`, {
      params,
    });
    return response.data;
  }

  async checkStockExists(warehouseId: string): Promise<boolean> {
    const response = await axios.get(`/warehouses/${warehouseId}/has-stock`);
    return response.data.hasStock;
  }
}

export const warehouseService = new WarehouseService();
