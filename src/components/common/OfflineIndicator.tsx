import React, { useCallback, useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { CloudSyncOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { countQueuedSales } from '../../utils/offline/offlineDb';
import { syncQueuedSales } from '../../services/offline/offlineSyncService';

const POLL_INTERVAL_MS = 20_000; // catches sales queued elsewhere in the app + re-checks a stalled sync

// Small fixed banner, mounted app-wide, that surfaces the one thing a cashier
// actually needs to know about connectivity: "is this device offline right
// now, and is anything from it still waiting to reach the server." Silent
// when there's nothing to report.
const OfflineIndicator: React.FC = () => {
    const online = useOnlineStatus();
    const [queuedCount, setQueuedCount] = useState(0);
    const [syncing, setSyncing] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const wasOfflineRef = useRef(false);

    const refreshCount = useCallback(async () => {
        setQueuedCount(await countQueuedSales());
    }, []);

    const runSync = useCallback(async () => {
        setSyncing(true);
        try {
            const result = await syncQueuedSales();
            await refreshCount();
            if (result.synced > 0) {
                messageApi.success(`Synced ${result.synced} offline sale${result.synced > 1 ? 's' : ''}.`);
            }
        } finally {
            setSyncing(false);
        }
    }, [refreshCount, messageApi]);

    // Check once on mount (covers sales queued in a previous session before
    // the browser was closed) and poll lightly in case the queue changes
    // elsewhere or a prior sync attempt stalled mid-way.
    useEffect(() => {
        refreshCount();
        const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [refreshCount]);

    // Fire a sync the moment connectivity returns.
    useEffect(() => {
        if (online && wasOfflineRef.current) {
            runSync();
        }
        wasOfflineRef.current = !online;
    }, [online, runSync]);

    if (online && queuedCount === 0) return null;

    const background = !online ? '#fff2e8' : syncing ? '#e6f4ff' : '#fffbe6';
    const border = !online ? '#ffbb96' : syncing ? '#91caff' : '#ffe58f';
    const color = !online ? '#ad4e00' : syncing ? '#0958d9' : '#874d00';

    return (
        <>
            {contextHolder}
            <div style={{
                position: 'fixed',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1500,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 999,
                background,
                border: `1px solid ${border}`,
                color,
                fontSize: 13,
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                cursor: online && !syncing && queuedCount > 0 ? 'pointer' : 'default',
            }}
                onClick={() => { if (online && !syncing && queuedCount > 0) runSync(); }}
                title={online && !syncing && queuedCount > 0 ? 'Tap to retry sync now' : undefined}
            >
                {!online ? <DisconnectOutlined /> : syncing ? <CloudSyncOutlined spin /> : <WifiOutlined />}
                {!online
                    ? `Offline${queuedCount > 0 ? ` — ${queuedCount} sale${queuedCount > 1 ? 's' : ''} queued` : ''}`
                    : syncing
                        ? 'Syncing offline sales…'
                        : `${queuedCount} sale${queuedCount > 1 ? 's' : ''} waiting to sync — tap to retry`}
            </div>
        </>
    );
};

export default OfflineIndicator;
