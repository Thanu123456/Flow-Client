export interface CartItemHeld {
  id: string;
  productId: string;
  variationId?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  maxStock: number;
}

export interface HeldBill {
  id: string;
  billNumber: string;
  customerId?: string;
  customerName?: string;
  notes: string;
  items: CartItemHeld[];
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  heldAt: string;
  resumedAt?: string;
  status: 'active' | 'resumed' | 'cancelled';
}

export interface SaveHoldItemRequest {
  id: string;
  product_id: string;
  variation_id?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  max_stock: number;
}

export interface SaveHoldRequest {
  notes?: string;
  customer_id?: string;
  items: SaveHoldItemRequest[];
  subtotal: number;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  delivery_charge: number;
  total_amount: number;
}
