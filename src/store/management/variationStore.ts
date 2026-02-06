import { create } from "zustand";
import { variationService } from "../../services/management/variationService";
import type {
  Variation,
  VariationFormData,
  VariationPaginationParams,
} from "../../types/entities/variation.types";

interface VariationState {
  variations: Variation[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  getVariations: (params: VariationPaginationParams) => Promise<void>;
  getAllVariations: () => Promise<Variation[]>;
  getVariationById: (id: string) => Promise<Variation>;
  createVariation: (data: VariationFormData) => Promise<void>;
  updateVariation: (
    id: string,
    data: Partial<VariationFormData>
  ) => Promise<void>;
  deleteVariation: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useVariationStore = create<VariationState>((set) => ({
  variations: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  getVariations: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await variationService.getVariations(params);
      set({
        variations: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch variations",
        loading: false,
      });
    }
  },

  getAllVariations: async () => {
    try {
      const variations = await variationService.getAllVariations();
      set({ variations });
      return variations;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch variations" });
      return [];
    }
  },

  getVariationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const variation = await variationService.getVariationById(id);
      set({ loading: false });
      return variation;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch variation",
        loading: false,
      });
      throw error;
    }
  },

  createVariation: async (data) => {
    set({ loading: true, error: null });
    try {
      await variationService.createVariation(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create variation",
        loading: false,
      });
      throw error;
    }
  },

  updateVariation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await variationService.updateVariation(id, data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update variation",
        loading: false,
      });
      throw error;
    }
  },

  deleteVariation: async (id) => {
    set({ loading: true, error: null });
    try {
      await variationService.deleteVariation(id);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete variation",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
