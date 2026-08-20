import { axiosInstance } from "../api/axiosInstance";
import type {
  Adjustment,
  AdjustmentItem,
  AdjustmentListItem,
  AdjustmentListResponse,
  AdjustmentListParams,
  CreateAdjustmentRequest,
} from "../../types/entities/stockAdjustment.types";

const toNum = (v: any): number => parseFloat(v || "0") || 0;

const transformItem = (it: any): AdjustmentItem => ({
  id: it.id,
  productId: it.product_id,
  productName: it.product_name || "",
  productSKU: it.product_sku || undefined,
  variationId: it.variation_id || undefined,
  variationType: it.variation_type || undefined,
  warehouseId: it.warehouse_id,
  warehouseName: it.warehouse_name || "",
  unitName: it.unit_name || undefined,
  quantity: toNum(it.quantity),
  reason: it.reason || undefined,
});

const transformAdjustment = (a: any): Adjustment => ({
  id: a.id,
  adjustmentNumber: a.adjustment_number,
  movementType: a.movement_type,
  referenceType: a.reference_type,
  priority: a.priority || undefined,
  reason: a.reason || undefined,
  notes: a.notes || undefined,
  createdBy: a.created_by,
  createdByName: a.created_by_name || undefined,
  itemCount: a.item_count || 0,
  items: Array.isArray(a.items) ? a.items.map(transformItem) : [],
  createdAt: a.created_at,
  updatedAt: a.updated_at,
});

const transformListItem = (a: any): AdjustmentListItem => ({
  id: a.id,
  adjustmentNumber: a.adjustment_number,
  movementType: a.movement_type,
  referenceType: a.reference_type,
  priority: a.priority || undefined,
  reason: a.reason || undefined,
  createdByName: a.created_by_name || undefined,
  itemCount: a.item_count || 0,
  createdAt: a.created_at,
});

export const stockAdjustmentService = {
  async listAdjustments(params: AdjustmentListParams = {}): Promise<AdjustmentListResponse> {
    const response = await axiosInstance.get("/admin/adjustments", {
      params: {
        page: params.page ?? 1,
        per_page: params.perPage ?? 20,
        search: params.search || undefined,
        movement_type: params.movementType || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
      },
    });
    const data = response.data?.data ?? [];
    const meta = response.data?.meta ?? {};
    return {
      adjustments: Array.isArray(data) ? data.map(transformListItem) : [],
      total: meta.total ?? 0,
    };
  },

  async getAdjustment(id: string): Promise<Adjustment> {
    const response = await axiosInstance.get(`/admin/adjustments/${id}`);
    return transformAdjustment(response.data?.data);
  },

  async createAdjustment(req: CreateAdjustmentRequest): Promise<Adjustment> {
    const response = await axiosInstance.post("/admin/adjustments", req);
    return transformAdjustment(response.data?.data);
  },

  async deleteAdjustment(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/adjustments/${id}`);
  },
};
