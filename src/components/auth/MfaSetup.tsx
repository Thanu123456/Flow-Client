import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Typography,
  Space,
  Alert,
  Input,
  Spin,
  Result,
  Divider,
  Tag,
  Modal,
  message,
  Tooltip
} from 'antd';
import {
  SafetyOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { authService } from '../../services/auth/authService';
import type { MfaSetupResponse, MfaStatusResponse } from '../../types/auth/auth.types';

const { Title, Text, Paragraph } = Typography;

interface MfaSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  // Fetch MFA setup data on mount
  useEffect(() => {
    initializeMfaSetup();
  }, []);

  const initializeMfaSetup = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.setupMfa();
      setSetupData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.verifyAndEnableMfa(verificationCode);
      message.success('MFA enabled successfully!');
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const copyBackupCodes = () => {
    if (setupData?.backup_codes) {
      const codes = setupData.backup_codes.join('\n');
      navigator.clipboard.writeText(codes);
      setBackupCodesCopied(true);
      message.success('Backup codes copied!');
    }
  };

  const downloadBackupCodes = () => {
    if (setupData?.backup_codes) {
      const content = `FlowPOS MFA Backup Codes\n========================\n\nKeep these codes safe! Each code can only be used once.\n\n${setupData.backup_codes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flowpos-backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
      setBackupCodesCopied(true);
      message.success('Backup codes downloaded!');
    }
  };

  const steps = [
    { title: 'Scan QR Code', icon: <QrcodeOutlined /> },
    { title: 'Verify Code', icon: <SafetyOutlined /> },
    { title: 'Save Backup Codes', icon: <CheckCircleOutlined /> },
  ];

  const renderStep0 = () => (
    <div style={{ textAlign: 'center' }}>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
      </Paragraph>

      {setupData?.qr_code_url ? (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-block',
              padding: 16,
              background: '#fff',
              borderRadius: 8,
              border: '1px solid #d9d9d9'
            }}
          >
            <img
              src={setupData.qr_code_url}
              alt="MFA QR Code"
              style={{ width: 200, height: 200 }}
            />
          </div>
        </div>
      ) : (
        <Spin size="large" style={{ margin: '40px 0' }} />
      )}

      <Divider>Or enter this code manually</Divider>

      <div style={{ marginBottom: 24 }}>
        <Text code style={{ fontSize: 16, padding: '8px 16px' }}>
          {setupData?.secret || '...'}
        </Text>
        <Tooltip title="Copy secret">
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => setupData?.secret && copyToClipboard(setupData.secret)}
            style={{ marginLeft: 8 }}
          />
        </Tooltip>
      </div>

      <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
        I've Scanned the QR Code
      </Button>
    </div>
  );

  const renderStep1 = () => (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Enter the 6-digit code from your authenticator app to verify setup
      </Paragraph>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24, textAlign: 'left' }}
        />
      )}

      <Input
        size="large"
        placeholder="Enter 6-digit code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onPressEnter={handleVerify}
        maxLength={6}
        style={{
          textAlign: 'center',
          fontSize: 24,
          letterSpacing: 8,
          marginBottom: 24
        }}
        autoFocus
      />

      <Space>
        <Button onClick={() => setCurrentStep(0)}>Back</Button>
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={handleVerify}
          disabled={verificationCode.length !== 6}
        >
          Verify & Enable MFA
        </Button>
      </Space>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ textAlign: 'center' }}>
      <Result
        status="success"
        title="MFA Enabled Successfully!"
        subTitle="Save your backup codes below. You'll need them if you lose access to your authenticator app."
        style={{ paddingBottom: 0 }}
      />

      <Alert
        message="Important: Save Your Backup Codes"
        description="Each backup code can only be used once. Store them in a secure location."
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 24, textAlign: 'left' }}
      />

      <Card
        size="small"
        style={{ marginBottom: 24, background: '#fafafa' }}
        title={
          <Space>
            <SafetyOutlined />
            <Text strong>Backup Codes</Text>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Copy all codes">
              <Button icon={<CopyOutlined />} onClick={copyBackupCodes}>
                Copy
              </Button>
            </Tooltip>
            <Tooltip title="Download as file">
              <Button icon={<DownloadOutlined />} onClick={downloadBackupCodes}>
                Download
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            padding: 16
          }}
        >
          {setupData?.backup_codes?.map((code, index) => (
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

      <Button
        type="primary"
        size="large"
        onClick={onComplete}
        disabled={!backupCodesCopied}
      >
        {backupCodesCopied ? "I've Saved My Backup Codes" : 'Please Save Backup Codes First'}
      </Button>

      {!backupCodesCopied && (
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          Copy or download your backup codes to continue
        </Paragraph>
      )}
    </div>
  );

  if (loading && !setupData) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: 16 }}>Setting up MFA...</Paragraph>
      </div>
    );
  }

  if (error && !setupData) {
    return (
      <Result
        status="error"
        title="Failed to Setup MFA"
        subTitle={error}
        extra={
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={initializeMfaSetup}>
              Try Again
            </Button>
          </Space>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </div>
  );
};

export default MfaSetup;
