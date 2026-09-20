import { axiosInstance } from "../api/axiosInstance";
import api from "../../utils/api";
import type { SaleDetailItem } from "../../types/entities/sale.types";

export interface PublicReceipt {
    shopName: string;
    logoUrl?: string;
    sale: SaleDetailItem;
}

const transformPublicReceipt = (d: any): PublicReceipt => ({
    shopName: d.shop_name,
    logoUrl: d.logo_url || undefined,
    sale: {
        id: d.sale.id,
        bill_number: d.sale.invoice_number,
        invoice_number: d.sale.invoice_number,
        customer_name: d.sale.customer_name || "Walk-in",
        subtotal: Number(d.sale.subtotal || 0),
        discount_amount: Number(d.sale.discount_amount || 0),
        delivery_charge: Number(d.sale.delivery_charge || 0),
        total_amount: Number(d.sale.total_amount || 0),
        paid_amount: Number(d.sale.paid_amount || 0),
        payment_method: d.sale.payment_method,
        status: d.sale.status,
        created_at: d.sale.created_at,
        items: (d.sale.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            quantity: Number(i.quantity || 0),
            price: Number(i.price || 0),
        })),
    },
});

export const receiptService = {
    // Backend: POST /admin/pos/send-sms-receipt (authenticated — kiosk and
    // full-admin POS sessions both reach it, same as /admin/pos/sale).
    async sendSmsReceipt(saleId: string, phone: string): Promise<void> {
        await axiosInstance.post("/admin/pos/send-sms-receipt", { sale_id: saleId, phone });
    },

    // Backend: GET /receipts/:tenantId/:saleId — public, no auth. Used by the
    // digital receipt page a customer reaches via the printed QR code. Uses
    // the plain `api` instance (not axiosInstance) since this page may be
    // opened with no token in localStorage at all — that's fine, the
    // interceptor just skips attaching an Authorization header in that case.
    async getPublicReceipt(tenantId: string, saleId: string): Promise<PublicReceipt> {
        const res = await api.get(`/receipts/${tenantId}/${saleId}`);
        return transformPublicReceipt(res.data?.data ?? res.data);
    },
};
