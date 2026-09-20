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
    Radio,
    Input,
    InputNumber,
    Empty,
    List,
    Alert,
} from 'antd';
import {
    LogoutOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    DollarOutlined,
    NumberOutlined,
    ClockCircleOutlined,
    WalletOutlined,
    UserSwitchOutlined,
    TagOutlined,
    RollbackOutlined,
    TrophyOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth/authService';
import { settingsService } from '../../services/management/settingsService';
import type { KioskSessionInfo, KioskEndShiftResponse, ShiftInsights } from '../../types/auth/kiosk.types';
import BackOfficeAccessModal from '../../components/kiosk/BackOfficeAccessModal';
import DenominationCounter, { denominationTotal } from '../../components/kiosk/DenominationCounter';
import type { DenominationCounts } from '../../components/kiosk/DenominationCounter';

const { Title, Text } = Typography;

const KioskPOS: React.FC = () => {
    const { user, tenant, logout, switchKioskUser } = useAuth();
    const { token } = theme.useToken();
    const navigate = useNavigate();

    const [session, setSession] = useState<KioskSessionInfo | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [ending, setEnding] = useState(false);
    const [summary, setSummary] = useState<KioskEndShiftResponse | null>(null);
    const [now, setNow] = useState(dayjs());

    // ── Closing cash count (shown before the shift is actually ended) ──────
    const [countModalVisible, setCountModalVisible] = useState(false);
    const [closingCounts, setClosingCounts] = useState<DenominationCounts>({});

    // ── Manual cash in/out (mid-shift drawer movement) ──────────────────────
    const [movementModalVisible, setMovementModalVisible] = useState(false);
    const [movementDirection, setMovementDirection] = useState<'in' | 'out'>('out');
    const [movementAmount, setMovementAmount] = useState<number>(0);
    const [movementNote, setMovementNote] = useState('');
    const [recordingMovement, setRecordingMovement] = useState(false);

    // ── Manager back-office step-up (PIN) ────────────────────────────────
    const [backOfficeOpen, setBackOfficeOpen] = useState(false);

    // ── Shift insights (hourly trend, top items, discount/refund activity) ──
    const [insights, setInsights] = useState<ShiftInsights | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(true);

    // ── Blind cash count (tenant setting) + live expected-cash preview ──────
    // Default true (hidden) matches the backend default and this screen's
    // prior behavior — only shown once the setting is confirmed off.
    const [blindCashCount, setBlindCashCount] = useState(true);
    const [expectedCashPreview, setExpectedCashPreview] = useState<number | null>(null);
    const [loadingExpectedCash, setLoadingExpectedCash] = useState(false);

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
        authService.getShiftInsights()
            .then(setInsights)
            .catch(() => { /* insights are a nice-to-have — fail quietly */ })
            .finally(() => setInsightsLoading(false));
    }, []);

    useEffect(() => {
        settingsService.getEffectiveSettings()
            .then((eff) => setBlindCashCount(eff.settings.blindCashCount))
            .catch(() => { /* keep the safe (blind) default on failure */ });
    }, []);

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
        setClosingCounts({});
        setExpectedCashPreview(null);
        setCountModalVisible(true);
        // Only fetch (and only ever show) the expected-cash figure when the
        // tenant has explicitly opted out of blind counting — the default is
        // to never reveal it to the cashier while they're counting.
        if (!blindCashCount) {
            setLoadingExpectedCash(true);
            authService.getShiftSummary()
                .then((s) => setExpectedCashPreview(s.expected_cash))
                .catch(() => { /* leave hidden on failure — falls back to blind */ })
                .finally(() => setLoadingExpectedCash(false));
        }
    };

    // Fast user-switch — see AuthContext.switchKioskUser: the shift stays
    // open, so the next cashier can sign in right away without this one
    // having to end their shift first.
    const handleSwitchUser = () => {
        Modal.confirm({
            title: 'Switch User',
            content: 'Your shift stays open — resume it later by logging back in. The next cashier can sign in now.',
            okText: 'Switch User',
            cancelText: 'Cancel',
            onOk: () => switchKioskUser(),
        });
    };

    const handleConfirmEndShift = async () => {
        const closingCash = denominationTotal(closingCounts);
        setEnding(true);
        try {
            const result = await authService.endShift(
                closingCash > 0 ? closingCash : undefined,
                closingCash > 0 ? JSON.stringify(closingCounts) : undefined,
            );
            setSummary(result);
            setCountModalVisible(false);
        } catch {
            message.error('Failed to end shift. Please try again.');
        } finally {
            setEnding(false);
        }
    };

    const handleRecordMovement = async () => {
        if (movementAmount <= 0) { message.error('Enter an amount greater than zero.'); return; }
        setRecordingMovement(true);
        try {
            await authService.recordCashMovement(movementDirection, movementAmount, movementNote || undefined);
            message.success(`Recorded cash ${movementDirection === 'in' ? 'in' : 'out'}: Rs. ${movementAmount.toFixed(2)}`);
            setMovementModalVisible(false);
            setMovementAmount(0);
            setMovementNote('');
        } catch {
            message.error('Failed to record cash movement.');
        } finally {
            setRecordingMovement(false);
        }
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
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button size="large" icon={<WalletOutlined />} onClick={() => setMovementModalVisible(true)}>
                        Cash In / Out
                    </Button>
                    <Button size="large" icon={<UserSwitchOutlined />} onClick={handleSwitchUser}>
                        Switch User
                    </Button>
                    <Button size="large" icon={<SafetyCertificateOutlined />} onClick={() => setBackOfficeOpen(true)}>
                        Back Office
                    </Button>
                    <Button danger size="large" icon={<LogoutOutlined />} onClick={handleEndShift} loading={ending}>
                        End Shift
                    </Button>
                </div>
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

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Discounts Applied"
                            value={insights?.activity.discount_count ?? 0}
                            prefix={<TagOutlined />}
                            suffix={insights && insights.activity.discount_total > 0
                                ? `· Rs. ${insights.activity.discount_total.toFixed(2)}`
                                : undefined}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Refunds This Shift"
                            value={insights?.activity.refund_count ?? 0}
                            prefix={<RollbackOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={14}>
                    <Card
                        title="Sales Trend This Shift"
                        style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}
                    >
                        <div style={{ width: '100%', height: 220 }}>
                            {insightsLoading ? (
                                <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                            ) : insights && insights.hourly_breakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <AreaChart data={insights.hourly_breakdown.map((b) => ({ hour: `${b.hour}:00`, total: b.total }))}>
                                        <defs>
                                            <linearGradient id="colorShiftSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={token.colorPrimary} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={token.colorPrimary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8c8c8c' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8c8c8c' }} tickFormatter={(v) => `${v}`} />
                                        <Tooltip formatter={(value: any) => [`Rs. ${Number(value).toFixed(2)}`, 'Sales']} />
                                        <Area type="monotone" dataKey="total" stroke={token.colorPrimary} strokeWidth={3} fillOpacity={1} fill="url(#colorShiftSales)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Empty description="No sales yet this shift" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ paddingTop: 40 }} />
                            )}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card
                        title={<><TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />Top Sellers This Shift</>}
                        style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}
                    >
                        {insightsLoading ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                        ) : insights && insights.top_items.length > 0 ? (
                            <List
                                size="small"
                                dataSource={insights.top_items}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Text>{item.name}</Text>
                                        <Text type="secondary">{item.quantity} sold · Rs. {item.total.toFixed(2)}</Text>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No items sold yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>

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
                    <>
                        <Row gutter={[16, 16]}>
                            <Col span={12}><Statistic title="Total Sales" value={summary.total_sales} precision={2} prefix="Rs." /></Col>
                            <Col span={12}><Statistic title="Transactions" value={summary.total_transactions} /></Col>
                            <Col span={12}><Statistic title="Cash Sales" value={summary.total_cash_sales} precision={2} prefix="Rs." /></Col>
                            <Col span={12}><Statistic title="Card Sales" value={summary.total_card_sales} precision={2} prefix="Rs." /></Col>
                            <Col span={12}><Statistic title="Refunds" value={summary.total_refunds} precision={2} prefix="Rs." /></Col>
                            <Col span={12}><Statistic title="Cash Paid Out" value={summary.total_cash_paid_out} precision={2} prefix="Rs." /></Col>
                        </Row>

                        <div style={{ borderTop: '1px dashed #d9d9d9', margin: '16px 0' }} />

                        <Row gutter={[16, 16]}>
                            <Col span={12}><Statistic title="Opening Cash" value={summary.opening_cash} precision={2} prefix="Rs." /></Col>
                            <Col span={12}><Statistic title="Expected Cash" value={summary.expected_cash} precision={2} prefix="Rs." /></Col>
                            {summary.closing_cash !== undefined && (
                                <Col span={12}><Statistic title="Counted Cash" value={summary.closing_cash} precision={2} prefix="Rs." /></Col>
                            )}
                            {summary.variance !== undefined && (
                                <Col span={12}>
                                    <Statistic
                                        title={summary.variance === 0 ? 'Balanced' : summary.variance > 0 ? 'Over' : 'Short'}
                                        value={Math.abs(summary.variance)}
                                        precision={2}
                                        prefix="Rs."
                                        valueStyle={{ color: summary.variance === 0 ? '#52c41a' : summary.variance > 0 ? '#1890ff' : '#f5222d' }}
                                    />
                                </Col>
                            )}
                        </Row>
                    </>
                )}
            </Modal>

            {/* ── Count closing cash before ending the shift ─────────────────── */}
            <Modal
                open={countModalVisible}
                title="Count Closing Cash"
                onCancel={() => setCountModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setCountModalVisible(false)}>Cancel</Button>,
                    <Button key="end" type="primary" danger loading={ending} onClick={handleConfirmEndShift}>
                        End Shift
                    </Button>,
                ]}
            >
                <Text type="secondary">Counting is optional — you can end the shift without it, but you won't get a variance figure.</Text>
                {!blindCashCount && (
                    <Alert
                        style={{ marginTop: 12 }}
                        type="info"
                        showIcon
                        message={
                            loadingExpectedCash
                                ? 'Loading expected cash…'
                                : expectedCashPreview !== null
                                    ? `Expected cash: Rs. ${expectedCashPreview.toFixed(2)}`
                                    : 'Expected cash unavailable'
                        }
                    />
                )}
                <div style={{ marginTop: 16 }}>
                    <DenominationCounter value={closingCounts} onChange={setClosingCounts} />
                </div>
            </Modal>

            <BackOfficeAccessModal open={backOfficeOpen} onClose={() => setBackOfficeOpen(false)} />

            {/* ── Manual cash in/out during the shift ─────────────────────────── */}
            <Modal
                open={movementModalVisible}
                title="Cash In / Out"
                onCancel={() => setMovementModalVisible(false)}
                onOk={handleRecordMovement}
                okText="Record"
                confirmLoading={recordingMovement}
                destroyOnClose
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Radio.Group value={movementDirection} onChange={(e) => setMovementDirection(e.target.value)}>
                        <Radio.Button value="in">Cash In</Radio.Button>
                        <Radio.Button value="out">Cash Out</Radio.Button>
                    </Radio.Group>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Amount</Text>
                        <InputNumber
                            style={{ width: '100%' }}
                            value={movementAmount}
                            onChange={(v) => setMovementAmount(Number(v))}
                            precision={2}
                            min={0}
                            autoFocus
                        />
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Reason (optional)</Text>
                        <Input
                            value={movementNote}
                            onChange={(e) => setMovementNote(e.target.value)}
                            placeholder="e.g. Petty cash for supplies"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KioskPOS;
