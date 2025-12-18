export interface SubCategory {
  id: string;
  name: string;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
  categoryCode?: string;
  status: "active" | "inactive";
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface SubCategoryFormData {
  name: string;
  imageUrl?: string;
  categoryId: string;
  status: "active" | "inactive";
}

export interface SubCategoryPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
  categoryId?: string;
}
