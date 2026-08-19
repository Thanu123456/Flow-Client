import React, { useEffect, useState, useCallback } from 'react';
import {
    Button,
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Avatar,
    Modal,
    message,
    theme,
    Spin,
} from 'antd';
import {
    LogoutOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    DollarOutlined,
    NumberOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';
import type { KioskSessionInfo, KioskEndShiftResponse } from '../../types/auth/kiosk.types';

const { Title, Text } = Typography;

const KioskPOS: React.FC = () => {
    const { user, tenant, logout } = useAuth();
    const { token } = theme.useToken();
    const navigate = useNavigate();

    const [session, setSession] = useState<KioskSessionInfo | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [ending, setEnding] = useState(false);
    const [summary, setSummary] = useState<KioskEndShiftResponse | null>(null);
    const [now, setNow] = useState(dayjs());

    const loadSession = useCallback(async () => {
        try {
            const data = await authService.getKioskSession();
            setSession(data);
        } catch {
            message.error('Failed to load shift session');
        } finally {
            setLoadingSession(false);
        }
    }, []);

    useEffect(() => { loadSession(); }, [loadSession]);

    useEffect(() => {
        const timer = setInterval(() => setNow(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    const shiftDuration = (() => {
        if (!session) return '--:--:--';
        const totalSeconds = Math.max(0, now.diff(dayjs(session.shift_started_at), 'second'));
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
    })();

    const handleEndShift = () => {
        Modal.confirm({
            title: 'End Shift',
            content: 'Are you sure you want to end your shift? You will be signed out and this device will return to the kiosk login screen.',
            okText: 'End Shift',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setEnding(true);
                try {
                    const result = await authService.endShift();
                    setSummary(result);
                } catch {
                    message.error('Failed to end shift. Please try again.');
                } finally {
                    setEnding(false);
                }
            },
        });
    };

    const handleCloseSummary = async () => {
        // The shift is already ended server-side; this just clears the local
        // session and sends the device back to the kiosk login screen.
        await logout();
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        src={tenant?.logo_url}
                        icon={<ShopOutlined />}
                        size={48}
                        style={{ background: token.colorPrimary }}
                    />
                    <div>
                        <Title level={3} style={{ margin: 0 }}>{tenant?.shop_name || 'Flow POS'}</Title>
                        <Text type="secondary">{now.format('ddd, MMM DD, YYYY · hh:mm:ss A')}</Text>
                    </div>
                </div>
                <Button danger size="large" icon={<LogoutOutlined />} onClick={handleEndShift} loading={ending}>
                    End Shift
                </Button>
            </div>

            <Card
                style={{ borderRadius: 20, marginBottom: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                bodyStyle={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}
            >
                <Avatar
                    size={64}
                    src={user && 'profile_image_url' in user ? user.profile_image_url : undefined}
                    icon={<UserOutlined />}
                    style={{ background: token.colorPrimary }}
                />
                <div>
                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Signed in as
                    </Text>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{user?.full_name || 'Cashier'}</div>
                    <Text type="secondary">
                        {user && 'role' in user && user.role ? user.role : 'Cashier'}
                        {user && 'user_id' in user ? ` · ID: ${user.user_id}` : ''}
                    </Text>
                </div>
            </Card>

            {loadingSession ? (
                <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
            ) : (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic
                                title="Today's Sales"
                                value={session?.total_sales ?? 0}
                                precision={2}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: token.colorPrimary }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic
                                title="Transactions"
                                value={session?.total_transactions ?? 0}
                                prefix={<NumberOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Statistic
                                title="Shift Duration"
                                value={shiftDuration}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Button
                type="primary"
                size="large"
                block
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/pos')}
                style={{ height: 72, fontSize: 20, fontWeight: 600, borderRadius: 16 }}
            >
                Go to POS Terminal
            </Button>

            <Modal
                open={!!summary}
                title="Shift Summary"
                closable={false}
                maskClosable={false}
                footer={[
                    <Button key="done" type="primary" size="large" block onClick={handleCloseSummary}>
                        Done — Sign Out
                    </Button>,
                ]}
            >
                {summary && (
                    <Row gutter={[16, 16]}>
                        <Col span={12}><Statistic title="Total Sales" value={summary.total_sales} precision={2} prefix="Rs." /></Col>
                        <Col span={12}><Statistic title="Transactions" value={summary.total_transactions} /></Col>
                        <Col span={12}><Statistic title="Cash Sales" value={summary.total_cash_sales} precision={2} prefix="Rs." /></Col>
                        <Col span={12}><Statistic title="Card Sales" value={summary.total_card_sales} precision={2} prefix="Rs." /></Col>
                        <Col span={24}><Statistic title="Refunds" value={summary.total_refunds} precision={2} prefix="Rs." /></Col>
                    </Row>
                )}
            </Modal>
        </div>
    );
};

export default KioskPOS;
