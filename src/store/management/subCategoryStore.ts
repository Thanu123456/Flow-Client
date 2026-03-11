import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { subcategoryService } from "../../services/management/subCategoryService";
import type {
  Subcategory,
  SubcategoryFormData,
  SubcategoryPaginationParams,
} from "../../types/entities/subcategory.types";

interface SubcategoryState {
  // Paginated table data
  subcategories: Subcategory[];
  // Full list for dropdowns — separate so table data is never overwritten
  allSubcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

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
    (set, get) => ({
      subcategories: [],
      allSubcategories: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getSubcategories: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await subcategoryService.getSubcategories(params);
          const data = response.data ?? [];
          const total = response.total ?? data.length;
          
          if (params.limit === 1) {
            set(state => ({
              pagination: { ...state.pagination, total },
              loading: false
            }));
          } else {
            set({
              subcategories: data,
              pagination: {
                total: total,
                page: response.page || params.page || 1,
                limit: response.limit || params.limit || 10,
                totalPages: response.totalPages || Math.ceil(total / (response.limit || 10)),
              },
              loading: false,
            });
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.message || error.message || "Failed to fetch subcategories",
            loading: false,
          });
        }
      },

      getSubcategoryById: async (id) => {
        try {
          return await subcategoryService.getSubcategoryById(id);
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to fetch subcategory" });
          return null;
        }
      },

      // Returns subcategories for a specific category — stored in allSubcategories to avoid
      // overwriting the paginated `subcategories` table list
      getSubcategoriesByCategory: async (categoryId) => {
        try {
          const subcategories = await subcategoryService.getSubcategoriesByCategory(categoryId);
          set({ allSubcategories: subcategories });  // ← separate field
          return subcategories;
        } catch (error: any) {
          const cached = get().allSubcategories.filter((s) => s.categoryId === categoryId);
          if (cached.length > 0) return cached;
          set({ error: error.response?.data?.message || error.message || "Failed to fetch subcategories" });
          return [];
        }
      },

      createSubcategory: async (data) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.createSubcategory(data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to create subcategory", loading: false });
          throw error;
        }
      },

      updateSubcategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.updateSubcategory(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to update subcategory", loading: false });
          throw error;
        }
      },

      deleteSubcategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await subcategoryService.deleteSubcategory(id);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || error.message || "Failed to delete subcategory", loading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "subcategory-store" }
  )
);
