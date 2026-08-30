import { axiosInstance } from "../api/axiosInstance";
import type {
  StockTake,
  StockTakeItem,
  StockTakeListItem,
} from "../../types/entities/stockAdjustment.types";

const toNum = (v: any): number => parseFloat(v || "0") || 0;
const toNumOrNull = (v: any): number | null => (v === null || v === undefined ? null : toNum(v));

const transformItem = (it: any): StockTakeItem => ({
  id: it.id,
  productId: it.product_id,
  productName: it.product_name || "",
  productSKU: it.product_sku || undefined,
  variationId: it.variation_id || undefined,
  variationType: it.variation_type || undefined,
  unitName: it.unit_name || undefined,
  systemQty: toNum(it.system_qty),
  countedQty: toNumOrNull(it.counted_qty),
  variance: toNumOrNull(it.variance),
  unitCost: toNum(it.unit_cost),
});

const transformStockTake = (s: any): StockTake => ({
  id: s.id,
  referenceNumber: s.reference_number,
  warehouseId: s.warehouse_id,
  warehouseName: s.warehouse_name || "",
  categoryId: s.category_id || undefined,
  categoryName: s.category_name || undefined,
  status: s.status,
  notes: s.notes || undefined,
  adjustmentInId: s.adjustment_in_id || undefined,
  adjustmentOutId: s.adjustment_out_id || undefined,
  createdByName: s.created_by_name || undefined,
  itemCount: s.item_count || 0,
  countedCount: s.counted_count || 0,
  items: Array.isArray(s.items) ? s.items.map(transformItem) : [],
  postedAt: s.posted_at || undefined,
  createdAt: s.created_at,
});

const transformListItem = (s: any): StockTakeListItem => ({
  id: s.id,
  referenceNumber: s.reference_number,
  warehouseName: s.warehouse_name || "",
  categoryName: s.category_name || undefined,
  status: s.status,
  itemCount: s.item_count || 0,
  countedCount: s.counted_count || 0,
  createdByName: s.created_by_name || undefined,
  createdAt: s.created_at,
});

export const stockTakeService = {
  async list(params: { page?: number; perPage?: number; status?: string } = {}): Promise<{ stockTakes: StockTakeListItem[]; total: number }> {
    const response = await axiosInstance.get("/admin/stock-takes", {
      params: { page: params.page ?? 1, per_page: params.perPage ?? 20, status: params.status || undefined },
    });
    const data = response.data?.data ?? [];
    return {
      stockTakes: Array.isArray(data) ? data.map(transformListItem) : [],
      total: response.data?.meta?.total ?? 0,
    };
  },

  async get(id: string): Promise<StockTake> {
    const response = await axiosInstance.get(`/admin/stock-takes/${id}`);
    return transformStockTake(response.data?.data);
  },

  async create(req: { warehouse_id: string; category_id?: string; notes?: string }): Promise<StockTake> {
    const response = await axiosInstance.post("/admin/stock-takes", req);
    return transformStockTake(response.data?.data);
  },

  async saveCounts(id: string, items: { item_id: string; counted_qty: number }[], markDone = false): Promise<StockTake> {
    const response = await axiosInstance.put(`/admin/stock-takes/${id}/counts`, { items, mark_done: markDone });
    return transformStockTake(response.data?.data);
  },

  async post(id: string, notes?: string): Promise<StockTake> {
    const response = await axiosInstance.post(`/admin/stock-takes/${id}/post`, { notes });
    return transformStockTake(response.data?.data);
  },

  async cancel(id: string): Promise<void> {
    await axiosInstance.post(`/admin/stock-takes/${id}/cancel`);
  },
};
