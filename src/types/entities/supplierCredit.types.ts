export interface CreditSupplier {
  id: string;
  displayName: string;
  phone: string;
  email?: string;
  outstandingBalance: string;
  lastTransactionAmount?: string;
  lastTransactionDate?: string;
  lastTransactionNote?: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  grnId?: string;
  transactionType: 'credit' | 'debit';
  amount: string;
  description?: string;
  balanceAfter: string;
  transactionDate: string;
  createdAt: string;
}

export interface CreateSupplierPaymentRequest {
  amount: string;
  type: 'debit' | 'credit';
  description?: string;
}

export type BalanceFilter = 'all' | 'credit' | 'debit';
