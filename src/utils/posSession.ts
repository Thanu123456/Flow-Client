/**
 * Per-till POS identifiers that must survive retries and offline replays.
 */

/**
 * A fresh idempotency key for one cart (sale or return). The server stores it
 * with the sale; a retried or offline-replayed checkout that carries the same
 * key gets the already-saved sale back instead of creating a duplicate.
 *
 * crypto.randomUUID only exists in secure contexts (https / localhost) — a
 * till reached over plain http on the shop LAN falls back to building a v4
 * UUID from getRandomValues, which is available everywhere.
 */
export function newClientTxnId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const WAREHOUSE_KEY = 'posWarehouseId';

/**
 * The warehouse this till sells from, as picked on the POS screen. The server
 * only uses it when the cashier's shift / user record doesn't already pin a
 * warehouse (see POSService.resolveWarehouse).
 */
export function getStoredPOSWarehouseId(): string | undefined {
    try {
        return localStorage.getItem(WAREHOUSE_KEY) || undefined;
    } catch {
        return undefined;
    }
}

export function setStoredPOSWarehouseId(id: string | undefined): void {
    try {
        if (id) localStorage.setItem(WAREHOUSE_KEY, id);
        else localStorage.removeItem(WAREHOUSE_KEY);
    } catch {
        /* storage blocked — the picker just won't be remembered */
    }
}
