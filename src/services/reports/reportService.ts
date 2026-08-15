import { axiosInstance } from "../api/axiosInstance";
import type { SalesReportFilter, SalesReportResponse } from "../../types/entities/report.types";

export const reportService = {
  getSalesReport: async (filter?: SalesReportFilter): Promise<SalesReportResponse> => {
    const params = new URLSearchParams();
    if (filter?.search)         params.set("search",         filter.search);
    if (filter?.payment_method) params.set("payment_method", filter.payment_method);
    if (filter?.date_from)      params.set("date_from",      filter.date_from);
    if (filter?.date_to)        params.set("date_to",        filter.date_to);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get(`/admin/reports/sales${query}`);
    return response.data.data;
  },

  exportSalesReportExcel: async (filter?: SalesReportFilter): Promise<Blob> => {
    const response = await axiosInstance.get("/admin/reports/sales/export/excel", {
      params: {
        search: filter?.search || undefined,
        payment_method: filter?.payment_method || undefined,
        date_from: filter?.date_from || undefined,
        date_to: filter?.date_to || undefined,
      },
      responseType: "arraybuffer",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
