import React, { useEffect, useState } from 'react';
import { Avatar, Button, Modal, message, theme } from 'antd';
import {
    ShopOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    QrcodeOutlined,
    LockOutlined,
    WalletOutlined,
    UserOutlined,
    DownOutlined,
    ArrowRightOutlined,
    WarningFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import VirtualKeypad from '../../components/kiosk/VirtualKeypad';
import KioskDeviceSetup from '../../components/kiosk/KioskDeviceSetup';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import type { KioskLoginRequest } from '../../types/auth/kiosk.types';
import DenominationCounter, { denominationTotal } from '../../components/kiosk/DenominationCounter';
import type { DenominationCounts } from '../../components/kiosk/DenominationCounter';

const PIN_LENGTH = 6;

const KioskLogin: React.FC = () => {
    const { kioskLogin } = useAuth();
    const { tenant, loading: tenantLoading, setTenant } = useTenant();
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [now, setNow] = useState(dayjs());

    // Which field the on-screen keypad currently types into.
    const [activeField, setActiveField] = useState<'user_id' | 'pin'>('user_id');
    const [userId, setUserId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [shake, setShake] = useState(false);

    const [showDrawer, setShowDrawer] = useState(false);
    const [openingCounts, setOpeningCounts] = useState<DenominationCounts>({});

    useEffect(() => {
        const t = setInterval(() => setNow(dayjs()), 1000 * 15);
        return () => clearInterval(t);
    }, []);

    // Badge/QR clock-in: an ID badge printed with the User ID as a barcode/QR,
    // read by a HID scanner (types the payload like a fast keyboard). Fills
    // the ID and jumps straight to PIN entry.
    useBarcodeScanner({
        enabled: !loading,
        onScan: (code) => {
            const trimmed = code.trim();
            if (!trimmed) return;
            setUserId(trimmed);
            setPin('');
            setError(null);
            setActiveField('pin');
        },
    });

    // This device has never been paired to a shop — resolve which tenant it
    // belongs to before showing the PIN login screen.
    if (!tenantLoading && !tenant) {
        return <KioskDeviceSetup />;
    }

    const openingCash = denominationTotal(openingCounts);
    const canSubmit = userId.trim().length >= 3 && pin.length >= 4 && !loading;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
        }
    };

    const focusPin = () => {
        // Drop focus from the ID input so the keypad (not the OS keyboard) is in charge.
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setActiveField('pin');
    };

    const handleKeypadPress = (key: string) => {
        setError(null);
        if (activeField === 'pin') {
            setPin((p) => (p.length < PIN_LENGTH ? p + key : p));
        } else {
            setUserId((u) => (u.length < 20 ? u + key : u));
        }
    };

    const handleBackspace = () => {
        if (activeField === 'pin') setPin((p) => p.slice(0, -1));
        else setUserId((u) => u.slice(0, -1));
    };

    const handleClear = () => {
        if (activeField === 'pin') setPin('');
        else setUserId('');
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setError(null);
        try {
            const loginData: KioskLoginRequest = {
                user_id: userId.trim(),
                pin,
                opening_cash: openingCash > 0 ? openingCash : undefined,
                opening_denomination: openingCash > 0 ? JSON.stringify(openingCounts) : undefined,
            };
            await kioskLogin(loginData);
            messageApi.success('Shift started');
            navigate('/pos');
        } catch (err: any) {
            console.error('Kiosk Login Failed:', err);
            // Backend errors are shaped { error: { message, details } } — the
            // details carry the useful part (e.g. "2 attempts remaining").
            const msg = err.response?.data?.error?.details
                || err.response?.data?.error?.message
                || 'Invalid User ID or PIN';
            setError(msg);
            setPin('');
            setActiveField('pin');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    const showHelp = () => {
        Modal.info({
            title: 'Need help signing in?',
            centered: true,
            content: (
                <div>
                    <p>Ask your manager or shop owner to reset your PIN from the admin dashboard.</p>
                    <p>After several wrong PINs an account locks for a short while — your manager can unlock it sooner.</p>
                </div>
            ),
        });
    };

    const shopName = tenant?.shop_name || 'Flow POS';

    return (
        <div className="kl-root" style={{ '--kl-primary': token.colorPrimary } as React.CSSProperties}>
            {contextHolder}

            {/* ── Brand panel ─────────────────────────────────────────────── */}
            <aside className="kl-brand">
                <div className="kl-brand-head">
                    <Avatar
                        src={tenant?.logo_url}
                        icon={<ShopOutlined />}
                        size={52}
                        style={{ background: 'rgba(255,255,255,0.14)', flexShrink: 0 }}
                    />
                    <div className="kl-brand-name">
                        <div className="kl-shop">{shopName}</div>
                        <div className="kl-eyebrow">Team sign-in</div>
                    </div>
                </div>

                <div className="kl-clock" aria-live="off">
                    <div className="kl-time">
                        {now.format('hh:mm')}
                        <span>{now.format('A')}</span>
                    </div>
                    <div className="kl-date">{now.format('dddd, MMMM D')}</div>
                </div>

                <ul className="kl-tips">
                    <li><QrcodeOutlined /><span>Scan your badge to fill in your ID</span></li>
                    <li><LockOutlined /><span>Enter your PIN to start your shift</span></li>
                    <li><WalletOutlined /><span>Count your opening drawer if asked</span></li>
                </ul>
            </aside>

            {/* ── Sign-in panel ───────────────────────────────────────────── */}
            <main className="kl-main">
                <div className="kl-toolbar">
                    <button
                        type="button"
                        className="kl-icon-btn"
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                    </button>
                </div>

                <form
                    className="kl-panel"
                    onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                    noValidate
                >
                    <h1 className="kl-title">Welcome back</h1>
                    <p className="kl-lead">Enter your ID and PIN to start your shift.</p>

                    {error && (
                        <div className="kl-error" role="alert">
                            <WarningFilled />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* User ID */}
                    <label
                        className={`kl-field${activeField === 'user_id' ? ' kl-field--active' : ''}`}
                        onClick={() => setActiveField('user_id')}
                    >
                        <span className="kl-field-label"><UserOutlined /> User ID</span>
                        <input
                            className="kl-input"
                            value={userId}
                            onChange={(e) => { setUserId(e.target.value); setError(null); }}
                            onFocus={() => setActiveField('user_id')}
                            onKeyDown={(e) => { if (e.key === 'Enter' && userId.trim().length >= 3) { e.preventDefault(); focusPin(); } }}
                            placeholder="e.g. EMP001"
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            maxLength={20}
                            disabled={loading}
                            aria-label="User ID"
                        />
                    </label>

                    {/* PIN */}
                    <div
                        className={`kl-field kl-field--pin${activeField === 'pin' ? ' kl-field--active' : ''}${shake ? ' kl-shake' : ''}`}
                        onClick={focusPin}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusPin(); } }}
                        aria-label={`PIN, ${pin.length} of ${PIN_LENGTH} digits entered`}
                    >
                        <span className="kl-field-label"><LockOutlined /> PIN</span>
                        <div className="kl-dots">
                            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                                <span key={i} className={`kl-dot${i < pin.length ? ' kl-dot--on' : ''}`} />
                            ))}
                        </div>
                    </div>

                    <VirtualKeypad
                        onKeyPress={handleKeypadPress}
                        onBackspace={handleBackspace}
                        onClear={handleClear}
                        disabled={loading}
                    />

                    {/* Opening drawer (optional) */}
                    <div className="kl-drawer">
                        <button
                            type="button"
                            className="kl-drawer-toggle"
                            onClick={() => setShowDrawer((v) => !v)}
                            aria-expanded={showDrawer}
                        >
                            <span><WalletOutlined /> Opening drawer count <em>(optional)</em></span>
                            <span className="kl-drawer-meta">
                                {openingCash > 0 ? `Rs. ${openingCash.toFixed(2)}` : 'Skip'}
                                <DownOutlined className={showDrawer ? 'kl-rot' : ''} />
                            </span>
                        </button>
                        {showDrawer && (
                            <div className="kl-drawer-body">
                                <DenominationCounter value={openingCounts} onChange={setOpeningCounts} />
                            </div>
                        )}
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        disabled={!canSubmit}
                        className="kl-submit"
                        icon={!loading ? <ArrowRightOutlined /> : undefined}
                        iconPosition="end"
                    >
                        Start shift
                    </Button>

                    <div className="kl-links">
                        <button type="button" onClick={showHelp}>Forgot PIN or ID?</button>
                        <span aria-hidden="true">·</span>
                        <button type="button" onClick={() => setTenant(null)}>Not {shopName}? Re-pair device</button>
                    </div>
                </form>
            </main>

            <style>{css}</style>
        </div>
    );
};

