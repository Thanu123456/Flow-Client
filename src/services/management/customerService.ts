import { axiosInstance } from "../api/axiosInstance";
import type {
  Customer,
  CustomerFormData,
  CustomerPaginationParams,
  CustomerResponse,
  CustomerSummary,
} from "../../types/entities/customer.types";

// Helper to transform backend customer response to frontend Customer type
const transformCustomer = (c: any): Customer => ({
  id: c.id,
  firstName: c.first_name,
  lastName: c.last_name,
  fullName: c.full_name,
  email: c.email || undefined,
  phone: c.phone,
  city: c.city || undefined,
  address: c.address || undefined,
  customerType: c.customer_type || 'walk_in',
  imageUrl: c.image_url || undefined,
  loyaltyPoints: c.loyalty_points || 0,
  creditLimit: c.credit_limit || '0.00',
  outstandingBalance: c.outstanding_balance || '0.00',
  notes: c.notes || undefined,
  isActive: c.is_active ?? true,
  totalPurchases: c.total_purchases || '0.00',
  lastPurchaseDate: c.last_purchase_date || undefined,
  purchaseCount: c.purchase_count || 0,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

// Helper to transform customer summary
const transformCustomerSummary = (c: any): CustomerSummary => ({
  id: c.id,
  fullName: c.full_name,
  phone: c.phone,
  email: c.email || undefined,
  type: c.customer_type || 'walk_in',
});

export const customerService = {
  // Get all customers with pagination
  getCustomers: async (params: CustomerPaginationParams): Promise<CustomerResponse> => {
    const backendParams: any = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      customer_type: params.customerType || undefined,
      include_inactive: params.includeInactive || undefined,
      sort_by: params.sortBy || undefined,
    };

    const response = await axiosInstance.get("/admin/customers", { params: backendParams });

    const customersData = response.data.customers || response.data.data || response.data || [];
    const customers: Customer[] = Array.isArray(customersData)
      ? customersData.map(transformCustomer)
      : [];

    return {
      data: customers,
      total: response.data.total || customers.length,
      page: response.data.page || params.page,
      limit: response.data.per_page || params.limit,
      totalPages: response.data.total_pages || Math.ceil((response.data.total || customers.length) / params.limit),
    };
  },

  // Get customer by ID
  getCustomerById: async (id: string): Promise<Customer> => {
    const response = await axiosInstance.get(`/admin/customers/${id}`);
    const customerData = response.data.customer || response.data.data || response.data;
    return transformCustomer(customerData);
  },

  // Create customer
  createCustomer: async (data: CustomerFormData): Promise<Customer> => {
    const payload: any = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || undefined,
      phone: data.phone,
      city: data.city || undefined,
      address: data.address || undefined,
      customer_type: data.customerType || undefined,
      image_url: data.imageUrl || undefined,
      credit_limit: data.creditLimit || undefined,
      notes: data.notes || undefined,
      is_active: data.isActive,
    };

    const response = await axiosInstance.post("/admin/customers", payload);
    const createdCustomer = response.data.customer || response.data.data || response.data;
    return transformCustomer(createdCustomer);
  },

  // Update customer
  updateCustomer: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    const payload: any = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined) payload.last_name = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.city !== undefined) payload.city = data.city;
    if (data.address !== undefined) payload.address = data.address;
    if (data.customerType !== undefined) payload.customer_type = data.customerType;
    if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;
    if (data.creditLimit !== undefined) payload.credit_limit = data.creditLimit;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await axiosInstance.put(`/admin/customers/${id}`, payload);
    const updatedCustomer = response.data.customer || response.data.data || response.data;
    return transformCustomer(updatedCustomer);
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/customers/${id}`);
  },

  // Get all active customers (for dropdowns)
  getAllCustomers: async (): Promise<CustomerSummary[]> => {
    const response = await axiosInstance.get("/admin/customers/all");
    const customersData = response.data.customers || response.data.data || response.data || [];
    return Array.isArray(customersData) ? customersData.map(transformCustomerSummary) : [];
  },

  // Search customers (for autocomplete)
  searchCustomers: async (query: string): Promise<CustomerSummary[]> => {
    const response = await axiosInstance.get("/admin/customers/search", {
      params: { q: query },
    });
    const customersData = response.data.customers || response.data.data || response.data || [];
    return Array.isArray(customersData) ? customersData.map(transformCustomerSummary) : [];
  },

  // Export customers to PDF
  exportToPDF: async (params: CustomerPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      customer_type: params.customerType || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/customers/export/pdf", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], { type: "application/pdf" });
  },

  // Export customers to Excel
  exportToExcel: async (params: CustomerPaginationParams): Promise<Blob> => {
    const backendParams = {
      page: params.page,
      per_page: params.limit,
      search: params.search || undefined,
      customer_type: params.customerType || undefined,
      include_inactive: params.includeInactive || undefined,
    };
    const response = await axiosInstance.get("/admin/customers/export/excel", {
      params: backendParams,
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
