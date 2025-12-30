import { axiosInstance } from "../api/axiosInstance";
import type {
  Category,
  CategoryFormData,
  CategoryPaginationParams,
  CategoryResponse,
} from "../../types/entities/category.types";

// Helper to transform backend category response to frontend Category type
const transformCategory = (c: any): Category => ({
  id: c.id,
  name: c.name,
  description: c.description || undefined,
  imageUrl: c.image_url || undefined,
  status: c.is_active ? "active" : "inactive",
  productCount: c.product_count || 0,
  subcategoryCount: c.subcategory_count || 0,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

export const categoryService = {
  // Get all categories with pagination
  getCategories: async (params: CategoryPaginationParams): Promise<CategoryResponse> => {
    // Convert frontend params to backend params
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };

    const response = await axiosInstance.get("/admin/categories", { params: backendParams });

    // Backend returns { categories: [...], total, page, per_page, total_pages }
    const categoriesData = response.data.categories || response.data.data || response.data || [];
    const categories: Category[] = Array.isArray(categoriesData)
      ? categoriesData.map(transformCategory)
      : [];

    return {
      data: categories,
      total: response.data.total || categories.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || categories.length) / params.limit),
    };
  },

  // Get all categories (no pagination, for dropdowns)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get("/admin/categories/all");
    const categoriesData = response.data.categories || response.data.data || response.data || [];
    return Array.isArray(categoriesData) ? categoriesData.map(transformCategory) : [];
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get(`/admin/categories/${id}`);
    const categoryData = response.data.category || response.data.data || response.data;
    return transformCategory(categoryData);
  },

  // Create category
  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      image_url: data.imageUrl || undefined,
      is_active: data.status === "active",
    };

    const response = await axiosInstance.post("/admin/categories", payload);
    const createdCategory = response.data.category || response.data.data || response.data;
    return transformCategory(createdCategory);
  },

  // Update category
  updateCategory: async (
    id: string,
    data: Partial<CategoryFormData>
  ): Promise<Category> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.status !== undefined) payload.is_active = data.status === "active";

    const response = await axiosInstance.put(`/admin/categories/${id}`, payload);
    const updatedCategory = response.data.category || response.data.data || response.data;
    return transformCategory(updatedCategory);
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/categories/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: CategoryPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/categories/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: CategoryPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/categories/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
