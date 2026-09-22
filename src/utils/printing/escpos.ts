// Raw ESC/POS command building for thermal receipt printers. This is the
// actual byte-level protocol virtually every receipt printer (Epson, Star,
// Citizen, Bixolon, and the generic clones sold under a dozen other brands)
// understands — sending these bytes straight to the printer is what "real"
// hardware integration means here, as opposed to the browser's print dialog
// rendering an HTML page (see printViaWindow.ts, which stays as the fallback
// for anyone without a WebUSB-capable printer).
//
// Reference: Epson's ESC/POS Command Reference (the de facto standard other
// vendors also implement a compatible subset of).

const ESC = 0x1b;
const GS = 0x1d;

export class ReceiptBuilder {
    private chunks: Uint8Array[] = [];
    private encoder = new TextEncoder();

    private push(bytes: number[] | Uint8Array) {
        this.chunks.push(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes));
        return this;
    }

    /** ESC @ — reset the printer to its power-on state. Always call this first. */
    init() {
        return this.push([ESC, 0x40]);
    }

    align(mode: 'left' | 'center' | 'right') {
        const n = mode === 'center' ? 1 : mode === 'right' ? 2 : 0;
        return this.push([ESC, 0x61, n]);
    }

    bold(on: boolean) {
        return this.push([ESC, 0x45, on ? 1 : 0]);
    }

    /** GS ! n — text size, 0-7 scales both width and height 1x-8x. */
    size(scale: number) {
        const s = Math.max(0, Math.min(7, scale));
        return this.push([GS, 0x21, (s << 4) | s]);
    }

    text(value: string) {
        // Plain 7-bit ASCII is universally safe across printer codepages;
        // anything outside it (customer names with accents, etc.) degrades to
        // '?' rather than mojibake or a wedged printer on an unsupported codepage.
        const ascii = value.replace(/[^\x00-\x7F]/g, '?');
        return this.push(this.encoder.encode(ascii));
    }

    line(value = '') {
        return this.text(value).newline();
    }

    newline() {
        return this.push([0x0a]);
    }

    /** A dashed divider sized for standard 42/32-column thermal paper. */
    divider(width: 32 | 42 = 42) {
        return this.line('-'.repeat(width));
    }

    /** Two columns on one line — a label and a right-aligned value. */
    twoColumn(left: string, right: string, width: 32 | 42 = 42) {
        const space = Math.max(1, width - left.length - right.length);
        return this.line(left + ' '.repeat(space) + right);
    }

    /** GS V — feed and cut. `partial` leaves a tear tab so the receipt doesn't fully detach. */
    cut(partial = true) {
        return this.push([GS, 0x56, partial ? 1 : 0]);
    }

    /**
     * ESC p m t1 t2 — pulse the drawer-kick pin wired through the printer's
     * cash-drawer port (RJ11/RJ12). This is how virtually every countertop
     * cash drawer is actually triggered: through the printer, not a separate
     * integration. m=0 selects pin 2 (the near-universal default wiring);
     * t1/t2 are the on/off pulse timing in ~2ms units.
     */
    openDrawer() {
        return this.push([ESC, 0x70, 0x00, 0x19, 0xfa]);
    }

    build(): Uint8Array {
        const total = this.chunks.reduce((sum, c) => sum + c.length, 0);
        const out = new Uint8Array(total);
        let offset = 0;
        for (const c of this.chunks) {
            out.set(c, offset);
            offset += c.length;
        }
        return out;
    }
}

export interface EscposReceiptData {
    shopName: string;
    addressLine?: string;
    invoiceNumber: string;
    dateLabel: string;
    customerName: string;
    paymentMethod: string;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    discountAmount?: number;
    deliveryCharge?: number;
    totalAmount: number;
    paidAmount: number;
    changeDue?: number;
    footerText?: string;
    duplicate?: boolean;
}

const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Builds the full receipt as raw ESC/POS bytes for a 42-column (80mm) printer. */
export function buildEscposReceipt(data: EscposReceiptData): Uint8Array {
    const b = new ReceiptBuilder().init();

    if (data.duplicate) {
        b.align('center').bold(true).line('*** DUPLICATE ***').bold(false).divider();
    }

    b.align('center').bold(true).size(1).line(data.shopName).size(0).bold(false);
    if (data.addressLine) b.line(data.addressLine);
    b.newline();

    b.align('left');
    b.line(`Invoice: ${data.invoiceNumber}`);
    b.line(`Date: ${data.dateLabel}`);
    b.line(`Customer: ${data.customerName}`);
    b.line(`Payment: ${data.paymentMethod}`);
    b.divider();

    for (const item of data.items) {
        b.line(item.name);
        const qty = item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(3);
        b.twoColumn(`  ${qty} x ${money(item.price)}`, money(item.quantity * item.price));
    }
    b.divider();

    b.twoColumn('Subtotal', money(data.subtotal));
    if (data.discountAmount) b.twoColumn('Discount', `-${money(data.discountAmount)}`);
    if (data.deliveryCharge) b.twoColumn('Delivery', `+${money(data.deliveryCharge)}`);
    // Bold only for emphasis — deliberately NOT double-width here: doubling
    // shifts the effective column count (42 -> ~21) and getting that
    // recalculation wrong risks overflow/wraparound on real paper, which
    // there's no way to verify without a physical printer on hand.
    b.bold(true);
    b.twoColumn('TOTAL', money(data.totalAmount));
    b.bold(false);
    b.twoColumn('Paid', money(data.paidAmount));
    if (data.changeDue) b.twoColumn('Change', money(data.changeDue));
    b.divider();

    b.align('center');
    b.line(data.footerText || 'Thank you for your business!');
    b.newline().newline();
    b.cut(true);

    return b.build();
}
