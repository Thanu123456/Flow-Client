export type WarrantyPeriod = 'month' | 'year';

export interface Warranty {
  id: string;
  name: string;
  duration: number;
  period: WarrantyPeriod;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarrantyFormData {
  name: string;
  duration: number;
  period: WarrantyPeriod;
  description?: string;
  isActive?: boolean;
}

export interface CreateWarrantyRequest {
  name: string;
  duration: number;
  period: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateWarrantyRequest {
  name?: string;
  duration?: number;
  period?: string;
  description?: string;
  is_active?: boolean;
}

export interface WarrantyPaginationParams {
  page: number;
  limit: number;
  search?: string;
  includeInactive?: boolean;
  sortBy?: 'name' | 'recent_added';
}

export interface WarrantyResponse {
  data: Warranty[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WarrantySummary {
  id: string;
  name: string;
  duration: number;
  period: string;
}
