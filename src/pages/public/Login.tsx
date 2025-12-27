import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Card,
  message,
  Divider,
  theme,
  Alert
} from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, ShopOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginRequest, AccountStatus } from '../../types/auth/auth.types';
import { API_URL } from '../../utils/api';
import { useApiError } from '../../hooks/useApiError';

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
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [statusAlert, setStatusAlert] = useState<{ type: 'warning' | 'error' | 'info'; message: string; reason?: string } | null>(null);
    const apiError = useApiError();

    const onFinish = async (values: any) => {
        setLoading(true);
        setStatusAlert(null);
        try {
            const loginData: LoginRequest = {
                email: values.email,
                password: values.password,
                remember_me: values.remember,
            };
            const response = await login(loginData);
            messageApi.success('Login Successful');

            if (response && 'must_change_password' in response && response.must_change_password) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Login Failed:', error);

            // Check for account status in error response
            const errorData = error.response?.data;
            const status = errorData?.status as AccountStatus | undefined;
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
                const errorMsg = error.message || errorData?.message || 'Invalid email or password';
                messageApi.error(errorMsg);
            }
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
                    maxWidth: 420, 
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
                    <Title level={2} style={{ margin: 0 }}>Welcome Back</Title>
                    <Text type="secondary">Sign in to your owner/admin account</Text>
                </div>

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

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' }, 
                            { type: 'email', message: 'Invalid Email Format'}
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                    
                    <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>OR CONTINUE WITH</Text></Divider>

                     <Form.Item>
                        <Button block icon={<GoogleOutlined />} onClick={() => window.location.href = `${API_URL}/auth/google/login`}>
                            Google
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                         <Text type="secondary">Don't have an account? </Text>
                        <Link to="/register">Register now</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
