import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { expenseService } from "../../services/management/expenseService";
import type {
  Expense,
  ExpenseFormData,
  ExpensePaginationParams,
} from "../../types/entities/expense.types";

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  totalAmount: number;
  pagination: { total: number; page: number; limit: number; totalPages: number };

  getExpenses: (params: ExpensePaginationParams) => Promise<void>;
  getExpenseById: (id: string) => Promise<Expense | null>;
  createExpense: (data: ExpenseFormData) => Promise<void>;
  updateExpense: (id: string, data: Partial<ExpenseFormData>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  clearError: () => void;
}

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;

export const useExpenseStore = create<ExpenseState>()(
  devtools(
    (set) => ({
      expenses: [],
      loading: false,
      submitting: false,
      error: null,
      totalAmount: 0,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

      getExpenses: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await expenseService.getExpenses(params);
          set({
            expenses: res.data,
            totalAmount: res.totalAmount,
            pagination: {
              total: res.total,
              page: res.page || params.page || 1,
              limit: res.limit || params.limit || 10,
              totalPages: res.totalPages || 1,
            },
            loading: false,
          });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to fetch expenses"), loading: false });
        }
      },

      getExpenseById: async (id) => {
        try {
          return await expenseService.getExpenseById(id);
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to fetch expense") });
          return null;
        }
      },

      createExpense: async (data) => {
        set({ submitting: true, error: null });
        try {
          await expenseService.createExpense(data);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to create expense"), submitting: false });
          throw e;
        }
      },

      updateExpense: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          await expenseService.updateExpense(id, data);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to update expense"), submitting: false });
          throw e;
        }
      },

      deleteExpense: async (id) => {
        set({ submitting: true, error: null });
        try {
          await expenseService.deleteExpense(id);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to delete expense"), submitting: false });
          throw e;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "expense-store" }
  )
);
