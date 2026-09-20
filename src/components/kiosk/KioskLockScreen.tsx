import React, { useState } from 'react';
import { Avatar, Typography, Alert, Button, theme } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import VirtualKeypad from './VirtualKeypad';

const { Title, Text } = Typography;

interface Props {
    userName: string;
    avatarUrl?: string;
    // Resolves true once the PIN has been accepted and the screen should
    // close. Left un-resolved (returns false) on a wrong PIN — the caller is
    // responsible for surfacing a hard failure (e.g. account locked) itself.
    onUnlock: (pin: string) => Promise<boolean>;
    onEndShiftInstead: () => void;
}

// Full-screen overlay shown over an idle kiosk session instead of logging the
// cashier out. Nothing under it unmounts — the cart and shift stay exactly as
// they were; re-entering the same PIN just resumes the active shift (the
// backend's /kiosk/login already does this) and closes the overlay.
const KioskLockScreen: React.FC<Props> = ({ userName, avatarUrl, onUnlock, onEndShiftInstead }) => {
    const { token } = theme.useToken();
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (key: string) => {
        if (loading || pin.length >= 6) return;
        setError(null);
        setPin(pin + key);
    };

    const handleBackspace = () => {
        if (loading) return;
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        if (loading) return;
        setPin('');
    };

    const handleUnlock = async () => {
        if (pin.length < 4 || loading) return;
        setLoading(true);
        setError(null);
        try {
            const ok = await onUnlock(pin);
            if (!ok) {
                setError('Incorrect PIN. Try again.');
                setPin('');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
                background: '#fff',
                borderRadius: 24,
                padding: '40px 36px',
                width: '100%',
                maxWidth: 420,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                textAlign: 'center',
            }}>
                <Avatar
                    size={72}
                    src={avatarUrl}
                    icon={<UserOutlined />}
                    style={{ background: token.colorPrimary, marginBottom: 16 }}
                />
                <Title level={3} style={{ margin: 0 }}>{userName}</Title>
                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                    <LockOutlined /> Session locked — enter PIN to resume
                </Text>

                {error && (
                    <Alert message={error} type="error" showIcon style={{ margin: '20px 0 0', borderRadius: 12, textAlign: 'left' }} />
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 14,
                    margin: '28px 0',
                }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: i < pin.length ? token.colorPrimary : '#e0e0e0',
                            transition: 'all 0.15s',
                        }} />
                    ))}
                </div>

                <VirtualKeypad
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                    disabled={loading}
                />

                <Button
                    type="primary"
                    block
                    size="large"
                    loading={loading}
                    disabled={pin.length < 4}
                    onClick={handleUnlock}
                    style={{ height: 56, fontSize: 18, fontWeight: 600, borderRadius: 14, marginTop: 24 }}
                >
                    Unlock
                </Button>

                <Button type="link" onClick={onEndShiftInstead} style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>
                    Not you? End shift and sign out
                </Button>
            </div>
        </div>
    );
};

export default KioskLockScreen;
