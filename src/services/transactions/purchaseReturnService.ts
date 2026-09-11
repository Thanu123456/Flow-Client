import { axiosInstance } from "../api/axiosInstance";
import type {
  PurchaseReturn,
  PurchaseReturnItem,
  PurchaseReturnAttachment,
  PurchaseReturnListItem,
  PurchaseReturnListResponse,
  PurchaseReturnListParams,
  CreatePurchaseReturnRequest,
  PurchaseReturnSettings,
} from "../../types/entities/purchaseReturn.types";
import type { JournalEntry, JournalLine } from "../../types/entities/purchase.types";

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
  serialNumbers: Array.isArray(i.serial_numbers) ? i.serial_numbers : undefined,
});

const transformAttachment = (a: any): PurchaseReturnAttachment => ({
  id: a.id,
  fileUrl: a.file_url,
  fileName: a.file_name,
  contentType: a.content_type || undefined,
  createdAt: a.created_at,
});

const transformReturn = (r: any): PurchaseReturn => ({
  id: r.id,
  returnNumber: r.return_number,
  debitNoteNumber: r.debit_note_number || undefined,
  originalGrnId: r.original_grn_id,
  originalGrnNumber: r.original_grn_number || '',
  vendorBillNumber: r.vendor_bill_number || undefined,
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
  approvedByName: r.approved_by_name || undefined,
  approvedAt: r.approved_at || undefined,
  rejectedByName: r.rejected_by_name || undefined,
  rejectedAt: r.rejected_at || undefined,
  rejectionReason: r.rejection_reason || undefined,
  voidedByName: r.voided_by_name || undefined,
  voidedAt: r.voided_at || undefined,
  voidReason: r.void_reason || undefined,
  items: Array.isArray(r.items) ? r.items.map(transformItem) : [],
  attachments: Array.isArray(r.attachments) ? r.attachments.map(transformAttachment) : [],
});

const transformListItem = (r: any): PurchaseReturnListItem => ({
  id: r.id,
  returnNumber: r.return_number,
  debitNoteNumber: r.debit_note_number || undefined,
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
        status: params.status || undefined,
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
        serial_numbers: item.serialNumbers && item.serialNumbers.length > 0 ? item.serialNumbers : undefined,
      })),
    };
    const response = await axiosInstance.post('/admin/purchase-returns', payload);
    const ret = response.data.data || response.data;
    return transformReturn(ret);
  },

  approveReturn: async (id: string): Promise<PurchaseReturn> => {
    const response = await axiosInstance.post(`/admin/purchase-returns/${id}/approve`);
    const ret = response.data.data || response.data;
    return transformReturn(ret);
  },

  rejectReturn: async (id: string, reason?: string): Promise<void> => {
    await axiosInstance.post(`/admin/purchase-returns/${id}/reject`, { reason: reason || undefined });
  },

  voidReturn: async (id: string, reason: string): Promise<void> => {
    await axiosInstance.post(`/admin/purchase-returns/${id}/void`, { reason });
  },

  // Get the GL journal entry raised for a purchase return
  getReturnJournal: async (id: string): Promise<JournalEntry[]> => {
    const response = await axiosInstance.get(`/admin/purchase-returns/${id}/journal`);
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

  listAttachments: async (id: string): Promise<PurchaseReturnAttachment[]> => {
    const response = await axiosInstance.get(`/admin/purchase-returns/${id}/attachments`);
    const data = response.data.data || response.data || [];
    return (Array.isArray(data) ? data : []).map(transformAttachment);
  },

  addAttachment: async (
    id: string,
    data: { fileName: string; contentType?: string; data: string },
  ): Promise<PurchaseReturnAttachment> => {
    const response = await axiosInstance.post(`/admin/purchase-returns/${id}/attachments`, {
      file_name: data.fileName,
      content_type: data.contentType || undefined,
      data: data.data,
    });
    const att = response.data.data || response.data;
    return transformAttachment(att);
  },

  deleteAttachment: async (id: string, attachmentId: string): Promise<void> => {
    await axiosInstance.delete(`/admin/purchase-returns/${id}/attachments/${attachmentId}`);
  },

  getSettings: async (): Promise<PurchaseReturnSettings> => {
    const response = await axiosInstance.get('/admin/purchase-returns/settings');
    const data = response.data.data || response.data;
    return { approvalThreshold: toNum(data.approval_threshold) };
  },

  updateSettings: async (approvalThreshold: number): Promise<PurchaseReturnSettings> => {
    const response = await axiosInstance.put('/admin/purchase-returns/settings', {
      approval_threshold: approvalThreshold,
    });
    const data = response.data.data || response.data;
    return { approvalThreshold: toNum(data.approval_threshold) };
  },
};
