import React, { useEffect, useState } from 'react';
import { Modal, Typography, Button, Spin, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';

const { Paragraph } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
}

// Lets an owner/admin read out (or rotate) the short code a fresh kiosk
// device uses to pair itself to this shop — see KioskDeviceSetup.tsx on the
// other end of this flow.
const KioskPairingCodeModal: React.FC<Props> = ({ open, onClose }) => {
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        authService.getKioskPairingCode()
            .then(setCode)
            .catch(() => message.error('Failed to load kiosk pairing code'))
            .finally(() => setLoading(false));
    }, [open]);

    const handleRegenerate = () => {
        Modal.confirm({
            title: 'Regenerate pairing code?',
            content: "The old code stops working immediately. Any device that hasn't been paired yet will need the new one.",
            okText: 'Regenerate',
            okButtonProps: { danger: true },
            onOk: async () => {
                setRegenerating(true);
                try {
                    const fresh = await authService.regenerateKioskPairingCode();
                    setCode(fresh);
                    message.success('Pairing code regenerated');
                } catch {
                    message.error('Failed to regenerate pairing code');
                } finally {
                    setRegenerating(false);
                }
            },
        });
    };

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard?.writeText(code).then(() => message.success('Copied to clipboard'));
    };

    return (
        <Modal open={open} onCancel={onClose} footer={null} title="Kiosk Device Pairing Code" centered>
            <Paragraph type="secondary">
                Enter this code on a new kiosk device's "Set Up This Kiosk" screen to pair it to your shop.
            </Paragraph>
            {loading ? (
                <div style={{ textAlign: 'center', padding: 32 }}><Spin /></div>
            ) : (
                <>
                    <div style={{
                        textAlign: 'center', padding: '24px 0', fontSize: 36, fontWeight: 700,
                        letterSpacing: 8, fontFamily: 'monospace', color: '#1677ff',
                    }}>
                        {code}
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Button icon={<CopyOutlined />} onClick={handleCopy}>Copy</Button>
                        <Button icon={<ReloadOutlined />} danger loading={regenerating} onClick={handleRegenerate}>
                            Regenerate
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default KioskPairingCodeModal;
