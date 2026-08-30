import { axiosInstance } from "../api/axiosInstance";
import type {
  Expense,
  ExpenseFormData,
  ExpenseListResult,
  ExpensePaginationParams,
} from "../../types/entities/expense.types";

const toNum = (v: any): number => {
  const n = parseFloat(v ?? "0");
  return Number.isFinite(n) ? n : 0;
};

export const transformExpense = (e: any): Expense => ({
  id: e.id,
  title: e.title,
  categoryId: e.category_id || undefined,
  categoryName: e.category_name || undefined,
  warehouseId: e.warehouse_id || undefined,
  warehouseName: e.warehouse_name || undefined,
  amount: toNum(e.amount),
  note: e.note || undefined,
  expenseDate: e.expense_date,
  createdAt: e.created_at,
  updatedAt: e.updated_at,
});

const buildPayload = (data: Partial<ExpenseFormData>, isUpdate: boolean) => {
  const payload: any = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.amount !== undefined) payload.amount = String(data.amount);
  if (data.note !== undefined) payload.note = data.note || undefined;
  if (data.expenseDate !== undefined) payload.expense_date = data.expenseDate;

  if (data.categoryId === null) {
    if (isUpdate) payload.clear_category = true;
  } else if (data.categoryId !== undefined) {
    payload.category_id = data.categoryId;
  }

  if (data.warehouseId === null) {
    if (isUpdate) payload.clear_warehouse = true;
  } else if (data.warehouseId !== undefined) {
    payload.warehouse_id = data.warehouseId;
  }
  return payload;
};

export const expenseService = {
  getExpenses: async (
    params: ExpensePaginationParams
  ): Promise<ExpenseListResult> => {
    const response = await axiosInstance.get("/admin/expenses", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        category_id: params.categoryId || undefined,
        warehouse_id: params.warehouseId || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
      },
    });
    // Handler returns { data: { expenses, total, page, per_page, total_pages, total_amount } }
    const body = response.data.data ?? response.data;
    const raw = body.expenses ?? [];
    const data: Expense[] = Array.isArray(raw) ? raw.map(transformExpense) : [];
    return {
      data,
      total: body.total ?? data.length,
      page: body.page ?? params.page,
      limit: body.per_page ?? params.limit,
      totalPages: body.total_pages ?? Math.ceil((body.total ?? data.length) / params.limit),
      totalAmount: toNum(body.total_amount),
    };
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await axiosInstance.get(`/admin/expenses/${id}`);
    return transformExpense(response.data.data ?? response.data);
  },

  createExpense: async (data: ExpenseFormData): Promise<Expense> => {
    const response = await axiosInstance.post(
      "/admin/expenses",
      buildPayload(data, false)
    );
    return transformExpense(response.data.data ?? response.data);
  },

  updateExpense: async (
    id: string,
    data: Partial<ExpenseFormData>
  ): Promise<Expense> => {
    const response = await axiosInstance.put(
      `/admin/expenses/${id}`,
      buildPayload(data, true)
    );
    return transformExpense(response.data.data ?? response.data);
  },

  deleteExpense: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/expenses/${id}`);
  },
};
