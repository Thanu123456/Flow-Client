export interface Unit {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  status: "active" | "inactive";
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitFormData {
  name: string;
  shortName: string;
  description?: string;
  status: "active" | "inactive";
}

export interface UnitFilters {
  search?: string;
  status?: "active" | "inactive";
}

export interface UnitPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface UnitResponse {
  data: Unit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}