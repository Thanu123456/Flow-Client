import React, { useState } from 'react';
import { Card, Typography, Input, Button, Alert, theme } from 'antd';
import { ShopOutlined, QrcodeOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';
import { useTenant } from '../../contexts/TenantContext';

const { Title, Text } = Typography;

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
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
        }}>
            <Card style={{ maxWidth: 440, width: '100%', borderRadius: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.1)', padding: '32px 10px' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', background: token.colorPrimary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    }}>
                        <ShopOutlined style={{ fontSize: 32, color: '#fff' }} />
                    </div>
                    <Title level={3} style={{ marginBottom: 4 }}>Set Up This Kiosk</Title>
                    <Text type="secondary">Enter the store code from your admin dashboard to pair this device.</Text>
                </div>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 24, borderRadius: 12 }}
                    />
                )}

                <Input
                    size="large"
                    placeholder="e.g. A3F9K2M1"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onPressEnter={handleSubmit}
                    maxLength={12}
                    autoFocus
                    disabled={loading}
                    prefix={<QrcodeOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ height: 56, fontSize: 20, letterSpacing: 4, textAlign: 'center', borderRadius: 12, marginBottom: 20 }}
                />

                <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onClick={handleSubmit}
                    style={{ height: 56, fontSize: 18, fontWeight: 600, borderRadius: 12 }}
                >
                    Pair Device
                </Button>

                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 13 }}>
                    Ask your manager for the store code — it's under Settings on the main dashboard.
                </Text>
            </Card>
        </div>
    );
};

export default KioskDeviceSetup;
