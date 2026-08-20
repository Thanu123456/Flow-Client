import { axiosInstance } from '../api/axiosInstance';
import type { ProfitLossResponse, PeriodFilterParams } from '../../types/entities/report.types';

export interface ProfitLossFilter extends PeriodFilterParams {
  payment_method?: string;
  include_bills?: boolean;
}

const toParams = (filter?: ProfitLossFilter) => ({
  preset: filter?.preset || undefined,
  year: filter?.year || undefined,
  quarter: filter?.quarter || undefined,
  date_from: filter?.date_from || undefined,
  date_to: filter?.date_to || undefined,
  payment_method: filter?.payment_method || undefined,
  include_bills: filter?.include_bills ? 'true' : undefined,
});

export const profitLossService = {
  getReport: async (filter?: ProfitLossFilter): Promise<ProfitLossResponse> => {
    const response = await axiosInstance.get('/admin/reports/profit-loss', { params: toParams(filter) });
    return response.data.data;
  },

  exportExcel: async (filter?: ProfitLossFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/profit-loss/export/excel', {
      params: toParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  exportPdf: async (filter?: ProfitLossFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/profit-loss/export/pdf', {
      params: toParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },
};
