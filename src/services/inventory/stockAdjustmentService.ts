import { axiosInstance } from "../api/axiosInstance";
import type {
  Adjustment,
  AdjustmentItem,
  AdjustmentAttachment,
  AdjustmentReason,
  AdjustmentListItem,
  AdjustmentListResponse,
  AdjustmentListParams,
  AdjustmentSettings,
  CreateAdjustmentRequest,
  ExpiredStockItem,
  GLAccount,
  JournalEntry,
  StockLedgerDiscrepancy,
  WriteOffExpiredRequest,
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
  unitCost: toNum(it.unit_cost),
  lineTotal: toNum(it.line_total),
  expiryDate: it.expiry_date || undefined,
  reason: it.reason || undefined,
});

const transformAttachment = (a: any): AdjustmentAttachment => ({
  id: a.id,
  fileUrl: a.file_url,
  fileName: a.file_name,
  contentType: a.content_type || undefined,
  createdAt: a.created_at,
});

export const transformReason = (r: any): AdjustmentReason => ({
  id: r.id,
  code: r.code,
  label: r.label,
  movementScope: r.movement_scope,
  expenseCategoryId: r.expense_category_id || undefined,
  expenseCategoryName: r.expense_category_name || undefined,
  glAccountId: r.gl_account_id || undefined,
  requiresApproval: !!r.requires_approval,
  isActive: !!r.is_active,
  sortOrder: r.sort_order || 0,
  createdAt: r.created_at,
});

const transformJournalEntry = (e: any): JournalEntry => ({
  id: e.id,
  entryNumber: e.entry_number,
  entryDate: e.entry_date,
  description: e.description || "",
  reversesEntryId: e.reverses_entry_id || undefined,
  reversedByEntryId: e.reversed_by_entry_id || undefined,
  lines: Array.isArray(e.lines)
    ? e.lines.map((l: any) => ({
        accountCode: l.account_code || "",
        accountName: l.account_name || "",
        debit: l.debit || "0.00",
        credit: l.credit || "0.00",
      }))
    : [],
  createdAt: e.created_at,
});

const transformAdjustment = (a: any): Adjustment => ({
  id: a.id,
  adjustmentNumber: a.adjustment_number,
  movementType: a.movement_type,
  referenceType: a.reference_type,
  priority: a.priority || undefined,
  reasonCodeId: a.reason_code_id || undefined,
  reasonCode: a.reason_code || undefined,
  reasonLabel: a.reason_label || undefined,
  reason: a.reason || undefined,
  notes: a.notes || undefined,
  totalAmount: toNum(a.total_amount),
  status: a.status,
  sourceType: a.source_type,
  approvedBy: a.approved_by || undefined,
  approvedByName: a.approved_by_name || undefined,
  approvedAt: a.approved_at || undefined,
  rejectionReason: a.rejection_reason || undefined,
  postedAt: a.posted_at || undefined,
  reversesId: a.reverses_adjustment_id || undefined,
  reversedById: a.reversed_by_adjustment_id || undefined,
  createdBy: a.created_by,
  createdByName: a.created_by_name || undefined,
  itemCount: a.item_count || 0,
  items: Array.isArray(a.items) ? a.items.map(transformItem) : [],
  attachments: Array.isArray(a.attachments) ? a.attachments.map(transformAttachment) : [],
  createdAt: a.created_at,
  updatedAt: a.updated_at,
});

