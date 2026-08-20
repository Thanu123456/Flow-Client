import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { purchaseReturnService } from "../../services/transactions/purchaseReturnService";
import type {
  PurchaseReturn,
  PurchaseReturnListItem,
  PurchaseReturnListParams,
  CreatePurchaseReturnRequest,
} from "../../types/entities/purchaseReturn.types";

interface PurchaseReturnState {
  returns: PurchaseReturnListItem[];
  selectedReturn: PurchaseReturn | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };

  listReturns: (params: PurchaseReturnListParams) => Promise<void>;
  getReturn: (id: string) => Promise<PurchaseReturn>;
  createReturn: (data: CreatePurchaseReturnRequest) => Promise<PurchaseReturn>;
  setSelectedReturn: (r: PurchaseReturn | null) => void;
  clearError: () => void;
}

export const usePurchaseReturnStore = create<PurchaseReturnState>()(
  devtools(
    (set, get) => ({
      returns: [],
      selectedReturn: null,
      loading: false,
      submitting: false,
      error: null,
      pagination: { total: 0, page: 1, perPage: 10, totalPages: 0 },

      listReturns: async (params) => {
        const hasExisting = get().returns.length > 0;
        set({ loading: !hasExisting, error: null });
        try {
          const response = await purchaseReturnService.listReturns(params);
          set({
            returns: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              perPage: response.perPage,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (err: any) {
          const msg =
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Failed to fetch purchase returns";
          set((s) => ({ ...s, error: msg, loading: false }));
        }
      },

      getReturn: async (id) => {
        const ret = await purchaseReturnService.getReturn(id);
        set({ selectedReturn: ret });
        return ret;
      },

      createReturn: async (data) => {
        set({ submitting: true, error: null });
        try {
          const ret = await purchaseReturnService.createReturn(data);
          set({ submitting: false });
          return ret;
        } catch (err: any) {
          const msg =
            err.response?.data?.error?.message ||
            err.response?.data?.message ||
            "Failed to create purchase return";
          set({ error: msg, submitting: false });
          throw err;
        }
      },

      setSelectedReturn: (r) => set({ selectedReturn: r }),
      clearError: () => set({ error: null }),
    }),
    { name: "purchase-return-store" }
  )
);
