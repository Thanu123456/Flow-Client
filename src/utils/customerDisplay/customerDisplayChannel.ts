// Same-device, dual-monitor customer-facing display: the cashier's POS page
// and a second browser window (opened onto the customer-facing monitor, see
// CustomerDisplay.tsx) talk over a BroadcastChannel — same-origin,
// same-browser-profile only, so nothing here is reachable from outside this
// specific device. No backend/websocket involved; this is the standard,
// low-effort way a web POS drives a second screen when both screens are on
// the one till PC. A separate customer-facing *device* (its own tablet) is a
// different, larger feature (would need its own pairing + network sync,
// closer to how kiosk device pairing works) — not what this implements.

export interface CustomerDisplayCartItem {
    name: string;
    quantity: number;
    price: number;
}

export interface CustomerDisplayCartMessage {
    type: 'cart';
    shopName?: string;
    logoUrl?: string;
    items: CustomerDisplayCartItem[];
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    total: number;
}

export interface CustomerDisplayPaymentMessage {
    type: 'payment_complete';
    invoiceNumber: string;
    totalAmount: number;
    changeDue: number;
    tenantId?: string;
    saleId?: string;
}

export interface CustomerDisplayIdleMessage {
    type: 'idle';
    shopName?: string;
    logoUrl?: string;
}

export type CustomerDisplayMessage =
    | CustomerDisplayCartMessage
    | CustomerDisplayPaymentMessage
    | CustomerDisplayIdleMessage;

const CHANNEL_NAME = 'flow-pos-customer-display';

// A single shared channel for the page's lifetime — cheaper than opening and
// closing one per message, and avoids racing a subscriber's cleanup against
// a post that happens right after.
let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
    if (typeof BroadcastChannel === 'undefined') return null; // safe no-op on very old browsers
    if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
    return channel;
}

export function postCartUpdate(msg: Omit<CustomerDisplayCartMessage, 'type'>): void {
    getChannel()?.postMessage({ type: 'cart', ...msg } satisfies CustomerDisplayCartMessage);
}

export function postPaymentComplete(msg: Omit<CustomerDisplayPaymentMessage, 'type'>): void {
    getChannel()?.postMessage({ type: 'payment_complete', ...msg } satisfies CustomerDisplayPaymentMessage);
}

export function postIdle(msg: Omit<CustomerDisplayIdleMessage, 'type'> = {}): void {
    getChannel()?.postMessage({ type: 'idle', ...msg } satisfies CustomerDisplayIdleMessage);
}

// Used by CustomerDisplay.tsx (the second-window view) to react to whatever
// the cashier's POS page posts. Returns an unsubscribe function.
export function subscribeCustomerDisplay(onMessage: (msg: CustomerDisplayMessage) => void): () => void {
    const ch = getChannel();
    if (!ch) return () => {};
    const handler = (e: MessageEvent) => onMessage(e.data as CustomerDisplayMessage);
    ch.addEventListener('message', handler);
    return () => ch.removeEventListener('message', handler);
}

export function openCustomerDisplayWindow(): void {
    window.open('/pos/customer-display', 'flow-pos-customer-display', 'width=1024,height=768');
}
