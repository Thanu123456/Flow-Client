export interface SaleProductItem {
  productId: string;
  productType: string;
  productName: string;
  availableStock: number;
}

export interface SaleProductsResponse {
  data: SaleProductItem[];
}

export interface SaleListItem {
  id: string;
  bill_number: string;
  invoice_number: string;
  customer_name: string;
  subtotal: number;
  discount_amount: number;
  delivery_charge: number;
  tax_total: number;
  total_amount: number;
  paid_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  // Accepted by the server with an exception (offline sync, negative stock,
  // stale price, unverifiable approval) and not yet cleared by a manager.
  needs_review?: boolean;
  review_reasons?: string[];
  is_offline?: boolean;
}

export interface SaleItemDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
  tax_rate?: number;
  tax_amount?: number;
}

export interface SaleDetailItem extends SaleListItem {
  items: SaleItemDetail[];
}

export interface SalesListFilter {
  search?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  needs_review?: boolean;
}
