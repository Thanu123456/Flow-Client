import { axiosInstance } from "../api/axiosInstance";
import type {
  Brand,
  BrandFormData,
  BrandPaginationParams,
  BrandResponse,
} from "../../types/entities/brand.types";

// Helper to transform backend brand response to frontend Brand type
const transformBrand = (b: any): Brand => ({
  id: b.id,
  name: b.name,
  description: b.description || undefined,
  imageUrl: b.image_url || undefined,
  status: b.is_active ? "active" : "inactive",
  productCount: b.product_count || 0,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
});

export const brandService = {
  // Get All Brands with pagination
  getBrands: async (params: BrandPaginationParams): Promise<BrandResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status === 'inactive' ? true : undefined,
    };

    const response = await axiosInstance.get('/admin/brands', { params: backendParams });
    const rd = response.data;

    const raw = rd.data ?? rd.brands ?? rd ?? [];
    const brands: Brand[] = Array.isArray(raw) ? raw.map(transformBrand) : [];

    return {
      data:       brands,
      total:      rd.total       ?? rd.meta?.total       ?? brands.length,
      page:       rd.page        ?? rd.meta?.page        ?? params.page,
      limit:      rd.per_page    ?? rd.meta?.per_page    ?? params.limit,
      totalPages: rd.total_pages ?? rd.meta?.total_pages ?? Math.ceil((rd.meta?.total ?? brands.length) / params.limit),
    };
  },

  // Get all brands (no pagination, for dropdowns)
  getAllBrands: async (): Promise<Brand[]> => {
    const response = await axiosInstance.get('/admin/brands/all');
    const raw = response.data.data ?? response.data.brands ?? response.data ?? [];
    return Array.isArray(raw) ? raw.map(transformBrand) : [];
  },


  // Get a specific Brand by ID
  getBrandById: async (id: string): Promise<Brand> => {
    const response = await axiosInstance.get(`/admin/brands/${id}`);
    const brandData = response.data.brand || response.data.data || response.data;
    return transformBrand(brandData);
  },

  // Create a New Brand
  createBrand: async (brandData: BrandFormData): Promise<Brand> => {
    const payload = {
      name: brandData.name,
      description: brandData.description || undefined,
      image_url: brandData.imageUrl || undefined,
      is_active: brandData.status === "active",
    };

    const response = await axiosInstance.post("/admin/brands", payload);
    const createdBrand = response.data.brand || response.data.data || response.data;
    return transformBrand(createdBrand);
  },

  // Update an existing Brand
  updateBrand: async (
    id: string,
    brandData: Partial<BrandFormData>
  ): Promise<Brand> => {
    const payload: any = {};
    if (brandData.name !== undefined) payload.name = brandData.name;
    if (brandData.description !== undefined) payload.description = brandData.description;
    if (brandData.imageUrl !== undefined) payload.image_url = brandData.imageUrl;
    if (brandData.status !== undefined) payload.is_active = brandData.status === "active";

    const response = await axiosInstance.put(`/admin/brands/${id}`, payload);
    const updatedBrand = response.data.brand || response.data.data || response.data;
    return transformBrand(updatedBrand);
  },

  // Delete a Brand
  deleteBrand: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/brands/${id}`);
  },

  // Export brands to PDF
  exportToPDF: async (params: BrandPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/brands/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export brands to Excel
  exportToExcel: async (params: BrandPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.status !== "active",
    };
    const response = await axiosInstance.get("/admin/brands/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
