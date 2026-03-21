import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SaleProductItem } from "../../types/entities/sale.types";
import { saleService } from "../../services/transactions/saleService";

interface SaleState {
  products: SaleProductItem[];
  loading: boolean;
  error: string | null;

  getProducts: () => Promise<void>;
  clearError: () => void;
}

export const useSaleStore = create<SaleState>()(
  devtools(
    (set, get) => ({
      products: [],
      loading: false,
      error: null,

      getProducts: async () => {
        const hasExisting = get().products.length > 0;
        set({ loading: !hasExisting, error: null });
        try {
          const response = await saleService.getProducts();
          set({ products: response.data, loading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Failed to fetch products",
            loading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "saleStore" }
  )
);