const transformListItem = (a: any): AdjustmentListItem => ({
  id: a.id,
  adjustmentNumber: a.adjustment_number,
  movementType: a.movement_type,
  referenceType: a.reference_type,
  priority: a.priority || undefined,
  reasonCode: a.reason_code || undefined,
  reasonLabel: a.reason_label || undefined,
  reason: a.reason || undefined,
  status: a.status,
  sourceType: a.source_type,
  totalAmount: toNum(a.total_amount),
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
        status: params.status || undefined,
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

  async getNextNumber(): Promise<string> {
    const response = await axiosInstance.get("/admin/adjustments/next-number");
    return response.data?.data?.adjustment_number ?? "";
  },

  async listExpiredStock(params: { warehouseId?: string; search?: string } = {}): Promise<ExpiredStockItem[]> {
    const response = await axiosInstance.get("/admin/adjustments/expired-stock", {
      params: {
        warehouse_id: params.warehouseId || undefined,
        search: params.search || undefined,
      },
    });
    const data = response.data?.data ?? [];
    return (Array.isArray(data) ? data : []).map((r: any) => ({
      productId: r.product_id,
      productName: r.product_name || "",
      productSKU: r.product_sku || undefined,
      variationId: r.variation_id || undefined,
      variationType: r.variation_type || undefined,
      warehouseId: r.warehouse_id,
      warehouseName: r.warehouse_name || "",
      unitName: r.unit_name || undefined,
      expiredQty: toNum(r.expired_qty),
      earliestExpiry: r.earliest_expiry,
      batchCount: r.batch_count || 0,
    }));
  },

  async writeOffExpired(req: WriteOffExpiredRequest): Promise<Adjustment> {
    const response = await axiosInstance.post("/admin/adjustments/write-off-expired", req);
    return transformAdjustment(response.data?.data);
  },

  async approveAdjustment(id: string): Promise<Adjustment> {
    const response = await axiosInstance.post(`/admin/adjustments/${id}/approve`);
    return transformAdjustment(response.data?.data);
  },

  async rejectAdjustment(id: string, reason: string): Promise<void> {
    await axiosInstance.post(`/admin/adjustments/${id}/reject`, { reason });
  },

  async reverseAdjustment(id: string, notes?: string): Promise<Adjustment> {
    const response = await axiosInstance.post(`/admin/adjustments/${id}/reverse`, { notes });
    return transformAdjustment(response.data?.data);
  },

  async addAttachment(id: string, file: { file_name: string; content_type?: string; data: string }): Promise<AdjustmentAttachment> {
    const response = await axiosInstance.post(`/admin/adjustments/${id}/attachments`, file);
    return transformAttachment(response.data?.data);
  },

  async deleteAttachment(id: string, attachmentId: string): Promise<void> {
    await axiosInstance.delete(`/admin/adjustments/${id}/attachments/${attachmentId}`);
  },

  async getSettings(): Promise<AdjustmentSettings> {
    const response = await axiosInstance.get("/admin/adjustments/settings");
    const d = response.data?.data ?? {};
    return { approvalThreshold: toNum(d.approval_threshold), glLockBeforeDate: d.gl_lock_before_date || undefined };
  },

  async updateSettings(approvalThreshold: number, glLockBeforeDate?: string | null): Promise<AdjustmentSettings> {
    const body: any = { approval_threshold: approvalThreshold };
    if (glLockBeforeDate !== undefined) body.gl_lock_before_date = glLockBeforeDate ?? "";
    const response = await axiosInstance.put("/admin/adjustments/settings", body);
    const d = response.data?.data ?? {};
    return { approvalThreshold: toNum(d.approval_threshold), glLockBeforeDate: d.gl_lock_before_date || undefined };
  },

  async getJournal(id: string): Promise<JournalEntry[]> {
    const response = await axiosInstance.get(`/admin/adjustments/${id}/journal`);
    const data = response.data?.data ?? [];
    return (Array.isArray(data) ? data : []).map(transformJournalEntry);
  },

  async listGLAccounts(): Promise<GLAccount[]> {
    const response = await axiosInstance.get("/admin/adjustments/gl-accounts");
    const data = response.data?.data ?? [];
    return (Array.isArray(data) ? data : []).map((a: any) => ({ id: a.id, code: a.code, name: a.name, type: a.type }));
  },

  async listReasons(activeOnly = false): Promise<AdjustmentReason[]> {
    const response = await axiosInstance.get("/admin/adjustments/reasons", {
      params: { active: activeOnly ? "true" : undefined },
    });
    const data = response.data?.data ?? [];
    return (Array.isArray(data) ? data : []).map(transformReason);
  },

  async createReason(req: Partial<AdjustmentReason>): Promise<AdjustmentReason> {
    const response = await axiosInstance.post("/admin/adjustments/reasons", {
      code: req.code, label: req.label, movement_scope: req.movementScope,
      expense_category_id: req.expenseCategoryId || undefined,
      gl_account_id: req.glAccountId || undefined,
      requires_approval: !!req.requiresApproval, is_active: req.isActive ?? true,
      sort_order: req.sortOrder ?? 0,
    });
    return transformReason(response.data?.data);
  },

  async updateReason(id: string, req: Partial<AdjustmentReason>): Promise<AdjustmentReason> {
    const response = await axiosInstance.put(`/admin/adjustments/reasons/${id}`, {
      code: req.code, label: req.label, movement_scope: req.movementScope,
      expense_category_id: req.expenseCategoryId || undefined,
      gl_account_id: req.glAccountId || undefined,
      requires_approval: !!req.requiresApproval, is_active: req.isActive ?? true,
      sort_order: req.sortOrder ?? 0,
    });
    return transformReason(response.data?.data);
  },

  async deleteReason(id: string): Promise<void> {
    await axiosInstance.delete(`/admin/adjustments/reasons/${id}`);
  },

  async listExpenseCategories(): Promise<{ id: string; name: string }[]> {
    const response = await axiosInstance.get("/admin/adjustments/expense-categories");
    const data = response.data?.data ?? [];
    return Array.isArray(data) ? data : [];
  },

  async reconcile(warehouseId?: string): Promise<StockLedgerDiscrepancy[]> {
    const response = await axiosInstance.get("/admin/adjustments/reconcile", {
      params: { warehouse_id: warehouseId || undefined },
    });
    const data = response.data?.data ?? [];
    return (Array.isArray(data) ? data : []).map((r: any) => ({
      productId: r.product_id,
      productName: r.product_name || "",
      productSKU: r.product_sku || undefined,
      variationId: r.variation_id || undefined,
      variationType: r.variation_type || undefined,
      warehouseId: r.warehouse_id,
      warehouseName: r.warehouse_name || "",
      unitName: r.unit_name || undefined,
      aggregateQty: toNum(r.aggregate_qty),
      batchQty: toNum(r.batch_qty),
      difference: toNum(r.difference),
    }));
  },
};
