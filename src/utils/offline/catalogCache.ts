import type { Product } from '../../types/entities/product.types';
import type { Category } from '../../types/entities/category.types';

// Local copy of the product catalog + category list, so a kiosk can keep
// *shopping* while offline — not just submit a cart that was already built
// while online (see offlineDb.ts / offlineSyncService.ts for that half of
// offline resilience, which this complements rather than replaces). A
// dropped connection now degrades to "browsing slightly stale prices/stock"
// instead of "can't search for anything at all".
const DB_NAME = 'flow_pos_catalog_cache';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_META = 'meta';

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
                const store = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
                store.createIndex('categoryId', 'categoryId');
            }
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

/** Replaces the entire cached catalog with a fresh snapshot (called after a successful online fetch). */
export async function saveCatalog(products: Product[], categories: Category[]): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_PRODUCTS, STORE_META], 'readwrite');
        const productStore = tx.objectStore(STORE_PRODUCTS);
        productStore.clear();
        for (const p of products) productStore.put(p);
        tx.objectStore(STORE_META).put({ key: 'categories', value: categories });
        tx.objectStore(STORE_META).put({ key: 'syncedAt', value: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
    });
}

export async function getCachedProducts(categoryId?: string): Promise<Product[]> {
    try {
        const db = await openDb();
        return await new Promise<Product[]>((resolve, reject) => {
            const tx = db.transaction(STORE_PRODUCTS, 'readonly');
            const store = tx.objectStore(STORE_PRODUCTS);
            const req = categoryId ? store.index('categoryId').getAll(categoryId) : store.getAll();
            req.onsuccess = () => resolve(req.result as Product[]);
            req.onerror = () => reject(req.error);
            tx.oncomplete = () => db.close();
        });
    } catch {
        return [];
    }
}

async function getMeta<T>(key: string): Promise<T | null> {
    try {
        const db = await openDb();
        return await new Promise<T | null>((resolve, reject) => {
            const tx = db.transaction(STORE_META, 'readonly');
            const req = tx.objectStore(STORE_META).get(key);
            req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null);
            req.onerror = () => reject(req.error);
            tx.oncomplete = () => db.close();
        });
    } catch {
        return null;
    }
}

export const getCachedCategories = () => getMeta<Category[]>('categories');
export const getCatalogSyncedAt = () => getMeta<string>('syncedAt');
