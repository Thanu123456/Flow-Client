import { posService } from '../transactions/posService';
import { getQueuedSales, removeQueuedSale, bumpAttempt, countQueuedSales } from '../../utils/offline/offlineDb';

let syncing = false;

export interface SyncResult {
    synced: number;
    failed: number;
    stillOffline: boolean;
}

// Replays queued sales against the server in the order they were taken.
// Stops at the first network-level failure (still offline — no point burning
// through the rest of the queue) but keeps going past a server-rejected item
// (e.g. a stale price) so one bad sale doesn't block everyone behind it; that
// item stays queued with its error recorded for manual follow-up.
export async function syncQueuedSales(): Promise<SyncResult> {
    if (syncing || typeof navigator !== 'undefined' && !navigator.onLine) {
        return { synced: 0, failed: 0, stillOffline: true };
    }
    syncing = true;
    let synced = 0;
    let failed = 0;
    let stillOffline = false;
    try {
        const queue = await getQueuedSales();
        for (const item of queue) {
            try {
                if (item.kind === 'return') {
                    await posService.createReturn(item.payload);
                } else {
                    await posService.createSale(item.payload);
                }
                await removeQueuedSale(item.localId);
                synced++;
            } catch (err: any) {
                if (!err?.response) {
                    // Network-level failure — connection dropped again mid-sync.
                    stillOffline = true;
                    failed++;
                    break;
                }
                await bumpAttempt(item.localId, err.response?.data?.message || err.message || 'Sync failed');
                failed++;
            }
        }
    } finally {
        syncing = false;
    }
    return { synced, failed, stillOffline };
}

export { countQueuedSales };
