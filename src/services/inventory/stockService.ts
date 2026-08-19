import { axiosInstance } from "../api/axiosInstance";
import type { StockListItem } from "../../types/entities/report.types";

export interface OutOfStockFilter {
    search?: string;
    category_id?: string;
}

export const stockService = {
    getOutOfStock: async (filter?: OutOfStockFilter): Promise<StockListItem[]> => {
        const response = await axiosInstance.get("/admin/stock/out", {
            params: {
                search: filter?.search || undefined,
                category_id: filter?.category_id || undefined,
            },
        });
        return response.data.data;
    },
};
