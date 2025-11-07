// src/store/management/brandStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Brand, BrandFormData, BrandFilters, BrandPaginationParams, BrandResponse } from '../../types/entities/brand.types';
import { brandService } from '../../services/management/brandService';

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
  
  // Actions
  fetchBrands: (params: BrandPaginationParams) => Promise<void>;
  fetchBrandById: (id: string) => Promise<void>;
  createBrand: (brandData: BrandFormData) => Promise<Brand>;
  updateBrand: (id: string, brandData: Partial<BrandFormData>) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  setFilters: (filters: BrandFilters) => void;
  clearError: () => void;
  clearCurrentBrand: () => void;
}

export const useBrandStore = create<BrandState>()(
  devtools(
    (set, get) => ({
      brands: [],
      currentBrand: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      filters: {},

      fetchBrands: async (params) => {
        set({ loading: true, error: null });
        
        try {
          const response: BrandResponse = await brandService.getBrands(params);
          set({
            brands: response.data,
            pagination: {
              total: response.total,
              page: response.page,
              limit: response.limit,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch brands',
            loading: false,
          });
        }
      },

      fetchBrandById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const brand = await brandService.getBrandById(id);
          set({ currentBrand: brand, loading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to fetch brand',
            loading: false,
          });
        }
      },

      createBrand: async (brandData) => {
        set({ loading: true, error: null });
        
        try {
          const newBrand = await brandService.createBrand(brandData);
          set(state => ({
            brands: [newBrand, ...state.brands],
            loading: false,
          }));
          return newBrand;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to create brand',
            loading: false,
          });
          throw error;
        }
      },

      updateBrand: async (id, brandData) => {
        set({ loading: true, error: null });
        
        try {
          const updatedBrand = await brandService.updateBrand(id, brandData);
          set(state => ({
            brands: state.brands.map(brand => 
              brand.id === id ? updatedBrand : brand
            ),
            currentBrand: state.currentBrand?.id === id ? updatedBrand : state.currentBrand,
            loading: false,
          }));
          return updatedBrand;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update brand',
            loading: false,
          });
          throw error;
        }
      },

      deleteBrand: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await brandService.deleteBrand(id);
          set(state => ({
            brands: state.brands.filter(brand => brand.id !== id),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete brand',
            loading: false,
          });
          throw error;
        }
      },

      setFilters: (filters) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentBrand: () => {
        set({ currentBrand: null });
      },
    }),
    { name: 'brandStore' }
  )
);