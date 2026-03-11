import { axiosInstance } from "../api/axiosInstance";
import type {
  Warehouse,
  WarehouseFormData,
  WarehousePaginationParams,
  WarehouseResponse,
} from "../../types/entities/warehouse.types";

// Helper to transform backend warehouse response to frontend Warehouse type
const transformWarehouse = (w: any): Warehouse => ({
  id: w.id,
  name: w.name,
  contactPerson: w.contact_person || undefined,
  email: w.email || undefined,
  mobile: w.mobile || undefined,
  phone: w.phone || undefined,
  city: w.city || undefined,
  address: w.address || undefined,
  status: w.is_active ? "active" : "inactive",
  totalProducts: w.total_products || 0,
  totalStock: w.total_stock || 0,
  createdAt: w.created_at,
  updatedAt: w.updated_at,
});

export const warehouseService = {
  getWarehouses: async (params: WarehousePaginationParams): Promise<WarehouseResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      // Only send include_inactive when the user explicitly wants inactive records
      include_inactive: params.status === 'inactive' ? true : undefined,
    };

    const response = await axiosInstance.get('/admin/warehouses', { params: backendParams });
    const rd = response.data;
    const raw = rd.data ?? rd.warehouses ?? rd ?? [];
    const warehouses: Warehouse[] = Array.isArray(raw) ? raw.map(transformWarehouse) : [];

    return {
      data:       warehouses,
      total:      rd.total       ?? rd.meta?.total       ?? warehouses.length,
      page:       rd.page        ?? rd.meta?.page        ?? params.page,
      limit:      rd.per_page    ?? rd.meta?.per_page    ?? params.limit,
      totalPages: rd.total_pages ?? rd.meta?.total_pages ?? Math.ceil((rd.meta?.total ?? warehouses.length) / params.limit),
    };
  },

  // Get all warehouses (no pagination, for dropdowns)
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const response = await axiosInstance.get('/admin/warehouses/all');
    const raw = response.data.data ?? response.data.warehouses ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformWarehouse) : [];
  },

  // Get warehouse by ID
  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await axiosInstance.get(`/admin/warehouses/${id}`);
    const warehouseData = response.data.warehouse || response.data.data || response.data;
    return transformWarehouse(warehouseData);
  },

  // Create warehouse
  createWarehouse: async (data: WarehouseFormData): Promise<Warehouse> => {
    const payload = {
      name: data.name,
      contact_person: data.contactPerson || undefined,
      email: data.email || undefined,
      mobile: data.mobile || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      address: data.address || undefined,
      is_active: data.status === "active",
    };

    const response = await axiosInstance.post("/admin/warehouses", payload);
    const createdWarehouse = response.data.warehouse || response.data.data || response.data;
    return transformWarehouse(createdWarehouse);
  },

  // Update warehouse
  updateWarehouse: async (id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.email !== undefined) payload.email = data.email;
    if (data.mobile !== undefined) payload.mobile = data.mobile;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.city !== undefined) payload.city = data.city;
    if (data.address !== undefined) payload.address = data.address;
    if (data.status !== undefined) payload.is_active = data.status === "active";

    const response = await axiosInstance.put(`/admin/warehouses/${id}`, payload);
    const updatedWarehouse = response.data.warehouse || response.data.data || response.data;
    return transformWarehouse(updatedWarehouse);
  },

  // Delete warehouse
  deleteWarehouse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warehouses/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: WarehousePaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/warehouses/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: WarehousePaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/warehouses/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
