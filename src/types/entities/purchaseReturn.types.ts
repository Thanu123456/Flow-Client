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
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  originalGrnId: string;
  originalGrnNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  totalReturnAmount: number;
  notes?: string;
  status: string;
  returnDate: string;
  createdByName: string;
  createdAt: string;
  items: PurchaseReturnItem[];
}

export interface PurchaseReturnListItem {
  id: string;
  returnNumber: string;
  originalGrnNumber: string;
  supplierName: string;
  warehouseName: string;
  totalReturnAmount: number;
  status: string;
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
  dateFrom?: string;
  dateTo?: string;
}
