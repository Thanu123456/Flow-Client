import { axiosInstance } from "../api/axiosInstance";
import type {
  ExpenseCategory,
  ExpenseCategoryFormData,
  ExpenseCategoryListResult,
  ExpenseCategoryPaginationParams,
} from "../../types/entities/expense.types";

export const transformExpenseCategory = (c: any): ExpenseCategory => ({
  id: c.id,
  name: c.name,
  description: c.description || undefined,
  status: c.is_active ? "active" : "inactive",
  expenseCount: c.expense_count ?? 0,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

export const expenseCategoryService = {
  getCategories: async (
    params: ExpenseCategoryPaginationParams
  ): Promise<ExpenseCategoryListResult> => {
    const response = await axiosInstance.get("/admin/expense-categories", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        include_inactive: params.status === "inactive" ? true : undefined,
      },
    });
    const rd = response.data;
    const raw = rd.data ?? rd.categories ?? [];
    const data: ExpenseCategory[] = Array.isArray(raw)
      ? raw.map(transformExpenseCategory)
      : [];
    return {
      data,
      total: rd.meta?.total ?? rd.total ?? data.length,
      page: rd.meta?.page ?? params.page,
      limit: rd.meta?.per_page ?? params.limit,
      totalPages:
        rd.meta?.total_pages ??
        Math.ceil((rd.meta?.total ?? data.length) / params.limit),
    };
  },

  getAllCategories: async (): Promise<ExpenseCategory[]> => {
    const response = await axiosInstance.get("/admin/expense-categories/all");
    const raw = response.data.data ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformExpenseCategory) : [];
  },

  createCategory: async (
    data: ExpenseCategoryFormData
  ): Promise<ExpenseCategory> => {
    const response = await axiosInstance.post("/admin/expense-categories", {
      name: data.name,
      description: data.description || undefined,
      is_active: data.status === "active",
    });
    return transformExpenseCategory(response.data.data ?? response.data);
  },

  updateCategory: async (
    id: string,
    data: Partial<ExpenseCategoryFormData>
  ): Promise<ExpenseCategory> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.status !== undefined) payload.is_active = data.status === "active";
    const response = await axiosInstance.put(
      `/admin/expense-categories/${id}`,
      payload
    );
    return transformExpenseCategory(response.data.data ?? response.data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/expense-categories/${id}`);
  },
};
