import React, { useEffect, useState } from 'react';
import { Typography, Avatar } from 'antd';
import { ShopOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useTenant } from '../../contexts/TenantContext';
import ReceiptQRCode from '../../components/pos/ReceiptQRCode';
import {
    subscribeCustomerDisplay,
    type CustomerDisplayCartMessage,
    type CustomerDisplayPaymentMessage,
} from '../../utils/customerDisplay/customerDisplayChannel';

const { Title, Text } = Typography;

type ViewState =
    | { mode: 'idle' }
    | { mode: 'cart'; data: CustomerDisplayCartMessage }
    | { mode: 'paid'; data: CustomerDisplayPaymentMessage };

// Meant to run in a second browser window dragged onto the customer-facing
// monitor of a dual-screen till — opened from the POS page's "Customer
// Display" button. Purely reactive: everything it shows comes from
// BroadcastChannel messages the cashier's POS tab posts (see
// customerDisplayChannel.ts and POS.tsx's cart-sync effect); this page makes
// no API calls of its own.
const CustomerDisplay: React.FC = () => {
    const { tenant } = useTenant();
    const [view, setView] = useState<ViewState>({ mode: 'idle' });

    useEffect(() => {
        return subscribeCustomerDisplay((msg) => {
            setView((prev) => {
                if (msg.type === 'payment_complete') return { mode: 'paid', data: msg };
                if (msg.type === 'cart') {
                    if (msg.items.length === 0) {
                        // The POS clears its cart the instant a sale completes, which
                        // broadcasts an *empty* cart right behind the payment message.
                        // That must not replace the thank-you / receipt-QR screen the
                        // customer is about to scan — keep it until the timer below
                        // (or the next customer's first item) moves things on.
                        return prev.mode === 'paid' ? prev : { mode: 'idle' };
                    }
                    return { mode: 'cart', data: msg };
                }
                return { mode: 'idle' };
            });
        });
    }, []);

    // Auto-return to idle after the thank-you screen, long enough for the
    // customer to scan the QR code on their phone.
    useEffect(() => {
        if (view.mode !== 'paid') return;
        const t = setTimeout(() => setView({ mode: 'idle' }), 30000);
        return () => clearTimeout(t);
    }, [view]);

    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const Branding = () => (
        <>
            <Avatar src={tenant?.logo_url} icon={<ShopOutlined />} size={96} style={{ background: '#1677ff', marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0, color: '#fff' }}>{tenant?.shop_name || 'Welcome'}</Title>
        </>
    );

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            color: '#fff',
        }}>
            {view.mode === 'idle' && (
                <div style={{ textAlign: 'center' }}>
                    <Branding />
                    <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16, display: 'block' }}>
                        We'll show your order here as it's rung up
                    </Text>
                </div>
            )}

            {view.mode === 'cart' && (
                <div style={{ width: '100%', maxWidth: 640 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        {view.data.logoUrl
                            ? <Avatar src={view.data.logoUrl} size={56} />
                            : <Avatar icon={<ShopOutlined />} size={56} style={{ background: '#1677ff' }} />}
                        <Title level={4} style={{ color: '#fff', margin: '8px 0 0' }}>{view.data.shopName || tenant?.shop_name}</Title>
                    </div>

                    {view.data.items.length === 0 ? (
                        <Text style={{ color: 'rgba(255,255,255,0.6)', display: 'block', textAlign: 'center' }}>
                            Your items will appear here
                        </Text>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, maxHeight: '50vh', overflowY: 'auto' }}>
                            {view.data.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 18 }}>
                                    <span>{item.name} <Text style={{ color: 'rgba(255,255,255,0.5)' }}>× {item.quantity}</Text></span>
                                    <span>Rs. {fmt(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
                            <span>Subtotal</span><span>Rs. {fmt(view.data.subtotal)}</span>
                        </div>
                        {view.data.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
                                <span>Discount</span><span>-Rs. {fmt(view.data.discount)}</span>
                            </div>
                        )}
                        {view.data.deliveryCharge > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>
                                <span>Delivery</span><span>+Rs. {fmt(view.data.deliveryCharge)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 700, marginTop: 8 }}>
                            <span>Total</span><span>Rs. {fmt(view.data.total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {view.mode === 'paid' && (
                <div style={{ textAlign: 'center' }}>
                    <CheckCircleFilled style={{ fontSize: 72, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>Thank You!</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, display: 'block', marginTop: 8 }}>
                        Total paid: Rs. {fmt(view.data.totalAmount)}
                    </Text>
                    {view.data.changeDue > 0 && (
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, display: 'block' }}>
                            Change: Rs. {fmt(view.data.changeDue)}
                        </Text>
                    )}
                    {view.data.tenantId && view.data.saleId && (
                        <div style={{ marginTop: 24, background: '#fff', display: 'inline-block', padding: 16, borderRadius: 16 }}>
                            <ReceiptQRCode tenantId={view.data.tenantId} saleId={view.data.saleId} size={140} />
                        </div>
                    )}
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, display: 'block', marginTop: 12 }}>
                        Scan for your digital receipt
                    </Text>
                </div>
            )}
        </div>
    );
};

export default CustomerDisplay;
