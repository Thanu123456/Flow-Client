export type POStatus =
  | 'draft'
  | 'approved'
  | 'partially_received'
  | 'received'
  | 'closed'
  | 'cancelled';

export interface POItem {
  id: string;
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  unitId?: string;
  unitName?: string;
  unitShortName?: string;
  orderedQty: number;
  receivedQty: number;
  outstandingQty: number;
  unitCost: number;
  lineTotal: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  status: POStatus;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  overReceiptTolerancePct: number;
  orderDate: string;
  expectedDate?: string;
  notes?: string;
  items: POItem[];
  itemCount: number;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface POListItem {
  id: string;
  poNumber: string;
  supplierName?: string;
  warehouseName?: string;
  status: POStatus;
  totalAmount: number;
  itemCount: number;
  orderDate: string;
  expectedDate?: string;
  createdAt: string;
}

export interface POListResponse {
  data: POListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface POListParams {
  page: number;
  perPage: number;
  search?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePOItemRequest {
  productId: string;
  variationId?: string;
  variationType?: string;
  unitId?: string;
  orderedQty: number;
  unitCost: number;
  notes?: string;
}

export interface CreatePORequest {
  supplierId: string;
  warehouseId: string;
  orderDate?: string;
  expectedDate?: string;
  notes?: string;
  discountAmount?: number;
  overReceiptTolerancePct?: number;
  items: CreatePOItemRequest[];
}

export interface UpdatePORequest {
  supplierId?: string;
  warehouseId?: string;
  orderDate?: string;
  expectedDate?: string;
  notes?: string;
  discountAmount?: number;
  overReceiptTolerancePct?: number;
}

export interface AddPOItemRequest {
  productId: string;
  variationId?: string;
  variationType?: string;
  unitId?: string;
  orderedQty: number;
  unitCost: number;
  notes?: string;
}

export interface UpdatePOItemRequest {
  orderedQty?: number;
  unitCost?: number;
  unitId?: string;
  notes?: string;
}

// Local (unsaved) line item used while composing a new PO in the UI
export interface POItemLocal {
  localId: string;
  productId: string;
  productName: string;
  productSKU?: string;
  variationId?: string;
  variationType?: string;
  unitId?: string;
  unitName?: string;
  unitShortName?: string;
  orderedQty: number;
  unitCost: number;
  lineTotal: number;
  notes?: string;
}
