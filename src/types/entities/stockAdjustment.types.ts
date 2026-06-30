export type AdjustmentMovementType = 'in' | 'out';

export type AdjustmentReferenceType =
  | 'purchase'
  | 'sales'
  | 'damage'
  | 'expiry'
  | 'return'
  | 'other';

export type AdjustmentPriority = 'high' | 'low';

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
  reason?: string;
}

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  movementType: AdjustmentMovementType;
  referenceType: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reason?: string;
  notes?: string;
  createdBy: string;
  createdByName?: string;
  itemCount: number;
  items: AdjustmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdjustmentListItem {
  id: string;
  adjustmentNumber: string;
  movementType: AdjustmentMovementType;
  referenceType: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reason?: string;
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
  reason?: string;
}

// ── Request types ─────────────────────────────────────────────────────────────

export interface CreateAdjustmentItemRequest {
  product_id: string;
  warehouse_id: string;
  variation_id?: string;
  quantity: number;
  reason?: string;
}

export interface CreateAdjustmentRequest {
  movement_type: AdjustmentMovementType;
  reference_type: AdjustmentReferenceType;
  priority?: AdjustmentPriority;
  reason?: string;
  notes?: string;
  items: CreateAdjustmentItemRequest[];
}
