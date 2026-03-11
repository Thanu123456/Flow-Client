import { axiosInstance } from "../api/axiosInstance";
import type {
  Subcategory,
  SubcategoryFormData,
  SubcategoryPaginationParams,
  SubcategoryResponse,
} from "../../types/entities/subcategory.types";

// Helper to transform backend subcategory response to frontend Subcategory type
const transformSubcategory = (s: any): Subcategory => ({
  id: s.id,
  categoryId: s.category_id,
  categoryName: s.category_name || undefined,
  name: s.name,
  description: s.description || undefined,
  imageUrl: s.image_url || undefined,
  status: s.is_active ? "active" : "inactive",
  productCount: s.product_count || 0,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

export const subcategoryService = {
  getSubcategories: async (params: SubcategoryPaginationParams): Promise<SubcategoryResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status === 'inactive' ? true : undefined,
    };

    const response = await axiosInstance.get('/admin/subcategories', { params: backendParams });
    const rd = response.data;
    const raw = rd.data ?? rd.subcategories ?? rd ?? [];
    const subcategories: Subcategory[] = Array.isArray(raw) ? raw.map(transformSubcategory) : [];

    return {
      data:       subcategories,
      total:      rd.total       ?? rd.meta?.total       ?? subcategories.length,
      page:       rd.page        ?? rd.meta?.page        ?? params.page,
      limit:      rd.per_page    ?? rd.meta?.per_page    ?? params.limit,
      totalPages: rd.total_pages ?? rd.meta?.total_pages ?? Math.ceil((rd.meta?.total ?? subcategories.length) / params.limit),
    };
  },

  // Get subcategories by category
  getSubcategoriesByCategory: async (categoryId: string): Promise<Subcategory[]> => {
    const response = await axiosInstance.get(`/admin/subcategories/by-category/${categoryId}`);
    const raw = response.data.data ?? response.data.subcategories ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformSubcategory) : [];
  },

  // Get all subcategories (no pagination, for dropdowns)
  getAllSubcategories: async (): Promise<Subcategory[]> => {
    const response = await axiosInstance.get('/admin/subcategories/all');
    const raw = response.data.data ?? response.data.subcategories ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformSubcategory) : [];
  },

  // Get subcategory by ID
  getSubcategoryById: async (id: string): Promise<Subcategory> => {
    const response = await axiosInstance.get(`/admin/subcategories/${id}`);
    const subcategoryData = response.data.subcategory || response.data.data || response.data;
    return transformSubcategory(subcategoryData);
  },

  // Create subcategory
  createSubcategory: async (data: SubcategoryFormData): Promise<Subcategory> => {
    const payload = {
      category_id: data.categoryId,
      name: data.name,
      description: data.description || undefined,
      image_url: data.imageUrl || undefined,
      is_active: data.status === "active",
    };

    const response = await axiosInstance.post("/admin/subcategories", payload);
    const createdSubcategory = response.data.subcategory || response.data.data || response.data;
    return transformSubcategory(createdSubcategory);
  },

  // Update subcategory
  updateSubcategory: async (id: string, data: Partial<SubcategoryFormData>): Promise<Subcategory> => {
    const payload: any = {};
    if (data.categoryId !== undefined) payload.category_id = data.categoryId;
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.status !== undefined) payload.is_active = data.status === "active";

    const response = await axiosInstance.put(`/admin/subcategories/${id}`, payload);
    const updatedSubcategory = response.data.subcategory || response.data.data || response.data;
    return transformSubcategory(updatedSubcategory);
  },

  // Delete subcategory
  deleteSubcategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/subcategories/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: SubcategoryPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/subcategories/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: SubcategoryPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/subcategories/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
