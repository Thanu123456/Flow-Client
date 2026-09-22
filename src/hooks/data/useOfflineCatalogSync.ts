import { useEffect } from 'react';
import { productService } from '../../services/inventory/productService';
import { useCategoryStore } from '../../store/management/categoryStore';
import { saveCatalog } from '../../utils/offline/catalogCache';

const FULL_CATALOG_LIMIT = 5000;
const SYNC_INTERVAL_MS = 10 * 60 * 1000; // 10 min

/**
 * Keeps the local product/category cache warm while online, so
 * usePOSProducts/usePOSBootstrap have something recent to fall back to the
 * moment the connection actually drops — without this, the cache would only
 * ever hold whatever single category the cashier happened to be viewing when
 * they went offline. Mount once (POS.tsx); pure side effect, renders nothing.
 *
 * Deliberately fetches the FULL active catalog (not per-category) in one
 * call, since the point is to cover categories the cashier hasn't visited
 * yet today — that's the difference between "still can browse everything
 * offline" and "only whatever was on screen a moment ago".
 */
export function useOfflineCatalogSync(): void {
    useEffect(() => {
        let cancelled = false;

        const sync = async () => {
            if (typeof navigator !== 'undefined' && !navigator.onLine) return;
            try {
                const [productsRes, categories] = await Promise.all([
                    productService.getProducts({ page: 1, limit: FULL_CATALOG_LIMIT, status: 'active' }),
                    useCategoryStore.getState().getAllCategories(),
                ]);
                if (!cancelled) {
                    await saveCatalog(productsRes.data ?? [], categories);
                }
            } catch {
                // Best-effort — the existing cache (however stale) just stays as-is.
            }
        };

        sync();
        const interval = setInterval(sync, SYNC_INTERVAL_MS);
        // Also resync the moment connectivity returns, rather than waiting for
        // the next 10-minute tick — that's when a stale cache matters most.
        window.addEventListener('online', sync);

        return () => {
            cancelled = true;
            clearInterval(interval);
            window.removeEventListener('online', sync);
        };
    }, []);
}
