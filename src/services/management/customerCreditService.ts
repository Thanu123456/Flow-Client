import { axiosInstance } from '../api/axiosInstance';
import type {
  CreditCustomer,
  CustomerTransaction,
  CreateCustomerPaymentRequest,
  BalanceFilter,
} from '../../types/entities/customerCredit.types';

const transformCreditCustomer = (c: any): CreditCustomer => ({
  id: c.id,
  displayName: c.display_name,
  phone: c.phone,
  email: c.email || undefined,
  outstandingBalance: c.outstanding_balance || '0',
  lastTransactionAmount: c.last_transaction_amount || undefined,
  lastTransactionDate: c.last_transaction_date || undefined,
  lastTransactionNote: c.last_transaction_note || undefined,
});

const transformTransaction = (t: any): CustomerTransaction => ({
  id: t.id,
  customerId: t.customer_id,
  saleId: t.sale_id || undefined,
  transactionType: t.transaction_type,
  amount: t.amount,
  description: t.description || undefined,
  balanceAfter: t.balance_after,
  transactionDate: t.transaction_date,
  createdAt: t.created_at,
});

export const customerCreditService = {
  listCreditCustomers: async (search?: string, balanceType?: BalanceFilter): Promise<CreditCustomer[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (balanceType && balanceType !== 'all') params.balance_type = balanceType;

    const response = await axiosInstance.get('/admin/customers/credit', { params });
    const data = response.data.data || [];
    return Array.isArray(data) ? data.map(transformCreditCustomer) : [];
  },

  createPayment: async (customerId: string, req: CreateCustomerPaymentRequest): Promise<CustomerTransaction> => {
    const response = await axiosInstance.post(`/admin/customers/${customerId}/payments`, {
      amount: req.amount,
      type: req.type,
      description: req.description || undefined,
    });
    return transformTransaction(response.data.data);
  },

  listTransactions: async (customerId: string, limit = 50): Promise<CustomerTransaction[]> => {
    const response = await axiosInstance.get(`/admin/customers/${customerId}/transactions`, {
      params: { limit },
    });
    const data = response.data.data || [];
    return Array.isArray(data) ? data.map(transformTransaction) : [];
  },

  getBalance: async (customerId: string): Promise<string> => {
    const response = await axiosInstance.get(`/admin/customers/${customerId}/balance`);
    return response.data.data?.currentBalance || '0';
  },
};
