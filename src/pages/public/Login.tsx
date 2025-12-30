import React, { useState } from 'react';
import { Typography, Card, message, theme, Alert, Button } from 'antd';
import { ShopOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginRequest, AccountStatus } from '../../types/auth/auth.types';
import { API_URL } from '../../utils/api';
import { useApiError } from '../../hooks/useApiError';
import LoginForm from '../../components/auth/LoginForm';
import { MfaVerification } from '../../components/auth';

const { Title, Text } = Typography;

// Account status messages per requirements
const STATUS_MESSAGES: Record<AccountStatus, { type: 'warning' | 'error' | 'info'; message: string }> = {
    pending: {
        type: 'warning',
        message: 'Your account is awaiting admin approval. Please check your email for updates. For urgent inquiries, contact: support@yourpos.com'
    },
    rejected: {
        type: 'error',
        message: 'Your registration was not approved. Please contact support for more information: support@yourpos.com'
    },
    suspended: {
        type: 'error',
        message: 'Your account has been temporarily suspended. Please contact support: support@yourpos.com'
    },
    inactive: {
        type: 'info',
        message: 'Your account is currently inactive. Please contact support for assistance.'
    },
    active: {
        type: 'info',
        message: ''
    }
};

const Login: React.FC = () => {
    const { login, mfaRequired, verifyMfaLogin, cancelMfaLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [statusAlert, setStatusAlert] = useState<{ type: 'warning' | 'error' | 'info'; message: string; reason?: string } | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [mfaError, setMfaError] = useState<string | null>(null);
    const apiError = useApiError();

    const handleSubmit = async (values: LoginRequest) => {
        setLoading(true);
        setStatusAlert(null);
        setFormError(null);
        try {
            const response = await login(values);

            // If MFA is required, the auth context will set mfaRequired to true
            // and we don't navigate yet
            if (response && 'mfa_required' in response && response.mfa_required) {
                return; // Stay on login page, MFA verification will be shown
            }

            messageApi.success('Login Successful');

            if (response && 'must_change_password' in response && response.must_change_password) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (error: unknown) {
            console.error('Login Failed:', error);
            const err = error as { response?: { data?: { message?: string; status?: AccountStatus; rejection_reason?: string } }; message?: string };

            // Check for account status in error response
            const errorData = err.response?.data;
            const status = errorData?.status;
            const rejectionReason = errorData?.rejection_reason;

            if (status && STATUS_MESSAGES[status]) {
                const statusInfo = STATUS_MESSAGES[status];
                let alertMessage = statusInfo.message;

                // Include rejection reason if available
                if (status === 'rejected' && rejectionReason) {
                    alertMessage = `Your registration was not approved. Reason: ${rejectionReason}. Please contact support for more information: support@yourpos.com`;
                }

                setStatusAlert({
                    type: statusInfo.type,
                    message: alertMessage,
                    reason: rejectionReason
                });
            } else {
                // Regular error (invalid credentials, etc.)
                const errorMsg = err.message || errorData?.message || 'Invalid email or password';
                setFormError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (code: string) => {
        setMfaError(null);
        try {
            await verifyMfaLogin(code);
            messageApi.success('Login Successful');
            navigate('/dashboard');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Invalid verification code';
            setMfaError(errorMsg);
            throw error; // Re-throw to let MfaVerification handle the error state
        }
    };

    const handleCancelMfa = () => {
        cancelMfaLogin();
        setMfaError(null);
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google/login`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: token.colorBgLayout,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
        }}>
            {contextHolder}
            <Card
                style={{
                    width: '100%',
                    maxWidth: mfaRequired ? 480 : 420,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                variant="borderless"
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        height: 48,
                        width: 48,
                        background: token.colorPrimary,
                        borderRadius: 8,
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                        <ShopOutlined style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                    {!mfaRequired && (
                        <>
                            <Title level={2} style={{ margin: 0 }}>Welcome Back</Title>
                            <Text type="secondary">Sign in to your owner/admin account</Text>
                        </>
                    )}
                </div>

                {/* MFA Verification View */}
                {mfaRequired ? (
                    <div>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={handleCancelMfa}
                            style={{ marginBottom: 16, padding: 0 }}
                        >
                            Back to Login
                        </Button>
                        <MfaVerification
                            onSubmit={handleMfaVerify}
                            loading={loading}
                            error={mfaError}
                        />
                    </div>
                ) : (
                    <>
                        {/* Account Status Alert */}
                        {statusAlert && (
                            <Alert
                                message={statusAlert.type === 'warning' ? 'Account Pending' : statusAlert.type === 'error' ? 'Account Issue' : 'Notice'}
                                description={statusAlert.message}
                                type={statusAlert.type}
                                showIcon
                                closable
                                onClose={() => setStatusAlert(null)}
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        {/* Rate Limiting Alert */}
                        {apiError && apiError.status === 429 && (
                            <Alert
                                message="Too Many Attempts"
                                description={apiError.message}
                                type="error"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        <LoginForm
                            onSubmit={handleSubmit}
                            onGoogleLogin={handleGoogleLogin}
                            loading={loading}
                            error={formError}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default Login;
