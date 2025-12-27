import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Card,
  message,
  theme,
  Alert
} from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { SuperAdminLoginRequest } from '../../types/auth/superadmin.types';
import { useApiError } from '../../hooks/useApiError';

const { Title, Text } = Typography;

const SuperAdminLogin: React.FC = () => {
    const { superAdminLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();
    const [showMFA, setShowMFA] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const apiError = useApiError();

    const onFinish = async (values: any) => {
        if (isLocked) {
            messageApi.error('Account temporarily locked. Please try again in 15 minutes.');
            return;
        }

        setLoading(true);
        try {
            const loginData: SuperAdminLoginRequest = {
                email: values.email,
                password: values.password,
                remember_me: values.remember,
                mfa_code: values.mfa_code
            };
            await superAdminLogin(loginData);
            setLoginAttempts(0);
            messageApi.success('Login Successful');
            navigate('/superadmin/dashboard');
        } catch (error: any) {
            console.error('Login Failed:', error);
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || 'Invalid email or password';

            // Track login attempts
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);

            // Check if account should be locked (5 attempts per 15 minutes per requirements)
            if (newAttempts >= 5 || error.response?.status === 429) {
                setIsLocked(true);
                messageApi.error('Too many failed attempts. Account locked for 15 minutes.');
                // Auto-unlock after 15 minutes
                setTimeout(() => {
                    setIsLocked(false);
                    setLoginAttempts(0);
                }, 15 * 60 * 1000);
                return;
            }

            // Check if error suggests MFA is required
            if (errorMsg.toLowerCase().includes('mfa') || errorMsg.toLowerCase().includes('two-factor') || errorMsg.toLowerCase().includes('code required')) {
                setShowMFA(true);
                messageApi.info('Please enter your two-factor authentication code.');
            } else {
                messageApi.error(`${errorMsg} (${5 - newAttempts} attempts remaining)`);
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
            flexDirection: 'column',
            padding: '24px'
        }}>
            {contextHolder}
            <Card 
                style={{ 
                    width: '100%', 
                    maxWidth: 420, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: token.colorError // Visual hint for restricted area? Or just standard.
                }}
            >
                 <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ 
                        display: 'inline-flex',
                        padding: 12,
                        borderRadius: '50%',
                        background: token.colorErrorBg,
                        marginBottom: 16
                     }}>
                        <SafetyOutlined style={{ fontSize: 24, color: token.colorError }} />
                    </div>
                    <Title level={2} style={{ margin: 0 }}>Super Admin</Title>
                    <Text type="secondary">Restricted Access Area</Text>
                </div>

                {/* Account Locked Alert */}
                {isLocked && (
                    <Alert
                        message="Account Locked"
                        description="Too many failed login attempts. Please try again in 15 minutes."
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {/* Rate Limiting Alert from API */}
                {apiError && apiError.status === 429 && (
                    <Alert
                        message="Too Many Requests"
                        description={apiError.message}
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                {/* Login Attempts Warning */}
                {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
                    <Alert
                        message="Login Attempts"
                        description={`${5 - loginAttempts} attempts remaining before account lockout.`}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                )}

                <Form
                    name="super_admin_login"
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

                    {showMFA && (
                        <Form.Item
                            name="mfa_code"
                            label="MFA Code"
                            rules={[{ required: true, message: 'Please enter MFA Code' }]}
                        >
                            <Input prefix={<SafetyOutlined />} placeholder="Enter 6-digit code" maxLength={6} />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/superadmin/forgot-password">Forgot password?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            disabled={isLocked}
                            danger
                        >
                            Secure Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SuperAdminLogin;
