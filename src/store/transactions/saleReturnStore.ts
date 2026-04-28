import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { message } from 'antd';
import { saleReturnService } from '../../services/transactions/saleReturnService';
import type {
  SaleReturn,
  SaleReturnsFilter,
  OriginalSaleDetail,
  ProcessRefundRequest,
} from '../../types/entities/saleReturn.types';

interface SaleReturnState {
  returns: SaleReturn[];
  selectedReturn: SaleReturn | null;
  originalSale: OriginalSaleDetail | null;
  loading: boolean;
  submitting: boolean;
  searching: boolean;

  fetchReturns: (filter?: SaleReturnsFilter) => Promise<void>;
  fetchReturnDetail: (id: string) => Promise<void>;
  findOriginalSale: (invoiceNumber: string) => Promise<boolean>;
  loadOriginalSale: (saleId: string) => Promise<void>;
  processRefund: (data: ProcessRefundRequest) => Promise<string | null>;
  clearOriginalSale: () => void;
  setSelectedReturn: (r: SaleReturn | null) => void;
}

export const useSaleReturnStore = create<SaleReturnState>()(
  devtools(
    (set) => ({
      returns: [],
      selectedReturn: null,
      originalSale: null,
      loading: false,
      submitting: false,
      searching: false,

      fetchReturns: async (filter = {}) => {
        set({ loading: true });
        try {
          const returns = await saleReturnService.listReturns(filter);
          set({ returns });
        } catch {
          message.error('Failed to load sale returns');
        } finally {
          set({ loading: false });
        }
      },

      fetchReturnDetail: async (id) => {
        set({ loading: true });
        try {
          const ret = await saleReturnService.getReturnDetail(id);
          set({ selectedReturn: ret });
        } catch {
          message.error('Failed to load return details');
        } finally {
          set({ loading: false });
        }
      },

      findOriginalSale: async (invoiceNumber) => {
        set({ searching: true, originalSale: null });
        try {
          const sale = await saleReturnService.findSaleByInvoice(invoiceNumber);
          if (!sale) {
            message.warning('No sale found with that invoice number');
            return false;
          }
          if (sale.status === 'refunded') {
            message.warning('This sale has already been refunded');
            return false;
          }
          set({ originalSale: sale });
          return true;
        } catch {
          message.error('Failed to search for sale');
          return false;
        } finally {
          set({ searching: false });
        }
      },

      loadOriginalSale: async (saleId) => {
        set({ searching: true });
        try {
          const sale = await saleReturnService.getOriginalSale(saleId);
          set({ originalSale: sale });
        } catch {
          message.error('Failed to load sale details');
        } finally {
          set({ searching: false });
        }
      },

      processRefund: async (data) => {
        set({ submitting: true });
        try {
          const result = await saleReturnService.processRefund(data);
          message.success(`Refund processed: ${result.invoiceNumber}`);
          return result.id;
        } catch {
          message.error('Failed to process refund');
          return null;
        } finally {
          set({ submitting: false });
        }
      },

      clearOriginalSale: () => set({ originalSale: null }),
      setSelectedReturn: (r) => set({ selectedReturn: r }),
    }),
    { name: 'sale-return-store' }
  )
);
