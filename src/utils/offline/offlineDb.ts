import type { POSSaleRequest } from '../../services/transactions/posService';

// Local queue of POS sales that couldn't reach the server (kiosk offline or a
// dropped connection mid-checkout). Backed by IndexedDB rather than
// localStorage — it survives a page refresh/crash without size pressure, and
// this device may sit offline for hours with dozens of queued sales.
const DB_NAME = 'flow_pos_offline';
const DB_VERSION = 1;
const STORE_SALES = 'pending_sales';

export interface QueuedSale {
    localId: string;
    kind: 'sale' | 'return';
    payload: POSSaleRequest;
    createdAt: string;
    attempts: number;
    lastError?: string;
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_SALES)) {
                db.createObjectStore(STORE_SALES, { keyPath: 'localId' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SALES, mode);
        const store = tx.objectStore(STORE_SALES);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

export async function enqueueSale(kind: 'sale' | 'return', payload: POSSaleRequest): Promise<QueuedSale> {
    const entry: QueuedSale = {
        localId: crypto.randomUUID(),
        kind,
        payload,
        createdAt: new Date().toISOString(),
        attempts: 0,
    };
    await withStore('readwrite', (store) => store.add(entry));
    return entry;
}

export async function getQueuedSales(): Promise<QueuedSale[]> {
    try {
        return await withStore('readonly', (store) => store.getAll());
    } catch {
        return [];
    }
}

export async function countQueuedSales(): Promise<number> {
    try {
        return await withStore('readonly', (store) => store.count());
    } catch {
        return 0;
    }
}

export async function removeQueuedSale(localId: string): Promise<void> {
    await withStore('readwrite', (store) => store.delete(localId));
}

export async function bumpAttempt(localId: string, error: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SALES, 'readwrite');
        const store = tx.objectStore(STORE_SALES);
        const getReq = store.get(localId);
        getReq.onsuccess = () => {
            const entry: QueuedSale | undefined = getReq.result;
            if (entry) {
                entry.attempts += 1;
                entry.lastError = error;
                store.put(entry);
            }
        };
        getReq.onerror = () => reject(getReq.error);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
    });
}
