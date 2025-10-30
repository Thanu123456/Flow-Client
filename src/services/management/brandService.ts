// src/services/management/brandService.ts
import { axiosInstance } from '../api/axiosInstance';
import type { Brand, BrandFormData, BrandPaginationParams, BrandResponse } from '../../types/entities/brand.types';

export const brandService = {
  // Get all brands with pagination and filters
  getBrands: async (params: BrandPaginationParams): Promise<BrandResponse> => {
    const response = await axiosInstance.get('/api/brands', { params });
    return response.data;
  },

  // Get a single brand by ID
  getBrandById: async (id: string): Promise<Brand> => {
    const response = await axiosInstance.get(`/api/brands/${id}`);
    return response.data;
  },

  // Create a new brand
  createBrand: async (brandData: BrandFormData): Promise<Brand> => {
    const formData = new FormData();
    
    formData.append('name', brandData.name);
    formData.append('status', brandData.status);
    
    if (brandData.description) {
      formData.append('description', brandData.description);
    }
    
    if (brandData.imageUrl) {
      formData.append('image', brandData.imageUrl);
    }
    
    const response = await axiosInstance.post('/api/brands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Update an existing brand
  updateBrand: async (id: string, brandData: Partial<BrandFormData>): Promise<Brand> => {
    const formData = new FormData();
    
    if (brandData.name !== undefined) {
      formData.append('name', brandData.name);
    }
    
    if (brandData.status !== undefined) {
      formData.append('status', brandData.status);
    }
    
    if (brandData.description !== undefined) {
      formData.append('description', brandData.description);
    }
    
    if (brandData.imageUrl !== undefined) {
      formData.append('image', brandData.imageUrl);
    }
    
    const response = await axiosInstance.put(`/api/brands/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Delete a brand
  deleteBrand: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/brands/${id}`);
  },

  // Get product count for a brand
  getBrandProductCount: async (id: string): Promise<number> => {
    const response = await axiosInstance.get(`/api/brands/${id}/product-count`);
    return response.data.count;
  },

  // Export brands to PDF
  exportToPDF: async (params: BrandPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get('/api/brands/export/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export brands to Excel
  exportToExcel: async (params: BrandPaginationParams): Promise<Blob> => {
    const response = await axiosInstance.get('/api/brands/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};