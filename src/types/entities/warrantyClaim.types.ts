import type { WarrantyPeriod, WarrantyType } from "./warranty.types";

export type RegistrationState = "active" | "expired" | "lifetime" | "voided";

export interface WarrantyRegistration {
  id: string;
  saleId: string;
  saleItemId: string;
  invoiceNumber: string;
  productId: string;
  productName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  quantity: number;
  warrantyName: string;
  warrantyType: WarrantyType;
  duration: number;
  period: WarrantyPeriod;
  terms?: string;
  exclusions?: string;
  startDate: string;
  /** undefined = lifetime */
  expiryDate?: string;
  serialNumber?: string;
  serialVerified: boolean;
  grnId?: string;
  grnNumber?: string;
  supplierId?: string;
  supplierName?: string;
  status: "active" | "voided";
  state: RegistrationState;
  daysLeft?: number;
  claimCount: number;
  createdAt: string;
}

export type ClaimStatus = "open" | "approved" | "in_repair" | "resolved" | "rejected" | "cancelled";
export type ClaimResolution = "repaired" | "replaced" | "refunded" | "credited" | "no_fault";
export type SupplierClaimStatus = "none" | "submitted" | "accepted" | "rejected" | "credited";

export interface ClaimEvent {
  id: string;
  eventType: "created" | "status_changed" | "supplier_updated" | string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  userName?: string;
  createdAt: string;
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  registrationId: string;
  issueDescription: string;
  inWarranty: boolean;
  status: ClaimStatus;
  resolution?: ClaimResolution;
  resolutionNotes?: string;
  resolvedAt?: string;
  supplierId?: string;
  supplierName?: string;
  supplierClaimStatus: SupplierClaimStatus;
  supplierClaimRef?: string;
  supplierClaimDate?: string;
  supplierCreditAmount: number;
  supplierNotes?: string;
  invoiceNumber: string;
  productName: string;
  serialNumber?: string;
  customerName?: string;
  customerPhone?: string;
  warrantyName: string;
  expiryDate?: string;
  grnNumber?: string;
  createdAt: string;
  updatedAt: string;
  events?: ClaimEvent[];
}

export interface ClaimStats {
  open: number;
  inRepair: number;
  awaitingSupplier: number;
  expiringSoon: number;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
