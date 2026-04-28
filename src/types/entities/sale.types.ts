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
  total_amount: number;
  paid_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface SaleItemDetail {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface SaleDetailItem extends SaleListItem {
  items: SaleItemDetail[];
}

export interface SalesListFilter {
  search?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}
