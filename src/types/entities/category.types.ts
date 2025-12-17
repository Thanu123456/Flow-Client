export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
  subCategoryCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  code?: string;
  description?: string;
  status: "active" | "inactive";
}

export interface CategoryPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface DeleteCategoryData {
  password: string;
}
