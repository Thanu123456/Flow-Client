import React, { useState } from 'react';
import { Modal, Input, Button, Alert, Typography, Form } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';
import { startElevation } from '../../utils/elevation';

const { Text } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
}

// A manager (or owner) steps from the register into the back office with their
// own User ID + PIN. On success this swaps in their short-lived session and
// navigates away (see utils/elevation.ts) — the cashier's shift stays open
// underneath and comes back when the manager returns to the register.
const BackOfficeAccessModal: React.FC<Props> = ({ open, onClose }) => {
    const [managerId, setManagerId] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setManagerId('');
        setPin('');
        setError(null);
    };

    const handleClose = () => {
        if (loading) return;
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!managerId.trim() || !pin.trim()) {
            setError("Enter the manager's User ID and PIN.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authService.elevateToBackOffice(managerId.trim(), pin.trim());
            startElevation(res); // navigates away — nothing to do after this
        } catch (err: any) {
            const msg = err.response?.data?.error?.details
                || err.response?.data?.error?.message
                || 'Invalid manager ID or PIN.';
            setError(msg);
            setPin('');
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={<><SafetyCertificateOutlined style={{ color: '#1677ff', marginRight: 8 }} />Back office access</>}
            onCancel={handleClose}
            footer={[
                <Button key="cancel" onClick={handleClose} disabled={loading}>Cancel</Button>,
                <Button key="go" type="primary" loading={loading} onClick={handleSubmit}>Continue</Button>,
            ]}
            destroyOnClose
            centered
            maskClosable={false}
        >
            <Text type="secondary">
                A manager can step into the dashboard from here. It lasts 10 minutes, then this register
                returns to the cashier's open shift.
            </Text>
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
                        onPressEnter={handleSubmit}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default BackOfficeAccessModal;
