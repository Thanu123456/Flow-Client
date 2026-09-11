export type PaymentMethod = 'cash' | 'cheque' | 'credit';
export type GRNStatus = 'draft' | 'completed' | 'cancelled';
export type InspectionStatus = 'pending' | 'accepted' | 'rejected';
export type ChargeType = 'freight' | 'duty' | 'insurance' | 'handling' | 'other';
export type ChargeAllocation = 'value' | 'quantity';

export interface GRNCharge {
  id?: string;
  chargeType: ChargeType;
  amount: number;
  allocationMethod: ChargeAllocation;
  note?: string;
}

export interface GRNAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  contentType?: string;
  createdAt: string;
}

export interface GRNItem {
  id: string;
  productId: string;
  productName: string;
  productSKU?: string;
  productBarcode?: string;
  productImage?: string;
  variationId?: string;
  variationType?: string;
  categoryName?: string;
  brandName?: string;
  quantity: number;
  unitId?: string;
  unitName?: string;
  unitShortName?: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  ourPrice: number;
  netPrice: number;
  isNewPrice: boolean;
  oldCostPrice?: number;
  oldRetailPrice?: number;
  oldWholesalePrice?: number;
  oldOurPrice?: number;
  manufactureDate?: string;
  expiryDate?: string;
  hasSerialNumbers: boolean;
  serialNumbers?: string[];
  currentStock: number;
  returnedQty: number;
  purchaseOrderItemId?: string;
  lotNumber?: string;
  inspectionStatus: InspectionStatus;
  rejectedQty: number;
  inspectionNote?: string;
  landedCostPerUnit: number;
  effectiveUnitCost: number;
  // Non-blocking note returned only from addItem when the entered cost
  // deviates too far from the product's current cost. Not persisted.
  priceWarning?: string;
}

export interface GRN {
  id: string;
  grnNumber: string;
  warehouseId: string;
  warehouseName: string;
  supplierId?: string;
  supplierName?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  debitBalanceUsed: number;
  creditAmount: number;
  chequeNumber?: string;
  chequeDate?: string;
  chequeNote?: string;
  pendingChequeAmount: number;
  isPostDated: boolean;
  status: GRNStatus;
  notes?: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  charges?: GRNCharge[];
  totalLandedCost: number;
  attachments?: GRNAttachment[];
  grnDate: string;
  items: GRNItem[];
  itemCount: number;
  totalQuantity: number;
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GRNListItem {
  id: string;
  grnNumber: string;
  supplierName?: string;
  warehouseName: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  netAmount: number;
  status: GRNStatus;
  itemCount: number;
  grnDate: string;
  createdAt: string;
}

export interface GRNListResponse {
  data: GRNListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface CreateGRNRequest {
  warehouseId: string;
  supplierId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  grnDate?: string;
  purchaseOrderId?: string;
}

export interface UpdateGRNRequest {
  warehouseId?: string;
  supplierId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  grnDate?: string;
}

export interface AddGRNItemRequest {
  productId: string;
  variationId?: string;
  variationType?: string;
  quantity: number;
  unitId?: string;
  costPrice: number;
  retailPrice?: number;
  wholesalePrice?: number;
  ourPrice?: number;
  manufactureDate?: string;
  expiryDate?: string;
  hasSerialNumbers?: boolean;
  purchaseOrderItemId?: string;
  lotNumber?: string;
  inspectionStatus?: InspectionStatus;
  rejectedQty?: number;
  inspectionNote?: string;
}

export interface UpdateGRNItemRequest {
  quantity?: number;
  costPrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  ourPrice?: number;
  manufactureDate?: string;
  expiryDate?: string;
  lotNumber?: string;
  inspectionStatus?: InspectionStatus;
  rejectedQty?: number;
  inspectionNote?: string;
}

export interface CompleteGRNRequest {
  discountAmount?: number;
  paidAmount: number;
  chequeNumber?: string;
  chequeDate?: string;
  chequeNote?: string;
  debitBalanceUsed?: number;
}

export interface AddSerialNumbersRequest {
  grnItemId: string;
  serialNumbers: string[];
}

export interface GRNListParams {
  page: number;
  perPage: number;
  search?: string;
  supplierId?: string;
  warehouseId?: string;
  paymentMethod?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
}

// Product search result for GRN item selection
export interface ProductSearchResult {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  categoryName?: string;
  brandName?: string;
  productType: 'single' | 'variable';
  variations?: ProductVariationOption[];
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  ourPrice: number;
  currentStock: number;
  unitId?: string;
  unitName?: string;
  unitShortName?: string;
  hasSerialNumbers: boolean;
}

export interface ProductVariationOption {
  id: string;
  type: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  ourPrice: number;
  currentStock: number;
}

// Local item state used in the Add GRN form (before saving to backend)
export interface GRNItemLocal {
  localId: string;
  backendId?: string;
  isNew: boolean;
  isModified: boolean;
  isDeleted: boolean;

  productId: string;
  productName: string;
  productSKU?: string;
  productImage?: string;
  variationId?: string;
  variationType?: string;
  quantity: number;
  unitId?: string;
  unitName?: string;
  unitShortName?: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  ourPrice: number;
  netPrice: number;
  manufactureDate?: string;
  expiryDate?: string;
  hasSerialNumbers: boolean;
  serialNumbers: string[];
  currentStock: number;
  purchaseOrderItemId?: string;
  lotNumber?: string;
  inspectionStatus?: InspectionStatus;
  rejectedQty?: number;
  inspectionNote?: string;
}

export interface SupplierBalance {
  supplierId: string;
  outstandingBalance: number;
}

// Journal (GL) entry raised for a GRN / vendor bill
export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
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
