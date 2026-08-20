import { axiosInstance } from '../api/axiosInstance';
import type {
  StockListResponse,
  ProductStockDetail,
  StockAnalyticsResponse,
  BatchExportItem,
  BatchExportFilter,
  PeriodFilterParams,
} from '../../types/entities/report.types';

export interface StockListFilter {
  search?: string;
  category_id?: string;
  zero_stock?: boolean;
  threshold?: number;
}

export interface StockAnalyticsFilter extends PeriodFilterParams {
  threshold?: number;
}

const listParams = (filter?: StockListFilter) => ({
  search: filter?.search || undefined,
  category_id: filter?.category_id || undefined,
  zero_stock: filter?.zero_stock ? 'true' : undefined,
  threshold: filter?.threshold || undefined,
});

const analyticsParams = (filter?: StockAnalyticsFilter) => ({
  preset: filter?.preset || undefined,
  year: filter?.year || undefined,
  quarter: filter?.quarter || undefined,
  date_from: filter?.date_from || undefined,
  date_to: filter?.date_to || undefined,
  threshold: filter?.threshold || undefined,
});

const batchParams = (filter?: BatchExportFilter) => ({
  date_filter_type: filter?.date_filter_type || undefined,
  date_from: filter?.date_from || undefined,
  date_to: filter?.date_to || undefined,
  stock_filter: filter?.stock_filter || undefined,
  threshold: filter?.threshold || undefined,
});

export const stockReportService = {
  getStockList: async (filter?: StockListFilter): Promise<StockListResponse> => {
    const response = await axiosInstance.get('/admin/reports/stock', { params: listParams(filter) });
    return response.data.data;
  },

  getProductDetail: async (productId: string): Promise<ProductStockDetail> => {
    const response = await axiosInstance.get(`/admin/reports/stock/products/${productId}`);
    return response.data.data;
  },

  getBatchExport: async (filter?: BatchExportFilter): Promise<BatchExportItem[]> => {
    const response = await axiosInstance.get('/admin/reports/stock/batch-export', { params: batchParams(filter) });
    return response.data.data;
  },

  getAnalytics: async (filter?: StockAnalyticsFilter): Promise<StockAnalyticsResponse> => {
    const response = await axiosInstance.get('/admin/reports/stock/analytics', { params: analyticsParams(filter) });
    return response.data.data;
  },

  exportExcel: async (filter?: StockListFilter & StockAnalyticsFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/stock/export/excel', {
      params: { ...listParams(filter), ...analyticsParams(filter) },
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  exportPdf: async (filter?: StockListFilter & StockAnalyticsFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/stock/export/pdf', {
      params: { ...listParams(filter), ...analyticsParams(filter) },
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },

  exportBatchExcel: async (filter?: BatchExportFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/stock/batch-export/excel', {
      params: batchParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  exportBatchPdf: async (filter?: BatchExportFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/stock/batch-export/pdf', {
      params: batchParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },
};
