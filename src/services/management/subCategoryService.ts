import { axiosInstance } from "../api/axiosInstance";
import type {
  SubCategoryFormData,
  SubCategoryPaginationParams,
} from "../../../src/types/entities/subcategory.types.ts";

class SubCategoryService {
  // Get all subcategories (with pagination)
  async getSubCategories(params: SubCategoryPaginationParams) {
    const response = await axiosInstance.get("/subcategories", { params });
    return response.data;
  }

  // Get subcategory by ID
  async getSubCategoryById(id: string) {
    const response = await axiosInstance.get(`/subcategories/${id}`);
    return response.data;
  }

  // Create a new subcategory
  async createSubCategory(data: SubCategoryFormData) {
    const response = await axiosInstance.post("/subcategories", data);
    return response.data;
  }

  // Update a subcategory
  async updateSubCategory(id: string, data: Partial<SubCategoryFormData>) {
    const response = await axiosInstance.put(`/subcategories/${id}`, data);
    return response.data;
  }

  // Delete a subcategory
  async deleteSubCategory(id: string) {
    const response = await axiosInstance.delete(`/subcategories/${id}`);
    return response.data;
  }

  // Export PDF
  async exportToPDF(params: SubCategoryPaginationParams): Promise<Blob> {
    const response = await axiosInstance.get(`/subcategories/export/pdf`, {
      params,
      responseType: "arraybuffer",
    });

    return new Blob([response.data], { type: "application/pdf" });
  }

  // Export Excel
  async exportToExcel(params: SubCategoryPaginationParams): Promise<Blob> {
    const response = await axiosInstance.get(`/subcategories/export/excel`, {
      params,
      responseType: "arraybuffer",
    });

    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  // Get category code for a category ID
  async getCategoryCode(categoryId: string): Promise<string> {
    const response = await axiosInstance.get(`/categories/${categoryId}/code`);
    return response.data.code;
  }
}

export const subCategoryService = new SubCategoryService();
