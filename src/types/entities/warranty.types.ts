export type WarrantyPeriod = "month" | "year";

export interface Warranty {
  id: string;
  name: string;
  description?: string;
  duration: number;
  period: WarrantyPeriod;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyFormData {
  name: string;
  description?: string;
  duration: number;
  period: WarrantyPeriod;
  isActive: boolean;
}

export interface WarrantyPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface WarrantyResponse {
  data: Warranty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
