export type AdjustmentMovementType = 'in' | 'out';

export type AdjustmentReferenceType =
  | 'purchase'
  | 'sales'
  | 'damage'
  | 'expiry'
  | 'return'
  | 'other';

export type AdjustmentPriority = 'high' | 'low';

export type AdjustmentStatus = 'pending_approval' | 'posted' | 'rejected';
export type AdjustmentSourceType = 'manual' | 'stock_take' | 'expiry_write_off' | 'reversal';

export interface AdjustmentAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  contentType?: string;
  createdAt: string;
}

export interface AdjustmentReason {
  id: string;
  code: string;
  label: string;
  movementScope: 'in' | 'out' | 'both';
  expenseCategoryId?: string;
  expenseCategoryName?: string;
  glAccountId?: string;
  requiresApproval: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  reversesEntryId?: string;
  reversedByEntryId?: string;
  lines: JournalLine[];
  createdAt: string;
}

export interface AdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  warehouseId: string;
  warehouseName: string;
  unitName?: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  expiryDate?: string;
  reason?: string;
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  movementType: AdjustmentMovementType;
  referenceType: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reasonCodeId?: string;
  reasonCode?: string;
  reasonLabel?: string;
  reason?: string;
  notes?: string;
  totalAmount: number;
  status: AdjustmentStatus;
  sourceType: AdjustmentSourceType;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  postedAt?: string;
  reversesId?: string;
  reversedById?: string;
  createdBy: string;
  createdByName?: string;
  itemCount: number;
  items: AdjustmentItem[];
  attachments: AdjustmentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface AdjustmentListItem {
  id: string;
  adjustmentNumber: string;
  movementType: AdjustmentMovementType;
  referenceType: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reasonCode?: string;
  reasonLabel?: string;
  reason?: string;
  status: AdjustmentStatus;
  sourceType: AdjustmentSourceType;
  totalAmount: number;
  createdByName?: string;
  itemCount: number;
  createdAt: string;
}

export interface AdjustmentListResponse {
  adjustments: AdjustmentListItem[];
  total: number;
}

export interface AdjustmentListParams {
  page?: number;
  perPage?: number;
  search?: string;
  movementType?: AdjustmentMovementType | '';
  status?: AdjustmentStatus | '';
  dateFrom?: string;
  dateTo?: string;
}

// ── Form types (local state while building the adjustment) ───────────────────

export interface AdjustmentItemLocal {
  key: string;          // React list key
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  warehouseId: string;
  warehouseName: string;
  unitName?: string;
  currentStock: number;
  quantity: number;
  unitCost?: number;     // optional cost override
  expiryDate?: string;   // "YYYY-MM-DD" – stock-in only
  reason?: string;
}

// ── Request types ─────────────────────────────────────────────────────────────

export interface CreateAdjustmentItemRequest {
  product_id: string;
  warehouse_id: string;
  variation_id?: string;
  quantity: number;
  unit_cost?: number;
  expiry_date?: string;   // "YYYY-MM-DD" – stock-in only
  reason?: string;
}

export interface CreateAdjustmentRequest {
  movement_type: AdjustmentMovementType;
  reference_type: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reason_code_id?: string;
  reason?: string;
  notes?: string;
  items: CreateAdjustmentItemRequest[];
}

// ── Governance ───────────────────────────────────────────────────────────────

export interface AdjustmentSettings {
  approvalThreshold: number;
  glLockBeforeDate?: string;
}

export interface StockLedgerDiscrepancy {
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  warehouseId: string;
  warehouseName: string;
  unitName?: string;
  aggregateQty: number;
  batchQty: number;
  difference: number;
}

// ── Stock take ───────────────────────────────────────────────────────────────

export type StockTakeStatus = 'in_progress' | 'counted' | 'posted' | 'cancelled';

export interface StockTakeItem {
  id: string;
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  unitName?: string;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  unitCost: number;
}

export interface StockTake {
  id: string;
  referenceNumber: string;
  warehouseId: string;
  warehouseName: string;
  categoryId?: string;
  categoryName?: string;
  status: StockTakeStatus;
  notes?: string;
  adjustmentInId?: string;
  adjustmentOutId?: string;
  createdByName?: string;
  itemCount: number;
  countedCount: number;
  items: StockTakeItem[];
  postedAt?: string;
  createdAt: string;
}

export interface StockTakeListItem {
  id: string;
  referenceNumber: string;
  warehouseName: string;
  categoryName?: string;
  status: StockTakeStatus;
  itemCount: number;
  countedCount: number;
  createdByName?: string;
  createdAt: string;
}

// ── Expired-stock write-off ───────────────────────────────────────────────────

export interface ExpiredStockItem {
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  warehouseId: string;
  warehouseName: string;
  unitName?: string;
  expiredQty: number;
  earliestExpiry: string;
  batchCount: number;
}

export interface WriteOffExpiredRequest {
  warehouse_id: string;
  reason?: string;
  notes?: string;
  items: {
    product_id: string;
    variation_id?: string;
    quantity: number;
  }[];
}
