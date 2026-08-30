import { axiosInstance } from "../api/axiosInstance";
import type {
  ChequeRegisterParams,
  ChequeRegisterResult,
  ChequeRegisterRow,
  ChequeReturn,
  ChequeReturnParams,
  ChequeReturnResult,
  ChequeSummary,
  ProcessChequeReturnPayload,
} from "../../types/entities/cheque.types";

const toNum = (v: any): number => {
  const n = parseFloat(v ?? "0");
  return Number.isFinite(n) ? n : 0;
};

const transformRow = (r: any): ChequeRegisterRow => ({
  grnId: r.grn_id,
  grnNumber: r.grn_number,
  chequeNumber: r.cheque_number || "",
  chequeDate: r.cheque_date || undefined,
  chequeNote: r.cheque_note || undefined,
  chequeStatus: r.cheque_status,
  clearedAt: r.cleared_at || undefined,
  isPostDated: !!r.is_post_dated,
  supplierId: r.supplier_id || undefined,
  supplierName: r.supplier_name || undefined,
  amount: toNum(r.amount),
  grnDate: r.grn_date,
  daysRemaining: r.days_remaining ?? undefined,
  dueState: r.due_state,
});

const transformReturn = (r: any): ChequeReturn => ({
  id: r.id,
  grnId: r.grn_id,
  grnNumber: r.grn_number || undefined,
  chequeNumber: r.cheque_number || undefined,
  chequeDate: r.cheque_date || undefined,
  amount: toNum(r.amount),
  note: r.note || undefined,
  settlementMethod: r.settlement_method,
  settlementAmount: toNum(r.settlement_amount),
  newChequeNumber: r.new_cheque_number || undefined,
  newChequeDate: r.new_cheque_date || undefined,
  supplierName: r.supplier_name || undefined,
  returnDate: r.return_date,
});

export const chequeService = {
  getRegister: async (params: ChequeRegisterParams): Promise<ChequeRegisterResult> => {
    const response = await axiosInstance.get("/admin/cheques", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        status: params.status || undefined,
        due_bucket: params.dueBucket || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
      },
    });
    const body = response.data.data ?? response.data;
    const raw = body.cheques ?? [];
    const data = Array.isArray(raw) ? raw.map(transformRow) : [];
    return {
      data,
      total: body.total ?? data.length,
      page: body.page ?? params.page,
      limit: body.per_page ?? params.limit,
      totalPages: body.total_pages ?? Math.ceil((body.total ?? data.length) / params.limit),
    };
  },

  getSummary: async (): Promise<ChequeSummary> => {
    const response = await axiosInstance.get("/admin/cheques/summary");
    const d = response.data.data ?? response.data;
    return {
      pendingCount: d.pending_count ?? 0,
      pendingAmount: toNum(d.pending_amount),
      paidCount: d.paid_count ?? 0,
      paidAmount: toNum(d.paid_amount),
      overdueCount: d.overdue_count ?? 0,
      dueSoonCount: d.due_soon_count ?? 0,
    };
  },

  markPaid: async (grnId: string): Promise<void> => {
    await axiosInstance.post(`/admin/cheques/${grnId}/mark-paid`);
  },

  processReturn: async (
    grnId: string,
    payload: ProcessChequeReturnPayload
  ): Promise<ChequeReturn> => {
    const body: any = {
      settlement_method: payload.settlementMethod,
    };
    if (payload.settlementAmount !== undefined)
      body.settlement_amount = String(payload.settlementAmount);
    if (payload.newChequeNumber) body.new_cheque_number = payload.newChequeNumber;
    if (payload.newChequeDate) body.new_cheque_date = payload.newChequeDate;
    if (payload.newChequeNote) body.new_cheque_note = payload.newChequeNote;
    if (payload.note) body.note = payload.note;
    const response = await axiosInstance.post(`/admin/cheques/${grnId}/return`, body);
    return transformReturn(response.data.data ?? response.data);
  },

  getReturns: async (params: ChequeReturnParams): Promise<ChequeReturnResult> => {
    const response = await axiosInstance.get("/admin/cheque-returns", {
      params: {
        page: params.page,
        per_page: params.limit,
        search: params.search || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
      },
    });
    const body = response.data.data ?? response.data;
    const raw = body.returns ?? [];
    const data = Array.isArray(raw) ? raw.map(transformReturn) : [];
    return {
      data,
      total: body.total ?? data.length,
      page: body.page ?? params.page,
      limit: body.per_page ?? params.limit,
      totalPages: body.total_pages ?? Math.ceil((body.total ?? data.length) / params.limit),
    };
  },
};
