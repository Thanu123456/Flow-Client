// Expense module types — mirrors the desktop POS "Expenses" and
// "Expenses Category" forms (see Flow-Client memory: expense-module).

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  expenseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategoryFormData {
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export interface ExpenseCategoryPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface Expense {
  id: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  warehouseId?: string;
  warehouseName?: string;
  amount: number;
  note?: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  title: string;
  categoryId?: string | null;
  warehouseId?: string | null;
  amount: number;
  note?: string;
  /** ISO date string (YYYY-MM-DD) */
  expenseDate: string;
}

export interface ExpensePaginationParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  from?: string;
  to?: string;
}

export interface ExpenseListResult {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalAmount: number;
}

export interface ExpenseCategoryListResult {
  data: ExpenseCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
