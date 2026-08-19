import { axiosInstance } from '../api/axiosInstance';
import type { TopSellingProductResponse, TopSellingFilter } from '../../types/entities/report.types';

const toParams = (filter?: TopSellingFilter) => ({
  preset: filter?.preset || undefined,
  year: filter?.year || undefined,
  quarter: filter?.quarter || undefined,
  date_from: filter?.date_from || undefined,
  date_to: filter?.date_to || undefined,
  payment_method: filter?.payment_method || undefined,
  limit: filter?.limit || undefined,
  offset: filter?.offset || undefined,
});

export const topSellingService = {
  getReport: async (filter?: TopSellingFilter): Promise<TopSellingProductResponse> => {
    const response = await axiosInstance.get('/admin/reports/top-selling', { params: toParams(filter) });
    return response.data.data;
  },

  exportExcel: async (filter?: TopSellingFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/top-selling/export/excel', {
      params: toParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  },

  exportPdf: async (filter?: TopSellingFilter): Promise<Blob> => {
    const response = await axiosInstance.get('/admin/reports/top-selling/export/pdf', {
      params: toParams(filter),
      responseType: 'arraybuffer',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },
};
