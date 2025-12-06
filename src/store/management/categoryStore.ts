import { create } from "zustand";
import { categoryService } from "../../services/management/categoryService";
import type {
  Category,
  CategoryFormData,
  CategoryPaginationParams,
  DeleteCategoryData,
} from "../../types/entities/category.types";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getCategories: (params: CategoryPaginationParams) => Promise<void>;
  getCategoryById: (id: string) => Promise<Category>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (
    id: string,
    data: Partial<CategoryFormData>
  ) => Promise<void>;
  deleteCategory: (id: string, deleteData: DeleteCategoryData) => Promise<void>;
  generateCategoryCode: () => Promise<string>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  getCategories: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryService.getCategories(params);
      set({
        categories: response.data,
        pagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch categories",
        loading: false,
      });
    }
  },

  getCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.getCategoryById(id);
      set({ loading: false });
      return category;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch category",
        loading: false,
      });
      throw error;
    }
  },

  createCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      await categoryService.createCategory(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create category",
        loading: false,
      });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await categoryService.updateCategory(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update category",
        loading: false,
      });
      throw error;
    }
  },

  deleteCategory: async (id, deleteData) => {
    set({ loading: true, error: null });
    try {
      await categoryService.deleteCategory(id, deleteData);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete category",
        loading: false,
      });
      throw error;
    }
  },

  generateCategoryCode: async () => {
    try {
      const code = await categoryService.generateCategoryCode();
      return code;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to generate category code",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
