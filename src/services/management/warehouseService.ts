import { axiosInstance } from "../api/axiosInstance";
import type {
  LocationFormData,
  LocationStockRow,
  ReorderLevelInput,
  StockTransfer,
  Warehouse,
  WarehouseFormData,
  WarehouseImportResult,
  WarehouseLocation,
  WarehouseMovement,
  WarehouseOverview,
  WarehousePaginationParams,
  WarehouseResponse,
  WarehouseStockRow,
  MovementType,
} from "../../types/entities/warehouse.types";

const opt = (v: any) => (v === null || v === undefined || v === "" ? undefined : v);

// Helper to transform backend warehouse response to frontend Warehouse type
export const transformWarehouse = (w: any): Warehouse => ({
  id: w.id,
  name: w.name,
  code: opt(w.code),
  warehouseType: w.warehouse_type || "store",
  managerUserId: opt(w.manager_user_id),
  managerName: opt(w.manager_name),
  isDefault: !!w.is_default,
  capacity: w.capacity === null || w.capacity === undefined ? undefined : Number(w.capacity),
  contactPerson: w.contact_person || undefined,
  email: w.email || undefined,
  mobile: w.mobile || undefined,
  phone: w.phone || undefined,
  city: w.city || undefined,
  address: w.address || undefined,
  status: w.is_active ? "active" : "inactive",
  totalProducts: w.total_products || 0,
  stockByUnit: Array.isArray(w.stock_by_unit)
    ? w.stock_by_unit.map((u: any) => ({ unit: u.unit || "", quantity: Number(u.quantity) || 0 }))
    : [],
  createdAt: w.created_at,
  updatedAt: w.updated_at,
  deletedAt: opt(w.deleted_at),
});

const unwrap = (res: any) => res.data?.data ?? res.data;

const transformOverview = (d: any): WarehouseOverview => ({
  productsInStock: Number(d.products_in_stock || 0),
  outOfStock: Number(d.out_of_stock || 0),
  lowStock: Number(d.low_stock || 0),
  stockByUnit: (d.stock_by_unit || []).map((u: any) => ({ unit: u.unit || "", quantity: Number(u.quantity) || 0 })),
  valuation: Number(d.valuation || 0),
  totalUnits: Number(d.total_units || 0),
  capacity: d.capacity === null || d.capacity === undefined ? undefined : Number(d.capacity),
  utilizationPct: d.utilization_pct === null || d.utilization_pct === undefined ? undefined : Number(d.utilization_pct),
  zones: Number(d.zones || 0),
  bins: Number(d.bins || 0),
  transfersOut30d: Number(d.transfers_out_30d || 0),
  transfersIn30d: Number(d.transfers_in_30d || 0),
});

const num = (v: any) => (v === null || v === undefined ? undefined : Number(v));

const transformStockRow = (r: any): WarehouseStockRow => ({
  productId: r.product_id,
  variationId: opt(r.variation_id),
  productName: r.product_name,
  variationLabel: opt(r.variation_label),
  sku: opt(r.sku),
  barcode: opt(r.barcode),
  unit: opt(r.unit),
  quantity: Number(r.quantity || 0),
  minQty: Number(r.min_qty || 0),
  maxQty: num(r.max_qty),
  reorderQty: num(r.reorder_qty),
  hasOverride: !!r.has_override,
  value: Number(r.value || 0),
  status: r.status,
  suggestedQty: num(r.suggested_qty),
});

const transformLocation = (l: any): WarehouseLocation => ({
  id: l.id,
  warehouseId: l.warehouse_id,
  parentId: opt(l.parent_id),
  locationType: l.location_type,
  code: l.code,
  name: opt(l.name),
  capacity: num(l.capacity),
  notes: opt(l.notes),
  isActive: !!l.is_active,
  usedQty: Number(l.used_qty || 0),
  productCount: Number(l.product_count || 0),
  childCount: Number(l.child_count || 0),
});

export const transformTransfer = (t: any): StockTransfer => ({
  id: t.id,
  transferNumber: t.transfer_number,
  fromWarehouseId: t.from_warehouse_id,
  fromWarehouse: t.from_warehouse,
  toWarehouseId: t.to_warehouse_id,
  toWarehouse: t.to_warehouse,
  status: t.status,
  notes: opt(t.notes),
  createdByName: opt(t.created_by_name),
  createdAt: t.created_at,
  itemCount: Number(t.item_count || 0),
  totalQuantity: Number(t.total_quantity || 0),
  totalValue: Number(t.total_value || 0),
  items: Array.isArray(t.items)
    ? t.items.map((i: any) => ({
        productId: i.product_id,
        variationId: opt(i.variation_id),
        productName: i.product_name,
        variationLabel: opt(i.variation_label),
        sku: opt(i.sku),
        unit: opt(i.unit),
        quantity: Number(i.quantity || 0),
        unitCost: Number(i.unit_cost || 0),
      }))
    : undefined,
});

