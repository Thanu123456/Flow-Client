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
  // Get all subcategories with pagination
  getSubcategories: async (params: SubcategoryPaginationParams): Promise<SubcategoryResponse> => {
    // Convert frontend params to backend params
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };

    const response = await axiosInstance.get("/admin/subcategories", { params: backendParams });

    // Backend returns { subcategories: [...], total, page, per_page, total_pages }
    const subcategoriesData = response.data.subcategories || response.data.data || response.data || [];
    const subcategories: Subcategory[] = Array.isArray(subcategoriesData)
      ? subcategoriesData.map(transformSubcategory)
      : [];

    return {
      data: subcategories,
      total: response.data.total || subcategories.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || subcategories.length) / params.limit),
    };
  },

  // Get subcategories by category
  getSubcategoriesByCategory: async (categoryId: string): Promise<Subcategory[]> => {
    const response = await axiosInstance.get(`/admin/subcategories/by-category/${categoryId}`);
    const subcategoriesData = response.data.subcategories || response.data.data || response.data || [];
    return Array.isArray(subcategoriesData) ? subcategoriesData.map(transformSubcategory) : [];
  },

  // Get all subcategories (no pagination, for dropdowns)
  getAllSubcategories: async (): Promise<Subcategory[]> => {
    const response = await axiosInstance.get("/admin/subcategories/all");
    const subcategoriesData = response.data.subcategories || response.data.data || response.data || [];
    return Array.isArray(subcategoriesData) ? subcategoriesData.map(transformSubcategory) : [];
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
