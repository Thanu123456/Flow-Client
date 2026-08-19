import { axiosInstance } from '../api/axiosInstance';
import type {
  PurchaseReportListResponse,
  PurchaseReportAnalyticsResponse,
  PeriodFilterParams,
} from '../../types/entities/report.types';

export interface PurchaseReportFilter extends PeriodFilterParams {
  search?: string;
}

const periodParams = (filter?: PeriodFilterParams) => ({
  preset: filter?.preset || undefined,
  year: filter?.year || undefined,
  quarter: filter?.quarter || undefined,
  date_from: filter?.date_from || undefined,
  date_to: filter?.date_to || undefined,
});

export const purchaseReportService = {
  getList: async (filter?: PurchaseReportFilter): Promise<PurchaseReportListResponse> => {
    const response = await axiosInstance.get('/admin/reports/purchases', {
      params: { search: filter?.search || undefined, ...periodParams(filter) },
    });
    return response.data.data;
  },

  getAnalytics: async (filter?: PeriodFilterParams): Promise<PurchaseReportAnalyticsResponse> => {
    const response = await axiosInstance.get('/admin/reports/purchases/analytics', { params: periodParams(filter) });
    return response.data.data;
  },

  exportExcel: async (filter?: PurchaseReportFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/purchases/export/excel', {
      params: { search: filter?.search || undefined, ...periodParams(filter) },
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  exportPdf: async (filter?: PurchaseReportFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/purchases/export/pdf', {
      params: { search: filter?.search || undefined, ...periodParams(filter) },
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },
};
