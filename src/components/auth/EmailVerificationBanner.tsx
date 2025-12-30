import React, { useState } from 'react';
import { Alert, Button, Space, message } from 'antd';
import { MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { authService } from '../../services/auth/authService';

interface EmailVerificationBannerProps {
  email?: string;
  onVerified?: () => void;
  style?: React.CSSProperties;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  email,
  onVerified,
  style
}) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setLoading(true);
    try {
      await authService.resendVerificationEmail(email);
      setSent(true);
      setCooldown(60);
      message.success('Verification email sent! Please check your inbox.');

      // Start cooldown countdown
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert
      type="warning"
      showIcon
      icon={<MailOutlined />}
      style={{ marginBottom: 16, ...style }}
      message="Email Not Verified"
      description={
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <span>
            Please verify your email address to access all features.
            {email && (
              <>
                {' '}We sent a verification link to <strong>{email}</strong>.
              </>
            )}
          </span>
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              loading={loading}
              disabled={cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend Email' : 'Send Verification Email'}
            </Button>
            {sent && (
              <span style={{ color: '#52c41a', fontSize: 12 }}>
                Email sent! Check your inbox.
              </span>
            )}
          </Space>
        </Space>
      }
    />
  );
};

export default EmailVerificationBanner;
