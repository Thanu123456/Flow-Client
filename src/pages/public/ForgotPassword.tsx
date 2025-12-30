import React, { useState } from 'react';
import { Card, theme } from 'antd';
import { authService } from '../../services/auth/authService';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = theme.useToken();

    const handleSubmit = async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(email);
        } catch (err: unknown) {
            console.error('Forgot Password Failed:', err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Failed to process request';
            setError(errorMsg);
            throw err; // Re-throw to prevent success state in component
        } finally {
            setLoading(false);
        }
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
            <Card
                style={{
                    width: '100%',
                    maxWidth: 450,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}
                variant="borderless"
            >
                <ForgotPasswordForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    backUrl="/login"
                />
            </Card>
        </div>
    );
};

export default ForgotPassword;
