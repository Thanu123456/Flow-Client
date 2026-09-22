// WebUSB connection to a thermal receipt printer, for sending raw ESC/POS
// bytes directly (see escpos.ts) instead of going through the OS print
// dialog. This is genuinely how most browser-based POS systems talk to a
// receipt printer — there's no vendor SDK needed because ESC/POS printers
// overwhelmingly expose themselves as a standard USB Printer-class device.
//
// Real limits, stated plainly rather than glossed over:
//   - WebUSB only exists in Chromium browsers (Chrome, Edge, Opera) — not
//     Firefox or Safari. A kiosk built on this needs a Chromium browser.
//   - It needs a secure context (HTTPS, or localhost in dev).
//   - It only reaches printers connected by USB. A network/Ethernet or
//     Bluetooth-only printer needs a different transport this doesn't cover.
//   - Pairing requires one explicit user gesture (a button click) per
//     browser profile; after that, `navigator.usb.getDevices()` reconnects
//     silently — no repeated prompts on every kiosk boot.
//   - None of this has been exercised against a physical printer here — it's
//     built to the documented USB Printer class (0x07) and Epson's published
//     ESC/POS reference, but "should work" and "verified working" are
//     different claims. Test against your actual hardware before relying on it.

const STORAGE_KEY = 'kioskPrinterDevice';

export interface StoredPrinterRef {
    vendorId: number;
    productId: number;
}

export function isWebUsbSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
}

function getStoredRef(): StoredPrinterRef | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as StoredPrinterRef) : null;
    } catch {
        return null;
    }
}

function storeRef(device: USBDevice) {
    const ref: StoredPrinterRef = { vendorId: device.vendorId, productId: device.productId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ref));
}

export function forgetStoredPrinter(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function hasStoredPrinter(): boolean {
    return getStoredRef() !== null;
}

// Finds the printer's OUT (host -> device) bulk endpoint and the interface it
// belongs to. USB Printer-class devices expose exactly one bulk OUT endpoint
// for print data; this walks the configuration rather than assuming
// interface/endpoint numbers, since those vary by printer model.
function findPrintInterface(device: USBDevice): { interfaceNumber: number; endpointNumber: number } | null {
    const config = device.configuration;
    if (!config) return null;
    for (const iface of config.interfaces) {
        const alt = iface.alternates.find((a) => a.interfaceClass === 7) ?? iface.alternates[0];
        const out = alt.endpoints.find((e) => e.direction === 'out');
        if (out) return { interfaceNumber: iface.interfaceNumber, endpointNumber: out.endpointNumber };
    }
    return null;
}

async function openAndClaim(device: USBDevice): Promise<{ interfaceNumber: number; endpointNumber: number }> {
    if (!device.opened) await device.open();
    if (device.configuration === null) await device.selectConfiguration(1);
    const target = findPrintInterface(device);
    if (!target) throw new Error('This USB device has no printer (class 7) interface with an OUT endpoint.');
    await device.claimInterface(target.interfaceNumber);
    return target;
}

/**
 * Opens the browser's device picker, filtered to the standard USB Printer
 * class (7) so it only lists actual printers rather than every USB device
 * plugged in. Must be called from a user gesture (a click handler) — WebUSB
 * refuses requestDevice() otherwise.
 */
export async function pairPrinter(): Promise<USBDevice> {
    if (!isWebUsbSupported()) {
        throw new Error('This browser doesn\'t support WebUSB — use Chrome or Edge for direct printer access.');
    }
    const device = await navigator.usb.requestDevice({ filters: [{ classCode: 7 }] });
    await openAndClaim(device);
    storeRef(device);
    return device;
}

/**
 * Reconnects to the previously-paired printer without prompting the user —
 * works because pairPrinter() already granted this origin permission for
 * that specific device. Returns null if nothing was ever paired, or if the
 * paired device isn't currently plugged in.
 */
export async function reconnectPrinter(): Promise<USBDevice | null> {
    if (!isWebUsbSupported()) return null;
    const ref = getStoredRef();
    if (!ref) return null;

    const devices = await navigator.usb.getDevices();
    const device = devices.find((d) => d.vendorId === ref.vendorId && d.productId === ref.productId);
    if (!device) return null;

    await openAndClaim(device);
    return device;
}

/** Sends raw bytes (an ESC/POS command stream) to an already-opened printer. */
export async function sendToPrinter(device: USBDevice, data: Uint8Array): Promise<void> {
    const target = findPrintInterface(device);
    if (!target) throw new Error('Printer interface not found — was it opened with openAndClaim/pairPrinter?');
    // WebUSB requires a plain ArrayBuffer-backed view; Uint8Array from a
    // freshly-built buffer already satisfies that.
    const result = await device.transferOut(target.endpointNumber, data);
    if (result.status !== 'ok') {
        throw new Error(`Printer transfer failed: ${result.status}`);
    }
}
