// Cheque module types — mirrors the desktop POS "Cheques" screen
// (ChequeTable / CreateChequeReturn / ReturnCheques). See memory: expense-module (Phase 2).

export type ChequeStatus = "pending" | "paid" | "returned";
export type ChequeDueState = "paid" | "overdue" | "due_soon" | "upcoming" | "no_date";
export type ChequeSettlementMethod = "cheque" | "cash" | "credit";

export interface ChequeRegisterRow {
  grnId: string;
  grnNumber: string;
  chequeNumber: string;
  chequeDate?: string;
  chequeNote?: string;
  chequeStatus: ChequeStatus;
  clearedAt?: string;
  isPostDated: boolean;
  supplierId?: string;
  supplierName?: string;
  amount: number;
  grnDate: string;
  daysRemaining?: number;
  dueState: ChequeDueState;
}

export interface ChequeSummary {
  pendingCount: number;
  pendingAmount: number;
  paidCount: number;
  paidAmount: number;
  overdueCount: number;
  dueSoonCount: number;
}

export interface ChequeRegisterParams {
  page: number;
  limit: number;
  search?: string;
  status?: "pending" | "paid";
  dueBucket?: "overdue" | "due_soon" | "upcoming";
  from?: string;
  to?: string;
}

export interface ChequeRegisterResult {
  data: ChequeRegisterRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChequeReturn {
  id: string;
  grnId: string;
  grnNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  amount: number;
  note?: string;
  settlementMethod: ChequeSettlementMethod;
  settlementAmount: number;
  newChequeNumber?: string;
  newChequeDate?: string;
  supplierName?: string;
  returnDate: string;
}

export interface ChequeReturnParams {
  page: number;
  limit: number;
  search?: string;
  from?: string;
  to?: string;
}

export interface ChequeReturnResult {
  data: ChequeReturn[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcessChequeReturnPayload {
  settlementMethod: ChequeSettlementMethod;
  settlementAmount?: number;
  newChequeNumber?: string;
  newChequeDate?: string | null;
  newChequeNote?: string;
  note?: string;
}
