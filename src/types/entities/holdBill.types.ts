export interface CartItemHeld {
  id: string;
  productId?: string;       // absent for a misc/"unknown item" line
  variationId?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  maxStock: number;
  isMisc?: boolean;
  // A cashier's price override survives hold → resume; it's still approved
  // only at checkout, like any other override.
  priceOverrideReason?: string;
  catalogPrice?: number;
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
  product_id?: string;
  variation_id?: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  max_stock: number;
  is_misc?: boolean;
  price_override_reason?: string;
  catalog_price?: number;
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
