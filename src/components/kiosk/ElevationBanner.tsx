import React, { useEffect, useState } from 'react';
import { SafetyCertificateFilled } from '@ant-design/icons';
import { endElevation, getElevation, isElevated } from '../../utils/elevation';

// Shown app-wide while a manager has stepped into the back office from a kiosk
// register (see utils/elevation.ts). Makes the temporary nature obvious, counts
// down to the automatic return, and gives a one-click way back to the register.
// Renders nothing in a normal session.
const ElevationBanner: React.FC = () => {
    const [remainingMs, setRemainingMs] = useState<number | null>(null);
    const [by, setBy] = useState('');

    useEffect(() => {
        if (!isElevated()) return;
        const { until, by: name } = getElevation();
        setBy(name);

        const tick = () => {
            const left = until - Date.now();
            if (left <= 0) {
                endElevation();
                return;
            }
            setRemainingMs(left);
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);

    if (remainingMs === null) return null;

    const mm = Math.floor(remainingMs / 60000);
    const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

    return (
        <div
            role="status"
            style={{
                position: 'fixed',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2100,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px 6px 14px',
                borderRadius: 999,
                background: '#0f172a',
                color: '#fff',
                fontSize: 13,
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                maxWidth: 'calc(100vw - 24px)',
            }}
        >
            <SafetyCertificateFilled style={{ color: '#60a5fa' }} />
            <span>
                Back office as <strong>{by}</strong> · {mm}:{ss} left
            </span>
            <button
                type="button"
                onClick={endElevation}
                style={{
                    border: 0,
                    borderRadius: 999,
                    padding: '6px 12px',
                    background: '#fff',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
            >
                Return to register
            </button>
        </div>
    );
};

export default ElevationBanner;
