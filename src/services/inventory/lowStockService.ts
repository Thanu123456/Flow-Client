import { axiosInstance } from "../api/axiosInstance";
import type { StockListItem } from "../../types/entities/report.types";

export interface LowStockFilter {
    search?: string;
    category_id?: string;
    threshold?: number;
}

export const lowStockService = {
    getLowStock: async (filter?: LowStockFilter): Promise<StockListItem[]> => {
        const response = await axiosInstance.get("/admin/stock/low", {
            params: {
                search: filter?.search || undefined,
                category_id: filter?.category_id || undefined,
                threshold: filter?.threshold || undefined,
            },
        });
        return response.data.data;
    },
};
