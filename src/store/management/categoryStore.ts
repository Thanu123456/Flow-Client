import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { categoryService } from "../../services/management/categoryService";
import type {
  Category,
  CategoryFormData,
  CategoryPaginationParams,
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
  getAllCategories: () => Promise<Category[]>;
  getCategoryById: (id: string) => Promise<Category>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (
    id: string,
    data: Partial<CategoryFormData>
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
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

      getAllCategories: async () => {
        try {
          const categories = await categoryService.getAllCategories();
          return categories;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch categories";
          set({ error: errorMessage });
          return [];
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

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await categoryService.deleteCategory(id);
          set({ loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete category",
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "category-store",
    }
  )
);
