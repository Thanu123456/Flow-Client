import { axiosInstance } from "../api/axiosInstance";
import type {
  GRN,
  GRNItem,
  GRNListItem,
  GRNListResponse,
  GRNListParams,
  CreateGRNRequest,
  UpdateGRNRequest,
  AddGRNItemRequest,
  UpdateGRNItemRequest,
  CompleteGRNRequest,
  AddSerialNumbersRequest,
  ProductSearchResult,
  ProductVariationOption,
  SupplierBalance,
} from "../../types/entities/purchase.types";

// --- Transform helpers ---

const toNum = (v: any): number => parseFloat(v || '0') || 0;

const transformGRNItem = (item: any): GRNItem => ({
  id: item.id,
  productId: item.product_id,
  productName: item.product_name || '',
  productSKU: item.product_sku || undefined,
  productBarcode: item.product_barcode || undefined,
  productImage: item.product_image || undefined,
  variationId: item.variation_id || undefined,
  variationType: item.variation_type || undefined,
  categoryName: item.category_name || undefined,
  brandName: item.brand_name || undefined,
  quantity: toNum(item.quantity),
  unitId: item.unit_id || undefined,
  unitName: item.unit_name || undefined,
  unitShortName: item.unit_short_name || undefined,
  costPrice: toNum(item.cost_price),
  retailPrice: toNum(item.retail_price),
  wholesalePrice: toNum(item.wholesale_price),
  ourPrice: toNum(item.our_price),
  netPrice: toNum(item.net_price),
  isNewPrice: item.is_new_price ?? false,
  oldCostPrice: item.old_cost_price != null ? toNum(item.old_cost_price) : undefined,
  oldRetailPrice: item.old_retail_price != null ? toNum(item.old_retail_price) : undefined,
  oldWholesalePrice: item.old_wholesale_price != null ? toNum(item.old_wholesale_price) : undefined,
  oldOurPrice: item.old_our_price != null ? toNum(item.old_our_price) : undefined,
  manufactureDate: item.manufacture_date || undefined,
  expiryDate: item.expiry_date || undefined,
  hasSerialNumbers: item.has_serial_numbers ?? false,
  serialNumbers: item.serial_numbers || undefined,
  currentStock: toNum(item.current_stock),
});

const transformGRN = (g: any): GRN => ({
  id: g.id,
  grnNumber: g.grn_number,
  warehouseId: g.warehouse_id,
  warehouseName: g.warehouse_name || '',
  supplierId: g.supplier_id || undefined,
  supplierName: g.supplier_name || undefined,
  paymentMethod: g.payment_method,
  totalAmount: toNum(g.total_amount),
  discountAmount: toNum(g.discount_amount),
  netAmount: toNum(g.net_amount),
  paidAmount: toNum(g.paid_amount),
  debitBalanceUsed: toNum(g.debit_balance_used),
  creditAmount: toNum(g.credit_amount),
  chequeNumber: g.cheque_number || undefined,
  chequeDate: g.cheque_date || undefined,
  chequeNote: g.cheque_note || undefined,
  pendingChequeAmount: toNum(g.pending_cheque_amount),
  isPostDated: g.is_post_dated ?? false,
  status: g.status,
  notes: g.notes || undefined,
  grnDate: g.grn_date,
  items: Array.isArray(g.items) ? g.items.map(transformGRNItem) : [],
  itemCount: g.item_count || 0,
  totalQuantity: toNum(g.total_quantity),
  createdBy: g.created_by,
  createdByName: g.created_by_name || '',
  approvedBy: g.approved_by || undefined,
  approvedByName: g.approved_by_name || undefined,
  approvedAt: g.approved_at || undefined,
  createdAt: g.created_at,
  updatedAt: g.updated_at,
});

const transformGRNListItem = (g: any): GRNListItem => ({
  id: g.id,
  grnNumber: g.grn_number,
  supplierName: g.supplier_name || undefined,
  warehouseName: g.warehouse_name || '',
  paymentMethod: g.payment_method,
  totalAmount: toNum(g.total_amount),
  netAmount: toNum(g.net_amount),
  status: g.status,
  itemCount: g.item_count || 0,
  grnDate: g.grn_date,
  createdAt: g.created_at,
});

