import { axiosInstance } from "../api/axiosInstance";
import type {
  Category,
  CategoryFormData,
  CategoryPaginationParams,
  DeleteCategoryData,
} from "../../types/entities/category.types";

export const categoryService = {
  // Get all categories
  getCategories: async (params: CategoryPaginationParams) => {
    const response = await axiosInstance.get("/admin/categories", { params });

    const list: Category[] = (response.data.data ?? response.data).map(
      (c: any) => ({
        ...c,
      })
    );

    return {
      data: list,
      total: response.data.total ?? list.length,
      page: response.data.page ?? params.page,
      limit: response.data.limit ?? params.limit,
      totalPages: response.data.total
        ? Math.ceil(response.data.total / (response.data.limit ?? params.limit))
        : 1,
    };
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await axiosInstance.get(`/admin/categories/${id}`);
    return response.data;
  },

  // Create category
  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const payload = {
      ...data,
    };

    const response = await axiosInstance.post("/admin/categories", payload);
    return response.data;
  },

  // Update category
  updateCategory: async (
    id: string,
    data: Partial<CategoryFormData>
  ): Promise<Category> => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: string, deleteData: DeleteCategoryData) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`, {
      data: deleteData,
    });
    return response.data;
  },

  // Export to PDF
  exportToPDF: async (params: CategoryPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get(`/admin/categories/export/pdf`, {
      params,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: CategoryPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get(`/admin/categories/export/excel`, {
      params,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },

  // Generate category code
  generateCategoryCode: async (): Promise<string> => {
    const response = await axiosInstance.get(`/admin/categories/generate-code`);
    return response.data.code;
  },
};
