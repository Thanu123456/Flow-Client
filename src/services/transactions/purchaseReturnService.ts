import { axiosInstance } from "../api/axiosInstance";
import type {
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnListItem,
  PurchaseReturnListResponse,
  PurchaseReturnListParams,
  CreatePurchaseReturnRequest,
} from "../../types/entities/purchaseReturn.types";

const toNum = (v: any): number => parseFloat(v || '0') || 0;

const transformItem = (i: any): PurchaseReturnItem => ({
  id: i.id,
  grnItemId: i.grn_item_id,
  productId: i.product_id,
  productName: i.product_name || '',
  variationId: i.variation_id || undefined,
  variationType: i.variation_type || undefined,
  returnQty: toNum(i.return_qty),
  costPrice: toNum(i.cost_price),
  totalAmount: toNum(i.total_amount),
  reason: i.reason || undefined,
});

const transformReturn = (r: any): PurchaseReturn => ({
  id: r.id,
  returnNumber: r.return_number,
  originalGrnId: r.original_grn_id,
  originalGrnNumber: r.original_grn_number || '',
  supplierId: r.supplier_id,
  supplierName: r.supplier_name || '',
  warehouseId: r.warehouse_id,
  warehouseName: r.warehouse_name || '',
  totalReturnAmount: toNum(r.total_return_amount),
  notes: r.notes || undefined,
  status: r.status,
  returnDate: r.return_date,
  createdByName: r.created_by_name || '',
  createdAt: r.created_at,
  items: Array.isArray(r.items) ? r.items.map(transformItem) : [],
});

const transformListItem = (r: any): PurchaseReturnListItem => ({
  id: r.id,
  returnNumber: r.return_number,
  originalGrnNumber: r.original_grn_number || '',
  supplierName: r.supplier_name || '',
  warehouseName: r.warehouse_name || '',
  totalReturnAmount: toNum(r.total_return_amount),
  status: r.status,
  returnDate: r.return_date,
  createdAt: r.created_at,
});

export const purchaseReturnService = {
  listReturns: async (params: PurchaseReturnListParams): Promise<PurchaseReturnListResponse> => {
    const response = await axiosInstance.get('/admin/purchase-returns', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
        supplier_id: params.supplierId || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
      },
    });
    const data = response.data.data || [];
    const meta = response.data.meta || {};
    return {
      data: Array.isArray(data) ? data.map(transformListItem) : [],
      total: meta.total || 0,
      page: meta.page || params.page,
      perPage: meta.per_page || params.perPage,
      totalPages: meta.total_pages || 1,
    };
  },

  getReturn: async (id: string): Promise<PurchaseReturn> => {
    const response = await axiosInstance.get(`/admin/purchase-returns/${id}`);
    const data = response.data.data || response.data;
    return transformReturn(data);
  },

  createReturn: async (data: CreatePurchaseReturnRequest): Promise<PurchaseReturn> => {
    const payload = {
      original_grn_id: data.originalGrnId,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({
        grn_item_id: item.grnItemId,
        return_qty: item.returnQty,
        reason: item.reason || undefined,
      })),
    };
    const response = await axiosInstance.post('/admin/purchase-returns', payload);
    const ret = response.data.data || response.data;
    return transformReturn(ret);
  },
};