/** Builds the JSON body shared by create and update. Blank strings clear optional fields. */
const toPayload = (data: Partial<WarehouseFormData>, isUpdate: boolean) => {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.code !== undefined && (isUpdate || data.code)) payload.code = data.code;
  if (data.warehouseType !== undefined) payload.warehouse_type = data.warehouseType;
  if (data.managerUserId !== undefined) {
    if (isUpdate) payload.manager_user_id = data.managerUserId || "";
    else if (data.managerUserId) payload.manager_user_id = data.managerUserId;
  }
  if (data.capacity !== undefined) {
    if (data.capacity === null) {
      if (isUpdate) payload.capacity = -1; // server: negative clears
    } else payload.capacity = data.capacity;
  }
  if (data.isDefault !== undefined) payload.is_default = data.isDefault;
  if (isUpdate) {
    if (data.contactPerson !== undefined) payload.contact_person = data.contactPerson;
    if (data.email !== undefined) payload.email = data.email;
    if (data.mobile !== undefined) payload.mobile = data.mobile;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.city !== undefined) payload.city = data.city;
    if (data.address !== undefined) payload.address = data.address;
    if (data.updatedAt !== undefined) payload.updated_at = data.updatedAt;
  } else {
    payload.contact_person = data.contactPerson || undefined;
    payload.email = data.email || undefined;
    payload.mobile = data.mobile || undefined;
    payload.phone = data.phone || undefined;
    payload.city = data.city || undefined;
    payload.address = data.address || undefined;
  }
  if (data.status !== undefined) payload.is_active = data.status === "active";
  return payload;
};

export interface StockQuery {
  page: number;
  limit: number;
  search?: string;
  status?: "ok" | "low" | "out" | "attention";
  sort?: "name" | "qty" | "value";
  dir?: "asc" | "desc";
}

export interface MovementQuery {
  page: number;
  limit: number;
  search?: string;
  types?: MovementType[];
  days?: number;
}

const paged = <T,>(res: any, map: (x: any) => T, page: number, limit: number) => {
  const rd = res.data;
  const raw = Array.isArray(rd?.data) ? rd.data : [];
  return {
    data: raw.map(map) as T[],
    total: (rd?.meta?.total ?? raw.length) as number,
    page: (rd?.meta?.page ?? page) as number,
    limit: (rd?.meta?.per_page ?? limit) as number,
  };
};

