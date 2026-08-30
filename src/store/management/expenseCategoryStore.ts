import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { expenseCategoryService } from "../../services/management/expenseCategoryService";
import type {
  ExpenseCategory,
  ExpenseCategoryFormData,
  ExpenseCategoryPaginationParams,
} from "../../types/entities/expense.types";

interface ExpenseCategoryState {
  categories: ExpenseCategory[];
  allCategories: ExpenseCategory[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };

  getCategories: (params: ExpenseCategoryPaginationParams) => Promise<void>;
  getAllCategories: () => Promise<ExpenseCategory[]>;
  createCategory: (data: ExpenseCategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: Partial<ExpenseCategoryFormData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;

export const useExpenseCategoryStore = create<ExpenseCategoryState>()(
  devtools(
    (set, get) => ({
      categories: [],
      allCategories: [],
      loading: false,
      submitting: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getCategories: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await expenseCategoryService.getCategories(params);
          set({
            categories: res.data,
            pagination: {
              total: res.total,
              page: res.page || params.page || 1,
              limit: res.limit || params.limit || 10,
              totalPages: res.totalPages || 1,
            },
            loading: false,
          });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to fetch expense categories"), loading: false });
        }
      },

      getAllCategories: async () => {
        try {
          const cats = await expenseCategoryService.getAllCategories();
          set({ allCategories: cats });
          return cats;
        } catch (e: any) {
          const cached = get().allCategories;
          if (cached.length === 0) set({ error: errMsg(e, "Failed to fetch expense categories") });
          return cached;
        }
      },

      createCategory: async (data) => {
        set({ submitting: true, error: null });
        try {
          await expenseCategoryService.createCategory(data);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to create category"), submitting: false });
          throw e;
        }
      },

      updateCategory: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          await expenseCategoryService.updateCategory(id, data);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to update category"), submitting: false });
          throw e;
        }
      },

      deleteCategory: async (id) => {
        set({ submitting: true, error: null });
        try {
          await expenseCategoryService.deleteCategory(id);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to delete category"), submitting: false });
          throw e;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "expense-category-store" }
  )
);
