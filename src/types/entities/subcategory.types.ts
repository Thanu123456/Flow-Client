export interface Subcategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  imageUrl?: string;
  description?: string;
  status: "active" | "inactive";
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryFormData {
  categoryId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  status: "active" | "inactive";
}

export interface SubcategoryFilters {
  search?: string;
  status?: "active" | "inactive";
  categoryId?: string;
}

export interface SubcategoryPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
  categoryId?: string;
}

export interface SubcategoryResponse {
  data: Subcategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
