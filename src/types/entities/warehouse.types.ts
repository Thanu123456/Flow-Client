export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  capacity?: number;
  currentStock?: number;
  status: "active" | "inactive";
  type: "main" | "branch" | "distribution";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseFormData {
  name: string;
  code?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  capacity?: number;
  status: "active" | "inactive";
  type: "main" | "branch" | "distribution";
  description?: string;
}

export interface WarehousePaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "active" | "inactive";
  type?: "main" | "branch" | "distribution";
  city?: string;
}

export interface WarehouseStock {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitName: string;
  lastUpdated: string;
}
