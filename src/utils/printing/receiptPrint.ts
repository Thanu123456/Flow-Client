// Orchestrates printing a receipt: try the direct WebUSB/ESC-POS path first
// (fast, no dialog, can kick the drawer), and fall back to the browser print
// dialog when no printer is paired, WebUSB isn't supported in this browser,
// or the direct send fails for any reason (paper out, USB hiccup, etc.) —
// the sale itself is never blocked on a printer working.
import { buildEscposReceipt, ReceiptBuilder, type EscposReceiptData } from './escpos';
import { reconnectPrinter, sendToPrinter, hasStoredPrinter } from './webUsbPrinter';
import { printViaWindow } from './printViaWindow';
import { renderReceiptHtml } from './receiptHtml';

export type PrintOutcome = 'printed-usb' | 'printed-browser';

export interface PrintReceiptOptions {
    // Pulses the drawer-kick pin as part of the same print job (the standard
    // way a cash sale opens the till) — only takes effect on the direct
    // WebUSB path; the browser-dialog fallback has no way to trigger a drawer.
    kickDrawer?: boolean;
}

export async function printReceipt(data: EscposReceiptData, options: PrintReceiptOptions = {}): Promise<PrintOutcome> {
    if (hasStoredPrinter()) {
        try {
            const device = await reconnectPrinter();
            if (device) {
                const receipt = buildEscposReceipt(data);
                const bytes = options.kickDrawer
                    ? concatBytes(receipt, new ReceiptBuilder().openDrawer().build())
                    : receipt;
                await sendToPrinter(device, bytes);
                return 'printed-usb';
            }
        } catch {
            // Fall through to the browser dialog — a print failure should never
            // block or alarm the cashier mid-checkout; see caller's toast copy.
        }
    }

    printViaWindow(renderReceiptHtml(data), `Receipt - ${data.invoiceNumber}`);
    return 'printed-browser';
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
}

/** Manual "open drawer" action (float top-up, till check) — independent of printing a receipt. */
export async function openCashDrawer(): Promise<boolean> {
    if (!hasStoredPrinter()) return false;
    try {
        const device = await reconnectPrinter();
        if (!device) return false;
        await sendToPrinter(device, new ReceiptBuilder().openDrawer().build());
        return true;
    } catch {
        return false;
    }
}
