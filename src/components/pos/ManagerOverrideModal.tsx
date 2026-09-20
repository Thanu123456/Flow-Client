import React, { useState } from 'react';
import { Modal, Input, Button, Alert, Typography, Form } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';

const { Text } = Typography;

interface Props {
    open: boolean;
    label: string;
    permission: string;
    onAuthorized: (token: string, authorizedBy: string) => void;
    onCancel: () => void;
}

// The "manager key" a cashier without pos.discounts/sales.refunds hits when
// applying a discount or processing a refund — a manager enters their own
// User ID + PIN here instead of the cashier being able to self-authorize it.
// See POSHandler.checkOverride (backend) for where the resulting token is
// actually enforced, not just requested.
const ManagerOverrideModal: React.FC<Props> = ({ open, label, permission, onAuthorized, onCancel }) => {
    const [managerId, setManagerId] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setManagerId('');
        setPin('');
        setError(null);
    };

    const handleCancel = () => {
        reset();
        onCancel();
    };

    const handleSubmit = async () => {
        if (!managerId.trim() || !pin.trim()) {
            setError("Enter the manager's User ID and PIN.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await authService.authorizeOverride(managerId.trim(), pin.trim(), permission);
            reset();
            onAuthorized(result.token, result.authorized_by);
        } catch (err: any) {
            const msg = err.response?.data?.error?.details
                || err.response?.data?.error?.message
                || 'Invalid manager ID or PIN.';
            setError(msg);
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={<><SafetyCertificateOutlined style={{ color: '#faad14', marginRight: 8 }} />Manager Approval Required</>}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>Approve</Button>,
            ]}
            destroyOnClose
            centered
            maskClosable={false}
        >
            <Text type="secondary">{label}</Text>
            {error && <Alert message={error} type="error" showIcon style={{ margin: '16px 0 0' }} />}
            <Form layout="vertical" style={{ marginTop: 16 }} onFinish={handleSubmit}>
                <Form.Item label="Manager User ID">
                    <Input
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        placeholder="e.g. MGR001"
                        autoFocus
                        disabled={loading}
                    />
                </Form.Item>
                <Form.Item label="Manager PIN" style={{ marginBottom: 0 }}>
                    <Input.Password
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        maxLength={6}
                        placeholder="••••"
                        disabled={loading}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManagerOverrideModal;
