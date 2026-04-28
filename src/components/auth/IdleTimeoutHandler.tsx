import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Modal, Button, Progress, Typography } from 'antd';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';

const { Text } = Typography;

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes of no activity → show warning
const WARNING_COUNTDOWN_S = 60;           // 60-second countdown before auto-logout
const REFRESH_THRESHOLD_MS = 15 * 60 * 1000; // Refresh token if < 15 min remaining
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000;   // Check token every 1 minute

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

const IdleTimeoutHandler: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(WARNING_COUNTDOWN_S);

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef(WARNING_COUNTDOWN_S);
    const isWarningActiveRef = useRef(false);
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
        setShowWarning(false);
        await logout();
    }, [logout, clearIdleTimer, clearCountdownTimer]);

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

    const resetIdleTimer = useCallback(() => {
        if (!isAuthenticated) return;
        clearIdleTimer();
        idleTimerRef.current = setTimeout(showIdleWarning, IDLE_TIMEOUT_MS);
    }, [isAuthenticated, clearIdleTimer, showIdleWarning]);

    const handleStayLoggedIn = useCallback(() => {
        clearCountdownTimer();
        isWarningActiveRef.current = false;
        setShowWarning(false);
        setCountdown(WARNING_COUNTDOWN_S);
        resetIdleTimer();
        refreshToken();
    }, [clearCountdownTimer, resetIdleTimer, refreshToken]);

    // Track user activity — reset idle timer on any interaction
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleActivity = () => {
            // While the warning is showing, ignore activity — user must click a button
            if (isWarningActiveRef.current) return;
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
            // Don't refresh while idle warning is showing
            if (isWarningActiveRef.current) return;

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

    if (!isAuthenticated || !showWarning) return null;

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
