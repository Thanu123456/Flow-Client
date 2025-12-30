import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subcategoryService } from "../../services/management/subCategoryService";
import type {
  Subcategory,
  SubcategoryFormData,
  SubcategoryPaginationParams,
} from "../../types/entities/subcategory.types";

interface SubcategoryState {
  subcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  // Actions
  getSubcategories: (params: SubcategoryPaginationParams) => Promise<void>;
  getSubcategoryById: (id: string) => Promise<Subcategory | null>;
  getSubcategoriesByCategory: (categoryId: string) => Promise<Subcategory[]>;
  createSubcategory: (data: SubcategoryFormData) => Promise<void>;
  updateSubcategory: (id: string, data: Partial<SubcategoryFormData>) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useSubcategoryStore = create<SubcategoryState>()(
  devtools(
    (set) => ({
      subcategories: [],
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },

      getSubcategories: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await subcategoryService.getSubcategories(params);
          set({
            subcategories: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch subcategories";
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      getSubcategoryById: async (id) => {
        try {
          const subcategory = await subcategoryService.getSubcategoryById(id);
          return subcategory;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch subcategory";
          set({ error: errorMessage });
          return null;
        }
      },

      getSubcategoriesByCategory: async (categoryId) => {
        try {
          const subcategories = await subcategoryService.getSubcategoriesByCategory(categoryId);
          return subcategories;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch subcategories";
          set({ error: errorMessage });
          return [];
        }
      },

      createSubcategory: async (data) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.createSubcategory(data);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to create subcategory";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      updateSubcategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.updateSubcategory(id, data);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to update subcategory";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      deleteSubcategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.deleteSubcategory(id);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to delete subcategory";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "subcategory-store",
    }
  )
);
