import { axiosInstance } from "../api/axiosInstance";
import type {
  PurchaseOrder,
  POItem,
  POListItem,
  POListResponse,
  POListParams,
  CreatePORequest,
  UpdatePORequest,
  AddPOItemRequest,
  UpdatePOItemRequest,
} from "../../types/entities/purchaseOrder.types";

const toNum = (v: any): number => parseFloat(v || '0') || 0;

const transformPOItem = (i: any): POItem => ({
  id: i.id,
  productId: i.product_id,
  productName: i.product_name || '',
  productSKU: i.product_sku || undefined,
  variationId: i.variation_id || undefined,
  variationType: i.variation_type || undefined,
  unitId: i.unit_id || undefined,
  unitName: i.unit_name || undefined,
  unitShortName: i.unit_short_name || undefined,
  orderedQty: toNum(i.ordered_qty),
  receivedQty: toNum(i.received_qty),
  outstandingQty: toNum(i.outstanding_qty),
  unitCost: toNum(i.unit_cost),
  lineTotal: toNum(i.line_total),
  notes: i.notes || undefined,
});

const transformPO = (p: any): PurchaseOrder => ({
  id: p.id,
  poNumber: p.po_number,
  supplierId: p.supplier_id,
  supplierName: p.supplier_name || undefined,
  warehouseId: p.warehouse_id,
  warehouseName: p.warehouse_name || undefined,
  status: p.status,
  subtotal: toNum(p.subtotal),
  discountAmount: toNum(p.discount_amount),
  totalAmount: toNum(p.total_amount),
  overReceiptTolerancePct: toNum(p.over_receipt_tolerance_pct),
  orderDate: p.order_date,
  expectedDate: p.expected_date || undefined,
  notes: p.notes || undefined,
  items: Array.isArray(p.items) ? p.items.map(transformPOItem) : [],
  itemCount: p.item_count || 0,
  createdBy: p.created_by,
  createdByName: p.created_by_name || undefined,
  approvedBy: p.approved_by || undefined,
  approvedAt: p.approved_at || undefined,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const transformPOListItem = (p: any): POListItem => ({
  id: p.id,
  poNumber: p.po_number,
  supplierName: p.supplier_name || undefined,
  warehouseName: p.warehouse_name || undefined,
  status: p.status,
  totalAmount: toNum(p.total_amount),
  itemCount: p.item_count || 0,
  orderDate: p.order_date,
  expectedDate: p.expected_date || undefined,
  createdAt: p.created_at,
});

export const purchaseOrderService = {
  list: async (params: POListParams): Promise<POListResponse> => {
    const response = await axiosInstance.get('/admin/purchase-orders', {
      params: {
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
        supplier_id: params.supplierId || undefined,
        warehouse_id: params.warehouseId || undefined,
        status: params.status || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
      },
    });
    const data = response.data.data || response.data;
    const pos = data.purchase_orders || data.data || [];
    return {
      data: Array.isArray(pos) ? pos.map(transformPOListItem) : [],
      total: data.total || 0,
      page: data.page || params.page,
      perPage: data.per_page || params.perPage,
      totalPages: data.total_pages || 1,
    };
  },

  get: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.get(`/admin/purchase-orders/${id}`);
    const data = response.data.data || response.data;
    return transformPO(data);
  },

  create: async (data: CreatePORequest): Promise<PurchaseOrder> => {
    const payload = {
      supplier_id: data.supplierId,
      warehouse_id: data.warehouseId,
      order_date: data.orderDate || undefined,
      expected_date: data.expectedDate || undefined,
      notes: data.notes || undefined,
      discount_amount: data.discountAmount || 0,
      over_receipt_tolerance_pct: data.overReceiptTolerancePct || 0,
      items: data.items.map((i) => ({
        product_id: i.productId,
        variation_id: i.variationId || undefined,
        variation_type: i.variationType || undefined,
        unit_id: i.unitId || undefined,
        ordered_qty: i.orderedQty,
        unit_cost: i.unitCost,
        notes: i.notes || undefined,
      })),
    };
    const response = await axiosInstance.post('/admin/purchase-orders', payload);
    return transformPO(response.data.data || response.data);
  },

  update: async (id: string, data: UpdatePORequest): Promise<PurchaseOrder> => {
    const payload: any = {};
    if (data.supplierId !== undefined) payload.supplier_id = data.supplierId;
    if (data.warehouseId !== undefined) payload.warehouse_id = data.warehouseId;
    if (data.orderDate !== undefined) payload.order_date = data.orderDate;
    if (data.expectedDate !== undefined) payload.expected_date = data.expectedDate;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.discountAmount !== undefined) payload.discount_amount = data.discountAmount;
    if (data.overReceiptTolerancePct !== undefined) payload.over_receipt_tolerance_pct = data.overReceiptTolerancePct;
    const response = await axiosInstance.put(`/admin/purchase-orders/${id}`, payload);
    return transformPO(response.data.data || response.data);
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/purchase-orders/${id}`);
  },

  addItem: async (poId: string, data: AddPOItemRequest): Promise<PurchaseOrder> => {
    const payload = {
      product_id: data.productId,
      variation_id: data.variationId || undefined,
      variation_type: data.variationType || undefined,
      unit_id: data.unitId || undefined,
      ordered_qty: data.orderedQty,
      unit_cost: data.unitCost,
      notes: data.notes || undefined,
    };
    const response = await axiosInstance.post(`/admin/purchase-orders/${poId}/items`, payload);
    return transformPO(response.data.data || response.data);
  },

  updateItem: async (poId: string, itemId: string, data: UpdatePOItemRequest): Promise<PurchaseOrder> => {
    const payload: any = {};
    if (data.orderedQty !== undefined) payload.ordered_qty = data.orderedQty;
    if (data.unitCost !== undefined) payload.unit_cost = data.unitCost;
    if (data.unitId !== undefined) payload.unit_id = data.unitId;
    if (data.notes !== undefined) payload.notes = data.notes;
    const response = await axiosInstance.put(`/admin/purchase-orders/${poId}/items/${itemId}`, payload);
    return transformPO(response.data.data || response.data);
  },

  removeItem: async (poId: string, itemId: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.delete(`/admin/purchase-orders/${poId}/items/${itemId}`);
    return transformPO(response.data.data || response.data);
  },

  approve: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post(`/admin/purchase-orders/${id}/approve`);
    return transformPO(response.data.data || response.data);
  },

  cancel: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post(`/admin/purchase-orders/${id}/cancel`);
    return transformPO(response.data.data || response.data);
  },

  close: async (id: string): Promise<PurchaseOrder> => {
    const response = await axiosInstance.post(`/admin/purchase-orders/${id}/close`);
    return transformPO(response.data.data || response.data);
  },
};
