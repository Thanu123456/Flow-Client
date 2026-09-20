import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Modal, Button, Progress, Typography } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';
import KioskLockScreen from '../kiosk/KioskLockScreen';
import type { KioskUserInfo } from '../../types/auth/kiosk.types';
import { useKioskLockStore } from '../../store/kiosk/kioskLockStore';
import { isElevated } from '../../utils/elevation';

const { Text } = Typography;

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes of no activity → warn (or, for kiosk, lock)
const WARNING_COUNTDOWN_S = 60;           // 60-second countdown before auto-logout (non-kiosk only)
const REFRESH_THRESHOLD_MS = 15 * 60 * 1000; // Refresh token if < 15 min remaining
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000;   // Check token every 1 minute

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

const IdleTimeoutHandler: React.FC = () => {
    const { isAuthenticated, isKiosk, user, kioskLogin, logout } = useAuth();

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(WARNING_COUNTDOWN_S);
    // Kiosk sessions never see the countdown-to-logout flow above — going idle
    // (or switching away from the tab / exiting fullscreen — see
    // KioskLockdownGuard) just locks the screen in place. The shift/cart are
    // untouched; correct PIN re-entry (KioskLockScreen) resumes them without a
    // page navigation. Backed by a shared store (not local state) since
    // KioskLockdownGuard can also trigger a lock, independently of this
    // component's own idle timer.
    const kioskLocked = useKioskLockStore((s) => s.locked);
    const lockKioskStore = useKioskLockStore((s) => s.lock);
    const unlockKioskStore = useKioskLockStore((s) => s.unlock);

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef(WARNING_COUNTDOWN_S);
    const isWarningActiveRef = useRef(false);
    const isKioskLockedRef = useRef(false);
    const isRefreshingRef = useRef(false);

    const clearIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const clearCountdownTimer = useCallback(() => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }
    }, []);

    const refreshToken = useCallback(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        try {
            const response = await authService.refreshToken();
            localStorage.setItem('token', response.token);
        } catch {
            // Silent — the 401 interceptor handles hard failures
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    const handleLogout = useCallback(async () => {
        clearIdleTimer();
        clearCountdownTimer();
        isWarningActiveRef.current = false;
        isKioskLockedRef.current = false;
        setShowWarning(false);
        unlockKioskStore();
        await logout();
    }, [logout, clearIdleTimer, clearCountdownTimer, unlockKioskStore]);

    const startCountdown = useCallback(() => {
        countdownRef.current = WARNING_COUNTDOWN_S;
        setCountdown(WARNING_COUNTDOWN_S);

        countdownTimerRef.current = setInterval(() => {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);
            if (countdownRef.current <= 0) {
                clearCountdownTimer();
                handleLogout();
            }
        }, 1000);
    }, [clearCountdownTimer, handleLogout]);

    const showIdleWarning = useCallback(() => {
        if (isWarningActiveRef.current) return;
        isWarningActiveRef.current = true;
        setShowWarning(true);
        startCountdown();
    }, [startCountdown]);

    // Kiosk idle → lock in place. No countdown/warning: locking is
    // non-destructive (the shift and cart are untouched underneath), unlike
    // the logout path above, so there's nothing to warn about before it happens.
    const lockKiosk = useCallback(() => {
        if (isKioskLockedRef.current) return;
        clearIdleTimer();
        isKioskLockedRef.current = true;
        lockKioskStore();
    }, [clearIdleTimer, lockKioskStore]);

    // The lock can also be triggered externally (KioskLockdownGuard, on
    // switching tabs or exiting fullscreen) — keep the ref used by the
    // non-reactive closures below in sync, and stop the idle timer so it
    // doesn't also fire while already locked.
    useEffect(() => {
        isKioskLockedRef.current = kioskLocked;
        if (kioskLocked) clearIdleTimer();
    }, [kioskLocked, clearIdleTimer]);

    const resetIdleTimer = useCallback(() => {
        if (!isAuthenticated) return;
        clearIdleTimer();
        idleTimerRef.current = setTimeout(isKiosk ? lockKiosk : showIdleWarning, IDLE_TIMEOUT_MS);
    }, [isAuthenticated, isKiosk, clearIdleTimer, lockKiosk, showIdleWarning]);

    const handleStayLoggedIn = useCallback(() => {
        clearCountdownTimer();
        isWarningActiveRef.current = false;
        setShowWarning(false);
        setCountdown(WARNING_COUNTDOWN_S);
        resetIdleTimer();
        refreshToken();
    }, [clearCountdownTimer, resetIdleTimer, refreshToken]);

    // Re-authenticates the same cashier in place. /kiosk/login resumes the
    // already-active shift rather than starting a new one, so this is safe to
    // call with no other side effects — it just refreshes the token and
    // closes the overlay. Returns false on a wrong PIN; on an account lock
    // (too many wrong PINs) it falls back to a real logout, since the cashier
    // has no way back in without a manager.
    const handleKioskUnlock = useCallback(async (pin: string): Promise<boolean> => {
        if (!user || !('user_id' in user)) return false;
        try {
            await kioskLogin({ user_id: (user as KioskUserInfo).user_id, pin });
            isKioskLockedRef.current = false;
            unlockKioskStore();
            resetIdleTimer();
            return true;
        } catch (err: any) {
            if (err?.response?.status === 423) {
                await handleLogout();
                return true; // overlay should close either way — we're logging out
            }
            return false;
        }
    }, [user, kioskLogin, resetIdleTimer, handleLogout, unlockKioskStore]);

    // Track user activity — reset idle timer on any interaction
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleActivity = () => {
            // While the warning/lock is showing, ignore activity — user must
            // act on the overlay itself (click a button / enter the PIN)
            if (isWarningActiveRef.current || isKioskLockedRef.current) return;
            resetIdleTimer();
        };

        ACTIVITY_EVENTS.forEach(event =>
            window.addEventListener(event, handleActivity, { passive: true })
        );

        resetIdleTimer(); // Start the idle timer on mount

        return () => {
            ACTIVITY_EVENTS.forEach(event =>
                window.removeEventListener(event, handleActivity)
            );
            clearIdleTimer();
            clearCountdownTimer();
        };
    }, [isAuthenticated, resetIdleTimer, clearIdleTimer, clearCountdownTimer]);

    // Auto-refresh token while user is active — prevents the 30-min forced logout
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkAndRefresh = async () => {
            // Don't refresh while the warning/lock overlay is showing
            if (isWarningActiveRef.current || isKioskLockedRef.current) return;
            // A manager's back-office step-up is deliberately non-refreshable
            // (ten minutes, then back to the register) — nothing to refresh.
            if (isElevated()) return;

            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode<{ exp: number }>(token);
                const timeUntilExpiry = decoded.exp * 1000 - Date.now();

                // Refresh if less than 15 minutes remaining
                if (timeUntilExpiry > 0 && timeUntilExpiry <= REFRESH_THRESHOLD_MS) {
                    await refreshToken();
                }
            } catch {
                // Ignore decode errors
            }
        };

        checkAndRefresh(); // Check immediately on mount
        const interval = setInterval(checkAndRefresh, TOKEN_CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAuthenticated, refreshToken]);

    if (!isAuthenticated) return null;

    if (isKiosk) {
        if (!kioskLocked || !user || !('user_id' in user)) return null;
        const kioskUser = user as KioskUserInfo;
        return (
            <KioskLockScreen
                userName={kioskUser.full_name}
                avatarUrl={kioskUser.profile_image_url}
                onUnlock={handleKioskUnlock}
                onEndShiftInstead={handleLogout}
            />
        );
    }

    if (!showWarning) return null;

    const progressPercent = Math.round((countdown / WARNING_COUNTDOWN_S) * 100);
    const strokeColor = countdown <= 15 ? '#ff4d4f' : countdown <= 30 ? '#faad14' : '#1677ff';

    return (
        <Modal
            open={showWarning}
            closable={false}
            maskClosable={false}
            centered
            title="Are you still there?"
            footer={[
                <Button key="logout" danger onClick={handleLogout}>
                    Logout
                </Button>,
                <Button key="stay" type="primary" onClick={handleStayLoggedIn}>
                    Stay Logged In
                </Button>,
            ]}
        >
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Text>
                    You've been inactive for 15 minutes. You'll be logged out automatically in:
                </Text>
                <div style={{ margin: '16px 0' }}>
                    <Progress
                        type="circle"
                        percent={progressPercent}
                        format={() => `${countdown}s`}
                        strokeColor={strokeColor}
                        size={80}
                    />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Click "Stay Logged In" to continue your session.
                </Text>
            </div>
        </Modal>
    );
};

export default IdleTimeoutHandler;
