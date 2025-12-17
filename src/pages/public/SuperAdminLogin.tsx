import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Typography, 
  Card, 
  message 
} from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { SuperAdminLoginRequest } from '../../types/auth/superadmin.types';

const { Title, Text } = Typography;

const SuperAdminLogin: React.FC = () => {
    const { superAdminLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const loginData: SuperAdminLoginRequest = {
                email: values.email,
                password: values.password,
                remember_me: values.remember,
                // mfa_code: values.mfa_code // Implement MFA field if enabled
            };
            await superAdminLogin(loginData);
            messageApi.success('Super Admin Login Successful');
            navigate('/superadmin/dashboard');
        } catch (error: any) {
            console.error('Login Failed:', error);
            const errorMsg = error.response?.data?.message || 'Invalid credentials';
            messageApi.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#001529', // Dark background for Super Admin
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
                        background: '#f5222d', // Red accent for Admin
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

                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
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
