import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { chequeService } from "../../services/transactions/chequeService";
import type {
  ChequeRegisterParams,
  ChequeRegisterRow,
  ChequeReturn,
  ChequeReturnParams,
  ChequeSummary,
  ProcessChequeReturnPayload,
} from "../../types/entities/cheque.types";

interface ChequeState {
  cheques: ChequeRegisterRow[];
  returns: ChequeReturn[];
  summary: ChequeSummary | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; totalPages: number };
  returnsPagination: { total: number; page: number; limit: number; totalPages: number };

  getRegister: (params: ChequeRegisterParams) => Promise<void>;
  getSummary: () => Promise<void>;
  getReturns: (params: ChequeReturnParams) => Promise<void>;
  markPaid: (grnId: string) => Promise<void>;
  processReturn: (grnId: string, payload: ProcessChequeReturnPayload) => Promise<void>;
  clearError: () => void;
}

const errMsg = (e: any, fallback: string) =>
  e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;

const emptyPage = { total: 0, page: 1, limit: 10, totalPages: 0 };

export const useChequeStore = create<ChequeState>()(
  devtools(
    (set) => ({
      cheques: [],
      returns: [],
      summary: null,
      loading: false,
      submitting: false,
      error: null,
      pagination: { ...emptyPage },
      returnsPagination: { ...emptyPage },

      getRegister: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await chequeService.getRegister(params);
          set({
            cheques: res.data,
            pagination: {
              total: res.total,
              page: res.page || params.page || 1,
              limit: res.limit || params.limit || 10,
              totalPages: res.totalPages || 1,
            },
            loading: false,
          });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to load cheques"), loading: false });
        }
      },

      getSummary: async () => {
        try {
          set({ summary: await chequeService.getSummary() });
        } catch {
          /* non-fatal */
        }
      },

      getReturns: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await chequeService.getReturns(params);
          set({
            returns: res.data,
            returnsPagination: {
              total: res.total,
              page: res.page || params.page || 1,
              limit: res.limit || params.limit || 10,
              totalPages: res.totalPages || 1,
            },
            loading: false,
          });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to load cheque returns"), loading: false });
        }
      },

      markPaid: async (grnId) => {
        set({ submitting: true, error: null });
        try {
          await chequeService.markPaid(grnId);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to mark cheque cleared"), submitting: false });
          throw e;
        }
      },

      processReturn: async (grnId, payload) => {
        set({ submitting: true, error: null });
        try {
          await chequeService.processReturn(grnId, payload);
          set({ submitting: false });
        } catch (e: any) {
          set({ error: errMsg(e, "Failed to process cheque return"), submitting: false });
          throw e;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "cheque-store" }
  )
);
