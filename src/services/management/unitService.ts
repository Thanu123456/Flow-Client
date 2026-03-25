import { axiosInstance } from "../api/axiosInstance";
import type {
  Unit,
  UnitFormData,
  UnitPaginationParams,
  UnitResponse,
} from "../../types/entities/unit.types";

// Helper to transform backend unit response to frontend Unit type
const transformUnit = (u: any): Unit => ({
  id: u.id,
  name: u.name,
  shortName: u.short_name || u.shortName || "",
  description: u.description || undefined,
  status: u.is_active ? "active" : "inactive",
  productCount: u.product_count || 0,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
});

export const unitService = {
  getUnits: async (params: UnitPaginationParams): Promise<UnitResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status === 'inactive' ? true : undefined,
    };

    const response = await axiosInstance.get('/admin/units', { params: backendParams });
    const rd = response.data;
    const raw = rd.data ?? rd.units ?? rd ?? [];
    const units: Unit[] = Array.isArray(raw) ? raw.map(transformUnit) : [];

    return {
      data:       units,
      total:      rd.total       ?? rd.meta?.total       ?? units.length,
      page:       rd.page        ?? rd.meta?.page        ?? params.page,
      limit:      rd.per_page    ?? rd.meta?.per_page    ?? params.limit,
      totalPages: rd.total_pages ?? rd.meta?.total_pages ?? Math.ceil((rd.meta?.total ?? units.length) / params.limit),
    };
  },

  // Get all units (no pagination, for dropdowns)
  getAllUnits: async (): Promise<Unit[]> => {
    const response = await axiosInstance.get('/admin/units/all');
    const raw = response.data.data ?? response.data.units ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformUnit) : [];
  },

  // Get a specific Unit by ID
  getUnitById: async (id: string): Promise<Unit> => {
    const response = await axiosInstance.get(`/admin/units/${id}`);
    const unitData = response.data.unit || response.data.data || response.data;
    return transformUnit(unitData);
  },

  // Create a New Unit
  createUnit: async (unitData: UnitFormData): Promise<Unit> => {
    const payload = {
      name: unitData.name,
      short_name: unitData.shortName,
      description: unitData.description || undefined,
      is_active: unitData.status === "active",
    };

    const response = await axiosInstance.post("/admin/units", payload);
    const createdUnit = response.data.unit || response.data.data || response.data;
    return transformUnit(createdUnit);
  },

  // Update an existing Unit
  updateUnit: async (
    id: string,
    unitData: Partial<UnitFormData>
  ): Promise<Unit> => {
    const payload: any = {};
    if (unitData.name !== undefined) payload.name = unitData.name;
    if (unitData.shortName !== undefined) payload.short_name = unitData.shortName;
    if (unitData.description !== undefined) payload.description = unitData.description;
    if (unitData.status !== undefined) payload.is_active = unitData.status === "active";

    const response = await axiosInstance.put(`/admin/units/${id}`, payload);
    const updatedUnit = response.data.unit || response.data.data || response.data;
    return transformUnit(updatedUnit);
  },

  // Delete a Unit
  deleteUnit: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/units/${id}`);
  },

  // Export units to PDF
  exportToPDF: async (params: UnitPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/units/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export units to Excel
  exportToExcel: async (params: UnitPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/units/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
