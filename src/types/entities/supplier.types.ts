export type PaymentTerms = 'cod' | 'net_7' | 'net_15' | 'net_30' | 'net_60' | 'net_90';

export interface Supplier {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  displayName: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms: PaymentTerms;
  imageUrl?: string;
  creditLimit: string;
  outstandingBalance: string;
  notes?: string;
  isActive: boolean;
  totalPurchases: string;
  lastPurchaseDate?: string;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormData {
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: PaymentTerms;
  imageUrl?: string;
  creditLimit?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateSupplierRequest {
  first_name: string;
  last_name: string;
  company_name?: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  tax_number?: string;
  payment_terms?: PaymentTerms;
  image_url?: string;
  credit_limit?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateSupplierRequest {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  tax_number?: string;
  payment_terms?: PaymentTerms;
  image_url?: string;
  credit_limit?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SupplierFilters {
  search?: string;
  includeInactive?: boolean;
  sortBy?: 'name' | 'recent_added' | 'total_purchases';
}

export interface SupplierPaginationParams {
  page: number;
  limit: number;
  search?: string;
  includeInactive?: boolean;
  sortBy?: 'name' | 'recent_added' | 'total_purchases';
}

export interface SupplierResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierSummary {
  id: string;
  displayName: string;
  phone: string;
  email?: string;
}
