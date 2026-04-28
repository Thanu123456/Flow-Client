import { axiosInstance } from '../api/axiosInstance';
import type { HeldBill, SaveHoldRequest } from '../../types/entities/holdBill.types';

const toNum = (v: any) => parseFloat(v || '0');

const transformItem = (raw: any) => ({
  id: raw.id,
  productId: raw.product_id,
  variationId: raw.variation_id,
  name: raw.name,
  unit: raw.unit,
  quantity: toNum(raw.quantity),
  price: toNum(raw.price),
  maxStock: raw.max_stock ?? 0,
});

const transform = (raw: any): HeldBill => ({
  id: raw.id,
  billNumber: raw.bill_number,
  customerId: raw.customer_id,
  customerName: raw.customer_name,
  notes: raw.notes || '',
  items: Array.isArray(raw.items) ? raw.items.map(transformItem) : [],
  subtotal: toNum(raw.subtotal),
  discountType: raw.discount_type || 'fixed',
  discountValue: toNum(raw.discount_value),
  discountAmount: toNum(raw.discount_amount),
  deliveryCharge: toNum(raw.delivery_charge),
  totalAmount: toNum(raw.total_amount),
  heldAt: raw.held_at,
  resumedAt: raw.resumed_at,
  status: raw.status,
});

export const holdService = {
  async getHeldBills(status = 'active'): Promise<HeldBill[]> {
    const res = await axiosInstance.get('/admin/pos/holds', { params: { status } });
    return (res.data.data || []).map(transform);
  },

  async saveHold(data: SaveHoldRequest): Promise<{ holdId: string }> {
    const res = await axiosInstance.post('/admin/pos/hold', data);
    return { holdId: res.data.hold_id };
  },

  async resumeHold(holdId: string): Promise<HeldBill> {
    const res = await axiosInstance.post(`/admin/pos/holds/${holdId}/resume`);
    return transform(res.data.data);
  },

  async deleteHold(holdId: string): Promise<void> {
    await axiosInstance.delete(`/admin/pos/holds/${holdId}`);
  },
};
