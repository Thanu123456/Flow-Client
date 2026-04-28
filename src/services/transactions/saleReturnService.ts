import { axiosInstance } from '../api/axiosInstance';
import type {
  SaleReturn,
  SaleReturnsFilter,
  OriginalSaleDetail,
  ProcessRefundRequest,
} from '../../types/entities/saleReturn.types';

const transformReturn = (raw: any): SaleReturn => ({
  id: raw.id,
  invoiceNumber: raw.invoice_number,
  customerId: raw.customer_id ?? undefined,
  customerName: raw.customer_name,
  paymentMethod: raw.payment_method,
  totalAmount: Math.abs(parseFloat(raw.total_amount ?? '0')),
  paidAmount: Math.abs(parseFloat(raw.paid_amount ?? '0')),
  discountAmount: Math.abs(parseFloat(raw.discount_amount ?? '0')),
  deliveryCharge: Math.abs(parseFloat(raw.delivery_charge ?? '0')),
  subtotal: Math.abs(parseFloat(raw.subtotal ?? '0')),
  status: 'refunded',
  reason: raw.reason ?? undefined,
  note: raw.note ?? undefined,
  items: (raw.items ?? []).map((item: any) => ({
    id: item.id,
    productId: item.product_id ?? item.id,
    productName: item.name ?? item.product_name ?? '',
    variationId: item.variation_id ?? undefined,
    variationType: item.variation_type ?? undefined,
    unit: item.unit ?? undefined,
    quantity: Math.abs(parseFloat(item.quantity ?? '0')),
    price: Math.abs(parseFloat(item.price ?? '0')),
  })),
  createdAt: raw.created_at,
});

const transformOriginalSale = (raw: any): OriginalSaleDetail => ({
  id: raw.id,
  invoiceNumber: raw.invoice_number,
  customerId: raw.customer_id ?? undefined,
  customerName: raw.customer_name,
  paymentMethod: raw.payment_method,
  totalAmount: parseFloat(raw.total_amount ?? '0'),
  paidAmount: parseFloat(raw.paid_amount ?? '0'),
  deliveryCharge: parseFloat(raw.delivery_charge ?? '0'),
  status: raw.status,
  createdAt: raw.created_at,
  items: (raw.items ?? []).map((item: any) => ({
    id: item.id,
    productId: item.product_id ?? item.id,
    productName: item.name ?? item.product_name ?? '',
    variationId: item.variation_id ?? undefined,
    variationType: item.variation_type ?? item.variation_name ?? undefined,
    unit: item.unit ?? item.unit_name ?? item.unit_short_name ?? undefined,
    quantity: parseFloat(item.quantity ?? '0'),
    price: parseFloat(item.price ?? '0'),
    availableQty: parseFloat(item.available_qty ?? item.quantity ?? '0'),
  })),
});

export const saleReturnService = {
  async listReturns(filter: SaleReturnsFilter = {}): Promise<SaleReturn[]> {
    const params = new URLSearchParams();
    if (filter.search)         params.set('search',         filter.search);
    if (filter.payment_method) params.set('payment_method', filter.payment_method);
    if (filter.date_from)      params.set('date_from',      filter.date_from);
    if (filter.date_to)        params.set('date_to',        filter.date_to);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await axiosInstance.get(`/admin/sale-returns${query}`);
    return (res.data.data ?? []).map(transformReturn);
  },

  async getReturnDetail(id: string): Promise<SaleReturn> {
    const res = await axiosInstance.get(`/admin/sale-returns/${id}`);
    return transformReturn(res.data.data ?? res.data);
  },

  async getOriginalSale(saleId: string): Promise<OriginalSaleDetail> {
    const res = await axiosInstance.get(`/admin/sales/${saleId}`);
    return transformOriginalSale(res.data.data ?? res.data);
  },

  async findSaleByInvoice(invoiceNumber: string): Promise<OriginalSaleDetail | null> {
    const params = new URLSearchParams({ search: invoiceNumber });
    const res = await axiosInstance.get(`/admin/sales?${params.toString()}`);
    const items: any[] = res.data.data ?? [];
    if (!items.length) return null;
    return saleReturnService.getOriginalSale(items[0].id);
  },

  async processRefund(data: ProcessRefundRequest): Promise<{ id: string; invoiceNumber: string }> {
    const res = await axiosInstance.post('/admin/pos/return', data);
    const sale = res.data.sale;
    return { id: sale.id, invoiceNumber: sale.invoice_number };
  },
};