const transformProductSearch = (p: any): ProductSearchResult => ({
  id: p.id,
  name: p.name,
  sku: p.sku || undefined,
  barcode: p.barcode || undefined,
  imageUrl: p.image_url || undefined,
  categoryName: p.category_name || undefined,
  brandName: p.brand_name || undefined,
  productType: p.product_type || 'single',
  variations: Array.isArray(p.variations)
    ? p.variations.map((v: any): ProductVariationOption => ({
        id: v.id,
        type: v.variation_type || v.type || '',
        costPrice: toNum(v.cost_price),
        retailPrice: toNum(v.retail_price),
        wholesalePrice: toNum(v.wholesale_price),
        ourPrice: toNum(v.our_price),
        currentStock: toNum(v.current_stock),
      }))
    : undefined,
  costPrice: toNum(p.cost_price),
  retailPrice: toNum(p.retail_price),
  wholesalePrice: toNum(p.wholesale_price),
  ourPrice: toNum(p.our_price),
  currentStock: toNum(p.current_stock),
  unitId: p.unit_id || undefined,
  unitName: p.unit_name || undefined,
  unitShortName: p.unit_short_name || undefined,
  hasSerialNumbers: p.has_serial_numbers ?? false,
});

// --- Service ---

export const purchaseService = {
  // List GRNs with pagination and filters
  listGRNs: async (params: GRNListParams): Promise<GRNListResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      supplier_id: params.supplierId || undefined,
      warehouse_id: params.warehouseId || undefined,
      payment_method: params.paymentMethod || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
      sort_by: params.sortBy || undefined,
    };

    const response = await axiosInstance.get('/admin/purchases', { params: backendParams });
    const grns = response.data.data || response.data.grns || [];
    const meta = response.data.meta || {};

    return {
      data: Array.isArray(grns) ? grns.map(transformGRNListItem) : [],
      total: meta.total || response.data.total || 0,
      page: meta.page || response.data.page || params.page,
      perPage: meta.per_page || response.data.per_page || params.perPage,
      totalPages: meta.total_pages || response.data.total_pages || 1,
    };
  },

  // Get single GRN with full details
  getGRN: async (id: string): Promise<GRN> => {
    const response = await axiosInstance.get(`/admin/purchases/${id}`);
    const data = response.data.grn || response.data.data || response.data;
    return transformGRN(data);
  },

  // Create a new GRN (draft)
  createGRN: async (data: CreateGRNRequest): Promise<GRN> => {
    const payload = {
      warehouse_id: data.warehouseId,
      supplier_id: data.supplierId || undefined,
      payment_method: data.paymentMethod,
      notes: data.notes || undefined,
      grn_date: data.grnDate || undefined,
    };
    const response = await axiosInstance.post('/admin/purchases', payload);
    const grn = response.data.grn || response.data.data || response.data;
    return transformGRN(grn);
  },

  // Update a draft GRN header
  updateGRN: async (id: string, data: UpdateGRNRequest): Promise<GRN> => {
    const payload: any = {};
    if (data.warehouseId !== undefined) payload.warehouse_id = data.warehouseId;
    if (data.supplierId !== undefined) payload.supplier_id = data.supplierId;
    if (data.paymentMethod !== undefined) payload.payment_method = data.paymentMethod;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.grnDate !== undefined) payload.grn_date = data.grnDate;

    const response = await axiosInstance.put(`/admin/purchases/${id}`, payload);
    const grn = response.data.grn || response.data.data || response.data;
    return transformGRN(grn);
  },

  // Delete a draft GRN
  deleteGRN: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/purchases/${id}`);
  },

  // Add an item to a GRN
  addItem: async (grnId: string, data: AddGRNItemRequest): Promise<GRNItem> => {
    const payload = {
      product_id: data.productId,
      variation_id: data.variationId || undefined,
      variation_type: data.variationType || undefined,
      quantity: data.quantity,
      unit_id: data.unitId || undefined,
      cost_price: data.costPrice,
      retail_price: data.retailPrice || undefined,
      wholesale_price: data.wholesalePrice || undefined,
      our_price: data.ourPrice || undefined,
      manufacture_date: data.manufactureDate || undefined,
      expiry_date: data.expiryDate || undefined,
      has_serial_numbers: data.hasSerialNumbers || undefined,
    };
    const response = await axiosInstance.post(`/admin/purchases/${grnId}/items`, payload);
    const item = response.data.item || response.data.data || response.data;
    return transformGRNItem(item);
  },

  // Update a GRN item
  updateItem: async (grnId: string, itemId: string, data: UpdateGRNItemRequest): Promise<GRNItem> => {
    const payload: any = {};
    if (data.quantity !== undefined) payload.quantity = data.quantity;
    if (data.costPrice !== undefined) payload.cost_price = data.costPrice;
    if (data.retailPrice !== undefined) payload.retail_price = data.retailPrice;
    if (data.wholesalePrice !== undefined) payload.wholesale_price = data.wholesalePrice;
    if (data.ourPrice !== undefined) payload.our_price = data.ourPrice;
    if (data.manufactureDate !== undefined) payload.manufacture_date = data.manufactureDate;
    if (data.expiryDate !== undefined) payload.expiry_date = data.expiryDate;

    const response = await axiosInstance.put(`/admin/purchases/${grnId}/items/${itemId}`, payload);
    const item = response.data.item || response.data.data || response.data;
    return transformGRNItem(item);
  },

  // Remove an item from a GRN
  removeItem: async (grnId: string, itemId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/purchases/${grnId}/items/${itemId}`);
  },

  // Complete the GRN (finalizes stock, payments, etc.)
  completeGRN: async (id: string, data: CompleteGRNRequest): Promise<GRN> => {
    const payload = {
      discount_amount: data.discountAmount || 0,
      paid_amount: data.paidAmount,
      cheque_number: data.chequeNumber || undefined,
      cheque_date: data.chequeDate || undefined,
      cheque_note: data.chequeNote || undefined,
      debit_balance_used: data.debitBalanceUsed || 0,
    };
    const response = await axiosInstance.post(`/admin/purchases/${id}/complete`, payload);
    const grn = response.data.grn || response.data.data || response.data;
    return transformGRN(grn);
  },

  // Cancel a GRN
  cancelGRN: async (id: string): Promise<GRN> => {
    const response = await axiosInstance.post(`/admin/purchases/${id}/cancel`);
    const grn = response.data.grn || response.data.data || response.data;
    return transformGRN(grn);
  },

  // Add serial numbers to a GRN item
  addSerialNumbers: async (grnId: string, data: AddSerialNumbersRequest): Promise<void> => {
    const payload = {
      grn_item_id: data.grnItemId,
      serial_numbers: data.serialNumbers,
    };
    await axiosInstance.post(`/admin/purchases/${grnId}/serial-numbers`, payload);
  },

  // Search products for GRN entry
  searchProducts: async (query: string, warehouseId?: string): Promise<ProductSearchResult[]> => {
    const response = await axiosInstance.get('/admin/products/search', {
      params: {
        q: query,
        warehouse_id: warehouseId || undefined,
        include_variations: true,
        include_stock: true,
      },
    });
    const products = response.data.products || response.data.data || response.data || [];
    return Array.isArray(products) ? products.map(transformProductSearch) : [];
  },

  // Get supplier balance
  getSupplierBalance: async (supplierId: string): Promise<SupplierBalance> => {
    const response = await axiosInstance.get(`/admin/suppliers/${supplierId}/balance`);
    const data = response.data.balance || response.data.data || response.data;
    return {
      supplierId,
      outstandingBalance: toNum(data.outstanding_balance ?? data),
    };
  },

  // Export GRN list to PDF
  exportToPDF: async (params: GRNListParams): Promise<Blob> => {
    const backendParams = {
      page: 1,
      per_page: 1000,
      search: params.search || undefined,
      supplier_id: params.supplierId || undefined,
      warehouse_id: params.warehouseId || undefined,
      payment_method: params.paymentMethod || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
    };
    const response = await axiosInstance.get('/admin/purchases/export/pdf', {
      params: backendParams,
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },

  // Export GRN list to Excel
  exportToExcel: async (params: GRNListParams): Promise<Blob> => {
    const backendParams = {
      page: 1,
      per_page: 1000,
      search: params.search || undefined,
      supplier_id: params.supplierId || undefined,
      warehouse_id: params.warehouseId || undefined,
      payment_method: params.paymentMethod || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
    };
    const response = await axiosInstance.get('/admin/purchases/export/excel', {
      params: backendParams,
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },
};
