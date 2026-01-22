import { axiosInstance } from "../api/axiosInstance";
import type {
  Supplier,
  SupplierFormData,
  SupplierPaginationParams,
  SupplierResponse,
  SupplierSummary,
} from "../../types/entities/supplier.types";

// Helper to transform backend supplier response to frontend Supplier type
const transformSupplier = (s: any): Supplier => ({
  id: s.id,
  firstName: s.first_name,
  lastName: s.last_name,
  fullName: s.full_name,
  companyName: s.company_name || undefined,
  displayName: s.display_name || s.company_name || s.full_name,
  email: s.email || undefined,
  phone: s.phone,
  city: s.city || undefined,
  address: s.address || undefined,
  taxNumber: s.tax_number || undefined,
  paymentTerms: s.payment_terms || 'cod',
  imageUrl: s.image_url || undefined,
  creditLimit: s.credit_limit || '0.00',
  outstandingBalance: s.outstanding_balance || '0.00',
  notes: s.notes || undefined,
  isActive: s.is_active ?? true,
  totalPurchases: s.total_purchases || '0.00',
  lastPurchaseDate: s.last_purchase_date || undefined,
  purchaseCount: s.purchase_count || 0,
  createdAt: s.created_at,
  updatedAt: s.updated_at,
});

// Helper to transform supplier summary
const transformSupplierSummary = (s: any): SupplierSummary => ({
  id: s.id,
  displayName: s.display_name || s.company_name || s.full_name,
  phone: s.phone,
  email: s.email || undefined,
});

export const supplierService = {
  // Get all suppliers with pagination
  getSuppliers: async (params: SupplierPaginationParams): Promise<SupplierResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
      sort_by: params.sortBy || undefined,
    };

    const response = await axiosInstance.get("/admin/suppliers", { params: backendParams });

    const suppliersData = response.data.suppliers || response.data.data || response.data || [];
    const suppliers: Supplier[] = Array.isArray(suppliersData)
      ? suppliersData.map(transformSupplier)
      : [];

    return {
      data: suppliers,
      total: response.data.total || suppliers.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || suppliers.length) / params.limit),
    };
  },

  // Get supplier by ID
  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await axiosInstance.get(`/admin/suppliers/${id}`);
    const supplierData = response.data.supplier || response.data.data || response.data;
    return transformSupplier(supplierData);
  },

  // Create supplier
  createSupplier: async (data: SupplierFormData): Promise<Supplier> => {
    const payload: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      company_name: data.companyName || undefined,
      email: data.email || undefined,
      phone: data.phone,
      city: data.city || undefined,
      address: data.address || undefined,
      tax_number: data.taxNumber || undefined,
      payment_terms: data.paymentTerms || undefined,
      image_url: data.imageUrl || undefined,
      credit_limit: data.creditLimit || undefined,
      notes: data.notes || undefined,
      is_active: data.isActive,
    };

    const response = await axiosInstance.post("/admin/suppliers", payload);
    const createdSupplier = response.data.supplier || response.data.data || response.data;
    return transformSupplier(createdSupplier);
  },

  // Update supplier
  updateSupplier: async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    const payload: any = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.companyName !== undefined) payload.company_name = data.companyName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.city !== undefined) payload.city = data.city;
    if (data.address !== undefined) payload.address = data.address;
    if (data.taxNumber !== undefined) payload.tax_number = data.taxNumber;
    if (data.paymentTerms !== undefined) payload.payment_terms = data.paymentTerms;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.creditLimit !== undefined) payload.credit_limit = data.creditLimit;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await axiosInstance.put(`/admin/suppliers/${id}`, payload);
    const updatedSupplier = response.data.supplier || response.data.data || response.data;
    return transformSupplier(updatedSupplier);
  },

  // Delete supplier
  deleteSupplier: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/suppliers/${id}`);
  },

  // Get all active suppliers (for dropdowns)
  getAllSuppliers: async (): Promise<SupplierSummary[]> => {
    const response = await axiosInstance.get("/admin/suppliers/all");
    const suppliersData = response.data.suppliers || response.data.data || response.data || [];
    return Array.isArray(suppliersData) ? suppliersData.map(transformSupplierSummary) : [];
  },

  // Search suppliers (for autocomplete)
  searchSuppliers: async (query: string): Promise<SupplierSummary[]> => {
    const response = await axiosInstance.get("/admin/suppliers/search", {
      params: { q: query },
    });
    const suppliersData = response.data.suppliers || response.data.data || response.data || [];
    return Array.isArray(suppliersData) ? suppliersData.map(transformSupplierSummary) : [];
  },

  // Export suppliers to PDF
  exportToPDF: async (params: SupplierPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/suppliers/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export suppliers to Excel
  exportToExcel: async (params: SupplierPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/suppliers/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
