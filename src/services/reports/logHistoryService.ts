import { axiosInstance } from '../api/axiosInstance';
import type {
  LogHistorySessionListResponse,
  LogHistoryAnalyticsResponse,
  LogHistoryReceipt,
  PeriodFilterParams,
} from '../../types/entities/report.types';

export interface LogHistorySessionFilter {
  search?: string;
  date?: string;
}

export const logHistoryService = {
  getSessionList: async (filter?: LogHistorySessionFilter): Promise<LogHistorySessionListResponse> => {
    const response = await axiosInstance.get('/admin/reports/log-history', {
      params: {
        search: filter?.search || undefined,
        date: filter?.date || undefined,
      },
    });
    return response.data.data;
  },

  getAnalytics: async (filter?: PeriodFilterParams): Promise<LogHistoryAnalyticsResponse> => {
    const response = await axiosInstance.get('/admin/reports/log-history/analytics', {
      params: {
        preset: filter?.preset || undefined,
        year: filter?.year || undefined,
        quarter: filter?.quarter || undefined,
        date_from: filter?.date_from || undefined,
        date_to: filter?.date_to || undefined,
      },
    });
    return response.data.data;
  },

  getReceipt: async (sessionId: string): Promise<LogHistoryReceipt> => {
    const response = await axiosInstance.get(`/admin/reports/log-history/${sessionId}/receipt`);
    return response.data.data;
  },
};
