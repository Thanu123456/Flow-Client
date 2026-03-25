import { axiosInstance } from "../api/axiosInstance";

export interface POSSaleRequest {
    tenant_id?: string;
    customer_id?: string;
    payment_method?: string;
    total_amount?: number;
    paid_amount?: number;
    products: {
        product_id: string;
        variation_id?: string;
        quantity: number;
        price: number;
    }[];
}

export const posService = {
    createSale: async (data: POSSaleRequest): Promise<any> => {
        const response = await axiosInstance.post("/admin/pos/sale", data);
        return response.data;
    },
    createReturn: async (data: POSSaleRequest): Promise<any> => {
        const response = await axiosInstance.post("/admin/pos/return", data);
        return response.data;
    }
};