export const warehouseService = {
  getWarehouses: async (params: WarehousePaginationParams): Promise<WarehouseResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      // undefined filter => all live warehouses; otherwise active / inactive / deleted only
      status: params.status ?? 'all',
      warehouse_type: params.warehouseType || undefined,
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
    const response = await axiosInstance.post("/admin/warehouses", toPayload(data, false));
    const createdWarehouse = response.data.warehouse || response.data.data || response.data;
    return transformWarehouse(createdWarehouse);
  },

  // Update warehouse
  updateWarehouse: async (id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> => {
    const response = await axiosInstance.put(`/admin/warehouses/${id}`, toPayload(data, true));
    const updatedWarehouse = response.data.warehouse || response.data.data || response.data;
    return transformWarehouse(updatedWarehouse);
  },

  // Delete warehouse
  deleteWarehouse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warehouses/${id}`);
  },

  restoreWarehouse: async (id: string): Promise<Warehouse> =>
    transformWarehouse(unwrap(await axiosInstance.post(`/admin/warehouses/${id}/restore`))),

  setDefaultWarehouse: async (id: string): Promise<Warehouse> =>
    transformWarehouse(unwrap(await axiosInstance.post(`/admin/warehouses/${id}/default`))),

  // Export to PDF
  exportToPDF: async (params: WarehousePaginationParams): Promise<Blob> => {
    const backendParams = {
      search: params.search || undefined,
      status: params.status ?? "all",
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
      search: params.search || undefined,
      status: params.status ?? "all",
    };
    const response = await axiosInstance.get("/admin/warehouses/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },

  // Import (.xlsx / .csv) — backend: POST /admin/warehouses/import
  importWarehouses: async (file: File): Promise<WarehouseImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const d = unwrap(await axiosInstance.post("/admin/warehouses/import", form, { headers: { "Content-Type": "multipart/form-data" } }));
    return {
      totalRows: Number(d.total_rows || 0),
      created: Number(d.created || 0),
      skipped: Number(d.skipped || 0),
      errors: (d.errors || []).map((e: any) => ({ row: e.row, name: opt(e.name), message: e.message })),
    };
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/warehouses/import/template", { responseType: "arraybuffer" });
    return new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  },

  // ── detail view ───────────────────────────────────────────────────────────
  getOverview: async (id: string): Promise<{ warehouse: Warehouse; overview: WarehouseOverview }> => {
    const d = unwrap(await axiosInstance.get(`/admin/warehouses/${id}/overview`));
    return { warehouse: transformWarehouse(d.warehouse), overview: transformOverview(d.overview) };
  },

  getStock: async (id: string, q: StockQuery) => {
    const res = await axiosInstance.get(`/admin/warehouses/${id}/stock`, {
      params: { page: q.page, per_page: q.limit, search: q.search || undefined, status: q.status || undefined, sort: q.sort || undefined, dir: q.dir || undefined },
    });
    return paged(res, transformStockRow, q.page, q.limit);
  },

  getMovements: async (id: string, q: MovementQuery) => {
    const res = await axiosInstance.get(`/admin/warehouses/${id}/movements`, {
      params: {
        page: q.page,
        per_page: q.limit,
        search: q.search || undefined,
        type: q.types && q.types.length ? q.types.join(",") : undefined,
        days: q.days || undefined,
      },
    });
    return paged(
      res,
      (m: any): WarehouseMovement => ({
        occurredAt: m.occurred_at,
        type: m.type,
        reference: m.reference,
        productName: m.product_name,
        variationLabel: opt(m.variation_label),
        quantity: Number(m.quantity || 0),
        note: opt(m.note),
      }),
      q.page,
      q.limit
    );
  },

  setReorderLevel: async (id: string, r: ReorderLevelInput): Promise<void> => {
    await axiosInstance.put(`/admin/warehouses/${id}/reorder-levels`, {
      product_id: r.productId,
      variation_id: r.variationId || undefined,
      min_qty: r.minQty,
      max_qty: r.maxQty ?? undefined,
      reorder_qty: r.reorderQty ?? undefined,
    });
  },

  clearReorderLevel: async (id: string, productId: string, variationId?: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warehouses/${id}/reorder-levels`, {
      params: { product_id: productId, variation_id: variationId || undefined },
    });
  },

  // ── zones & bins ──────────────────────────────────────────────────────────
  getLocations: async (id: string): Promise<WarehouseLocation[]> => {
    const raw = unwrap(await axiosInstance.get(`/admin/warehouses/${id}/locations`));
    return Array.isArray(raw) ? raw.map(transformLocation) : [];
  },

  createLocation: async (id: string, d: LocationFormData): Promise<WarehouseLocation> =>
    transformLocation(
      unwrap(
        await axiosInstance.post(`/admin/warehouses/${id}/locations`, {
          location_type: d.locationType,
          parent_id: d.parentId || undefined,
          code: d.code,
          name: d.name || undefined,
          capacity: d.capacity ?? undefined,
          notes: d.notes || undefined,
          is_active: d.isActive,
        })
      )
    ),

  updateLocation: async (id: string, locId: string, d: LocationFormData): Promise<WarehouseLocation> =>
    transformLocation(
      unwrap(
        await axiosInstance.put(`/admin/warehouses/${id}/locations/${locId}`, {
          parent_id: d.parentId || undefined,
          code: d.code,
          name: d.name || undefined,
          capacity: d.capacity ?? undefined,
          notes: d.notes || undefined,
          is_active: d.isActive,
        })
      )
    ),

  deleteLocation: async (id: string, locId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/warehouses/${id}/locations/${locId}`);
  },

  getLocationStock: async (id: string, locId: string): Promise<LocationStockRow[]> => {
    const raw = unwrap(await axiosInstance.get(`/admin/warehouses/${id}/locations/${locId}/stock`));
    return (Array.isArray(raw) ? raw : []).map((r: any) => ({
      productId: r.product_id,
      variationId: opt(r.variation_id),
      productName: r.product_name,
      variationLabel: opt(r.variation_label),
      sku: opt(r.sku),
      quantity: Number(r.quantity || 0),
    }));
  },

  setLocationStock: async (id: string, locId: string, productId: string, quantity: number, variationId?: string): Promise<void> => {
    await axiosInstance.put(`/admin/warehouses/${id}/locations/${locId}/stock`, {
      product_id: productId,
      variation_id: variationId || undefined,
      quantity,
    });
  },
};
