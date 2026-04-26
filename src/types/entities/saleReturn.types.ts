// Refund record from GET /admin/sale-returns
export interface SaleReturn {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  totalAmount: number;    // absolute value (stored negative, displayed positive)
  paidAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  subtotal: number;
  status: 'refunded';
  reason?: string;
  note?: string;
  items: SaleReturnItem[];
  createdAt: string;
}

export interface SaleReturnItem {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationType?: string;
  unit?: string;
  quantity: number;       // absolute value
  price: number;          // absolute value
}

// Original sale loaded to populate the refund form
export interface OriginalSaleDetail {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  deliveryCharge: number;
  status: string;
  createdAt: string;
  items: OriginalSaleItem[];
}

export interface OriginalSaleItem {
  id: string;
  productId: string;
  productName: string;
  variationId?: string;
  variationType?: string;
  unit?: string;
  quantity: number;
  price: number;
  /** How many units can still be returned (original qty minus already-returned qty) */
  availableQty: number;
}

// Sent to POST /admin/pos/return
export interface ProcessRefundRequest {
  invoice_number?: string;
  original_sale_id?: string;
  customer_id?: string;
  payment_method: string;
  total_amount: number;
  paid_amount: number;
  reason?: string;
  note?: string;
  refund_delivery_charge?: boolean;
  products: {
    product_id: string;
    variation_id?: string;
    quantity: number;
    price: number;
  }[];
}

export interface SaleReturnsFilter {
  search?: string;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}
