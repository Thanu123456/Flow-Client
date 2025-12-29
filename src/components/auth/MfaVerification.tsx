import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Alert, Typography, Space } from 'antd';
import { SafetyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface MfaVerificationProps {
  onSubmit: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  email?: string;
  codeLength?: number;
}

const MfaVerification: React.FC<MfaVerificationProps> = ({
  onSubmit,
  onResend,
  loading = false,
  error = null,
  email,
  codeLength = 6,
}) => {
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-submit when all digits are entered
    const fullCode = newCode.join('');
    if (fullCode.length === codeLength && !newCode.includes('')) {
      handleSubmit(fullCode);
    }

    // Move to next input
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength);

    if (pastedData) {
      const newCode = [...code];
      pastedData.split('').forEach((char, i) => {
        if (i < codeLength) {
          newCode[i] = char;
        }
      });
      setCode(newCode);

      // Auto-submit if complete
      if (newCode.join('').length === codeLength) {
        handleSubmit(newCode.join(''));
      }
    }
  };

  const handleSubmit = async (fullCode: string) => {
    if (fullCode.length !== codeLength) return;

    setSubmitting(true);
    try {
      await onSubmit(fullCode);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!onResend || resendCooldown > 0) return;

    setResending(true);
    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
      setCode(Array(codeLength).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, textAlign: 'center' }}>
      <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />

      <Title level={3}>Two-Factor Authentication</Title>
      <Paragraph type="secondary">
        {email ? (
          <>Enter the 6-digit code sent to <Text strong>{email}</Text></>
        ) : (
          'Enter the 6-digit code from your authenticator app'
        )}
      </Paragraph>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24, textAlign: 'left' }}
        />
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el?.input || null;
            }}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            maxLength={1}
            disabled={loading || submitting}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              borderRadius: 8,
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          block
          loading={loading || submitting}
          onClick={() => handleSubmit(code.join(''))}
          disabled={code.join('').length !== codeLength}
        >
          Verify
        </Button>

        {onResend && (
          <Button
            type="link"
            icon={<ReloadOutlined />}
            onClick={handleResend}
            disabled={resendCooldown > 0 || resending}
            loading={resending}
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive a code? Resend"}
          </Button>
        )}
      </Space>
    </div>
  );
};

export default MfaVerification;
