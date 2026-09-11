import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { purchaseOrderService } from "../../services/transactions/purchaseOrderService";
import type {
  PurchaseOrder,
  POListItem,
  POListParams,
  CreatePORequest,
  UpdatePORequest,
  AddPOItemRequest,
  UpdatePOItemRequest,
} from "../../types/entities/purchaseOrder.types";

interface PurchaseOrderState {
  purchaseOrders: POListItem[];
  selectedPO: PurchaseOrder | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };

  listPOs: (params: POListParams) => Promise<void>;
  getPO: (id: string) => Promise<PurchaseOrder>;
  createPO: (data: CreatePORequest) => Promise<PurchaseOrder>;
  updatePO: (id: string, data: UpdatePORequest) => Promise<PurchaseOrder>;
  deletePO: (id: string) => Promise<void>;
  addItem: (poId: string, data: AddPOItemRequest) => Promise<PurchaseOrder>;
  updateItem: (poId: string, itemId: string, data: UpdatePOItemRequest) => Promise<PurchaseOrder>;
  removeItem: (poId: string, itemId: string) => Promise<PurchaseOrder>;
  approvePO: (id: string) => Promise<PurchaseOrder>;
  cancelPO: (id: string) => Promise<PurchaseOrder>;
  closePO: (id: string) => Promise<PurchaseOrder>;
  setSelectedPO: (po: PurchaseOrder | null) => void;
  clearError: () => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
  devtools(
    (set, get) => ({
      purchaseOrders: [],
      selectedPO: null,
      loading: false,
      submitting: false,
      error: null,
      pagination: { total: 0, page: 1, perPage: 10, totalPages: 0 },

      listPOs: async (params) => {
        const hasExisting = get().purchaseOrders.length > 0;
        set({ loading: !hasExisting, error: null });
        try {
          const response = await purchaseOrderService.list(params);
          set({
            purchaseOrders: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              perPage: response.perPage,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (err: any) {
          const errData = err.response?.data;
          const errMsg = errData?.error?.message || errData?.error?.details || errData?.message || "Failed to fetch purchase orders";
          set({ error: errMsg, loading: false });
        }
      },

      getPO: async (id) => {
        const po = await purchaseOrderService.get(id);
        set({ selectedPO: po });
        return po;
      },

      createPO: async (data) => {
        set({ submitting: true, error: null });
        try {
          const po = await purchaseOrderService.create(data);
          set({ submitting: false });
          return po;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to create purchase order", submitting: false });
          throw error;
        }
      },

      updatePO: async (id, data) => {
        set({ submitting: true, error: null });
        try {
          const po = await purchaseOrderService.update(id, data);
          set({ submitting: false });
          return po;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to update purchase order", submitting: false });
          throw error;
        }
      },

      deletePO: async (id) => {
        set({ submitting: true, error: null });
        try {
          await purchaseOrderService.delete(id);
          set({ submitting: false });
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to delete purchase order", submitting: false });
          throw error;
        }
      },

      addItem: async (poId, data) => purchaseOrderService.addItem(poId, data),
      updateItem: async (poId, itemId, data) => purchaseOrderService.updateItem(poId, itemId, data),
      removeItem: async (poId, itemId) => purchaseOrderService.removeItem(poId, itemId),

      approvePO: async (id) => {
        set({ submitting: true, error: null });
        try {
          const po = await purchaseOrderService.approve(id);
          set({ submitting: false });
          return po;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to approve purchase order", submitting: false });
          throw error;
        }
      },

      cancelPO: async (id) => {
        set({ submitting: true, error: null });
        try {
          const po = await purchaseOrderService.cancel(id);
          set({ submitting: false });
          return po;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to cancel purchase order", submitting: false });
          throw error;
        }
      },

      closePO: async (id) => {
        set({ submitting: true, error: null });
        try {
          const po = await purchaseOrderService.close(id);
          set({ submitting: false });
          return po;
        } catch (error: any) {
          set({ error: error.response?.data?.message || "Failed to close purchase order", submitting: false });
          throw error;
        }
      },

      setSelectedPO: (po) => set({ selectedPO: po }),
      clearError: () => set({ error: null }),
    }),
    { name: "purchase-order-store" }
  )
);
