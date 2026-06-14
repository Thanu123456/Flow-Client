import { axiosInstance } from '../api/axiosInstance';
import type {
  CreditSupplier,
  SupplierTransaction,
  CreateSupplierPaymentRequest,
  BalanceFilter,
} from '../../types/entities/supplierCredit.types';

const transformCreditSupplier = (s: any): CreditSupplier => ({
  id: s.id,
  displayName: s.display_name,
  phone: s.phone,
  email: s.email || undefined,
  outstandingBalance: s.outstanding_balance || '0',
  lastTransactionAmount: s.last_transaction_amount || undefined,
  lastTransactionDate: s.last_transaction_date || undefined,
  lastTransactionNote: s.last_transaction_note || undefined,
});

const transformTransaction = (t: any): SupplierTransaction => ({
  id: t.id,
  supplierId: t.supplier_id,
  grnId: t.grn_id || undefined,
  transactionType: t.transaction_type,
  amount: t.amount,
  description: t.description || undefined,
  balanceAfter: t.balance_after,
  transactionDate: t.transaction_date,
  createdAt: t.created_at,
});

export const supplierCreditService = {
  listCreditSuppliers: async (search?: string, balanceType?: BalanceFilter): Promise<CreditSupplier[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (balanceType && balanceType !== 'all') params.balance_type = balanceType;

    const response = await axiosInstance.get('/admin/suppliers/credit', { params });
    const data = response.data.data || [];
    return Array.isArray(data) ? data.map(transformCreditSupplier) : [];
  },

  createPayment: async (supplierId: string, req: CreateSupplierPaymentRequest): Promise<SupplierTransaction> => {
    const response = await axiosInstance.post(`/admin/suppliers/${supplierId}/payments`, {
      amount: req.amount,
      type: req.type,
      description: req.description || undefined,
    });
    return transformTransaction(response.data.data);
  },

  listTransactions: async (supplierId: string, limit = 50): Promise<SupplierTransaction[]> => {
    const response = await axiosInstance.get(`/admin/suppliers/${supplierId}/transactions`, {
      params: { limit },
    });
    const data = response.data.data || [];
    return Array.isArray(data) ? data.map(transformTransaction) : [];
  },
};
