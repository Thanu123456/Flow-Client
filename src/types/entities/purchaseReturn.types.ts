export type PurchaseReturnStatus = 'pending_approval' | 'completed' | 'rejected' | 'voided';

export interface PurchaseReturnItem {
  id: string;
  grnItemId: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationType?: string;
  returnQty: number;
  costPrice: number;
  totalAmount: number;
  reason?: string;
  serialNumbers?: string[];
}

export interface PurchaseReturnAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  contentType?: string;
  createdAt: string;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  debitNoteNumber?: string;
  originalGrnId: string;
  originalGrnNumber: string;
  vendorBillNumber?: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  totalReturnAmount: number;
  notes?: string;
  status: PurchaseReturnStatus;
  returnDate: string;
  createdByName: string;
  createdAt: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  voidedByName?: string;
  voidedAt?: string;
  voidReason?: string;
  items: PurchaseReturnItem[];
  attachments?: PurchaseReturnAttachment[];
}

export interface PurchaseReturnListItem {
  id: string;
  returnNumber: string;
  debitNoteNumber?: string;
  originalGrnNumber: string;
  supplierName: string;
  warehouseName: string;
  totalReturnAmount: number;
  status: PurchaseReturnStatus;
  returnDate: string;
  createdAt: string;
}

export interface PurchaseReturnListResponse {
  data: PurchaseReturnListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CreatePurchaseReturnItemRequest {
  grnItemId: string;
  returnQty: number;
  reason?: string;
  // Required, with an exact count match to returnQty, when the underlying
  // GRN item is serialised.
  serialNumbers?: string[];
}

export interface CreatePurchaseReturnRequest {
  originalGrnId: string;
  notes?: string;
  items: CreatePurchaseReturnItemRequest[];
}

export interface PurchaseReturnListParams {
  page: number;
  perPage: number;
  search?: string;
  supplierId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PurchaseReturnSettings {
  approvalThreshold: number;
}
