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
        // The price the till shows. The server re-prices catalogue lines itself
        // and only accepts a different figure as a price override (below).
        price: number;
        // Marks the line as a deliberate price override — needs pos.price_override
        // (or a manager's price_override_token). Absent = sell at catalogue price.
        price_override_reason?: string;
    }[];

    // Manager-override token (see ManagerOverrideModal) — required when the
    // cashier's own role lacks pos.discounts (for a discount) or sales.refunds
    // (for any return); the server re-validates it, this is never trusted as-is.
    override_token?: string;
    // Manager-override token for the cart's price-override lines
    // (pos.price_override) — separate because a token covers one permission.
    price_override_token?: string;

    // Idempotency key, generated once per cart (utils/posSession) and reused
    // for every retry/offline replay so the server never saves the cart twice.
    client_txn_id?: string;
    // The till's picked warehouse — only used when the cashier's shift/user
    // record doesn't already pin one.
    warehouse_id?: string;
    // Set on a sale synced from the offline queue: it already happened at the
    // counter, so the server records it (flagged for review) where it would
    // otherwise reject it — negative stock, a since-changed price, an expired
    // manager approval. offline_created_at is when it actually happened.
    offline?: boolean;
    offline_created_at?: string;
}

// One line the server refused because its price no longer matches the
// catalogue (HTTP 409, code POS_PRICE_CHANGED).
export interface PriceChangedLine {
    product_id: string;
    variation_id?: string;
    name: string;
    sent_price: number;
    current_price: number;
}

// The invoice number is always assigned by the server (it checks uniqueness
// against the database) — the response's `sale.invoice_number` is the only
// authoritative value, never whatever the cart preview displayed pre-checkout.
// changeDue is only ever non-zero for a Credit sale paid beyond what's owed
// (this bill + any prior balance) — the server caps what applies to the
// customer's balance and returns the rest here as cash to hand back.
// replayed is true when the server recognised client_txn_id as a sale it had
// already saved (e.g. the first reply was lost) and returned that sale.
// A warranty registered for a sold item — printed under the line on the receipt.
export interface ReceiptWarranty {
    productId: string;
    warrantyName: string;
    /** YYYY-MM-DD; undefined = lifetime */
    expiryDate?: string;
}

export interface POSTransactionResult {
    id: string;
    invoiceNumber: string;
    changeDue: number;
    replayed?: boolean;
    warranties?: ReceiptWarranty[];
}

// Which warehouse this till sells from — resolved by the server exactly as a
// sale would be (shift → user assignment → the till's pick → only warehouse).
export interface TillContext {
    warehouseId?: string;
    warehouseName?: string;
    pinned: boolean;          // decided by shift/user — the picker has no effect
    needsSelection: boolean;  // several warehouses, nothing picked yet
    message?: string;
}

// ─────────────────────────────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────────────────────────────
export const posService = {
    // Existing endpoints
    createSale: async (data: POSSaleRequest): Promise<POSTransactionResult> => {
        const response = await axiosInstance.post("/admin/pos/sale", data);
        const sale = response.data?.sale ?? {};
        const warranties: ReceiptWarranty[] = (sale.warranties ?? []).map((w: any) => ({
            productId: w.product_id,
            warrantyName: w.warranty_name,
            expiryDate: w.expiry_date || undefined,
        }));
        return { id: sale.id, invoiceNumber: sale.invoice_number, changeDue: Number(sale.change_due || 0), replayed: !!sale.replayed, warranties };
    },

    getTillContext: async (warehouseId?: string): Promise<TillContext> => {
        const response = await axiosInstance.get("/admin/pos/context", {
            params: { warehouse_id: warehouseId || undefined },
        });
        const d = response.data?.data ?? {};
        return {
            warehouseId: d.warehouse_id || undefined,
            warehouseName: d.warehouse_name || undefined,
            pinned: !!d.pinned,
            needsSelection: !!d.needs_selection,
            message: d.message || undefined,
        };
    },

    createReturn: async (data: POSSaleRequest): Promise<POSTransactionResult> => {
        const response = await axiosInstance.post("/admin/pos/return", data);
        const sale = response.data?.sale ?? {};
        return { id: sale.id, invoiceNumber: sale.invoice_number, changeDue: Number(sale.change_due || 0) };
    },
};
