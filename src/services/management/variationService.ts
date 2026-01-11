import { axiosInstance } from "../api/axiosInstance";
import type {
  Variation,
  VariationFormData,
  VariationPaginationParams,
  VariationValue,
} from "../../types/entities/variation.types";

// Helper to transform backend variation value to frontend type
const transformVariationValue = (v: any): VariationValue => ({
  id: v.id,
  value: v.value,
  createdAt: v.created_at,
});

// Helper to transform backend variation response to frontend Variation type
const transformVariation = (v: any): Variation => ({
  id: v.id,
  name: v.name,
  values: Array.isArray(v.values) ? v.values.map(transformVariationValue) : [],
  valuesCount:
    v.values_count || (Array.isArray(v.values) ? v.values.length : 0),
  status: v.is_active ? "active" : "inactive",
  createdAt: v.created_at,
  updatedAt: v.updated_at,
});

interface VariationResponse {
  data: Variation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const variationService = {
  // Get all variations with pagination
  getVariations: async (
    params: VariationPaginationParams
  ): Promise<VariationResponse> => {
    // Convert frontend params to backend params
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };

    const response = await axiosInstance.get("/admin/variations", {
      params: backendParams,
    });

    // Backend returns { variations: [...], total, page, per_page, total_pages }
    const variationsData =
      response.data.variations || response.data.data || response.data || [];
    const variations: Variation[] = Array.isArray(variationsData)
      ? variationsData.map(transformVariation)
      : [];

    return {
      data: variations,
      total: response.data.total || variations.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages:
        response.data.total_pages ||
        Math.ceil((response.data.total || variations.length) / params.limit),
    };
  },

  // Get all variations (no pagination, for dropdowns)
  getAllVariations: async (): Promise<Variation[]> => {
    const response = await axiosInstance.get("/admin/variations/all");
    const variationsData =
      response.data.variations || response.data.data || response.data || [];
    return Array.isArray(variationsData)
      ? variationsData.map(transformVariation)
      : [];
  },

  // Get variation by ID
  getVariationById: async (id: string): Promise<Variation> => {
    const response = await axiosInstance.get(`/admin/variations/${id}`);
    const variationData =
      response.data.variation || response.data.data || response.data;
    return transformVariation(variationData);
  },

  // Create variation
  createVariation: async (data: VariationFormData): Promise<Variation> => {
    const payload = {
      name: data.name,
      values: data.values, // Array of strings
      is_active: data.status === "active",
    };

    const response = await axiosInstance.post("/admin/variations", payload);
    const createdVariation =
      response.data.variation || response.data.data || response.data;
    return transformVariation(createdVariation);
  },

  // Update variation
  updateVariation: async (
    id: string,
    data: Partial<VariationFormData>
  ): Promise<Variation> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.values !== undefined) payload.values = data.values;
    if (data.status !== undefined) payload.is_active = data.status === "active";

    const response = await axiosInstance.put(
      `/admin/variations/${id}`,
      payload
    );
    const updatedVariation =
      response.data.variation || response.data.data || response.data;
    return transformVariation(updatedVariation);
  },

  // Delete variation
  deleteVariation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/variations/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: VariationPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/variations/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: VariationPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/variations/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
