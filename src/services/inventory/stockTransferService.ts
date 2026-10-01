import { axiosInstance } from "../api/axiosInstance";
import { transformTransfer } from "../management/warehouseService";
import type { StockTransfer } from "../../types/entities/warehouse.types";

const unwrap = (res: any) => res.data?.data ?? res.data;

export interface TransferLineInput {
  productId: string;
  variationId?: string;
  quantity: number;
}

export const stockTransferService = {
  /** Immediate warehouse -> warehouse transfer (cost and expiry of the moved batches are preserved). */
  create: async (data: { fromWarehouseId: string; toWarehouseId: string; notes?: string; items: TransferLineInput[] }): Promise<StockTransfer> =>
    transformTransfer(
      unwrap(
        await axiosInstance.post("/admin/stock-transfers", {
          from_warehouse_id: data.fromWarehouseId,
          to_warehouse_id: data.toWarehouseId,
          notes: data.notes || undefined,
          items: data.items.map((i) => ({
            product_id: i.productId,
            variation_id: i.variationId || undefined,
            quantity: i.quantity,
          })),
        })
      )
    ),

  list: async (params: { page: number; limit: number; warehouseId?: string; search?: string }) => {
    const res = await axiosInstance.get("/admin/stock-transfers", {
      params: {
        page: params.page,
        per_page: params.limit,
        warehouse_id: params.warehouseId || undefined,
        search: params.search || undefined,
      },
    });
    const rd = res.data;
    const raw = Array.isArray(rd?.data) ? rd.data : [];
    return {
      data: raw.map(transformTransfer) as StockTransfer[],
      total: (rd?.meta?.total ?? raw.length) as number,
    };
  },

  get: async (id: string): Promise<StockTransfer> => transformTransfer(unwrap(await axiosInstance.get(`/admin/stock-transfers/${id}`))),
};
