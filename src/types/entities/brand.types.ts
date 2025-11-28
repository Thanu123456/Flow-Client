export interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
  description: string | undefined;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface BrandFormData {
  name: string;
  imageUrl?: string;
  description?: string;
  status: "active" | "inactive";
}

export interface BrandFilters {
  search?: string;
  status?: "active" | "inactive";
}

export interface BrandPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface BrandResponse {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
