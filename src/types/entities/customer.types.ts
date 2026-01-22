export type CustomerType = 'walk_in' | 'regular' | 'wholesale' | 'vip';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  customerType: CustomerType;
  imageUrl?: string;
  loyaltyPoints: number;
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

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  customerType?: CustomerType;
  imageUrl?: string;
  creditLimit?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  city?: string;
  address?: string;
  customer_type?: CustomerType;
  image_url?: string;
  credit_limit?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateCustomerRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  customer_type?: CustomerType;
  image_url?: string;
  credit_limit?: string;
  notes?: string;
  is_active?: boolean;
}

export interface CustomerFilters {
  search?: string;
  customerType?: CustomerType;
  includeInactive?: boolean;
  sortBy?: 'name' | 'recent_added' | 'total_purchases';
}

export interface CustomerPaginationParams {
  page: number;
  limit: number;
  search?: string;
  customerType?: CustomerType;
  includeInactive?: boolean;
  sortBy?: 'name' | 'recent_added' | 'total_purchases';
}

export interface CustomerResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  type: CustomerType;
}