import { axiosInstance } from "../api/axiosInstance";

// ─────────────────────────────────────────────────────────────────────
//  Request / Response Types
// ─────────────────────────────────────────────────────────────────────
export interface POSSaleRequest {
    tenant_id?: string;
    customer_id?: string;

    // Feature #3 – Card Payment
    payment_method?: string;
    card_bank?: string;
    card_number?: string;
    card_type?: string;

    // Bank Transfer / Split payment — bank_name + bank_reference apply to a
    // BankTransfer sale or the bank portion of a Split one. The three
    // *_amount fields are only read when payment_method is "Split" and must
    // sum to paid_amount; the server rejects the sale otherwise.
    bank_name?: string;
    bank_reference?: string;
    cash_amount?: number;
    card_amount?: number;
    bank_transfer_amount?: number;

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

    // Products (Feature #5 – decimal quantity for weight items). A misc/
    // "unknown item" line omits product_id and sends product_name instead —
    // the server records it with no stock movement.
    products: {
        product_id?: string;
        product_name?: string;
        variation_id?: string;
        quantity: number;   // float for weight-based, int for regular
        price: number;
    }[];

    // Manager-override token (see ManagerOverrideModal) — required when the
    // cashier's own role lacks pos.discounts (for a discount) or sales.refunds
    // (for any return); the server re-validates it, this is never trusted as-is.
    override_token?: string;
}

export interface NextBillNumberResponse {
    bill_number?: string;
    next_bill_number?: string;
}

export interface POSSettingsResponse {
    allow_no_stock_bills: boolean;
}

// The invoice number is always assigned by the server (it checks uniqueness
// against the database) — the response's `sale.invoice_number` is the only
// authoritative value, never whatever the cart preview displayed pre-checkout.
// changeDue is only ever non-zero for a Credit sale paid beyond what's owed
// (this bill + any prior balance) — the server caps what applies to the
// customer's balance and returns the rest here as cash to hand back.
export interface POSTransactionResult {
    id: string;
    invoiceNumber: string;
    changeDue: number;
}

// ─────────────────────────────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────────────────────────────
export const posService = {
    // Existing endpoints
    createSale: async (data: POSSaleRequest): Promise<POSTransactionResult> => {
        const response = await axiosInstance.post("/admin/pos/sale", data);
        const sale = response.data?.sale ?? {};
        return { id: sale.id, invoiceNumber: sale.invoice_number, changeDue: Number(sale.change_due || 0) };
    },

    createReturn: async (data: POSSaleRequest): Promise<POSTransactionResult> => {
        const response = await axiosInstance.post("/admin/pos/return", data);
        const sale = response.data?.sale ?? {};
        return { id: sale.id, invoiceNumber: sale.invoice_number, changeDue: Number(sale.change_due || 0) };
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
