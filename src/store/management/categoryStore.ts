import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { categoryService } from "../../services/management/categoryService";
import type {
  Category,
  CategoryFormData,
  CategoryPaginationParams,
} from "../../types/entities/category.types";

interface CategoryState {
  // Paginated table data — NEVER overwritten by dropdown calls
  categories: Category[];
  // Full list for dropdowns — NEVER overwritten by table calls
  allCategories: Category[];
  allCategoriesLoading: boolean; // tracks in-flight getAllCategories request
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
  updateCategory: (id: string, data: Partial<CategoryFormData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  generateCategoryCode: () => Promise<string>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      categories: [],
      allCategories: [],
      allCategoriesLoading: false,
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getCategories: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await categoryService.getCategories(params);
          const data = response.data ?? [];
          const total = response.total ?? data.length;
          
          if (params.limit === 1) {
            set(state => ({
              pagination: { ...state.pagination, total },
              loading: false
            }));
          } else {
            set({
              categories: data,
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
            error: error.response?.data?.message || "Failed to fetch categories",
            loading: false,
          });
        }
      },

      getAllCategories: async () => {
        const cached = get().allCategories;
        // Deduplicate: if a fetch is already in flight, skip.
        if (get().allCategoriesLoading) return cached.length > 0 ? cached : [];
        set({ allCategoriesLoading: true });
        const tryFetch = async (attemptsLeft: number): Promise<Category[]> => {
          try {
            const categories = await categoryService.getAllCategories();
            // Safety guard: never overwrite a loaded list with an empty response
            if (categories.length > 0 || cached.length === 0) {
              set({ allCategories: categories, allCategoriesLoading: false });
            } else {
              set({ allCategoriesLoading: false });
            }
            return categories.length > 0 ? categories : cached;
          } catch (err: any) {
            if (cached.length === 0 && attemptsLeft > 0) {
              await new Promise(r => setTimeout(r, 3000));
              return tryFetch(attemptsLeft - 1);
            }
            set({ allCategoriesLoading: false });
            if (cached.length > 0) return cached;
            set({ error: err.response?.data?.message || err.message || "Failed to fetch categories" });
            return [];
          }
        };
        return tryFetch(2);
      },

      getCategoryById: async (id) => {
        try {
          const category = await categoryService.getCategoryById(id);
          return category;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to fetch category" });
          throw error;
        }
      },

      createCategory: async (data) => {
        set({ loading: true, error: null });
        try {
          await categoryService.createCategory(data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to create category", loading: false });
          throw error;
        }
      },

      updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
          await categoryService.updateCategory(id, data);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to update category", loading: false });
          throw error;
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          await categoryService.deleteCategory(id);
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to delete category", loading: false });
          throw error;
        }
      },

      generateCategoryCode: async () => {
        const timestampPart = Date.now().toString(36).toUpperCase();
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CAT-${timestampPart}-${randomPart}`;
      },

      clearError: () => set({ error: null }),
    }),
    { name: "category-store" }
  )
);
