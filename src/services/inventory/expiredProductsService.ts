import { axiosInstance } from "../api/axiosInstance";
import type { BatchExportItem } from "../../types/entities/report.types";

export interface ExpiredProductsFilter {
    /** Include batches expiring within this many days (0 = already expired only). Default 30. */
    days?: number;
}

export const expiredProductsService = {
    getExpiring: async (filter?: ExpiredProductsFilter): Promise<BatchExportItem[]> => {
        const response = await axiosInstance.get("/admin/stock/expired", {
            params: {
                days: filter?.days ?? undefined,
            },
        });
        return response.data.data;
    },
};
