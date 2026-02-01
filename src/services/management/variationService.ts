import { axiosInstance } from "../api/axiosInstance";
import type {
  Variation,
  VariationFormData,
  VariationPaginationParams,
  VariationValue,
  VariationResponse,
} from "../../types/entities/variation.types";

const splitValueString = (val: any): string[] => {
  if (typeof val !== "string") return [];
  if (!val.includes(",")) return [val.trim()];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
};

// Helper to transform backend variation value to frontend type
const transformVariationValue = (v: any): VariationValue[] => {
  if (typeof v === "string") {
    return splitValueString(v).map(val => ({
      id: val,
      value: val,
    }));
  }

  const valStr = String(v.value || v.Value || v.name || v.Name || v.values_name || v.option_value || v.OptionValue || "");
  const splitValues = splitValueString(valStr);

  if (splitValues.length > 1) {
    return splitValues.map((val, idx) => ({
      id: String(v.id || v.ID || v.value_id || "") + "-" + idx,
      value: val,
      createdAt: v.created_at || v.createdAt || v.CreatedAt || v.Created_at || "",
      updatedAt: v.updated_at || v.updatedAt || v.UpdatedAt || v.Updated_at || "",
    }));
  }

  return [{
    id: String(v.id || v.ID || v.value_id || v.value || v.Value || Math.random().toString()),
    value: valStr || JSON.stringify(v),
    createdAt: v.created_at || v.createdAt || v.CreatedAt || v.Created_at || "",
    updatedAt: v.updated_at || v.updatedAt || v.UpdatedAt || v.Updated_at || "",
  }];
};

// Helper to transform backend variation response to frontend Variation type
const transformVariation = (v: any): Variation => {
  // If v is nested in a 'variation' or 'data' property, unwrap it
  const data = v.variation || v.Variation || (v.id ? v : (v.data || v));

  // Collect potential variation values from all possible keys
  let rawValues: any[] = [];

  if (Array.isArray(data.values)) rawValues = [...rawValues, ...data.values];
  if (Array.isArray(data.options)) rawValues = [...rawValues, ...data.options];
  if (Array.isArray(data.Values)) rawValues = [...rawValues, ...data.Values];
  if (Array.isArray(data.Options)) rawValues = [...rawValues, ...data.Options];
  if (Array.isArray(data.variation_options)) rawValues = [...rawValues, ...data.variation_options];
  if (Array.isArray(data.variation_values)) rawValues = [...rawValues, ...data.variation_values];

  // If no arrays found, try single fields that might contain comma-separated values
  if (rawValues.length === 0) {
    const singleValue = data.values_name || data.value_names || data.value_name || data.value || data.Value || data.options_name;
    if (singleValue) rawValues = [singleValue];
  }

  // Transform and flatten the values (since each raw value might be a comma-separated string)
  const values: VariationValue[] = [];
  const seenValues = new Set<string>();

  rawValues.forEach(rv => {
    const transformed = transformVariationValue(rv);
    transformed.forEach(tv => {
      const lowerVal = tv.value.toLowerCase().trim();
      if (!seenValues.has(lowerVal)) {
        values.push(tv);
        seenValues.add(lowerVal);
      }
    });
  });

  return {
    id: String(data.id || data.ID || ""),
    name: String(data.name || data.Name || "Unnamed Variation"),
    values: values,
    valuesCount: values.length, // Always use the calculated length to be accurate
    status: (data.is_active === true || data.is_active === "true" || data.status === "active" || data.IsActive === true) ? "active" : "inactive",
    createdAt: data.created_at || data.createdAt || data.CreatedAt || v.created_at || v.createdAt || data.Created_at ||
      (data.audit && (data.audit.created_at || data.audit.createdAt)) ||
      (data.Audit && (data.Audit.CreatedAt || data.Audit.created_at)) ||
      data.variation_created_at || "",
    updatedAt: data.updated_at || data.updatedAt || data.UpdatedAt || v.updated_at || v.updatedAt || data.Updated_at ||
      (data.audit && (data.audit.updated_at || data.audit.updatedAt)) ||
      (data.Audit && (data.Audit.UpdatedAt || data.Audit.updated_at)) ||
      data.variation_updated_at || data.modified_at || data.updated_date || "",
  };
};

