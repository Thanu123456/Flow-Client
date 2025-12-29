import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Card,
  message,
  Alert
} from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApiError } from '../../hooks/useApiError';
import type { SuperAdminLoginRequest } from '../../types/auth/superadmin.types';

const { Title, Text } = Typography;

const SuperAdminLogin: React.FC = () => {
    const { superAdminLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const apiError = useApiError();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const loginData: SuperAdminLoginRequest = {
                email: values.email,
                password: values.password,
                remember_me: values.remember,
                mfa_code: values.mfa_code
            };
            await superAdminLogin(loginData);
            messageApi.success('Super Admin Login Successful');

            // Check if password change is required (handled by route guard)
            // Navigate to dashboard - route guard will redirect to change-password if needed
            navigate('/superadmin/dashboard');
        } catch (error: any) {
            console.error('Login Failed:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Invalid credentials';
            messageApi.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#001529',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
        }}>
            {contextHolder}
            <Card
                style={{
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                variant="borderless"
            >
                 <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        height: 48,
                        width: 48,
                        background: '#f5222d',
                        borderRadius: 8,
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                    <Title level={3} style={{ margin: 0 }}>Super Admin Portal</Title>
                    <Text type="secondary">Restricted Access</Text>
                </div>

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
                        <Input prefix={<UserOutlined />} placeholder="Admin Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="mfa_code"
                        label={<Text type="secondary" style={{ fontSize: 12 }}>Two-Factor Code (if enabled)</Text>}
                    >
                        <Input placeholder="Enter 2FA code" maxLength={6} />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" style={{ color: '#f5222d' }}>Forgot password?</Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading} danger>
                            Secure Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SuperAdminLogin;
