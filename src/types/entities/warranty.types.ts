export type WarrantyPeriod = "day" | "week" | "month" | "year" | "lifetime";
export type WarrantyType = "manufacturer" | "store" | "extended";

export interface Warranty {
  id: string;
  name: string;
  description?: string;
  duration: number;
  period: WarrantyPeriod;
  warrantyType: WarrantyType;
  terms?: string;
  exclusions?: string;
  /** Live products currently using this warranty. */
  productCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyFormData {
  name: string;
  description?: string;
  duration: number;
  period: WarrantyPeriod;
  warrantyType: WarrantyType;
  terms?: string;
  exclusions?: string;
  isActive: boolean;
  /** updatedAt the form was loaded with — lets the server detect concurrent edits. */
  updatedAt?: string;
}

export interface WarrantyPaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface WarrantyResponse {
  data: Warranty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
