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
  // Get All Units with pagination
  getUnits: async (params: UnitPaginationParams): Promise<UnitResponse> => {
    // Convert frontend params to backend params
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };

    const response = await axiosInstance.get("/admin/units", { params: backendParams });

    // Backend returns { units: [...], total, page, per_page, total_pages }
    const unitsData = response.data.units || response.data.data || response.data || [];
    const units: Unit[] = Array.isArray(unitsData)
      ? unitsData.map(transformUnit)
      : [];

    return {
      data: units,
      total: response.data.total || units.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || units.length) / params.limit),
    };
  },

  // Get all units (no pagination, for dropdowns)
  getAllUnits: async (): Promise<Unit[]> => {
    const response = await axiosInstance.get("/admin/units/all");
    const unitsData = response.data.units || response.data.data || response.data || [];
    return Array.isArray(unitsData) ? unitsData.map(transformUnit) : [];
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
