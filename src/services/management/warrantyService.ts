import { axiosInstance } from "../api/axiosInstance";
import type {
  Warranty,
  WarrantyFormData,
  WarrantyPaginationParams,
  WarrantyResponse,
  WarrantySummary,
} from "../../types/entities/warranty.types";

// Helper to transform backend warranty response to frontend Warranty type
const transformWarranty = (w: any): Warranty => ({
  id: w.id,
  name: w.name,
  duration: w.duration,
  period: w.period,
  description: w.description || undefined,
  isActive: w.is_active ?? true,
  createdAt: w.created_at,
  updatedAt: w.updated_at,
});

// Helper to transform warranty summary
const transformWarrantySummary = (w: any): WarrantySummary => ({
  id: w.id,
  name: w.name,
  duration: w.duration,
  period: w.period,
});

export const warrantyService = {
  // Get all warranties with pagination
  getWarranties: async (params: WarrantyPaginationParams): Promise<WarrantyResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
      sort_by: params.sortBy || undefined,
    };

    const response = await axiosInstance.get("/admin/warranties", { params: backendParams });

    const warrantiesData = response.data.warranties || response.data.data || response.data || [];
    const warranties: Warranty[] = Array.isArray(warrantiesData)
      ? warrantiesData.map(transformWarranty)
      : [];

    return {
      data: warranties,
      total: response.data.total || warranties.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || warranties.length) / params.limit),
    };
  },

  // Get warranty by ID
  getWarrantyById: async (id: string): Promise<Warranty> => {
    const response = await axiosInstance.get(`/admin/warranties/${id}`);
    const warrantyData = response.data.warranty || response.data.data || response.data;
    return transformWarranty(warrantyData);
  },

  // Create warranty
  createWarranty: async (data: WarrantyFormData): Promise<Warranty> => {
    const payload: any = {
      name: data.name,
      duration: data.duration,
      period: data.period,
      description: data.description || undefined,
      is_active: data.isActive,
    };

    const response = await axiosInstance.post("/admin/warranties", payload);
    const createdWarranty = response.data.warranty || response.data.data || response.data;
    return transformWarranty(createdWarranty);
  },

  // Update warranty
  updateWarranty: async (id: string, data: Partial<WarrantyFormData>): Promise<Warranty> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.duration !== undefined) payload.duration = data.duration;
    if (data.period !== undefined) payload.period = data.period;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await axiosInstance.put(`/admin/warranties/${id}`, payload);
    const updatedWarranty = response.data.warranty || response.data.data || response.data;
    return transformWarranty(updatedWarranty);
  },

  // Delete warranty
  deleteWarranty: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warranties/${id}`);
  },

  // Get all active warranties (for dropdowns)
  getAllWarranties: async (): Promise<WarrantySummary[]> => {
    const response = await axiosInstance.get("/admin/warranties/all");
    const warrantiesData = response.data.warranties || response.data.data || response.data || [];
    return Array.isArray(warrantiesData) ? warrantiesData.map(transformWarrantySummary) : [];
  },

  // Export warranties to PDF
  exportToPDF: async (params: WarrantyPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/warranties/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export warranties to Excel
  exportToExcel: async (params: WarrantyPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/warranties/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