export const variationService = {
  // Get all variations with pagination
  getVariations: async (
    params: VariationPaginationParams
  ): Promise<VariationResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== true,
      is_active: params.status !== undefined ? params.status : undefined,
    };

    const response = await axiosInstance.get("/admin/variations", {
      params: backendParams,
    });

    const flatData = response.data.data || response.data || [];
    const meta = response.data.meta || {};

    const variationsMap = new Map<string, any>();

    flatData.forEach((row: any) => {
      const varName = String(row.name || row.Name || "Unnamed Variation");
      const groupKey = varName.toLowerCase().trim();

      if (!variationsMap.has(groupKey)) {
        variationsMap.set(groupKey, {
          ...row, // Preserve all original fields
          id: row.id || row.ID,
          name: varName,
          values: [] // We'll collect values here
        });
      }

      // Collect value-related fields from this row
      const variation = variationsMap.get(groupKey);
      const val = row.values_name || row.value_name || row.value || row.Value || row.option_value;
      if (val) {
        variation.values.push(val);
      }

      // Also check if the row already has arrays we should include
      if (Array.isArray(row.values)) variation.values = [...variation.values, ...row.values];
      if (Array.isArray(row.options)) variation.values = [...variation.values, ...row.options];

      // Preserve the most recent updated_at timestamp from all rows
      const rowUpdatedAt = row.updated_at || row.updatedAt || row.UpdatedAt || row.Updated_at || "";
      const currentUpdatedAt = variation.updated_at || variation.updatedAt || "";
      if (rowUpdatedAt && (!currentUpdatedAt || new Date(rowUpdatedAt) > new Date(currentUpdatedAt))) {
        variation.updated_at = rowUpdatedAt;
        variation.updatedAt = rowUpdatedAt;
      }

      // Also preserve created_at if missing
      const rowCreatedAt = row.created_at || row.createdAt || row.CreatedAt || row.Created_at || "";
      if (rowCreatedAt && !variation.created_at && !variation.createdAt) {
        variation.created_at = rowCreatedAt;
        variation.createdAt = rowCreatedAt;
      }
    });

    let variations: Variation[] = Array.from(variationsMap.values()).map(transformVariation);

    // Apply frontend filtering as fallback if backend doesn't filter properly
    if (params.status !== undefined) {
      const targetStatus = params.status === true ? "active" : "inactive";
      variations = variations.filter(v => v.status === targetStatus);
    }

    const page = meta.page || params.page;
    const perPage = meta.per_page || params.limit;

    return {
      data: variations,
      total: variations.length, // Use filtered count for accurate pagination
      page,
      limit: perPage,
      totalPages: Math.ceil(variations.length / perPage),
      pagination: {
        total: variations.length,
        page,
        limit: perPage,
        totalPages: Math.ceil(variations.length / perPage),
      }
    };
  },

  // Get all variations (no pagination)
  getAllVariations: async (): Promise<Variation[]> => {
    const response = await axiosInstance.get("/admin/variations/all");
    const variationsData = response.data.data || response.data.variations || response.data || [];

    // Use the same grouping logic as getVariations for consistency
    const variationsMap = new Map<string, any>();
    const items = Array.isArray(variationsData) ? variationsData : [variationsData];

    items.forEach((row: any) => {
      const varName = String(row.name || row.Name || "Unnamed Variation");
      const groupKey = varName.toLowerCase().trim();
      if (!variationsMap.has(groupKey)) {
        variationsMap.set(groupKey, { ...row, values: [] });
      }
      const variation = variationsMap.get(groupKey);
      const val = row.values_name || row.value_name || row.value || row.Value || row.option_value;
      if (val) variation.values.push(val);
      if (Array.isArray(row.values)) variation.values = [...variation.values, ...row.values];

      // Preserve the most recent updated_at timestamp from all rows
      const rowUpdatedAt = row.updated_at || row.updatedAt || row.UpdatedAt || row.Updated_at || "";
      const currentUpdatedAt = variation.updated_at || variation.updatedAt || "";
      if (rowUpdatedAt && (!currentUpdatedAt || new Date(rowUpdatedAt) > new Date(currentUpdatedAt))) {
        variation.updated_at = rowUpdatedAt;
        variation.updatedAt = rowUpdatedAt;
      }

      // Also preserve created_at if missing
      const rowCreatedAt = row.created_at || row.createdAt || row.CreatedAt || row.Created_at || "";
      if (rowCreatedAt && !variation.created_at && !variation.createdAt) {
        variation.created_at = rowCreatedAt;
        variation.createdAt = rowCreatedAt;
      }
    });

    return Array.from(variationsMap.values()).map(transformVariation);
  },

  // Get variation by ID
  getVariationById: async (id: string): Promise<Variation> => {
    const response = await axiosInstance.get(`/admin/variations/${id}`);
    const variationData = response.data.variation || response.data.data || response.data;
    return transformVariation(variationData);
  },

  // Create variation
  createVariation: async (data: VariationFormData): Promise<Variation> => {
    const payload = {
      name: data.name,
      values: data.values,
      is_active: data.status === "active",
    };

    const response = await axiosInstance.post("/admin/variations", payload);
    const createdVariation = response.data.variation || response.data.data || response.data;
    return transformVariation(createdVariation);
  },

  // Update variation
  updateVariation: async (
    id: string,
    data: Partial<VariationFormData>
  ): Promise<Variation> => {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.values !== undefined) payload.values = data.values;
    if (data.status !== undefined) payload.is_active = data.status === "active";

    const response = await axiosInstance.put(`/admin/variations/${id}`, payload);
    const updatedVariation = response.data.variation || response.data.data || response.data;
    return transformVariation(updatedVariation);
  },

  // Delete variation
  deleteVariation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/variations/${id}`);
  },

  // Export to PDF
  exportToPDF: async (params: VariationPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/variations/export/pdf", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        include_inactive: params.status !== true,
        is_active: params.status !== undefined ? params.status : undefined,
      },
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export to Excel
  exportToExcel: async (params: VariationPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/variations/export/excel", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        include_inactive: params.status !== true,
        is_active: params.status !== undefined ? params.status : undefined,
      },
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
