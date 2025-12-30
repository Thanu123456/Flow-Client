import React, { useState } from 'react';
import { Typography, Card, message, theme, Modal } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { RegisterRequest } from '../../types/auth/auth.types';
import SignupForm from '../../components/auth/SignupForm';

const { Title, Text } = Typography;

const Signup: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (values: RegisterRequest) => {
        setLoading(true);
        setFormError(null);
        try {
            await register(values);

            Modal.success({
                title: 'Registration Submitted Successfully!',
                content: (
                    <div>
                        <p>We've sent a verification email to <strong>{values.email}</strong>.</p>
                        <p>Please verify your email address, then wait for admin approval. You will be notified via email once your account is approved.</p>
                    </div>
                ),
                onOk: () => navigate(`/verify-email?email=${encodeURIComponent(values.email)}`),
                okText: 'Check Email Verification'
            });

        } catch (error: unknown) {
            console.error(error);
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
            setFormError(errorMsg);
            messageApi.error(errorMsg);
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
            {contextHolder}
            <Card
                style={{
                    width: '100%',
                    maxWidth: 800,
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
                    <Title level={2} style={{ margin: 0 }}>Create your Account</Title>
                    <Text type="secondary">Start your 14-day free trial, no credit card required.</Text>
                </div>

                <SignupForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={formError}
                />
            </Card>
        </div>
    );
};

export default Signup;
