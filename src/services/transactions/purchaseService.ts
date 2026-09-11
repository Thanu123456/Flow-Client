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
  JournalEntry,
  JournalLine,
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
  returnedQty: toNum(item.returned_qty),
  purchaseOrderItemId: item.purchase_order_item_id || undefined,
  lotNumber: item.lot_number || undefined,
  inspectionStatus: item.inspection_status || 'accepted',
  rejectedQty: toNum(item.rejected_qty),
  inspectionNote: item.inspection_note || undefined,
  landedCostPerUnit: toNum(item.landed_cost_per_unit),
  effectiveUnitCost: toNum(item.effective_unit_cost),
  priceWarning: item.price_warning || undefined,
});

const transformCharge = (c: any): import('../../types/entities/purchase.types').GRNCharge => ({
  id: c.id,
  chargeType: c.charge_type,
  amount: toNum(c.amount),
  allocationMethod: c.allocation_method || 'value',
  note: c.note || undefined,
});

const transformAttachment = (a: any): import('../../types/entities/purchase.types').GRNAttachment => ({
  id: a.id,
  fileUrl: a.file_url,
  fileName: a.file_name,
  contentType: a.content_type || undefined,
  createdAt: a.created_at,
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
  purchaseOrderId: g.purchase_order_id || undefined,
  purchaseOrderNumber: g.purchase_order_number || undefined,
  charges: Array.isArray(g.charges) ? g.charges.map(transformCharge) : [],
  totalLandedCost: toNum(g.total_landed_cost),
  attachments: Array.isArray(g.attachments) ? g.attachments.map(transformAttachment) : [],
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
      purchase_order_id: data.purchaseOrderId || undefined,
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
      purchase_order_item_id: data.purchaseOrderItemId || undefined,
      lot_number: data.lotNumber || undefined,
      inspection_status: data.inspectionStatus || undefined,
      rejected_qty: data.rejectedQty || undefined,
      inspection_note: data.inspectionNote || undefined,
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
    if (data.lotNumber !== undefined) payload.lot_number = data.lotNumber;
    if (data.inspectionStatus !== undefined) payload.inspection_status = data.inspectionStatus;
    if (data.rejectedQty !== undefined) payload.rejected_qty = data.rejectedQty;
    if (data.inspectionNote !== undefined) payload.inspection_note = data.inspectionNote;

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

  // Landed-cost charge lines on a GRN
  getCharges: async (grnId: string): Promise<import('../../types/entities/purchase.types').GRNCharge[]> => {
    const response = await axiosInstance.get(`/admin/purchases/${grnId}/charges`);
    const list = response.data.data || response.data || [];
    return (Array.isArray(list) ? list : []).map(transformCharge);
  },

  setCharges: async (
    grnId: string,
    charges: import('../../types/entities/purchase.types').GRNCharge[],
  ): Promise<import('../../types/entities/purchase.types').GRNCharge[]> => {
    const payload = {
      charges: charges.map((c) => ({
        charge_type: c.chargeType,
        amount: c.amount,
        allocation_method: c.allocationMethod,
        note: c.note || undefined,
      })),
    };
    const response = await axiosInstance.put(`/admin/purchases/${grnId}/charges`, payload);
    const list = response.data.data || response.data || [];
    return (Array.isArray(list) ? list : []).map(transformCharge);
  },

  // Document attachments on a GRN (packing slip, supplier invoice scan)
  getAttachments: async (grnId: string): Promise<import('../../types/entities/purchase.types').GRNAttachment[]> => {
    const response = await axiosInstance.get(`/admin/purchases/${grnId}/attachments`);
    const list = response.data.data || response.data || [];
    return (Array.isArray(list) ? list : []).map(transformAttachment);
  },

  addAttachment: async (
    grnId: string,
    data: { fileName: string; contentType?: string; data: string },
  ): Promise<import('../../types/entities/purchase.types').GRNAttachment> => {
    const response = await axiosInstance.post(`/admin/purchases/${grnId}/attachments`, {
      file_name: data.fileName,
      content_type: data.contentType || undefined,
      data: data.data,
    });
    const att = response.data.data || response.data;
    return transformAttachment(att);
  },

  deleteAttachment: async (grnId: string, attachmentId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/purchases/${grnId}/attachments/${attachmentId}`);
  },

  // Record receiving inspection for a saved GRN line
  inspectItem: async (
    grnId: string,
    itemId: string,
    data: { status: 'pending' | 'accepted' | 'rejected'; rejectedQty?: number; note?: string },
  ): Promise<GRNItem> => {
    const response = await axiosInstance.post(`/admin/purchases/${grnId}/items/${itemId}/inspect`, {
      status: data.status,
      rejected_qty: data.rejectedQty,
      note: data.note || undefined,
    });
    const item = response.data.item || response.data.data || response.data;
    return transformGRNItem(item);
  },

  // List the serial numbers of a GRN line still in stock — used to offer
  // choices when composing a purchase return against a serialised item.
  getAvailableSerials: async (grnId: string, itemId: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/admin/purchases/${grnId}/items/${itemId}/available-serials`);
    const data = response.data.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  // Get the GL journal entries raised for a GRN (goods receipt + vendor bill)
  getGRNJournal: async (id: string): Promise<JournalEntry[]> => {
    const response = await axiosInstance.get(`/admin/purchases/${id}/journal`);
    const entries = response.data.data || response.data || [];
    return (Array.isArray(entries) ? entries : []).map((e: any): JournalEntry => ({
      id: e.id,
      entryNumber: e.entry_number,
      entryDate: e.entry_date,
      description: e.description,
      reversesEntryId: e.reverses_entry_id || undefined,
      reversedByEntryId: e.reversed_by_entry_id || undefined,
      createdAt: e.created_at,
      lines: Array.isArray(e.lines)
        ? e.lines.map((l: any): JournalLine => ({
            accountCode: l.account_code,
            accountName: l.account_name,
            debit: toNum(l.debit),
            credit: toNum(l.credit),
          }))
        : [],
    }));
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
