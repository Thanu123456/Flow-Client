import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { stockAdjustmentService } from "../../services/inventory/stockAdjustmentService";
import type {
  Adjustment,
  AdjustmentListItem,
  AdjustmentListParams,
  CreateAdjustmentRequest,
} from "../../types/entities/stockAdjustment.types";

interface AdjustmentState {
  adjustments: AdjustmentListItem[];
  selectedAdjustment: Adjustment | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: { page: number; perPage: number; total: number };

  listAdjustments: (params?: AdjustmentListParams) => Promise<void>;
  getAdjustment: (id: string) => Promise<void>;
  createAdjustment: (req: CreateAdjustmentRequest) => Promise<Adjustment>;
  deleteAdjustment: (id: string) => Promise<void>;
  approveAdjustment: (id: string) => Promise<void>;
  rejectAdjustment: (id: string, reason: string) => Promise<void>;
  reverseAdjustment: (id: string, notes?: string) => Promise<Adjustment>;
  clearSelected: () => void;
  clearError: () => void;
}

export const useStockAdjustmentStore = create<AdjustmentState>()(
  devtools(
    (set, get) => ({
      adjustments: [],
      selectedAdjustment: null,
      loading: false,
      submitting: false,
      error: null,
      pagination: { page: 1, perPage: 20, total: 0 },

      listAdjustments: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const result = await stockAdjustmentService.listAdjustments({
            page: get().pagination.page,
            perPage: get().pagination.perPage,
            ...params,
          });
          set({
            adjustments: result.adjustments,
            pagination: {
              ...get().pagination,
              total: result.total,
              page: params.page ?? get().pagination.page,
            },
            loading: false,
          });
        } catch (err: any) {
          set({ error: err?.response?.data?.error?.message ?? "Failed to load adjustments", loading: false });
        }
      },

      getAdjustment: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const adj = await stockAdjustmentService.getAdjustment(id);
          set({ selectedAdjustment: adj, loading: false });
        } catch (err: any) {
          set({ error: err?.response?.data?.error?.message ?? "Failed to load adjustment", loading: false });
        }
      },

      createAdjustment: async (req: CreateAdjustmentRequest) => {
        set({ submitting: true, error: null });
        try {
          const adj = await stockAdjustmentService.createAdjustment(req);
          set({ submitting: false });
          return adj;
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message ?? "Failed to create adjustment";
          set({ submitting: false, error: msg });
          throw new Error(msg);
        }
      },

      deleteAdjustment: async (id: string) => {
        set({ submitting: true, error: null });
        try {
          await stockAdjustmentService.deleteAdjustment(id);
          set((s) => ({
            adjustments: s.adjustments.filter((a) => a.id !== id),
            submitting: false,
            pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
          }));
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message ?? "Failed to delete adjustment";
          set({ submitting: false, error: msg });
          throw new Error(msg);
        }
      },

      approveAdjustment: async (id: string) => {
        set({ submitting: true, error: null });
        try {
          const adj = await stockAdjustmentService.approveAdjustment(id);
          set((s) => ({
            submitting: false,
            selectedAdjustment: s.selectedAdjustment?.id === id ? adj : s.selectedAdjustment,
            adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, status: "posted" } : a)),
          }));
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message ?? "Failed to approve adjustment";
          set({ submitting: false, error: msg });
          throw new Error(msg);
        }
      },

      rejectAdjustment: async (id: string, reason: string) => {
        set({ submitting: true, error: null });
        try {
          await stockAdjustmentService.rejectAdjustment(id, reason);
          set((s) => ({
            submitting: false,
            adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, status: "rejected" } : a)),
          }));
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message ?? "Failed to reject adjustment";
          set({ submitting: false, error: msg });
          throw new Error(msg);
        }
      },

      reverseAdjustment: async (id: string, notes?: string) => {
        set({ submitting: true, error: null });
        try {
          const rev = await stockAdjustmentService.reverseAdjustment(id, notes);
          set({ submitting: false });
          return rev;
        } catch (err: any) {
          const msg = err?.response?.data?.error?.message ?? "Failed to reverse adjustment";
          set({ submitting: false, error: msg });
          throw new Error(msg);
        }
      },

      clearSelected: () => set({ selectedAdjustment: null }),
      clearError: () => set({ error: null }),
    }),
    { name: "stock-adjustment-store" }
  )
);
