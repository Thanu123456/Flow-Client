import { axiosInstance } from "../api/axiosInstance";

// ─────────────────────────────────────────────────────────────────────
//  Request / Response Types
// ─────────────────────────────────────────────────────────────────────
export interface POSSaleRequest {
    // Feature #4 – Bill Number
    invoice_number?: string;

    tenant_id?: string;
    customer_id?: string;

    // Feature #3 – Card Payment
    payment_method?: string;
    card_bank?: string;
    card_number?: string;
    card_type?: string;

    // Amounts
    total_amount?: number;
    paid_amount?: number;

    // Feature #1 – Discount
    discount_type?: "fixed" | "percent";
    discount_value?: number;
    discount_amount?: number;

    // Feature #2 – Delivery Charge
    delivery_charge?: number;

    // Feature #6 – Price Mode
    price_mode?: "our" | "retail" | "wholesale";

    // Products (Feature #5 – decimal quantity for weight items)
    products: {
        product_id: string;
        variation_id?: string;
        quantity: number;   // float for weight-based, int for regular
        price: number;
    }[];
}

export interface NextBillNumberResponse {
    bill_number?: string;
    next_bill_number?: string;
}

export interface POSSettingsResponse {
    allow_no_stock_bills: boolean;
}

// ─────────────────────────────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────────────────────────────
export const posService = {
    // Existing endpoints
    createSale: async (data: POSSaleRequest): Promise<any> => {
        const response = await axiosInstance.post("/admin/pos/sale", data);
        return response.data;
    },

    createReturn: async (data: POSSaleRequest): Promise<any> => {
        const response = await axiosInstance.post("/admin/pos/return", data);
        return response.data;
    },

    // Feature #4 – Fetch next bill number
    getNextBillNumber: async (): Promise<NextBillNumberResponse> => {
        const response = await axiosInstance.get("/admin/pos/next-bill-number");
        return response.data;
    },

    // Feature #8 – POS settings (allow no-stock bills)
    getSettings: async (): Promise<POSSettingsResponse> => {
        const response = await axiosInstance.get("/admin/pos/settings");
        return response.data;
    },

    updateSettings: async (settings: Partial<POSSettingsResponse>): Promise<POSSettingsResponse> => {
        const response = await axiosInstance.patch("/admin/pos/settings", settings);
        return response.data;
    },
};
