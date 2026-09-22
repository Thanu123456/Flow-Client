import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';
import { getOrCreateDeviceId } from '../../utils/kiosk/deviceId';

// Every 60s, matching the backend's KioskService.HeartbeatIntervalSeconds —
// keep these in lockstep if either changes.
const HEARTBEAT_INTERVAL_MS = 60_000;

// Powers the admin fleet view (Settings → Kiosk Devices): every kiosk device,
// signed in or not, checks in periodically so an owner can tell "idle at the
// PIN screen" apart from "unplugged/offline", and so a remote sign-out
// requested from that fleet view actually has a way to reach the device (it
// takes effect on the next check-in, not instantly — there's no push channel
// to a browser tab). Renders nothing; a manager's back-office elevation
// (which flips isKiosk to false in localStorage) naturally pauses this too,
// since there's no device-fleet concept to report for a full session.
const KioskHeartbeat: React.FC = () => {
    const { isAuthenticated, isKiosk, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !isKiosk) return;

        let cancelled = false;
        const beat = async () => {
            try {
                const result = await authService.kioskHeartbeat(getOrCreateDeviceId());
                if (!cancelled && result.force_signout) {
                    await logout();
                }
            } catch {
                // A missed heartbeat just means this device shows as offline in
                // the fleet view until the next successful one — nothing to react
                // to client-side (in particular, never force a logout on failure).
            }
        };

        beat();
        const t = setInterval(beat, HEARTBEAT_INTERVAL_MS);
        return () => { cancelled = true; clearInterval(t); };
    }, [isAuthenticated, isKiosk, logout]);

    return null;
};

export default KioskHeartbeat;
