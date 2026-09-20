import React, { useState } from 'react';
import { Button, theme } from 'antd';
import { ShopOutlined, QrcodeOutlined, WarningFilled, ArrowRightOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';
import { useTenant } from '../../contexts/TenantContext';

// Shown on a kiosk device that has no shop branded to it yet (fresh browser,
// or one that was explicitly re-paired). Trades the old "an owner must fully
// log into the main app on this exact device first" bootstrap for a short
// code read off the admin dashboard — the same idea as Square/Toast/Clover's
// device-pairing flow.
const KioskDeviceSetup: React.FC = () => {
    const { setTenant } = useTenant();
    const { token } = theme.useToken();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const trimmed = code.trim();
        if (!trimmed) {
            setError('Enter the store code shown in your admin dashboard.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const store = await authService.resolveKioskStore(trimmed);
            setTenant({
                id: store.tenant_id,
                shop_name: store.shop_name,
                logo_url: store.logo_url,
                status: 'active',
            });
        } catch (err: any) {
            const msg = err.response?.data?.error?.details
                || err.response?.data?.error?.message
                || 'Store code not recognized. Check the code and try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ks-root" style={{ '--ks-primary': token.colorPrimary } as React.CSSProperties}>
            <form
                className="ks-card"
                onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                noValidate
            >
                <div className="ks-badge"><ShopOutlined /></div>
                <h1 className="ks-title">Set up this kiosk</h1>
                <p className="ks-lead">
                    Enter the store code from your admin dashboard to connect this device to your shop.
                </p>

                {error && (
                    <div className="ks-error" role="alert">
                        <WarningFilled />
                        <span>{error}</span>
                    </div>
                )}

                <label className="ks-field">
                    <span className="ks-label"><QrcodeOutlined /> Store code</span>
                    <input
                        className="ks-input"
                        value={code}
                        onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                        placeholder="A3F9K2M1"
                        maxLength={12}
                        autoFocus
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        disabled={loading}
                        aria-label="Store code"
                    />
                </label>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    disabled={!code.trim()}
                    className="ks-submit"
                    icon={!loading ? <ArrowRightOutlined /> : undefined}
                    iconPosition="end"
                >
                    Pair device
                </Button>

                <p className="ks-help">
                    Ask your manager for the code — it's under <strong>Kiosk Pairing Code</strong> in the
                    profile menu of the main dashboard.
                </p>
            </form>

            <style>{`
                .ks-root {
                    min-height: 100vh;
                    min-height: 100dvh;
                    display: grid;
                    place-items: center;
                    padding: 20px;
                    background:
                        radial-gradient(90% 70% at 15% 0%, color-mix(in srgb, var(--ks-primary) 50%, transparent) 0%, transparent 60%),
                        linear-gradient(160deg, #0b1220 0%, #10213f 100%);
                }
                .ks-card {
                    width: 100%;
                    max-width: 440px;
                    background: #fff;
                    border-radius: 24px;
                    padding: clamp(24px, 5vw, 40px);
                    box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    color: #0f172a;
                }
                .ks-badge {
                    width: 60px; height: 60px; border-radius: 18px;
                    display: grid; place-items: center;
                    font-size: 26px; color: #fff;
                    background: var(--ks-primary);
                    box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--ks-primary) 70%, transparent);
                }
                .ks-title { margin: 4px 0 0; font-size: clamp(24px, 4vw, 30px); font-weight: 700; letter-spacing: -0.02em; }
                .ks-lead { margin: -6px 0 4px; color: #64748b; font-size: 15px; line-height: 1.5; }
                .ks-error {
                    display: flex; align-items: flex-start; gap: 10px;
                    padding: 12px 14px; border-radius: 12px;
                    background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
                    font-size: 14px; line-height: 1.4;
                }
                .ks-error .anticon { margin-top: 2px; color: #dc2626; }
                .ks-field {
                    display: flex; flex-direction: column; gap: 6px;
                    padding: 12px 16px; border-radius: 16px;
                    border: 1.5px solid #e3e8ef; background: #fff;
                    transition: border-color .15s, box-shadow .15s;
                }
                .ks-field:focus-within {
                    border-color: var(--ks-primary);
                    box-shadow: 0 0 0 4px color-mix(in srgb, var(--ks-primary) 14%, transparent);
                }
                .ks-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; display: flex; align-items: center; gap: 6px; }
                .ks-input {
                    border: 0; outline: 0; background: transparent; width: 100%;
                    font-size: 26px; font-weight: 700; letter-spacing: 0.22em;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                    color: #0f172a; padding: 2px 0; min-height: 36px;
                }
                .ks-input::placeholder { color: #c3ccd9; letter-spacing: 0.22em; }
                .ks-submit.ant-btn {
                    height: 56px; border-radius: 16px; font-size: 17px; font-weight: 600;
                    box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--ks-primary) 60%, transparent);
                }
                .ks-submit.ant-btn:disabled { box-shadow: none; }
                .ks-help { margin: 0; text-align: center; color: #94a3b8; font-size: 13px; line-height: 1.5; }
                .ks-help strong { color: #64748b; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default KioskDeviceSetup;
