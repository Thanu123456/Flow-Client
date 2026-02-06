import { axiosInstance } from "../api/axiosInstance";
import type {
  Warranty,
  WarrantyFormData,
  WarrantyPaginationParams,
  WarrantyResponse,
} from "../../types/entities/warranty.types";

const transformWarranty = (data: any): Warranty => ({
  id: data.id,
  name: data.name,
  description: data.description,
  duration: data.duration,
  period: data.period,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const warrantyService = {
  getWarranties: async (params: WarrantyPaginationParams): Promise<WarrantyResponse> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/warranties", { params: backendParams });
    const data = response.data.warranties || response.data.data || [];
    const warranties = Array.isArray(data) ? data.map(transformWarranty) : [];

    return {
      data: warranties,
      total: response.data.total || warranties.length,
      page: response.data.page || 1,
      limit: response.data.per_page || 10,
      totalPages: response.data.total_pages || 1
    };
  },

  getAllWarranties: async (): Promise<Warranty[]> => {
    const response = await axiosInstance.get("/admin/warranties/all");
    const data = response.data.warranties || response.data.data || [];
    return Array.isArray(data) ? data.map(transformWarranty) : [];
  },

  getWarrantyById: async (id: string): Promise<Warranty> => {
    const response = await axiosInstance.get(`/admin/warranties/${id}`);
    return transformWarranty(response.data.data || response.data);
  },

  createWarranty: async (data: WarrantyFormData): Promise<void> => {
    await axiosInstance.post("/admin/warranties", {
      name: data.name,
      description: data.description,
      duration: data.duration,
      period: data.period,
      is_active: data.isActive
    });
  },

  updateWarranty: async (id: string, data: Partial<WarrantyFormData>): Promise<void> => {
    await axiosInstance.put(`/admin/warranties/${id}`, {
      name: data.name,
      description: data.description,
      duration: data.duration,
      period: data.period,
      is_active: data.isActive
    });
  },

  deleteWarranty: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warranties/${id}`);
  },

  exportToPDF: async (params: WarrantyPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/warranties/export/pdf", {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportToExcel: async (params: WarrantyPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/warranties/export/excel", {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
