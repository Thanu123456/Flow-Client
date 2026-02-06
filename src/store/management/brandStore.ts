import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  Brand,
  BrandFormData,
  BrandFilters,
  BrandPaginationParams,
  BrandResponse,
} from "../../types/entities/brand.types";
import { brandService } from "../../services/management/brandService";

// Interface for the Brand

interface BrandState {
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: BrandFilters;

  getBrands: (params: BrandPaginationParams) => Promise<void>;
  getAllBrands: () => Promise<Brand[]>;
  getBrandById: (id: string) => Promise<void>;
  createBrand: (brandData: BrandFormData) => Promise<Brand>;
  updateBrand: (
    id: string,
    brandData: Partial<BrandFormData>
  ) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  setFilters: (filters: BrandFilters) => void;
  clearError: () => void;
  clearCurrentBrand: () => void;
}

export const useBrandStore = create<BrandState>()(
  devtools(
    (set, _get) => ({
      brands: [],
      currentBrand: null,
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      filters: {},

      // Get All Brands

      getBrands: async (params) => {
        set({ loading: true, error: null });
        try {
          const response: BrandResponse = await brandService.getBrands(params);
          set({ brands: response.data, pagination: response, loading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Failed to fetch brands",
            loading: false,
          });
        }
      },

      // Get specific Brand

      getBrandById: async (id) => {
        set({ loading: true, error: null });
        try {
          const brand = await brandService.getBrandById(id);
          set({ currentBrand: brand, loading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Failed to fetch brand",
            loading: false,
          });
        }
      },

      // Get all brands for dropdowns
      getAllBrands: async () => {
        try {
          const brands = await brandService.getAllBrands();
          set({ brands });
          return brands;
        } catch (err: any) {
          set({ error: err.response?.data?.message || "Failed to fetch brands" });
          return [];
        }
      },

      // Create New Brand

      createBrand: async (brandData) => {
        set({ loading: true, error: null });
        try {
          const newBrand = await brandService.createBrand(brandData);
          set((state) => ({
            brands: [newBrand, ...state.brands],
            loading: false,
          }));
          return newBrand;
        } catch (err: any) {
          const message =
            err.response?.data?.message || "Failed to create brand";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      // Update existing Brand

      updateBrand: async (id, brandData) => {
        set({ loading: true, error: null });
        try {
          const updatedBrand = await brandService.updateBrand(id, brandData);
          set((state) => ({
            brands: state.brands.map((b) => (b.id === id ? updatedBrand : b)),
            currentBrand:
              state.currentBrand?.id === id ? updatedBrand : state.currentBrand,
            loading: false,
          }));
          return updatedBrand;
        } catch (err: any) {
          const message =
            err.response?.data?.message || "Failed to update brand";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      // Delete existing Brand

      deleteBrand: async (id) => {
        set({ loading: true, error: null });
        try {
          await brandService.deleteBrand(id);
          set((state) => ({
            brands: state.brands.filter((b) => b.id !== id),
            loading: false,
          }));
        } catch (err: any) {
          const message =
            err.response?.data?.message || "Failed to delete brand";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      setFilters: (filters) => set({ filters }),
      clearError: () => set({ error: null }),
      clearCurrentBrand: () => set({ currentBrand: null }),
    }),
    { name: "brandStore" }
  )
);
