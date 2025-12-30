export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
  status: "active" | "inactive";
  subcategoryCount?: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  imageUrl?: string;
  description?: string;
  status: "active" | "inactive";
}

export interface CategoryFilters {
  search?: string;
  status?: "active" | "inactive";
}

export interface CategoryPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeleteCategoryData {
  password: string;
}
