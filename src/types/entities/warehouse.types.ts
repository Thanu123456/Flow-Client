export interface Warehouse {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  status: "active" | "inactive";
  totalProducts?: number;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFormData {
  name: string;
  contactPerson?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  address?: string;
  status: "active" | "inactive";
}

export interface WarehouseFilters {
  search?: string;
  status?: "active" | "inactive";
}

export interface WarehousePaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface WarehouseResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