const css = `
.kl-root {
  --kl-ink: #0f172a;
  --kl-muted: #64748b;
  --kl-line: #e3e8ef;
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(320px, 5fr) 7fr;
  background: #f4f6fa;
  color: var(--kl-ink);
}

/* ── Brand panel ───────────────────────────────────────────── */
.kl-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: clamp(28px, 5vh, 56px) clamp(28px, 4vw, 56px);
  color: #fff;
  background:
    radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--kl-primary) 55%, transparent) 0%, transparent 60%),
    linear-gradient(160deg, #0b1220 0%, #10213f 100%);
  overflow: hidden;
}
.kl-brand::after {
  content: '';
  position: absolute;
  width: 420px; height: 420px;
  right: -140px; bottom: -160px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 0 0 60px rgba(255,255,255,0.025), 0 0 0 120px rgba(255,255,255,0.018);
  pointer-events: none;
}
.kl-brand-head { display: flex; align-items: center; gap: 14px; position: relative; z-index: 1; }
.kl-shop { font-size: 22px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
.kl-eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.6; margin-top: 2px; }
.kl-clock { position: relative; z-index: 1; }
.kl-time { font-size: clamp(56px, 9vh, 96px); font-weight: 300; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.kl-time span { font-size: 0.28em; font-weight: 600; margin-left: 10px; opacity: 0.6; letter-spacing: 0.08em; }
.kl-date { margin-top: 10px; font-size: 16px; opacity: 0.7; }
.kl-tips { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; position: relative; z-index: 1; }
.kl-tips li { display: flex; align-items: center; gap: 12px; font-size: 14px; opacity: 0.85; }
.kl-tips .anticon {
  width: 34px; height: 34px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 10px; background: rgba(255,255,255,0.1); font-size: 15px;
}

/* ── Sign-in panel ─────────────────────────────────────────── */
.kl-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px clamp(16px, 4vw, 48px) clamp(20px, 4vh, 40px);
  overflow-y: auto;
}
.kl-toolbar { width: 100%; display: flex; justify-content: flex-end; }
.kl-icon-btn {
  width: 44px; height: 44px; border-radius: 12px;
  border: 1px solid var(--kl-line); background: #fff; color: var(--kl-muted);
  font-size: 18px; cursor: pointer; display: grid; place-items: center;
  transition: color .15s, border-color .15s, background .15s;
}
.kl-icon-btn:hover { color: var(--kl-primary); border-color: var(--kl-primary); }
.kl-icon-btn:focus-visible, .kl-links button:focus-visible, .kl-drawer-toggle:focus-visible, .kl-field:focus-visible {
  outline: 3px solid var(--kl-primary); outline-offset: 2px;
}
.kl-panel {
  width: 100%;
  max-width: 440px;
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.6vh, 16px);
}
.kl-title { margin: 0; font-size: clamp(26px, 4vh, 34px); font-weight: 700; letter-spacing: -0.02em; }
.kl-lead { margin: -6px 0 4px; color: var(--kl-muted); font-size: 15px; }

.kl-error {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-radius: 12px;
  background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
  font-size: 14px; line-height: 1.4;
}
.kl-error .anticon { margin-top: 2px; color: #dc2626; }

.kl-field {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 16px;
  background: #fff;
  border: 1.5px solid var(--kl-line);
  border-radius: 16px;
  cursor: text;
  transition: border-color .15s, box-shadow .15s;
}
.kl-field--pin { cursor: pointer; }
.kl-field--active {
  border-color: var(--kl-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--kl-primary) 14%, transparent);
}
.kl-field-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--kl-muted); display: flex; align-items: center; gap: 6px; }
.kl-input {
  border: 0; outline: 0; background: transparent; width: 100%;
  font-size: clamp(20px, 3vh, 24px); font-weight: 600; font-family: inherit; color: var(--kl-ink);
  padding: 2px 0; min-height: 32px;
}
.kl-input::placeholder { color: #b6c0cf; font-weight: 500; }
.kl-dots { display: flex; gap: 14px; align-items: center; min-height: 32px; }
.kl-dot {
  width: 16px; height: 16px; border-radius: 50%;
  background: #e3e8ef;
  transition: background .15s, transform .15s;
}
.kl-dot--on { background: var(--kl-primary); transform: scale(1.12); }

.kl-shake { animation: kl-shake .45s ease; border-color: #ef4444; }
@keyframes kl-shake {
  10%, 90% { transform: translateX(-2px); }
  20%, 80% { transform: translateX(4px); }
  30%, 50%, 70% { transform: translateX(-7px); }
  40%, 60% { transform: translateX(7px); }
}

.kl-drawer { border: 1.5px dashed #cfd7e3; border-radius: 16px; background: rgba(255,255,255,0.6); }
.kl-drawer-toggle {
  width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 12px 16px; border: 0; background: transparent; cursor: pointer;
  font-size: 14px; font-weight: 600; color: var(--kl-ink); font-family: inherit; text-align: left;
  border-radius: 16px;
}
.kl-drawer-toggle em { font-style: normal; font-weight: 500; color: var(--kl-muted); }
.kl-drawer-meta { display: flex; align-items: center; gap: 8px; color: var(--kl-muted); font-weight: 500; white-space: nowrap; }
.kl-rot { transform: rotate(180deg); }
.kl-drawer-body { padding: 4px 16px 16px; }

.kl-submit.ant-btn {
  height: clamp(52px, 8vh, 60px);
  border-radius: 16px;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--kl-primary) 60%, transparent);
}
.kl-submit.ant-btn:disabled { box-shadow: none; }

.kl-links { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 6px 10px; color: #94a3b8; font-size: 13px; }
.kl-links button { border: 0; background: none; padding: 4px 2px; color: var(--kl-muted); cursor: pointer; font-family: inherit; font-size: 13px; border-radius: 6px; }
.kl-links button:hover { color: var(--kl-primary); text-decoration: underline; }

/* ── Responsive ────────────────────────────────────────────── */
/* Tablet portrait & phones: brand panel becomes a compact header. */
@media (max-width: 899px) {
  .kl-root { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .kl-brand {
    flex-direction: row; align-items: center; justify-content: space-between;
    gap: 16px; padding: 14px 18px;
  }
  .kl-brand::after, .kl-tips, .kl-date, .kl-eyebrow { display: none; }
  .kl-shop { font-size: 17px; }
  .kl-time { font-size: 24px; font-weight: 500; }
  .kl-time span { font-size: 0.5em; margin-left: 6px; }
  .kl-toolbar { display: none; }
  .kl-main { padding-top: 20px; }
  .kl-panel { margin: auto; }
  .kl-lead { display: none; }
  /* The page scrolls on small screens — keep the primary action reachable. */
  .kl-submit.ant-btn { position: sticky; bottom: 12px; z-index: 2; }
}
/* Desktop / landscape tablet: lock the layout to the viewport so the brand
   panel never scrolls away and the sign-in panel scrolls on its own if a
   very short screen still can't fit everything. */
@media (min-width: 900px) {
  .kl-root { height: 100vh; height: 100dvh; }
  .kl-main { position: relative; }
  .kl-toolbar { position: absolute; top: 16px; right: clamp(16px, 3vw, 32px); width: auto; }
}
/* Short screens (1366x768 laptops/kiosks and below): tighten spacing so the
   whole form — including Start shift — fits without scrolling. */
@media (min-width: 900px) and (max-height: 860px) {
  .kl-lead { display: none; }
  .kl-title { font-size: 26px; }
  .kl-panel { gap: 8px; }
  .kl-field { padding: 8px 14px; gap: 2px; }
  .kl-input { font-size: 20px; min-height: 28px; }
  .kl-dots { min-height: 28px; }
  .kl-drawer-toggle { padding: 9px 14px; }
  .kl-links { margin-top: -2px; }
}
@media (max-width: 380px) {
  .kl-dots { gap: 10px; }
  .kl-dot { width: 14px; height: 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .kl-shake { animation: none; }
  .kl-dot, .kl-field { transition: none; }
}
`;

export default KioskLogin;
