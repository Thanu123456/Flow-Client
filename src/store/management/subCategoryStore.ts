// src/store/management/subCategoryStore.ts
import { create } from "zustand";
import { subCategoryService } from "../../services/management/subCategoryService";
import type {
  SubCategory,
  SubCategoryFormData,
  SubCategoryPaginationParams,
} from "../../../src/types/entities/subcategory.types";

interface SubCategoryState {
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getSubCategories: (params: SubCategoryPaginationParams) => Promise<void>;
  getSubCategoryById: (id: string) => Promise<SubCategory>;
  createSubCategory: (data: SubCategoryFormData) => Promise<void>;
  updateSubCategory: (
    id: string,
    data: Partial<SubCategoryFormData>
  ) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
  getCategoryCode: (categoryId: string) => Promise<string>;
  clearError: () => void;
}

export const useSubCategoryStore = create<SubCategoryState>((set) => ({
  subCategories: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  getSubCategories: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await subCategoryService.getSubCategories(params);
      set({
        subCategories: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch sub-categories",
        loading: false,
      });
    }
  },

  getSubCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const subCategory = await subCategoryService.getSubCategoryById(id);
      set({ loading: false });
      return subCategory;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch sub-category",
        loading: false,
      });
      throw error;
    }
  },

  createSubCategory: async (data) => {
    set({ loading: true, error: null });
    try {
      await subCategoryService.createSubCategory(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create sub-category",
        loading: false,
      });
      throw error;
    }
  },

  updateSubCategory: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await subCategoryService.updateSubCategory(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update sub-category",
        loading: false,
      });
      throw error;
    }
  },

  deleteSubCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await subCategoryService.deleteSubCategory(id);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete sub-category",
        loading: false,
      });
      throw error;
    }
  },

  getCategoryCode: async (categoryId) => {
    try {
      const code = await subCategoryService.getCategoryCode(categoryId);
      return code;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to get category code",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
