import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, Result, Button, Spin, Typography, theme } from 'antd';
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { authService } from '../../services/auth/authService';

const { Title, Text, Paragraph } = Typography;

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'already_verified';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token: themeToken } = theme.useToken();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const verificationToken = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (verificationToken) {
      verifyEmail();
    } else {
      // No token, show the "check your email" state
      setStatus('loading');
      setMessage('Please check your email for the verification link.');
    }
  }, [verificationToken, emailParam]);

  const verifyEmail = async () => {
    if (!verificationToken) return;

    setStatus('loading');
    try {
      const response = await authService.verifyEmail(verificationToken);
      if (response.verified) {
        setStatus('success');
        setMessage(response.message || 'Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(response.message || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Verification failed';
      const errorCode = err.response?.data?.code;

      if (errorCode === 'TOKEN_EXPIRED' || errorMessage.toLowerCase().includes('expired')) {
        setStatus('expired');
        setMessage('This verification link has expired. Please request a new one.');
      } else if (errorCode === 'ALREADY_VERIFIED' || errorMessage.toLowerCase().includes('already')) {
        setStatus('already_verified');
        setMessage('This email has already been verified.');
      } else {
        setStatus('error');
        setMessage(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email && !emailParam) {
      navigate('/login');
      return;
    }

    setStatus('loading');
    try {
      const targetEmail = email || emailParam || '';
      await authService.resendVerificationEmail(targetEmail);
      setStatus('loading');
      setMessage('A new verification email has been sent. Please check your inbox.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send verification email');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        if (!verificationToken) {
          // Waiting for user to check email
          return (
            <Result
              icon={<MailOutlined style={{ color: themeToken.colorPrimary }} />}
              title="Check Your Email"
              subTitle={
                <>
                  <Paragraph>
                    We've sent a verification link to{' '}
                    {email && <Text strong>{email}</Text>}
                  </Paragraph>
                  <Paragraph type="secondary">
                    Click the link in the email to verify your account.
                    The link will expire in 24 hours.
                  </Paragraph>
                </>
              }
              extra={[
                <Button key="resend" onClick={handleResendVerification}>
                  Resend Verification Email
                </Button>,
                <Button key="login" type="primary" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>,
              ]}
            />
          );
        }
        // Verifying token
        return (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <Title level={4} style={{ marginTop: 24 }}>Verifying your email...</Title>
            <Text type="secondary">Please wait while we verify your email address.</Text>
          </div>
        );

      case 'success':
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Email Verified Successfully!"
            subTitle={message}
            extra={[
              <Button key="login" type="primary" size="large" onClick={() => navigate('/login')}>
                Proceed to Login
              </Button>,
            ]}
          />
        );

      case 'already_verified':
        return (
          <Result
            status="info"
            icon={<CheckCircleOutlined style={{ color: themeToken.colorPrimary }} />}
            title="Email Already Verified"
            subTitle={message}
            extra={[
              <Button key="login" type="primary" size="large" onClick={() => navigate('/login')}>
                Go to Login
              </Button>,
            ]}
          />
        );

      case 'expired':
        return (
          <Result
            status="warning"
            title="Verification Link Expired"
            subTitle={message}
            extra={[
              <Button key="resend" type="primary" onClick={handleResendVerification}>
                Send New Verification Email
              </Button>,
              <Button key="login" onClick={() => navigate('/login')}>
                Back to Login
              </Button>,
            ]}
          />
        );

      case 'error':
        return (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Verification Failed"
            subTitle={message}
            extra={[
              <Button key="resend" type="primary" onClick={handleResendVerification}>
                Resend Verification Email
              </Button>,
              <Button key="login" onClick={() => navigate('/login')}>
                Back to Login
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: themeToken.colorBgLayout,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 560,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        variant="borderless"
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              height: 48,
              width: 48,
              background: themeToken.colorPrimary,
              borderRadius: 8,
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShopOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
        </div>

        {renderContent()}

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary">
            Having trouble? <Link to="/login">Contact Support</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;
