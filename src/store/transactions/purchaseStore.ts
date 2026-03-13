import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { purchaseService } from "../../services/transactions/purchaseService";
import type {
  GRN,
  GRNListItem,
  GRNListParams,
  CreateGRNRequest,
  UpdateGRNRequest,
  AddGRNItemRequest,
  UpdateGRNItemRequest,
  CompleteGRNRequest,
  AddSerialNumbersRequest,
  ProductSearchResult,
} from "../../types/entities/purchase.types";

interface PurchaseState {
  grns: GRNListItem[];
  selectedGRN: GRN | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };

  // Actions
  listGRNs: (params: GRNListParams) => Promise<void>;
  getGRN: (id: string) => Promise<GRN>;
  createGRN: (data: CreateGRNRequest) => Promise<GRN>;
  updateGRN: (id: string, data: UpdateGRNRequest) => Promise<GRN>;
  deleteGRN: (id: string) => Promise<void>;
  addItem: (grnId: string, data: AddGRNItemRequest) => Promise<string>;
  updateItem: (grnId: string, itemId: string, data: UpdateGRNItemRequest) => Promise<void>;
  removeItem: (grnId: string, itemId: string) => Promise<void>;
  completeGRN: (id: string, data: CompleteGRNRequest) => Promise<GRN>;
  cancelGRN: (id: string) => Promise<void>;
  addSerialNumbers: (grnId: string, data: AddSerialNumbersRequest) => Promise<void>;
  searchProducts: (query: string, warehouseId?: string) => Promise<ProductSearchResult[]>;
  setSelectedGRN: (grn: GRN | null) => void;
  clearError: () => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  devtools(
    (set, get) => ({
      grns: [],
      selectedGRN: null,
      loading: false,
      submitting: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      },

      listGRNs: async (params) => {
        // Show spinner only on first load; subsequent fetches keep the table
        // visible so it never goes blank during filter changes or refreshes.
        const hasExisting = get().grns.length > 0;
        set({ loading: !hasExisting, error: null });

        const tryFetch = async (attemptsLeft: number): Promise<void> => {
          try {
            const response = await purchaseService.listGRNs(params);
            // Retry if backend returned 0 items on first load — cold-start can
            // return an empty result with HTTP 200 before the DB is fully warm.
            if (!hasExisting && response.data.length === 0 && attemptsLeft > 0) {
              await new Promise(r => setTimeout(r, 3000));
              return tryFetch(attemptsLeft - 1);
            }
            set({
              grns: response.data,
              pagination: {
                total: response.total,
                page: response.page,
                perPage: response.perPage,
                totalPages: response.totalPages,
              },
              loading: false,
            });
          } catch (err: any) {
            if (!hasExisting && attemptsLeft > 0) {
              // First load failed — keep spinner alive and retry
              await new Promise(r => setTimeout(r, 3000));
              return tryFetch(attemptsLeft - 1);
            }
            // Preserve existing GRNs on error; only surface the error flag
            const errData = err.response?.data;
            const errMsg = errData?.error?.message || errData?.error?.details || errData?.message || "Failed to fetch purchases";
            set(state => ({ ...state, error: errMsg, loading: false }));
          }
        };

        return tryFetch(2);
      },

      getGRN: async (id) => {
        try {
          const grn = await purchaseService.getGRN(id);
          set({ selectedGRN: grn });
          return grn;
        } catch (error: any) {
          throw error;
        }
      },

      createGRN: async (data) => {
        set({ submitting: true, error: null });
        try {
          const grn = await purchaseService.createGRN(data);
          set({ submitting: false });
          return grn;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to create purchase",
            submitting: false,
          });
          throw error;
        }
      },

      updateGRN: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          const grn = await purchaseService.updateGRN(id, data);
          set({ submitting: false });
          return grn;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to update purchase",
            submitting: false,
          });
          throw error;
        }
      },

      deleteGRN: async (id) => {
        set({ submitting: true, error: null });
        try {
          await purchaseService.deleteGRN(id);
          set({ submitting: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to delete purchase",
            submitting: false,
          });
          throw error;
        }
      },

      addItem: async (grnId, data) => {
        try {
          const item = await purchaseService.addItem(grnId, data);
          return item.id;
        } catch (error: any) {
          throw error;
        }
      },

      updateItem: async (grnId, itemId, data) => {
        try {
          await purchaseService.updateItem(grnId, itemId, data);
        } catch (error: any) {
          throw error;
        }
      },

      removeItem: async (grnId, itemId) => {
        try {
          await purchaseService.removeItem(grnId, itemId);
        } catch (error: any) {
          throw error;
        }
      },

      completeGRN: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          const grn = await purchaseService.completeGRN(id, data);
          set({ submitting: false });
          return grn;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to complete purchase",
            submitting: false,
          });
          throw error;
        }
      },

      cancelGRN: async (id) => {
        set({ submitting: true, error: null });
        try {
          await purchaseService.cancelGRN(id);
          set({ submitting: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to cancel purchase",
            submitting: false,
          });
          throw error;
        }
      },

      addSerialNumbers: async (grnId, data) => {
        try {
          await purchaseService.addSerialNumbers(grnId, data);
        } catch (error: any) {
          throw error;
        }
      },

      searchProducts: async (query, warehouseId) => {
        try {
          return await purchaseService.searchProducts(query, warehouseId);
        } catch (error: any) {
          console.error("Failed to search products:", error);
          return [];
        }
      },

      setSelectedGRN: (grn) => set({ selectedGRN: grn }),

      clearError: () => set({ error: null }),
    }),
    { name: "purchase-store" }
  )
);
