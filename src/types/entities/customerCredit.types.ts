export interface CreditCustomer {
  id: string;
  displayName: string;
  phone: string;
  email?: string;
  outstandingBalance: string;
  lastTransactionAmount?: string;
  lastTransactionDate?: string;
  lastTransactionNote?: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  saleId?: string;
  transactionType: 'credit' | 'debit';
  amount: string;
  description?: string;
  balanceAfter: string;
  transactionDate: string;
  createdAt: string;
}

export interface CreateCustomerPaymentRequest {
  amount: string;
  type: 'debit' | 'credit';
  description?: string;
}

export type BalanceFilter = 'all' | 'credit' | 'debit';
