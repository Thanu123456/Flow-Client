import emailjs from '@emailjs/browser';
import type { EffectiveSettings } from '../../types/entities/settings.types';
import { buildReceiptUrl } from './qrCode';

export interface EmailReceiptSaleInfo {
    invoiceNumber: string;
    totalAmount: number;
    createdAt: string;
}

// Sends the receipt email directly from the browser via EmailJS — unlike SMS
// (notify.lk), EmailJS's "public key" is meant to be used client-side (it's
// domain/rate-limited on their end, not a bearer secret), so there's no
// backend involvement here at all. The actual email layout lives in the
// tenant's own EmailJS template (configured in their EmailJS dashboard, not
// something this app can create for them) — it should read these template
// variables: shop_name, to_email, invoice_number, total, date, receipt_url.
export async function sendReceiptEmail(
    settings: EffectiveSettings,
    toEmail: string,
    tenantId: string,
    saleId: string,
    sale: EmailReceiptSaleInfo,
): Promise<void> {
    const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey } = settings.settings;
    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
        throw new Error('Email receipts are not configured yet — add your EmailJS details in Settings.');
    }

    await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
            shop_name: settings.business.shopName,
            to_email: toEmail,
            invoice_number: sale.invoiceNumber,
            total: sale.totalAmount.toFixed(2),
            date: sale.createdAt,
            receipt_url: buildReceiptUrl(tenantId, saleId),
        },
        { publicKey: emailjsPublicKey },
    );
}
