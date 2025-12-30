import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Alert,
  Modal,
  Input,
  Tag,
  Descriptions,
  Spin,
  message,
  Popconfirm
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { authService } from '../../services/auth/authService';
import type { MfaStatusResponse } from '../../types/auth/auth.types';
import MfaSetup from './MfaSetup';

const { Title, Text, Paragraph } = Typography;

interface MfaSettingsProps {
  onStatusChange?: (enabled: boolean) => void;
}

const MfaSettings: React.FC<MfaSettingsProps> = ({ onStatusChange }) => {
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MfaStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const fetchMfaStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await authService.getMfaStatus();
      setMfaStatus(status);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch MFA status');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (disableCode.length !== 6) {
      message.error('Please enter a valid 6-digit code');
      return;
    }

    setActionLoading(true);
    try {
      await authService.disableMfa(disableCode);
      message.success('MFA has been disabled');
      setShowDisableModal(false);
      setDisableCode('');
      await fetchMfaStatus();
      onStatusChange?.(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to disable MFA');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (backupCode.length !== 6) {
      message.error('Please enter a valid 6-digit code');
      return;
    }

    setActionLoading(true);
    try {
      const result = await authService.regenerateBackupCodes(backupCode);
      setNewBackupCodes(result.backup_codes);
      message.success('New backup codes generated');
      await fetchMfaStatus();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to generate backup codes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    fetchMfaStatus();
    onStatusChange?.(true);
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>Loading MFA settings...</Paragraph>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error Loading MFA Settings"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={fetchMfaStatus}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Two-Factor Authentication (2FA)</span>
          </Space>
        }
        extra={
          mfaStatus?.mfa_enabled ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Enabled
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">
              Disabled
            </Tag>
          )
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Add an extra layer of security to your account by requiring a verification code
          in addition to your password when signing in.
        </Paragraph>

        {mfaStatus?.mfa_enabled ? (
          <>
            <Alert
              message="Two-Factor Authentication is enabled"
              description="Your account is protected with an authenticator app."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Authentication Method">
                {mfaStatus.mfa_method === 'totp' ? 'Authenticator App (TOTP)' : 'Email'}
              </Descriptions.Item>
              <Descriptions.Item label="Backup Codes Remaining">
                <Space>
                  <Text
                    type={mfaStatus.backup_codes_remaining <= 2 ? 'danger' : undefined}
                    strong={mfaStatus.backup_codes_remaining <= 2}
                  >
                    {mfaStatus.backup_codes_remaining}
                  </Text>
                  {mfaStatus.backup_codes_remaining <= 2 && (
                    <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                      Running low
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Space wrap>
              <Button
                icon={<KeyOutlined />}
                onClick={() => setShowBackupCodesModal(true)}
              >
                Generate New Backup Codes
              </Button>
              <Popconfirm
                title="Disable Two-Factor Authentication?"
                description="This will make your account less secure."
                onConfirm={() => setShowDisableModal(true)}
                okText="Continue"
                cancelText="Cancel"
              >
                <Button danger>Disable 2FA</Button>
              </Popconfirm>
            </Space>
          </>
        ) : (
          <>
            <Alert
              message="Two-Factor Authentication is not enabled"
              description="Enable 2FA to add an extra layer of security to your account."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Button
              type="primary"
              icon={<SafetyOutlined />}
              size="large"
              onClick={() => setShowSetupModal(true)}
            >
              Enable Two-Factor Authentication
            </Button>
          </>
        )}
      </Card>

      {/* Setup MFA Modal */}
      <Modal
        title={
          <Space>
            <SafetyOutlined />
            <span>Setup Two-Factor Authentication</span>
          </Space>
        }
        open={showSetupModal}
        onCancel={() => setShowSetupModal(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <MfaSetup
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetupModal(false)}
        />
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        title="Disable Two-Factor Authentication"
        open={showDisableModal}
        onCancel={() => {
          setShowDisableModal(false);
          setDisableCode('');
        }}
        onOk={handleDisableMfa}
        confirmLoading={actionLoading}
        okText="Disable 2FA"
        okButtonProps={{ danger: true, disabled: disableCode.length !== 6 }}
      >
        <Alert
          message="Warning"
          description="Disabling 2FA will make your account less secure. You will only need your password to sign in."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Paragraph>Enter your authenticator code to confirm:</Paragraph>
        <Input
          size="large"
          placeholder="Enter 6-digit code"
          value={disableCode}
          onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
          style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8 }}
          autoFocus
        />
      </Modal>

      {/* Generate Backup Codes Modal */}
      <Modal
        title="Generate New Backup Codes"
        open={showBackupCodesModal}
        onCancel={() => {
          setShowBackupCodesModal(false);
          setBackupCode('');
          setNewBackupCodes([]);
        }}
        footer={
          newBackupCodes.length > 0 ? (
            <Button
              type="primary"
              onClick={() => {
                setShowBackupCodesModal(false);
                setBackupCode('');
                setNewBackupCodes([]);
              }}
            >
              Done
            </Button>
          ) : undefined
        }
        width={500}
      >
        {newBackupCodes.length > 0 ? (
          <>
            <Alert
              message="New Backup Codes Generated"
              description="Your old backup codes are now invalid. Save these new codes in a secure location."
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card size="small" style={{ background: '#fafafa' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8
                }}
              >
                {newBackupCodes.map((code, index) => (
                  <Tag
                    key={index}
                    style={{
                      fontSize: 14,
                      padding: '4px 12px',
                      fontFamily: 'monospace',
                      margin: 0
                    }}
                  >
                    {code}
                  </Tag>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <>
            <Alert
              message="This will invalidate your existing backup codes"
              description="Make sure you've used your old codes or no longer need them."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Paragraph>Enter your authenticator code to generate new backup codes:</Paragraph>
            <Input
              size="large"
              placeholder="Enter 6-digit code"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, marginBottom: 16 }}
              autoFocus
            />

            <Button
              type="primary"
              block
              loading={actionLoading}
              disabled={backupCode.length !== 6}
              onClick={handleRegenerateBackupCodes}
              icon={<ReloadOutlined />}
            >
              Generate New Codes
            </Button>
          </>
        )}
      </Modal>
    </>
  );
};

export default MfaSettings;
