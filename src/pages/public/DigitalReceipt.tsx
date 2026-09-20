import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Result, Typography, Avatar } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { receiptService } from '../../services/transactions/receiptService';
import type { PublicReceipt } from '../../services/transactions/receiptService';

const { Title, Text } = Typography;

// What a customer lands on after scanning the QR code printed on their paper
// receipt (or tapping a link in an emailed/texted one) — public, no login.
// Deliberately a plain read-only view, not the cashier-facing PrintReceipt
// component, since this renders in an ordinary phone browser tab, not a
// thermal-printer stylesheet.
const DigitalReceipt: React.FC = () => {
    const { tenantId, saleId } = useParams<{ tenantId: string; saleId: string }>();
    const [receipt, setReceipt] = useState<PublicReceipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantId || !saleId) {
            setError('Invalid receipt link.');
            setLoading(false);
            return;
        }
        receiptService.getPublicReceipt(tenantId, saleId)
            .then(setReceipt)
            .catch(() => setError("This receipt couldn't be found. It may have been removed."))
            .finally(() => setLoading(false));
    }, [tenantId, saleId]);

    const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: 24 }}>
                <Result status="404" title="Receipt not found" subTitle={error || undefined} />
            </div>
        );
    }

    const { sale } = receipt;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '32px 16px' }}>
            <div style={{
                maxWidth: 420,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <Avatar src={receipt.logoUrl} icon={<ShopOutlined />} size={56} style={{ marginBottom: 8 }} />
                    <Title level={4} style={{ margin: 0 }}>{receipt.shopName}</Title>
                    <Text type="secondary">Digital Receipt</Text>
                </div>

                <div style={{ borderTop: '1px dashed #d9d9d9', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Text type="secondary">Invoice</Text>
                    <Text strong>{sale.invoice_number}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                    <Text type="secondary">Date</Text>
                    <Text>{dayjs(sale.created_at).format('DD MMM YYYY, HH:mm')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                    <Text type="secondary">Payment</Text>
                    <Text style={{ textTransform: 'capitalize' }}>{sale.payment_method}</Text>
                </div>

                <div style={{ borderTop: '1px dashed #d9d9d9', margin: '12px 0' }} />

                {sale.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                        <span>{item.name} <Text type="secondary">× {item.quantity}</Text></span>
                        <span>Rs. {fmt(item.quantity * item.price)}</span>
                    </div>
                ))}

                <div style={{ borderTop: '1px dashed #d9d9d9', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Text type="secondary">Subtotal</Text>
                    <Text>Rs. {fmt(sale.subtotal)}</Text>
                </div>
                {sale.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                        <Text type="secondary">Discount</Text>
                        <Text>-Rs. {fmt(sale.discount_amount)}</Text>
                    </div>
                )}
                {sale.delivery_charge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                        <Text type="secondary">Delivery</Text>
                        <Text>+Rs. {fmt(sale.delivery_charge)}</Text>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid #000' }}>
                    <span>Total</span>
                    <span>Rs. {fmt(sale.total_amount)}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>Thank you for your business!</Text>
                </div>
            </div>
        </div>
    );
};

export default DigitalReceipt;
