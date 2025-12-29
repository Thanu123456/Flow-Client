import React, { useState } from 'react';
import { Card, theme, Alert } from 'antd';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import type { ResetPasswordRequest } from '../../types/auth/auth.types';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const { token: themeToken } = theme.useToken();
    const [error, setError] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const handleSubmit = async (data: ResetPasswordRequest) => {
        if (!resetToken) {
            setTokenError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }

        setLoading(true);
        setError(null);
        setTokenError(null);
        try {
            await authService.resetPassword(data);
        } catch (err: unknown) {
            console.error('Reset Password Failed:', err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Failed to reset password';

            // Check for token-related errors
            if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid token')) {
                setTokenError('Your password reset link has expired or is invalid. Please request a new one.');
            } else {
                setError(errorMsg);
            }
            throw err; // Re-throw to prevent success state in component
        } finally {
            setLoading(false);
        }
    };

    // Show error if no token
    if (!resetToken) {
        return (
            <div style={{
                minHeight: '100vh',
                background: themeToken.colorBgLayout,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px'
            }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 450,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    variant="borderless"
                >
                    <Alert
                        message="Missing Reset Token"
                        description={
                            <div>
                                <p>No reset token found. Please use the link from your email.</p>
                                <Link to="/forgot-password">Request a new reset link</Link>
                            </div>
                        }
                        type="warning"
                        showIcon
                    />
                </Card>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: themeToken.colorBgLayout,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                variant="borderless"
            >
                {/* Token Error Alert */}
                {tokenError && (
                    <Alert
                        message="Reset Link Invalid"
                        description={
                            <div>
                                <p>{tokenError}</p>
                                <Link to="/forgot-password">Request a new reset link</Link>
                            </div>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <ResetPasswordForm
                    token={resetToken}
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    loginUrl="/login"
                />
            </Card>
        </div>
    );
};

export default ResetPassword;
