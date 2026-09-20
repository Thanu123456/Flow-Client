// Manager "step up" from a kiosk register into the back office.
//
// A kiosk device holds the *cashier's* session (a kiosk token + their open
// shift). When a manager needs the dashboard, they enter their own PIN
// (POST /kiosk/elevate) and get a separate, ten-minute, non-refreshable full
// session. This module sets the cashier's session aside, drops the manager's
// in, and restores the cashier's exactly as it was when the elevation ends —
// so the shift keeps running underneath and no admin session is ever left
// logged in on shared hardware.
//
// Everything lives in localStorage (the same place the normal session does)
// and both directions end in a hard navigation, so React state and the query
// cache are rebuilt from scratch instead of carrying one person's data into
// the other's session.

const BACKUP_KEY = 'kioskBackup';
const UNTIL_KEY = 'elevatedUntil';
const BY_KEY = 'elevatedBy';

// Session keys the backup captures / restores.
const SESSION_KEYS = ['token', 'user', 'role', 'mustChangePassword', 'isKiosk'] as const;

export interface ElevationResponse {
    access_token: string;
    expires_in: number;
    user: {
        id: string;
        user_id: string;
        full_name: string;
        user_type: string;
        role?: string;
        profile_image_url?: string;
        permissions?: string[];
    };
}

export function isElevated(): boolean {
    return !!localStorage.getItem(UNTIL_KEY);
}

export function getElevation(): { until: number; by: string } {
    return {
        until: Number(localStorage.getItem(UNTIL_KEY)) || 0,
        by: localStorage.getItem(BY_KEY) || '',
    };
}

function clearElevationKeys() {
    localStorage.removeItem(UNTIL_KEY);
    localStorage.removeItem(BY_KEY);
}

// Puts the manager's session in place. Never overwrites an existing backup, so
// stepping up twice can't replace the cashier's saved session with a manager's.
export function beginElevation(res: ElevationResponse): void {
    if (!localStorage.getItem(BACKUP_KEY)) {
        const backup: Record<string, string | null> = {};
        SESSION_KEYS.forEach((k) => { backup[k] = localStorage.getItem(k); });
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    }

    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('role', res.user.user_type === 'owner' ? 'owner' : 'employee');
    localStorage.setItem('mustChangePassword', 'false');
    localStorage.setItem('isKiosk', 'false');
    // Expire our side a few seconds before the token does, so the UI ends the
    // elevation cleanly instead of the first API call after expiry failing.
    localStorage.setItem(UNTIL_KEY, String(Date.now() + res.expires_in * 1000 - 5000));
    localStorage.setItem(BY_KEY, res.user.full_name);
}

// Puts the cashier's kiosk session back. Returns false if there was nothing to
// restore (in which case the caller should fall back to a normal logout).
export function restoreKioskSession(): boolean {
    const raw = localStorage.getItem(BACKUP_KEY);
    clearElevationKeys();
    if (!raw) return false;
    localStorage.removeItem(BACKUP_KEY);
    try {
        const backup = JSON.parse(raw) as Record<string, string | null>;
        SESSION_KEYS.forEach((k) => {
            const v = backup[k];
            if (v === null || v === undefined) localStorage.removeItem(k);
            else localStorage.setItem(k, v);
        });
        return true;
    } catch {
        return false;
    }
}

// Enter the back office as the manager.
export function startElevation(res: ElevationResponse): void {
    beginElevation(res);
    window.location.href = '/dashboard';
}

// Leave the back office and go back to the register.
export function endElevation(): void {
    if (restoreKioskSession()) {
        window.location.href = '/kiosk/dashboard';
    } else {
        // No cashier session to return to — fall back to the kiosk sign-in.
        window.location.href = '/kiosk/login';
    }
}
