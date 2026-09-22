import type { EscposReceiptData } from './escpos';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// HTML rendering of the same receipt data escpos.ts turns into raw printer
// bytes — used for the browser-print-dialog fallback (printViaWindow) so the
// two paths show the customer/cashier the same receipt regardless of which
// one actually fired. Kept as a plain template-string builder rather than a
// React component so it can be handed straight to a popup window's
// document.write without a render pass.
export function renderReceiptHtml(data: EscposReceiptData): string {
    const itemRows = data.items.map((item) => {
        const qty = item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(3);
        return `
            <tr>
                <td style="padding:2px 0;">${esc(item.name)}</td>
                <td style="text-align:right;">${qty}</td>
                <td style="text-align:right;">${money(item.price)}</td>
                <td style="text-align:right;">${money(item.quantity * item.price)}</td>
            </tr>`;
    }).join('');

    return `
        <div style="padding:16px;font-family:'Courier New',monospace;font-size:13px;color:#000;max-width:320px;margin:0 auto;">
            ${data.duplicate ? `<div style="text-align:center;border:2px solid #000;padding:4px;margin-bottom:12px;font-weight:700;letter-spacing:2px;">DUPLICATE</div>` : ''}
            <div style="text-align:center;margin-bottom:12px;">
                <div style="font-weight:700;font-size:16px;">${esc(data.shopName)}</div>
                ${data.addressLine ? `<div>${esc(data.addressLine)}</div>` : ''}
                <div style="margin-top:4px;">Invoice: ${esc(data.invoiceNumber)}</div>
                <div>${esc(data.dateLabel)}</div>
            </div>
            <div style="border-top:1px dashed #000;margin:8px 0;"></div>
            <div>Customer: ${esc(data.customerName)}</div>
            <div style="text-transform:capitalize;">Payment: ${esc(data.paymentMethod)}</div>
            <div style="border-top:1px dashed #000;margin:8px 0;"></div>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr>
                        <th style="text-align:left;padding-bottom:4px;">Item</th>
                        <th style="text-align:right;padding-bottom:4px;">Qty</th>
                        <th style="text-align:right;padding-bottom:4px;">Price</th>
                        <th style="text-align:right;padding-bottom:4px;">Total</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
            </table>
            <div style="border-top:1px dashed #000;margin:8px 0;"></div>
            <table style="width:100%;border-collapse:collapse;">
                <tbody>
                    <tr><td>Subtotal</td><td style="text-align:right;">${money(data.subtotal)}</td></tr>
                    ${data.discountAmount ? `<tr><td>Discount</td><td style="text-align:right;">-${money(data.discountAmount)}</td></tr>` : ''}
                    ${data.deliveryCharge ? `<tr><td>Delivery</td><td style="text-align:right;">+${money(data.deliveryCharge)}</td></tr>` : ''}
                    <tr style="font-weight:700;border-top:1px solid #000;">
                        <td style="padding-top:4px;">Total</td>
                        <td style="text-align:right;padding-top:4px;">${money(data.totalAmount)}</td>
                    </tr>
                    <tr><td>Paid</td><td style="text-align:right;">${money(data.paidAmount)}</td></tr>
                    ${data.changeDue ? `<tr><td>Change</td><td style="text-align:right;">${money(data.changeDue)}</td></tr>` : ''}
                </tbody>
            </table>
            <div style="border-top:1px dashed #000;margin:8px 0;"></div>
            <div style="text-align:center;margin-top:12px;">${esc(data.footerText || 'Thank you for your business!')}</div>
        </div>`;
}
