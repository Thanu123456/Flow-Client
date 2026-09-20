import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, Space, Typography, message } from 'antd';
import { MailOutlined, MessageOutlined } from '@ant-design/icons';
import { useTenant } from '../../contexts/TenantContext';
import { receiptService } from '../../services/transactions/receiptService';
import { sendReceiptEmail } from '../../utils/receipts/emailReceipt';
import type { EffectiveSettings } from '../../types/entities/settings.types';
import ReceiptQRCode from './ReceiptQRCode';

const { Text } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    settings: EffectiveSettings | null;
    saleId: string;
    invoiceNumber: string;
    totalAmount: number;
    createdAt: string;
    defaultEmail?: string;
    defaultPhone?: string;
}

// Shown right after a successful sale — lets the cashier send the customer a
// digital copy of the receipt (email via EmailJS, SMS via notify.lk) and/or
// show the QR code for the customer to scan themselves. Only the channels
// the tenant has actually enabled in Settings → Digital Receipts appear.
const SendReceiptModal: React.FC<Props> = ({
    open, onClose, settings, saleId, invoiceNumber, totalAmount, createdAt, defaultEmail, defaultPhone,
}) => {
    const { tenant } = useTenant();
    const [email, setEmail] = useState(defaultEmail || '');
    const [phone, setPhone] = useState(defaultPhone || '');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendingSms, setSendingSms] = useState(false);

    useEffect(() => {
        if (open) {
            setEmail(defaultEmail || '');
            setPhone(defaultPhone || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultEmail, defaultPhone]);

    const cfg = settings?.settings;
    const showQr = !!cfg?.receiptQrEnabled && !!tenant?.id;
    const showEmail = !!cfg?.receiptEmailEnabled;
    const showSms = !!cfg?.receiptSmsEnabled;

    const handleSendEmail = async () => {
        if (!email.trim()) { message.error('Enter an email address.'); return; }
        if (!settings || !tenant?.id) return;
        setSendingEmail(true);
        try {
            await sendReceiptEmail(settings, email.trim(), tenant.id, saleId, { invoiceNumber, totalAmount, createdAt });
            message.success(`Receipt emailed to ${email.trim()}`);
        } catch (err: any) {
            message.error(err?.message || 'Failed to send email receipt.');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleSendSms = async () => {
        if (!phone.trim()) { message.error('Enter a phone number.'); return; }
        setSendingSms(true);
        try {
            await receiptService.sendSmsReceipt(saleId, phone.trim());
            message.success(`Receipt texted to ${phone.trim()}`);
        } catch (err: any) {
            const msg = err.response?.data?.details || err.response?.data?.error || 'Failed to send SMS receipt.';
            message.error(msg);
        } finally {
            setSendingSms(false);
        }
    };

    if (!showQr && !showEmail && !showSms) return null;

    return (
        <Modal open={open} title="Send Digital Receipt" onCancel={onClose} footer={[
            <Button key="done" type="primary" onClick={onClose}>Done</Button>,
        ]}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {showQr && tenant?.id && (
                    <div style={{ textAlign: 'center' }}>
                        <ReceiptQRCode tenantId={tenant.id} saleId={saleId} size={140} />
                        <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                            Let the customer scan this to view or save their receipt
                        </Text>
                    </div>
                )}
                {showEmail && (
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Email receipt</Text>
                        <Space.Compact style={{ width: '100%', marginTop: 4 }}>
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="customer@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="primary" loading={sendingEmail} onClick={handleSendEmail}>Send</Button>
                        </Space.Compact>
                    </div>
                )}
                {showSms && (
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>SMS receipt</Text>
                        <Space.Compact style={{ width: '100%', marginTop: 4 }}>
                            <Input
                                prefix={<MessageOutlined />}
                                placeholder="07XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <Button type="primary" loading={sendingSms} onClick={handleSendSms}>Send</Button>
                        </Space.Compact>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SendReceiptModal;
